# Architecture Overview

The Archiverse Theia application follows a modular architecture based on Eclipse Theia extensions. It leverages a separate backend process for core language and persistence functionalities, interacting with frontend components via RPC. Dependencies like the core ontology and model server are typically sourced from private GitHub packages.

*(A diagram illustrating the main components and their interactions would be beneficial here)*

## High-Level Components

The system is primarily composed of the following parts:

1.  **`archiverse-theia` (This Repository):** The frontend application and integration layer.
    *   **Application Shells (`hosts/electron-app`, `hosts/browser-app`):** The main application containers (Electron or Browser) that host the Theia frontend and backend contributions.
    *   **Theia Frontend (`packages/theia-frontend-*`):** UI components running in the browser/renderer process (e.g., `theia-frontend-explorer`, `theia-frontend-glsp`, `theia-frontend-forms`). These communicate with Theia Backend Contributions via Theia RPC. See [Frontend Extensions](./frontend-extensions.md) for details.
    *   **Theia Backend Contributions (`packages/theia-backend-extensions/`):** Extensions running in the main Theia backend process. They act as lightweight proxies, receiving requests from the frontend via Theia RPC and forwarding them to the `archiverse-model-server` via custom RPC (e.g., Sockets). Includes contributions for GLSP communication (`glsp-contribution`) and potentially Model Hub integration. See [Backend Contributions](./backend-extensions.md) for details.

2.  **`archiverse-model-server`:** A standalone Node.js process hosting the core language logic, persistence, and other backend services. (Likely consumed as a dependency, e.g., a private GitHub package).
    *   **Core Language Logic:** Implements the Langium services (parser, validator, linker, scope provider, AST interfaces) using the grammar/schema provided by the `@archiverse/ontology` package.
    *   **Persistence Implementations (`packages/persistence-*`):** Provides implementations for data storage (e.g., `persistence-graphdb` for graph databases, `persistence-inmemory` for transient storage). The `archiverse-model-server` selects the appropriate implementation at startup.
    *   **GLSP Server:** The actual GLSP (Graphical Language Server Platform) server implementation. It interacts with the core Langium services (within the same process) to provide diagram data and handles edits. Listens for connections from the `glsp-contribution` in the Theia backend.
    *   **Model Service Facade (`ArchiverseModelService`):** Exposes core language and persistence functionalities (e.g., get/update AST, query) via a custom RPC interface. Listens for connections from Theia backend contributions.

3.  **`@archiverse/ontology`:** A package (likely private GitHub package) defining the Archiverse modeling language grammar/schema using Langium. It's consumed by `archiverse-model-server`.

4.  **`archiverse-mcp-server`:** (Optional) A separate process exposing Archiverse-specific tools to AI agents via the Model Context Protocol (MCP). Communicates with `archiverse-model-server` via RPC. (Likely consumed as a dependency).

5.  **`archiverse-infra`:** Infrastructure resources (Dockerfiles, Helm charts, IaC scripts) for deployment. (Likely managed in a separate repository or submodule).

6.  **Protocol Package (`packages/protocol`):** Contains shared TypeScript types and interfaces used for communication between the Theia Backend Contributions and the `archiverse-model-server` (e.g., RPC definitions).

## Key Architectural Concepts

### Client / Backend Contribution / Server Process Separation

The architecture separates concerns into distinct layers:

1.  **Frontend (Client):** The user interface components running in the browser (`packages/theia-frontend-*`). Responsible for rendering and user interaction. Communicates with the Backend Contributions via Theia RPC.
2.  **Backend Contributions (Theia Backend):** Extensions running within the main Theia backend process (`packages/theia-backend-extensions/`). Act as proxies, forwarding requests from the frontend to the appropriate backend services (like `archiverse-model-server`).
3.  **Server Process (`archiverse-model-server`):** A dedicated process containing the core logic, data persistence, language services (Langium), and other backend functionalities (like the GLSP server). This keeps the main Theia process lightweight and allows the backend to be scaled independently.

### Pluggable Persistence Layer

The `archiverse-model-server` is designed to work with different data storage mechanisms.
*   **Persistence Interface:** Defined within the `archiverse-model-server` (or implicitly expected by its Langium services).
*   **Implementations:** Provided by separate packages (e.g., `packages/persistence-graphdb`, `packages/persistence-inmemory` within this monorepo, or potentially external packages).
*   **Configuration:** The `archiverse-model-server` selects the desired persistence implementation at startup based on configuration. This implementation handles connecting to the database, loading data into the Langium AST, and persisting changes.

### Model Interaction via RPC

Components outside the `archiverse-model-server` (like Theia Backend Contributions or potentially the `archiverse-mcp-server`) interact with the model data via the RPC interface exposed by the `ArchiverseModelService` facade within the `archiverse-model-server` process. This ensures a stable and well-defined API for accessing core functionalities.

### Langium Integration

The core language intelligence (parsing, validation, linking, content assist, etc.) is provided by Langium services. These services are implemented within the `archiverse-model-server` process, using the grammar defined in the `@archiverse/ontology` package. They operate directly on the in-memory AST representation of the model.

### Custom Model Explorer

To handle potentially large models and provide a tailored user experience, the application uses a custom explorer view (`theia-frontend-explorer`). This component interacts with the backend (via Theia RPC and the `archiverse-model-server`) to fetch and display model elements hierarchically, rather than relying on a traditional file system structure.
