# Backend Extensions (`extensions/server/`)

This section details the planned backend Theia extensions responsible for server-side logic.

## `archiverse-graph-vfs`

*   **Purpose:** Implements the Virtual File System (VFS) provider for the graph database.
*   **Responsibilities:**
    *   Connect to the configured graph database (e.g., Tinkerpop/Gremlin compatible).
    *   Implement Theia's `FileSystemProvider` interface.
    *   Register with the core `FileSystem` service for a custom URI scheme (e.g., `graphdb://`).
    *   Translate Theia filesystem requests (read, write, list, stat, etc.) into graph database queries/operations.
    *   Define the mapping between graph structures (nodes, relationships, properties) and the virtual file/folder hierarchy.
    *   Handle serialization/deserialization of node properties into virtual file content (e.g., JSON, YAML).
*   **Potential Internal Components:** May host the "Model Service Facade" if not placed in a separate `archiverse-model-server`.

## `archiverse-glsp-server`

*   **Purpose:** Provides the backend logic for the Graphical Language Server Platform (GLSP).
*   **Responsibilities:**
    *   Implement the GLSP protocol for diagram interactions.
    *   Receive requests from the `archiverse-glsp-client` (frontend).
    *   Fetch semantic model data required for diagrams, likely by interacting with the "Model Service Facade" (which uses the VFS).
    *   Translate semantic model data into the graphical `GModel` format expected by the client.
    *   Process diagram editing operations received from the client and translate them back into updates to the semantic model (again, likely via the Model Service Facade/VFS).
*   **Integration:** May run in the same process as the VFS/Model Service for easier data access, similar to the CrossModel approach.

## `archiverse-model-server`

*   **Purpose:** (Potentially) Provides a higher-level abstraction over the raw VFS for accessing and manipulating the semantic model. Manages model state, complex queries, or business logic.
*   **Responsibilities:**
    *   Host the "Model Service Facade" if not part of `archiverse-graph-vfs`.
    *   Offer a structured API for querying and updating the Archiverse model, hiding the complexities of direct VFS interaction or graph queries.
    *   Handle model validation rules or business logic beyond basic VFS operations.
    *   Manage model state consistency, potentially handling transactions or caching.
*   **Status:** Details TBD; its exact role might evolve depending on the needs of other backend components.
