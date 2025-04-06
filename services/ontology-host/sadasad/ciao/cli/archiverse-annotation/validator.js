// Using manual AST traversal
import { GrammarAST } from 'langium'; // Removed unused AstNode import
// --- Validation Constants based on AGAS ---
// These could potentially move to rules/common.ts later
const ALLOWED_PROPERTY_TYPES = /^(string|number|boolean|date|datetime|uri)(\??)$|^enum\(([\w|]+)\)(\??)$/;
const ALLOWED_PROPERTY_FLAGS = new Set(['key', 'required', 'readOnly', 'filterable', 'sortable']);
const ALLOWED_ENDPOINT_ROLES = new Set(['source', 'target']);
const ALLOWED_ENDPOINT_CARDS = new Set(['one', 'zero-one', 'many', 'zero-many']);
const VALID_IDENTIFIER_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
const VALID_UPPER_SNAKE_CASE_REGEX = /^[A-Z][A-Z0-9_]*$/; // Simple check, adjust as needed
/**
 * Validates a single parsed annotation based on its name and the AGAS rules.
 * This function could be broken down further into rules/ directory later.
 */
function validateSingleAnnotation(annotation, contextRule) {
    var _a;
    const issues = [];
    const addIssue = (message, key, severity = 'error') => {
        issues.push({ message, annotation, key, severity });
    };
    switch (annotation.name) {
        case 'element':
            // Check required keys
            if (!annotation.args.label) {
                addIssue('Missing required key "label".');
            }
            else if (!VALID_IDENTIFIER_REGEX.test(annotation.args.label)) {
                addIssue('Key "label" must be a valid identifier (alphanumeric + underscore, starting with letter).', 'label');
            }
            // Description is optional, no specific format check here
            break;
        case 'property':
            // Check required keys
            if (!annotation.args.name) {
                addIssue('Missing required key "name".');
            }
            // TODO: Validate 'name' against actual properties in contextRule if provided
            if (!annotation.args.type) {
                addIssue('Missing required key "type".');
            }
            else if (!ALLOWED_PROPERTY_TYPES.test(annotation.args.type)) {
                addIssue(`Invalid format for "type". Allowed: primitives (string?, number?, boolean?, date?, datetime?, uri?) or enum(Val1|Val2)?`, 'type');
            }
            if (annotation.args.flags) {
                const flags = annotation.args.flags.split(',').map(f => f.trim()).filter(f => f);
                for (const flag of flags) {
                    if (!ALLOWED_PROPERTY_FLAGS.has(flag)) {
                        addIssue(`Invalid flag "${flag}". Allowed flags: ${Array.from(ALLOWED_PROPERTY_FLAGS).join(', ')}.`, 'flags');
                    }
                }
                // Check for contradiction between required flag and optional type
                const isOptionalType = (_a = annotation.args.type) === null || _a === void 0 ? void 0 : _a.endsWith('?');
                if (flags.includes('required') && isOptionalType) {
                    addIssue('Contradiction: Flag "required" used with an optional type (ending in "?").', 'flags', 'warning');
                }
            }
            break;
        case 'relation':
            if (!annotation.args.type) {
                addIssue('Missing required key "type".');
            }
            else if (!VALID_UPPER_SNAKE_CASE_REGEX.test(annotation.args.type)) {
                // Relaxed check, AGAS recommends uppercase snake_case or camelCase
                addIssue('Key "type" should ideally be uppercase snake_case or camelCase (e.g., "RELATES_TO").', 'type', 'warning');
            }
            if (!VALID_IDENTIFIER_REGEX.test(annotation.args.type)) {
                addIssue('Key "type" must be a valid identifier.', 'type');
            }
            break;
        case 'endpoint':
            if (!annotation.args.role) {
                addIssue('Missing required key "role".');
            }
            else if (!ALLOWED_ENDPOINT_ROLES.has(annotation.args.role)) {
                addIssue(`Invalid value for "role". Must be "source" or "target".`, 'role');
            }
            if (!annotation.args.type) {
                addIssue('Missing required key "type".');
            }
            // TODO: Validate 'type' against known @element labels if possible
            if (!annotation.args.navName) {
                addIssue('Missing required key "navName".');
            }
            else if (!VALID_IDENTIFIER_REGEX.test(annotation.args.navName)) {
                addIssue('Key "navName" must be a valid identifier (e.g., camelCase).', 'navName');
            }
            if (!annotation.args.card) {
                addIssue('Missing required key "card".');
            }
            else if (!ALLOWED_ENDPOINT_CARDS.has(annotation.args.card)) {
                addIssue(`Invalid value for "card". Must be one of: ${Array.from(ALLOWED_ENDPOINT_CARDS).join(', ')}.`, 'card');
            }
            break;
        default:
            addIssue(`Unknown annotation type "@${annotation.name}".`);
            break;
    }
    return issues;
}
/**
 * Helper function to recursively find all Assignment nodes within an AbstractElement.
 */
