import { GrammarAST } from 'langium'; // Removed validation-related imports
import { getAnnotationsFromNode } from '../archiverse-annotation/parser.js';
import chalk from 'chalk'; // Import chalk for colored output (still used for warnings)
/**
 * Builds the Intermediate Representation (IR) from parsed grammar documents
 * and AGAS annotations found within them. It iterates through grammar rules,
 * identifies elements and relations based on annotations (@element, @relation),
 * and processes their associated properties (@property) and endpoints (@endpoint).
 *
 * @codeReview The code seems well-structured and handles the different types of annotations correctly. However, there are a few things that could be improved:
 *   - The code uses `console.warn` for logging warnings. It would be better to use a more sophisticated logging mechanism that allows for different log levels and output formats.
 *   - The code could be more modular. The `buildIntermediateRepresentation` function is quite long and could be broken down into smaller, more manageable functions.
 *   - The code could be more robust. It currently assumes that the annotations are well-formed and that all required arguments are present. It would be better to add more validation logic to ensure that the annotations are valid.
 * Builds the Intermediate Representation (IR) from parsed grammar documents
 * and validated AGAS annotations.
 * @param {LangiumDocument<Grammar>[]} grammarDocuments - The loaded and parsed grammar documents.
 * @param {string} logPrefix - A prefix string for console logging messages to provide context.
 * @returns {IntermediateRepresentation} The constructed Intermediate Representation object containing schema elements and relations.
 */
export function buildIntermediateRepresentation(grammarDocuments, logPrefix) {
    var _a;
    // Collect all rule names from all documents for cross-grammar type checking
    const allRuleNames = new Set();
    grammarDocuments.forEach(doc => {
        var _a, _b;
        (_b = (_a = doc.parseResult) === null || _a === void 0 ? void 0 : _a.value) === null || _b === void 0 ? void 0 : _b.rules.forEach(rule => {
            if (rule.name) { // Ensure rule has a name
                allRuleNames.add(rule.name);
            }
        });
    });
    const ir = {
        elements: [],
        relations: []
    };
    // Removed validationIssues array and acceptor
    // Removed validation message
    // console.log(chalk.blue('Validating grammar annotations...'));
    console.log(chalk.blue(`${logPrefix} Building Intermediate Representation...`)); // Use logPrefix
    for (const doc of grammarDocuments) {
        const grammar = (_a = doc.parseResult) === null || _a === void 0 ? void 0 : _a.value;
        if (!grammar)
            continue;
        for (const rule of grammar.rules) {
            // Removed call to validateAnnotationsForNode
            // --- IR Building Logic ---
            // We only care about ParserRules for elements and relations in the IR
            if (!GrammarAST.isParserRule(rule)) {
                continue;
            }
            // Removed check for ruleHasAnnotationError
            // Now 'rule' is known to be a ParserRule
            // Get annotations needed for IR building
            const annotations = getAnnotationsFromNode(rule);
            const elementAnnotation = annotations.find(a => a.name === 'element');
            const relationAnnotation = annotations.find(a => a.name === 'relation');
            const propertyAnnotations = annotations.filter(a => a.name === 'property');
            const endpointAnnotations = annotations.filter(a => a.name === 'endpoint');
            if (elementAnnotation) {
                // Process Element
                const element = {
                    kind: 'element',
                    label: elementAnnotation.args.label || rule.name,
                    description: elementAnnotation.args.description,
                    properties: processPropertyAnnotations(propertyAnnotations, rule, allRuleNames, logPrefix) // Pass logPrefix
                };
                ir.elements.push(element);
            }
            else if (relationAnnotation) {
                // Process Relation
                if (endpointAnnotations.length === 2) {
                    const endpoints = processEndpointAnnotations(endpointAnnotations, rule, logPrefix); // Pass logPrefix
                    if (endpoints) { // Ensure endpoints were valid
                        const relation = {
                            kind: 'relation',
                            type: relationAnnotation.args.type || rule.name,
                            description: relationAnnotation.args.description,
                            properties: processPropertyAnnotations(propertyAnnotations, rule, allRuleNames, logPrefix),
                            endpoints: endpoints
                        };
                        ir.relations.push(relation);
                    }
                    // processEndpointAnnotations now logs warnings with prefix
                }
                else {
                    // This should have been caught by annotation validation, but double-check
                    console.warn(chalk.yellow(`${logPrefix} WARN: Skipping relation rule "${rule.name}": Expected 2 @endpoint annotations, found ${endpointAnnotations.length}.`));
                }
            }
            // Ignore rules that have @property or @endpoint without @element or @relation (should be caught by validation)
        }
    }
    // --- End of loops ---
    // Removed reporting of validation issues
    console.log(chalk.blue(`${logPrefix} Intermediate Representation build complete. Found ${ir.elements.length} elements and ${ir.relations.length} relations.`)); // Use logPrefix
    return ir;
}
/**
 * Processes `@property` annotations found on a specific grammar rule to create
 * SchemaProperty objects for the Intermediate Representation. It parses the type string
 * to determine base type, array status, and optionality. It also performs basic
 * type validation against known rule names and primitives/enums, and adds an implicit
 * 'name' property if applicable.
 *
 * @codeReview The code seems well-structured and handles the different types of annotations correctly. However, there are a few things that could be improved:
 *   - The code uses `console.warn` for logging warnings. It would be better to use a more sophisticated logging mechanism that allows for different log levels and output formats.
 *   - The code could be more modular. The `processPropertyAnnotations` function is quite long and could be broken down into smaller, more manageable functions.
 *   - The code could be more robust. It currently assumes that the annotations are well-formed and that all required arguments are present. It would be better to add more validation logic to ensure that the annotations are valid.
 * Processes @property annotations for a given rule.
 * @param {ParsedAnnotation[]} propertyAnnotations - An array of parsed @property annotations associated with the contextRule.
 * @param {GrammarAST.ParserRule} contextRule - The grammar rule being processed.
 * @param {Set<string>} allRuleNames - A set containing all rule names from all loaded grammars, used for type validation.
 * @param {string} logPrefix - A prefix string for console logging messages.
 * @returns {SchemaProperty[]} An array of SchemaProperty objects derived from the annotations.
 */
