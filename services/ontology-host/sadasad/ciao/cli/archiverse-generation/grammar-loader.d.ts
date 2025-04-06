import { Grammar, LangiumDocument } from 'langium';
/**
 * Loads and parses all .langium grammar files within the project.
 * Ensures the Concrete Syntax Tree (CST) is available for annotation parsing.
 */
export declare function loadGrammarDocuments(): Promise<{
    documents: LangiumDocument<Grammar>[];
    workspaceRoot: string;
}>;
//# sourceMappingURL=grammar-loader.d.ts.map