function findAssignmentsRecursive(element) {
    if (!element) {
        return [];
    }
    let assignments = [];
    if (GrammarAST.isAssignment(element)) {
        assignments.push(element);
        // Also check inside the assignment's terminal (though unlikely to contain nested assignments)
        assignments = assignments.concat(findAssignmentsRecursive(element.terminal));
    }
    else if (GrammarAST.isGroup(element) || GrammarAST.isAlternatives(element) || GrammarAST.isUnorderedGroup(element)) {
        // Recursively check elements within container types
        for (const child of element.elements) {
            assignments = assignments.concat(findAssignmentsRecursive(child));
        }
    }
    // Actions don't typically contain nested assignments relevant to this check.
    // Other types like Atom, RuleCall, Keyword etc., don't contain assignments directly within them in the same way
    // but assignments can contain them (handled by the isAssignment case above).
    return assignments;
}
/**
 * Validates all annotations found for a specific grammar rule.
 * Also performs checks that require considering multiple annotations together (e.g., exactly two @endpoint).
 * This function could be the main export or part of a Validator class later.
 * It now uses the ValidationAcceptor directly for some checks.
 */
export function validateAnnotationsForNode(annotations, node, accept) {
    var _a;
    let issues = []; // Keep for individual annotation issues for now
    // Validate each annotation individually (still returning issues for now, could refactor later)
    for (const annotation of annotations) {
        issues = issues.concat(validateSingleAnnotation(annotation, node));
    }
    // Perform cross-annotation checks for relationships
    // This logic could move to rules/cross-annotation.ts later
    const relationAnnotations = annotations.filter(a => a.name === 'relation');
    const endpointAnnotations = annotations.filter(a => a.name === 'endpoint');
    if (relationAnnotations.length > 0 || endpointAnnotations.length > 0) {
        // If it looks like a relationship rule...
        if (relationAnnotations.length === 0) {
            // Report error on the first endpoint if relation is missing
            issues.push({ message: 'Missing required @relation annotation for this rule.', annotation: endpointAnnotations[0], severity: 'error' });
        }
        else if (relationAnnotations.length > 1) {
            issues.push({ message: 'Cannot have more than one @relation annotation per rule.', annotation: relationAnnotations[1], severity: 'error' });
        }
        if (endpointAnnotations.length !== 2) {
            const ann = (_a = endpointAnnotations[0]) !== null && _a !== void 0 ? _a : relationAnnotations[0]; // Pick one to attach error
            issues.push({ message: `Expected exactly two @endpoint annotations, found ${endpointAnnotations.length}.`, annotation: ann, severity: 'error' });
        }
        else {
            const roles = endpointAnnotations.map(a => a.args.role);
            if (!roles.includes('source') || !roles.includes('target')) {
                issues.push({ message: 'Must have exactly one @endpoint with role="source" and one with role="target".', annotation: endpointAnnotations[0], severity: 'error' });
            }
        }
    }
    // Perform cross-annotation checks for elements/properties
    // This logic could move to rules/cross-annotation.ts later
    const elementAnnotations = annotations.filter(a => a.name === 'element');
    const propertyAnnotations = annotations.filter(a => a.name === 'property');
    if (propertyAnnotations.length > 0 && elementAnnotations.length === 0 && relationAnnotations.length === 0) {
        issues.push({ message: '@property annotations must follow an @element or @relation annotation.', annotation: propertyAnnotations[0], severity: 'error' });
    }
    if (elementAnnotations.length > 1) {
        issues.push({ message: 'Cannot have more than one @element annotation per rule.', annotation: elementAnnotations[1], severity: 'error' });
    }
    // --- Element/Property Cross-Checks ---
    // Use GrammarAST.isParserRule and GrammarAST.isAssignment
    if (elementAnnotations.length === 1 && GrammarAST.isParserRule(node)) {
        const elementAnnotation = elementAnnotations[0];
        const definedProperties = new Set(propertyAnnotations.map(p => p.args.name));
        // Iterate through assignments in the rule definition to find expected properties
        // Use manual traversal helper
        const assignments = findAssignmentsRecursive(node.definition);
        for (const assignment of assignments) {
            const featureName = assignment.feature;
            if (!definedProperties.has(featureName)) {
                // Check if it's an implicit property handled elsewhere (like 'name' if not assigned) - currently handled in ir-builder, maybe move logic here?
                // For now, assume all direct assignments should have a @property annotation
                issues.push({
                    message: `Rule "${node.name}" defines property "${featureName}" but is missing a corresponding @property(name="${featureName}", ...) annotation.`,
                    annotation: elementAnnotation,
                    key: featureName,
                    severity: 'error'
                });
            }
        }
        // TODO: Potentially add check for @property annotations that don't match any assignment in the rule?
    }
    else if (GrammarAST.isParserRule(node) && elementAnnotations.length === 0 && relationAnnotations.length === 0) {
        // Check if a parser rule without @element or @relation *does* contain assignments,
        // suggesting an annotation might be missing.
        const assignments = findAssignmentsRecursive(node.definition);
        if (assignments.length > 0) {
            // Issue a warning attached to the rule's name property
            accept('warning', `Parser rule "${node.name}" contains property assignments but lacks an @element or @relation annotation. Is one missing?`, {
                node: node,
                property: 'name' // Attach to the rule name for better location
                // Alternatively, use 'node: node' to highlight the whole rule,
                // or calculate a specific range if needed.
            });
        } // <-- Add missing closing brace here
    }
    // TODO: Refactor validateSingleAnnotation to also use 'accept' instead of returning issues?
    // For now, we just don't return the collected 'issues' array as the function is void.
}
//# sourceMappingURL=validator.js.map