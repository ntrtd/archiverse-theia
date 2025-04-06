import { isLeafCstNode } from 'langium'; // Removed CstNode import
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
export function parseAnnotationsFromText(commentText) {
    const annotations = [];
    // Regex to find @annotation(...) patterns
    // It captures the annotation name and the arguments string
    // Changed ([^)]*) to (.*) to correctly capture args with nested parentheses in quoted strings
    const annotationRegex = /@(\w+)\s*\((.*)\)/g;
    let match;
    while ((match = annotationRegex.exec(commentText)) !== null) {
        const name = match[1];
        const argsString = match[2];
        const raw = match[0];
        const args = {};
        // Regex to parse key="value" pairs within the arguments string
        const argsRegex = /(\w+)\s*=\s*"([^"]*)"/g;
        let argMatch;
        while ((argMatch = argsRegex.exec(argsString)) !== null) {
            args[argMatch[1]] = argMatch[2];
        }
        annotations.push({ name, args, raw });
    }
    return annotations;
}
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
export function getAnnotationsFromNode(node) {
    const comments = getPrecedingComments(node);
    return comments.flatMap((comment) => parseAnnotationsFromText(comment));
}
/**
 * Helper function to find preceding comments using the CST.
 * Traverses backwards from the node's CST representation.
 */
function getPrecedingComments(node) {
    const cstNode = node.$cstNode;
    // Check if CST node and its parent exist
    if (!(cstNode === null || cstNode === void 0 ? void 0 : cstNode.parent)) {
        return []; // Cannot get comments without CST node or parent
    }
    const comments = [];
    const parentChildren = cstNode.parent.children;
    const nodeIndex = parentChildren.indexOf(cstNode);
    if (nodeIndex === -1) {
        return []; // Should not happen, but safeguard
    }
    // Iterate backwards from the node's position in the parent's children
    for (let i = nodeIndex - 1; i >= 0; i--) {
        const sibling = parentChildren[i];
        // Check if the sibling is a LeafCstNode
        if (isLeafCstNode(sibling)) {
            // Check if the text content looks like a multi-line comment
            const text = sibling.text;
            if (text.startsWith('/*') && text.endsWith('*/')) {
                comments.unshift(text); // Prepend to maintain order
            }
            else if (sibling.tokenType.name !== 'WS') { // Still check for whitespace using tokenType if possible
                // Stop if we hit a non-comment, non-whitespace token
                break;
            }
            // Continue if it's whitespace (WS)
        }
        else {
            // If it's not a leaf node (e.g., another rule invocation), stop searching backwards for comments
            break;
        }
        // Continue if it's whitespace (WS)
    }
    return comments;
}
//# sourceMappingURL=parser.js.map