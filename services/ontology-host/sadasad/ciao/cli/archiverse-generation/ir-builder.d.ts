import { Grammar, LangiumDocument } from 'langium';
import { IntermediateRepresentation } from './ir-types.js';
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
export declare function buildIntermediateRepresentation(grammarDocuments: LangiumDocument<Grammar>[], logPrefix: string): IntermediateRepresentation;
//# sourceMappingURL=ir-builder.d.ts.map