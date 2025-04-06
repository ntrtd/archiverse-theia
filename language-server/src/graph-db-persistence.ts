import { AstNode } from 'langium';
import * as gremlin from 'gremlin';
import { injectable } from 'inversify'; // Langium modules typically use inversify directly for DI

// --- Configuration Handling (for separate process) ---
interface GraphDbConfig {
    mode: 'local' | 'external';
    url: string;
    seedOnInit: boolean;
    traversalSource: string;
    // TODO: Add auth properties if needed
}

function readConfiguration(): GraphDbConfig {
    // In a real separate process, read from process.env, args, or config file
    console.log("GraphDbPersistence: Reading configuration...");
    const config: GraphDbConfig = {
        mode: (process.env.ARCHIVERSE_GRAPHDB_MODE === 'local' ? 'local' : 'external'),
        url: process.env.ARCHIVERSE_GRAPHDB_URL || 'ws://localhost:8182/gremlin',
        seedOnInit: (process.env.ARCHIVERSE_GRAPHDB_SEED || 'false').toLowerCase() === 'true',
        traversalSource: process.env.ARCHIVERSE_GRAPHDB_TRAVERSAL_SOURCE || 'g',
    };
    console.log("GraphDbPersistence: Config read:", config);
    // TODO: Add validation for configuration
    return config;
}
// --- End Configuration Handling ---


@injectable()
export class GraphDbPersistence {
    protected connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error' = 'disconnected';
    protected gremlinClient: gremlin.driver.Client | undefined;
    protected connectionPromise: Promise<void> | undefined;
    protected readonly config: GraphDbConfig;

    constructor() {
        this.config = readConfiguration();
        // Non-blocking initialization
        this.connectionPromise = this.connect().catch(err => {
            console.error("GraphDbPersistence: Initial connection failed:", err);
            // Status is set in connect()
        });
    }

    /**
     * Establishes connection to the graph database based on configuration.
     * Ensures only one connection attempt happens concurrently.
     */
    async connect(): Promise<void> {
        if (this.connectionPromise) {
            return this.connectionPromise; // Return existing promise
        }

        this.connectionPromise = (async () => {
            if (this.connectionStatus === 'connected' && this.gremlinClient) {
                console.log("GraphDbPersistence: Already connected.");
                return;
            }
            if (this.connectionStatus === 'connecting') {
                 console.warn("GraphDbPersistence: connect() called while already connecting.");
                 return; // Let the original promise resolve
            }

            console.log("GraphDbPersistence: Initializing connection...");
            this.connectionStatus = 'connecting';

            try {
                const { mode, url, seedOnInit, traversalSource } = this.config;
                console.log(`GraphDbPersistence: Attempting connection. Mode: ${mode}, URL: ${url}, Seed: ${seedOnInit}`);

                if (mode === 'external') {
                    // TODO: Add auth options based on config
                    this.gremlinClient = new gremlin.driver.Client(url, { traversalSource });
                    await this.gremlinClient.open();
                    console.log("GraphDbPersistence: Gremlin client connection opened.");

                    // Test connection
                    const result = await this.gremlinClient.submit('g.V().count()');
                    console.log(`GraphDbPersistence: Connection test successful. Vertex count: ${result?._items?.[0] ?? 'N/A'}`);
                    this.connectionStatus = 'connected';

                    if (seedOnInit) {
                        await this.seedDatabase(); // Seed after successful connection
                    }
                    console.log("GraphDbPersistence is ready.");

                } else if (mode === 'local') {
                    // TODO: Implement local DB management (e.g., Docker start/stop)
                    console.warn("GraphDbPersistence: Local DB mode not yet implemented.");
                    this.connectionStatus = 'error';
                    throw new Error("Local DB mode not yet implemented.");
                } else {
                    const errMsg = `Invalid graphDb mode: ${mode}`;
                    console.error(`GraphDbPersistence: ${errMsg}`);
                    this.connectionStatus = 'error';
                    throw new Error(errMsg);
                }

            } catch (error) {
                console.error("GraphDbPersistence: Failed to initialize connection:", error);
                this.connectionStatus = 'error';
                await this.disposeClient(); // Attempt to clean up client on error
                throw error; // Re-throw so the connectionPromise rejects
            }
        })();

        // Ensure subsequent calls wait for the same promise, handle rejection
        try {
            await this.connectionPromise;
        } catch (error) {
             this.connectionPromise = undefined; // Reset promise only if it failed, allowing retry
        }
        return this.connectionPromise; // Return the original promise (resolved or rejected)
    }

