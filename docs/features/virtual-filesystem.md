# Feature: Graph Database Virtual Filesystem (VFS)

A core feature of Archiverse Theia is its ability to treat a graph database as the primary workspace, rather than relying on physical files on disk (except for the Archiverse language definition itself, potentially). This is achieved through a custom Virtual File System (VFS) implementation.

## Concept

The VFS acts as an adapter between Theia's standard filesystem expectations and the graph database's structure.

*   **Theia's View:** Theia's components (Explorer, Editors, etc.) request operations like `readFile`, `readDirectory`, `writeFile` using standard URIs.
*   **VFS Translation:** Our custom VFS provider intercepts requests using a specific URI scheme (e.g., `graphdb://`). It translates these requests into appropriate graph database queries (e.g., Gremlin queries for Tinkerpop).
*   **Graph Database:** The actual data (nodes, properties, relationships) resides in the graph database.
*   **Virtual Representation:** The VFS presents graph data *as if* it were files and folders:
    *   Nodes might be represented as files (e.g., `graphdb://User/user123`). Reading this "file" fetches the properties of the `user123` node.
    *   Relationships or node types might define the directory structure (e.g., `graphdb://User/` lists all user nodes, `graphdb://Order/orderABC/Items/` might list nodes related to `orderABC` via an "HAS_ITEM" relationship).
    *   Writing to a "file" updates the corresponding node's properties in the graph. Creating/deleting files/folders translates to creating/deleting nodes/relationships.

## Implementation (`archiverse-graph-vfs` Extension)

*   This backend extension will contain a class implementing Theia's `FileSystemProvider` interface.
*   It will register itself with Theia's `FileSystem` service, associating itself with the `graphdb://` URI scheme.
*   It needs logic to connect to the specific graph database (connection details likely provided via configuration).
*   It requires mapping logic to translate between virtual paths/URIs and graph queries.
*   It needs to handle data serialization/deserialization between graph properties and file content (e.g., representing node properties as JSON or YAML within the virtual file).

## User Workflow Example

1.  **Application Start:** The user launches the Archiverse Theia Electron application.
2.  **VFS Initialization:** The `archiverse-graph-vfs` backend extension connects to the configured graph database.
3.  **Open Explorer:** The user opens the File Explorer view.
4.  **VFS Query:** The Explorer requests the root directory contents (e.g., `graphdb://`). The VFS queries the graph (e.g., "list top-level domains or systems") and returns a virtual directory listing.
5.  **Explorer Display:** The Explorer shows virtual folders like `User/`, `Order/`, etc.
6.  **Navigate:** User clicks `User/`. VFS queries "list all nodes with label 'User'" and returns virtual files like `user123`, `user456`.
7.  **Open "File":** User clicks `user123`. Theia requests `readFile('graphdb://User/user123')`.
8.  **VFS Fetches Properties:** VFS queries "get properties for node 'user123'".
9.  **Editor Display:** VFS returns properties (e.g., as JSON). Theia opens an editor showing the JSON content.

This allows users to browse and interact with the graph data using familiar file system paradigms within the IDE.
