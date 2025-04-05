# Architecture Overview

The Archiverse Theia application follows a modular architecture based on Eclipse Theia extensions. This allows for clear separation of concerns between different functionalities and environments (frontend/client vs. backend/server).

## High-Level Structure

*(A diagram illustrating the main components and their interactions would be beneficial here)*

The core components include:

*   **Theia Electron Shell:** The main application container.
*   **Archiverse Language Extension:** Provides core language support (loaded as a plugin).
*   **Backend Extensions:** Located under `extensions/server/`, handling server-side logic like database interaction, GLSP processing, LLM tasks, and model management.
    *   See [Backend Extensions](./backend-extensions.md) for details.
*   **Frontend Extensions:** Located under `extensions/client/`, handling user interface elements like diagram rendering, forms, menus, and tool interactions.
    *   See [Frontend Extensions](./frontend-extensions.md) for details.
*   **Submodules:** Used for external dependencies and reference repositories.

## Key Architectural Concepts

### Modular Extensions

Each distinct piece of functionality (VFS, GLSP Client, GLSP Server, Forms, Menus, Tools, etc.) is implemented as a separate Theia extension package. LLM integration leverages the built-in Theia AI framework and a custom MCP server. This promotes maintainability and allows for independent development and testing.

### Client/Server Separation

Frontend (UI) concerns are handled by client extensions, while backend logic resides in server extensions. Communication typically happens via RPC mechanisms provided by Theia.

### Virtual File System (VFS)

A cornerstone of the architecture is the graph database VFS.
*   The `archiverse-graph-vfs` extension implements Theia's `FileSystemProvider` interface, translating standard file operations (read, write, list) into graph database queries. It deals with the raw representation of graph data as files and directories.
*   Other backend components like the GLSP server, LLM server, or a dedicated Model Server (`archiverse-model-server`) will typically interact with a higher-level "Model Service Facade" (inspired by CrossModel). This facade uses the VFS internally to fetch raw data but provides a more structured, semantic view of the Archiverse model to its consumers. This facade might reside within the `archiverse-model-server` or potentially the `archiverse-graph-vfs` extension itself.

### Centralized Model (via VFS/Facade)

While the VFS provides the low-level access, the goal is to have a consistent way for different backend components (GLSP, LLM, Model Server) to access and potentially modify the underlying graph model data, likely through the aforementioned Model Service Facade.
