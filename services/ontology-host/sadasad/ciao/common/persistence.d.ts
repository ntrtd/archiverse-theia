import { AstNode, LangiumDocument } from 'langium';
import { URI } from 'vscode-uri';
export type QueryResult = any;
export type QueryParams = any;
/**
 * Interface for persistence services responsible for loading, saving,
 * and querying Archimate model data from a backend store.
 * This interface defines the contract used internally within the server-process
 * between the core language services and the persistence implementations.
 */
export interface IPersistenceService {
    /**
     * Initializes the persistence layer, including connecting to the
     * data source and performing optional seeding.
     * @param options Configuration options (e.g., connection string, credentials, seed flag).
     */
    initialize(options: Record<string, any>): Promise<void>;
    /**
     * Loads the AST for a given model element URI from the data source.
     * @param uri The URI of the model element (e.g., 'graphdb://...').
     * @returns A LangiumDocument containing the loaded AST, or undefined if not found.
     */
    loadAst(uri: URI): Promise<LangiumDocument | undefined>;
    /**
     * Saves the provided AST node (typically the root of a model file/element)
     * back to the data source.
     * @param node The AST node to save.
     */
    saveAst(node: AstNode): Promise<void>;
    /**
     * Deletes the model element corresponding to the given URI.
     * @param uri The URI of the model element to delete.
     */
    deleteAst(uri: URI): Promise<void>;
    /**
     * Performs a structural query against the data source.
     * (Details of query parameters and results need refinement).
     * @param params Query parameters.
     * @returns Query results.
     */
    query(params: QueryParams): Promise<QueryResult>;
    /**
     * Performs any necessary cleanup, like closing database connections.
     */
    dispose(): Promise<void>;
}
/**
 * Symbol used for dependency injection binding of the persistence service
 * within the server-process.
 */
export declare const PersistenceService: unique symbol;
//# sourceMappingURL=persistence.d.ts.map