    isReady(): boolean {
        return this.connectionStatus === 'connected' && !!this.gremlinClient;
    }

    /**
     * Ensures connection is ready, attempting connection if needed. Throws if not ready.
     */
    protected async ensureReady(): Promise<gremlin.driver.Client> {
         if (!this.isReady()) {
            console.log("GraphDbPersistence: Not ready, attempting connection...");
            await this.connect(); // Wait for connection attempt
         }
         // Check readiness again after attempting connection
         if (!this.isReady() || !this.gremlinClient) {
             throw new Error("GraphDbPersistence: Database connection is not established.");
         }
         return this.gremlinClient;
    }

    /**
     * Placeholder: Loads AST data from the graph for a given URI.
     * This is where the core logic of translating graph data to an AST resides.
     */
    async loadAstForUri(uri: string): Promise<AstNode | undefined> {
        const client = await this.ensureReady();
        console.log(`GraphDbPersistence: Loading AST for ${uri}`);
        // TODO: Implement graph query -> AST reconstruction logic using 'client'
        // Example: Query graph based on URI, map results to AST node structure.
        console.warn(`GraphDbPersistence: loadAstForUri(${uri}) - NI`);
        return undefined;
    }

    /**
     * Placeholder: Saves an AST back to the graph.
     * This is where the core logic of translating AST changes to graph updates resides.
     */
    async saveAst(uri: string, rootNode: AstNode): Promise<void> {
        const client = await this.ensureReady();
        console.log(`GraphDbPersistence: Saving AST for ${uri}`); // Avoid logging large node
        // TODO: Implement AST traversal -> graph update logic using 'client'
        // Example: Traverse AST, identify changes, generate Gremlin queries (addV, addE, property, drop).
        console.warn(`GraphDbPersistence: saveAst(${uri}) - NI`);
    }

    /**
     * Placeholder: Executes a structural query (not returning full AST).
     * Used for populating the explorer view.
     */
    async executeStructuralQuery<T = any>(queryType: string, params: any): Promise<T> {
        const client = await this.ensureReady();
        console.log(`GraphDbPersistence: Executing structural query ${queryType}`, params);
        // TODO: Implement graph query logic based on queryType/params using 'client'
        // Example: queryType='getRootElements' -> g.V().hasLabel('Domain')...
        // Example: queryType='getChildElements', params={parentUri: '...'} -> g.V().has('uri', parentUri).out(...)...
        console.warn(`GraphDbPersistence: executeStructuralQuery(${queryType}) - NI`);
        return {} as T; // Placeholder result
    }


    protected async seedDatabase(): Promise<void> {
        // Assumes connection is already established and client exists
        if (!this.gremlinClient) return;
        console.log("GraphDbPersistence: Database seeding requested...");
        try {
            // Example seeding query using the client directly
            await this.gremlinClient.submit("g.addV('Domain').property('name', 'Example Domain Seeded by Persistence').iterate()");
            console.log("GraphDbPersistence: Database seeding completed (example).");
        } catch (seedError) {
            console.error("GraphDbPersistence: Database seeding failed:", seedError);
        }
    }

    protected async disposeClient(): Promise<void> {
        if (this.gremlinClient) {
            const clientToClose = this.gremlinClient;
            this.gremlinClient = undefined; // Mark as potentially unusable immediately
            try {
                await clientToClose.close();
                console.log("GraphDbPersistence: Gremlin client closed.");
            } catch (err: any) {
                console.error("GraphDbPersistence: Error closing Gremlin client:", err);
            }
        }
    }

    async dispose(): Promise<void> {
        await this.disposeClient();
        this.connectionStatus = 'disconnected';
        this.connectionPromise = undefined; // Allow reconnect if needed later
        console.log("GraphDbPersistence disposed.");
    }
}
