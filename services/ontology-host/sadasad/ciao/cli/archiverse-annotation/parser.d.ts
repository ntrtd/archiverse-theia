import { GrammarAST } from 'langium';
import { ParsedAnnotation } from './types.js';
/**
 * Parses Archiverse Grammar Annotation System (AGAS) annotations from a given block of text,
 * typically extracted from a comment. It looks for patterns like `@annotationName(key="value", ...)`
 * and extracts the annotation name and its key-value arguments.
 *
 * Example comment: / * @element(label="MyElement", description="...") @property(name="id", type="string", flags="key, required") * /
 * (Note: Added spaces in the example above to avoid breaking the outer comment in this source file)
 *
 * @param {string} commentText - The text content of a comment block potentially containing AGAS annotations.
 * @returns {ParsedAnnotation[]} An array of parsed annotation objects found in the text. Each object contains the annotation name, a record of its arguments, and the raw matched string.
 */
export declare function parseAnnotationsFromText(commentText: string): ParsedAnnotation[];
/**
 * Retrieves and parses all AGAS annotations found in comments immediately preceding
 * a given Langium grammar AbstractRule node (e.g., ParserRule, TerminalRule) in the source file.
 * It leverages the Concrete Syntax Tree (CST) for accurate comment association.
 *
 * Note: This function relies on the availability of the CST (`node.$cstNode`). If the CST
 * is not present, it will not be able to find comments and will return an empty array.
 *
 * @param {GrammarAST.AbstractRule} node - The Langium grammar AST node (ParserRule, TerminalRule, etc.)
 *                                         for which to find preceding annotations.
 * @returns {ParsedAnnotation[]} An array of all parsed AGAS annotations found in the
 *                               comments preceding the node. Returns an empty array if no
 *                               comments or no annotations are found, or if the CST is unavailable.
 */
export declare function getAnnotationsFromNode(node: GrammarAST.AbstractRule): ParsedAnnotation[];
//# sourceMappingURL=parser.d.ts.map