function processPropertyAnnotations(propertyAnnotations, contextRule, allRuleNames, // Added parameter
logPrefix // Added parameter
) {
    var _a;
    const properties = [];
    // Validation is assumed to happen in a separate step now
    for (const ann of propertyAnnotations) {
        const name = ann.args.name;
        const type = ann.args.type;
        // --- DEBUG LOGGING ---
        // console.log(`[IR Builder Debug] Processing @property for rule "${contextRule.name}": Annotation Raw: ${ann.raw}`);
        // console.log(`[IR Builder Debug] Parsed Name: ${name}, Parsed Type: ${type}`);
        // --- END DEBUG ---
        // Basic check for required args needed for IR
        if (!name || !type) {
            console.warn(chalk.yellow(`${logPrefix} WARN: Skipping @property on rule "${contextRule.name}" due to missing name/type. Raw: ${ann.raw}`)); // Use logPrefix
            continue;
        }
        // Parse the type string to determine baseType, isArray, isOptional
        let baseType = type;
        const isArray = type.endsWith('[]') || type.endsWith('[]?');
        const isOptional = type.endsWith('?') || type.endsWith('[]?');
        if (isArray) {
            baseType = baseType.replace(/\[\]\??$/, ''); // Remove array and optional markers
        }
        else if (isOptional) {
            baseType = baseType.replace(/\?$/, ''); // Remove optional marker
        }
        // Basic validation (more thorough validation should happen in the validator)
        // Check if baseType is valid: either a known rule name across *all* grammars or a valid primitive/enum type.
        const isKnownRule = allRuleNames.has(baseType); // Use the complete set of rule names
        const allowedBaseTypesRegex = /^(string|number|boolean|date|datetime|uri)$|^enum\([\w|]+\)$/;
        const isValidPrimitiveOrEnum = allowedBaseTypesRegex.test(baseType);
        if (!isKnownRule && !isValidPrimitiveOrEnum) {
            // Only skip if it's neither a known rule nor a valid primitive/enum
            console.warn(chalk.yellow(`${logPrefix} WARN: Skipping @property "${name}" on rule "${contextRule.name}" due to invalid base type "${baseType}" (not a known rule across grammars, primitive, or enum).`)); // Use logPrefix
            continue;
        }
        properties.push({
            name: name,
            type: type,
            baseType: baseType,
            isArray: isArray,
            isOptional: isOptional,
            description: ann.args.description,
            flags: new Set(((_a = ann.args.flags) === null || _a === void 0 ? void 0 : _a.split(',').map(f => f.trim()).filter(f => f)) || [])
        });
    }
    // Add implicit 'name' property if not explicitly defined via annotation for elements/relations that have a name assignment
    if (contextRule.parameters.length === 0 && contextRule.definition && 'name' in contextRule.definition && typeof contextRule.definition.name === 'string') {
        if (!properties.some(p => p.name === 'name')) {
            properties.push({
                name: 'name',
                type: 'string',
                baseType: 'string',
                isArray: false,
                isOptional: false,
                flags: new Set(['key']),
                description: 'Implicit name property'
            });
        }
    }
    // Add implicit 'description' property? Maybe not, rely on explicit annotation.
    return properties;
}
/**
 * Processes `@endpoint` annotations found on a specific relation grammar rule
 * to create a pair of SchemaEndpoint objects (source and target) for the
 * Intermediate Representation. It validates that exactly one source and one
 * target endpoint are defined.
 *
 * @codeReview The code seems well-structured and handles the different types of annotations correctly. However, there are a few things that could be improved:
 *   - The code uses `console.warn` for logging warnings. It would be better to use a more sophisticated logging mechanism that allows for different log levels and output formats.
 *   - The code could be more robust. It currently assumes that the annotations are well-formed and that all required arguments are present. It would be better to add more validation logic to ensure that the annotations are valid.
 * Processes @endpoint annotations for a given relation rule.
 * Returns a tuple of [source, target] endpoints or null if invalid.
 * @param {ParsedAnnotation[]} endpointAnnotations - An array of parsed @endpoint annotations associated with the contextRule.
 * @param {GrammarAST.ParserRule} contextRule - The grammar rule being processed (expected to be a relation rule).
 * @param {string} logPrefix - A prefix string for console logging messages.
 * @returns {[SchemaEndpoint, SchemaEndpoint] | null} A tuple containing the source and target SchemaEndpoint objects, or null if the annotations are invalid (e.g., missing source/target, duplicates).
 */
