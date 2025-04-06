import { CstNode } from 'langium';
/**
 * Represents a parsed AGAS annotation.
 */
export interface ParsedAnnotation {
    name: string;
    args: Record<string, string>;
    raw: string;
    location?: CstNode;
}
/**
 * Represents a validation issue found in an annotation.
 */
export interface AnnotationIssue {
    message: string;
    annotation: ParsedAnnotation;
    key?: string;
    severity: 'error' | 'warning';
}
//# sourceMappingURL=types.d.ts.map