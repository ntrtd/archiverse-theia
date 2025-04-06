# Archiverse Theia

This repository contains the source code for Archiverse Theia, an integrated modeling environment based on the Eclipse Theia platform, leveraging the Archiverse language and a graph database backend.

For detailed information, please refer to the **[Documentation](./docs/README.md)**.

## High-Level Architecture

Archiverse Theia follows a client-server architecture with a distinct separation between the core backend logic and the frontend applications:

1.  **Archiverse ontology host (`services/model-server`):** A standalone Node.js process that acts as the brain of the system. It integrates/hosts:
    *   The **Archiverse ontology** logic (using Langium for parsing, validation, linking, etc.), managing the central semantic model (AST).
    *   The **Persistence Layer** for saving/loading models (configurable for in-memory or GraphDB).
    *   The **GLSP Endpoint/Service** for graphical diagramming capabilities.
    *   An **Archiverse ontology API** providing a stable interface for internal components (like the GLSP service) and external RPC callers.
    This host process is designed to run independently.

2.  **Theia Applications (`hosts/`):** Runnable application shells built on the Eclipse Theia framework. These can be:
    *   An **Electron App** (`hosts/electron-app`)
    *   A **Browser App** (`hosts/browser-app`)
    These applications assemble various frontend and backend extensions. The Theia backend part of these applications communicates with the **Archiverse ontology host** (typically via RPC) to access language features, persistence, etc.

3.  **Reusable Packages & Extensions (`packages/`):** A collection of libraries and Theia extensions providing specific functionalities:
    *   **Persistence Implementations** (`persistence-graphdb`, `persistence-inmemory`).
    *   **Theia Frontend Extensions** (`theia-frontend-glsp`, `theia-frontend-forms`, `theia-frontend-explorer`, etc.) providing the user interface components.
    *   **Theia Backend Extensions** (`theia-backend-extensions`) providing integration points within the Theia backend process running inside the `hosts/` applications.
    *   **Shared Protocol** (`protocol`) defining data structures and interfaces used for communication between components.

This separation ensures that the core language and persistence logic is decoupled from the specific application host (Electron/Browser) and UI framework (Theia), promoting modularity and maintainability.

## Repository Structure

This project uses a monorepo structure managed by Yarn Workspaces and Lerna, organizing the components described above:

```
/archiverse-theia
├── packages/                 # Reusable libraries and Theia extensions (UI components, persistence, protocol)
│   ├── persistence-graphdb/  # Implements persistence using a real GraphDB.
│   ├── persistence-inmemory/ # Implements persistence using an in-memory map.
│   ├── theia-backend-extensions/ # Theia backend extensions running within hosts/ apps.
│   ├── theia-frontend-explorer/ # Theia frontend extension for model explorer view.
│   ├── theia-frontend-glsp/  # Theia frontend extension for GLSP diagram rendering.
│   ├── theia-frontend-forms/ # Theia frontend extension for form-based editing.
│   ├── ... (other frontend extensions) ...
│   └── protocol/             # Shared TypeScript types/interfaces.
├── hosts/                    # Runnable Theia applications (assemble extensions from packages/)
│   ├── electron-app/         # Electron shell application.
│   ├── browser-app/          # Browser-based Theia shell application.
├── services/                 # Standalone backend services
│   └── model-server/       # Archiverse ontology host (integrates Ontology logic, Persistence, GLSP endpoint, Ontology API).
├── docs/                     # Project documentation.
├── package.json              # Root workspace config (Yarn Workspaces).
├── lerna.json                # Lerna configuration.
└── tsconfig.base.json        # Base TypeScript configuration.
```

**Monorepo Benefits:** Keeps related code developed *within this repository* together, simplifies dependency management between local packages, and facilitates refactoring across components.

## Getting Started

Please install all necessary [prerequisites](https://github.com/eclipse-theia/theia/blob/master/doc/Developing.md#prerequisites), including Node.js (>=18) and Yarn (v1.x).

1.  **Clone the Repository:**
    ```bash
    git clone <repository-url> archiverse-theia
    cd archiverse-theia
    ```

2.  **Initialize Submodules:**
    ```bash
    git submodule update --init --recursive
    ```

3.  **Install Dependencies:**
    ```bash
    yarn install
    ```
    *(This installs dependencies for all packages and apps within the workspace).*

## Running the Electron Example (Development Mode)

Development typically involves running the **Archiverse ontology host** process (`services/model-server`) and a **Theia Application** (e.g., Electron app) concurrently. See [Development Setup](./docs/development/setup.md) for full details.

1.  **Start the Archiverse ontology host (Terminal 1):**
    This hosts the core logic. For development, use the in-memory persistence.
    ```bash
    # Example command (check root package.json for actual script, e.g., yarn workspace @archiverse-theia/model-server start:dev)
    yarn start:server:inmemory
    ```
    Keep this running. Note the communication endpoint (e.g., RPC port for the Archiverse ontology API) it logs.

2.  **Start the Theia Application (e.g., Electron App) (Terminal 2):**
    The Theia Application needs to connect to the running **Archiverse ontology host** process. This is usually configured via environment variables passed to the application host (e.g., `ONTOLOGY_HOST_RPC_URL=ws://localhost:<port>`).
    ```bash
    # Example commands (check root package.json for actual scripts)
    # Ensure components are built if needed
    yarn build:electron:dev # Or similar build script for the specific Theia Application host

    # Start the Theia Application (ensure ONTOLOGY_HOST_RPC_URL or similar is set)
    yarn start:electron # Or similar start script for the specific Theia Application host
    ```

*Alternatively, use corresponding launch configurations in VS Code if available.*