function processEndpointAnnotations(endpointAnnotations, contextRule, logPrefix) {
    let sourceEndpoint = null;
    let targetEndpoint = null;
    // Validation is assumed to happen in a separate step now
    for (const ann of endpointAnnotations) {
        const role = ann.args.role;
        const type = ann.args.type;
        const navName = ann.args.navName;
        const card = ann.args.card;
        // Basic check for required args needed for IR
        if (!role || !type || !navName || !card || (role !== 'source' && role !== 'target')) {
            console.warn(chalk.yellow(`${logPrefix} WARN: Skipping invalid @endpoint on rule "${contextRule.name}". Raw: ${ann.raw}`)); // Use logPrefix
            continue;
        }
        const endpoint = {
            role: role,
            elementTypeLabel: type,
            navigationName: navName,
            cardinality: card
        };
        if (role === 'source') {
            if (sourceEndpoint) {
                console.warn(chalk.yellow(`${logPrefix} WARN: Skipping relation rule "${contextRule.name}": Multiple @endpoint(role="source") found.`)); // Use logPrefix
                return null;
            } // Duplicate source
            sourceEndpoint = endpoint;
        }
        else { // role === 'target'
            if (targetEndpoint) {
                console.warn(chalk.yellow(`${logPrefix} WARN: Skipping relation rule "${contextRule.name}": Multiple @endpoint(role="target") found.`)); // Use logPrefix
                return null;
            } // Duplicate target
            targetEndpoint = endpoint;
        }
    }
    if (!sourceEndpoint || !targetEndpoint) {
        console.warn(chalk.yellow(`${logPrefix} WARN: Skipping relation rule "${contextRule.name}": Missing source or target @endpoint.`)); // Use logPrefix
        return null; // Missing one of the endpoints
    }
    return [sourceEndpoint, targetEndpoint];
}
// Chalk import moved to the top
//# sourceMappingURL=ir-builder.js.map