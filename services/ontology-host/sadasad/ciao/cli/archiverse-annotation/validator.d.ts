import { GrammarAST, ValidationAcceptor } from 'langium';
import { ParsedAnnotation } from './types.js';
/**
 * Validates all annotations found for a specific grammar rule.
 * Also performs checks that require considering multiple annotations together (e.g., exactly two @endpoint).
 * This function could be the main export or part of a Validator class later.
 * It now uses the ValidationAcceptor directly for some checks.
 */
export declare function validateAnnotationsForNode(annotations: ParsedAnnotation[], node: GrammarAST.AbstractRule, accept: ValidationAcceptor): void;
//# sourceMappingURL=validator.d.ts.map