# Architecture Overview

The Archiverse Theia application follows a modular architecture based on Eclipse Theia extensions within a Yarn/Lerna monorepo (`archiverse-theia`). This allows for clear separation of concerns between different functionalities and environments. Deployment infrastructure (Dockerfiles, Helm charts) is managed in the `submodules/archiverse-infra` submodule.

## High-Level Structure (CrossModel Alignment)

*(A diagram illustrating the main components and their interactions, similar to the CrossModel diagram, would be beneficial here)*

The architecture aligns with the CrossModel pattern, separating the main Theia environment from a dedicated Server Process hosting core logic:

*   **Theia Environment:**
    *   **Application Shells (`apps/electron-app`, `apps/browser-app`):** The main application containers (Electron or Browser). They bundle Theia frontend and backend *contributions*.
    *   **Theia Backend Process:** Runs the main Theia backend Node.js environment. Hosts *contributions* that act as proxies to the `Server Process`.
        *   **Backend Contributions (`packages/theia-backend-extensions/`):** Contains extensions like `glsp-contribution` which receive requests from the frontend via Theia RPC and forward them to the actual servers in the `Server Process` via custom RPC (e.g., Sockets). Includes Model Hub contributions if used. See [Backend Contributions](./backend-extensions.md) for details.
    *   **Theia Frontend (`packages/theia-frontend-*`):** UI components running in the browser/renderer process (Explorer, GLSP Client, Forms Client, Menus, etc.). Communicate with the Theia Backend Process via Theia RPC. See [Frontend Extensions](./frontend-extensions.md) for details.
*   **Server Process (`apps/server-process/`):** A standalone Node.js process hosting the core logic and actual servers.
    *   **Core Language Logic (`submodules/archiverse-archie`):** Provides the Langium services (grammar, parser, validator, linker, scope provider, AST interfaces).
    *   **Persistence Implementations (`packages/persistence-*`):** Provides `persistence-graphdb` and `persistence-inmemory` implementations, consuming interfaces from `archiverse-archie`. The `server-process` selects one at startup.
    *   **GLSP Server (`glsp-server` within `server-process`):** The actual GLSP server implementation. Accesses core language services directly within the same process. Listens for connections from the `glsp-contribution` in the Theia Backend.
    *   **Model Service Facade (`model-service` within `server-process`):** Exposes core language and persistence functionalities (e.g., get/update AST, query) via a custom RPC interface (e.g., `ArchimateModelService`). Listens for connections from components like the `glsp-contribution` or potential Model Hub contributions in the Theia Backend.
*   **Protocol (`packages/protocol`):** Shared TypeScript types and interfaces for communication (e.g., RPC definitions between Theia Backend Contributions and the Server Process).
*   **Submodules:**
    *   `archiverse-archie`: Core language definition.
    *   `archiverse-infra`: Dockerfiles, Helm charts for deployment.
    *   Others (GLSP, etc.).

## Key Architectural Concepts

### Theia Environment vs. Server Process

Following the CrossModel pattern, the application separates the standard Theia environment (Frontend, Backend Contributions) from a dedicated `Server Process` (`apps/server-process/`) which hosts the core language logic, persistence, and actual backend servers (GLSP, Model Service Facade).

*   **Theia Backend Contributions (`packages/theia-backend-extensions/`):** Act as lightweight proxies within the main Theia backend process. They handle communication with the frontend via Theia RPC and forward requests to the `Server Process` via custom RPC (e.g., Sockets).
*   **`Server Process` (`apps/server-process/`):** The heavyweight process containing:
    *   Langium services from `archiverse-archie`.
    *   The selected persistence implementation (`persistence-graphdb` or `persistence-inmemory`).
    *   The actual GLSP Server logic.
    *   The `ArchimateModelService` RPC facade.
    Components within this process can interact directly.

### Client/Backend Contributions/Server Process Separation

*   **Frontend (Theia Client):** UI components within `packages/theia-frontend-*`. Runs in the browser/renderer. Communicates via Theia RPC to Backend Contributions.
*   **Backend Contributions (Theia Backend):** Proxy logic within `packages/theia-backend-extensions/`. Runs in the main Theia Backend Node.js process. Communicates via custom RPC to the Server Process.
*   **Server Process:** Core logic, persistence, GLSP server, Model Service facade within `apps/server-process/`. Runs as a separate Node.js process.

### Pluggable Persistence Layer

The core language logic (in `submodules/archiverse-archie`) is decoupled from the storage mechanism.
*   **Persistence Interface:** Defined within `archiverse-archie` (or implicitly expected by its services).
*   **Implementations:** Provided by `packages/persistence-graphdb` and `packages/persistence-inmemory` in this repository.
*   **`Server Process`:** Injects the chosen persistence implementation (based on configuration/environment) which handles:
    *   Managing the connection to the storage (graph DB or in-memory map).
    *   Handling optional seeding.
    *   Loading data and constructing Langium ASTs (`loadAstForUri`).
    *   Traversing Langium ASTs and persisting changes back (`saveAst`).
*   **Langium Integration:** Standard Langium services from `archiverse-archie` operate on the in-memory AST loaded/managed via the injected persistence service *within the Server Process*.

### Model Interaction via RPC

Components outside the `Server Process` interact with the model data via the RPC interface exposed by the `ArchimateModelService` facade running within the `Server Process`.

*   **`ArchimateModelService` Facade:** Exposed by `apps/server-process`, providing methods to get/update the AST, run validations, perform structural queries etc., using services from `archiverse-archie` and the injected persistence layer.
*   **Theia Backend Contributions (e.g., GLSP Contribution, Model Hub Contributions):** Act as RPC clients connecting to the `ArchimateModelService`. If Model Hub is used, its contributions run here and make RPC calls to the `ArchimateModelService` instead of accessing Langium services directly.
*   **Frontend Clients (`packages/theia-frontend-*`, Editors):** Use standard Theia RPC to talk to the Backend Contributions, which then relay requests to the `Server Process` via the custom RPC mechanism.

### Custom Model Explorer (`packages/theia-frontend-explorer`)

A dedicated custom Theia view replaces the standard File Explorer. It communicates via Theia RPC with a backend contribution (potentially part of `packages/theia-backend-extensions/`), which in turn uses RPC to call structural query methods on the `ArchimateModelService` facade in the `Server Process`.
