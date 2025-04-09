# Archiverse Theia

This repository (`archiverse-theia`) contains the source code for the Archiverse integrated modeling environment, built upon the Eclipse Theia platform. It provides the user interface (editors, views, diagrams) and the necessary integration components to interact with the core Archiverse backend services.

The architecture relies heavily on external services for core functionality, particularly the `archiverse-model-server` (for language processing, persistence, GLSP backend) and `@ntrtd/archiverse-ontology` (for the Langium grammar). This `archiverse-theia` repository focuses on building the Theia-specific parts that consume these external services. This separation pattern is similar to the `crossmodel` reference implementation (`submodules/crossmodel`), which also separates its core server logic into a distinct process, although `crossmodel` manages that process differently (via an internal VS Code extension).

For detailed architectural documentation, please refer to the files within the `docs/` directory, particularly [Architecture Overview](./architecture/index.md) and [Model Persistence and Interaction](./architecture/model-persistence-interaction.md).

## High-Level Architecture and `crossmodel` Comparison

Archiverse Theia follows a client-server architecture common in modern IDEs and DSL tools, separating the UI/integration layer (this repo) from the core backend logic (external `archiverse-model-server`).

1.  **`archiverse-model-server` (External Repository/Process):**
    *   **Role:** The "brain" of the system, hosting Langium services (using `@ntrtd/archiverse-ontology`), the Persistence Layer, the GLSP Server, and the Model Service API. It's the single source of truth for model data and domain logic. (See: https://github.com/ntrtd/archiverse-model-server)
    *   **`crossmodel` Comparison:** Analogous to the separate "Server Process / VS Code Extension Host" in `crossmodel`'s architecture (see `submodules/crossmodel/docs/Architecture.png`) which bundles Langium, GLSP, and Model Servers. The key difference is `archiverse-model-server`'s complete externalization versus `crossmodel`'s internal management via `submodules/crossmodel/extensions/crossmodel-lang/`.

2.  **`archiverse-theia` Theia Applications (`hosts/` - This Repo):**
    *   **Role:** Runnable Electron or Browser-based shells assembling the Theia extensions from `packages/`. They provide the application entry point.
    *   **`crossmodel` Comparison:** Directly comparable to `submodules/crossmodel/applications/`.

3.  **`archiverse-theia` Reusable Packages & Theia Extensions (`packages/` - This Repo):**
    *   **Role:** Contains the UI components and integration logic specific to Theia.
        *   **Frontend Extensions (`theia-frontend-*`):** Provide UI elements like diagrams (`theia-frontend-glsp`), forms (`theia-frontend-forms`), and explorers (`theia-frontend-explorer`). Communicate via Theia RPC. Comparable to `submodules/crossmodel/packages/glsp-client`, `form-client`.
        *   **Backend Extensions (`theia-backend-extensions`):** Run in the Theia backend process. Act as proxies, receiving Theia RPC calls and forwarding them to the external `archiverse-model-server` via custom RPC (using `protocol`). Comparable to `submodules/crossmodel/packages/core` and other backend contributions acting as clients to `crossmodel`'s server process.
        *   **Protocol (`protocol`):** Defines the custom RPC contract between Theia backend extensions and the external `archiverse-model-server`.
    *   **`crossmodel` Comparison:** The structure and purpose of frontend/backend extensions acting as clients/proxies to a separate server process is a very similar pattern.

This separation ensures that core logic (external) is decoupled from the UI/IDE framework (this repo), promoting modularity, independent scaling, and reusability, aligning with modern software architecture principles also reflected in `crossmodel`'s design.

## Repository Structure

This project uses a monorepo structure managed by Yarn Workspaces and Lerna, organizing the Theia-specific components developed *within this repository*:

```
/archiverse-theia
├── packages/                 # Reusable Theia extensions and protocol definitions.
│   ├── theia-backend-extensions/ # Theia backend extensions (proxies to external model-server).
│   ├── theia-frontend-explorer/ # Theia frontend extension for model explorer view.
│   ├── theia-frontend-glsp/  # Theia frontend extension for GLSP diagram rendering.
│   ├── theia-frontend-forms/ # Theia frontend extension for form-based editing.
│   ├── ... (other frontend extensions) ...
│   └── protocol/             # Shared TypeScript types/interfaces for RPC with external model-server.
├── hosts/                    # Runnable Theia applications (assemble extensions from packages/).
│   ├── electron-app/         # Electron shell application.
│   ├── browser-app/          # Browser-based Theia shell application.
├── docs/                     # Project documentation.
├── package.json              # Root workspace config (Yarn Workspaces).
├── lerna.json                # Lerna configuration.
└── tsconfig.base.json        # Base TypeScript configuration.
```

*(Note: The core `archiverse-model-server`, its persistence layer implementations, and the `@ntrtd/archiverse-ontology` grammar definition reside in separate repositories and are treated as external dependencies).*

**Monorepo Benefits:** Keeps the related Theia UI and integration code developed *within this repository* together, simplifies dependency management between local packages (`protocol`, frontend/backend extensions), and facilitates refactoring across these Theia-specific components.

## Deployment Approach (Kubernetes & Operator Pattern)

The Archiverse architecture, with its separation of `archiverse-theia` and `archiverse-model-server`, is designed for deployment on container orchestration platforms like Kubernetes. The infrastructure for this is managed in the `archiverse-infra` repository.

A key aspect of the intended deployment strategy, inspired by `theia-cloud-helm` (`submodules/theia-cloud-helm`), involves using the **Kubernetes Operator pattern** for managing **dynamic, per-user sessions**:

*   **Theia Cloud Operator:** A controller running in Kubernetes watches for custom resources (CRDs like `Session`, defined in `archiverse-infra` based on `theia-cloud-helm`).
*   **Dynamic Provisioning:** When a user requests a session (e.g., via a portal), the operator automatically creates dedicated Pods for both the `archiverse-theia` backend and the `archiverse-model-server`.
*   **Isolation:** This provides strong isolation between user sessions.
*   **Configuration:** The operator injects necessary configuration, such as the specific internal address of the user's dedicated `archiverse-model-server` Pod, into the corresponding `archiverse-theia` backend Pod via environment variables (e.g., `MODEL_SERVER_RPC_URL`).
*   **Lifecycle Management:** The operator handles the creation and deletion of these session-specific resources.

This advanced deployment model enables multi-tenancy and efficient resource utilization, leveraging established cloud-native patterns. See the [Deployment Architecture](./architecture/deployment.md) documentation for more details.

## Getting Started

Please install all necessary [prerequisites](https://github.com/eclipse-theia/theia/blob/master/doc/Developing.md#prerequisites), including Node.js (>=18) and Yarn (v1.x).

1.  **Clone the Required Repositories:** You will likely need `archiverse-theia` (this repo) and `archiverse-model-server`. Ensure they are placed appropriately (e.g., in adjacent directories) if local development requires relative paths.
    ```bash
    git clone <repository-url-theia> archiverse-theia
    git clone <repository-url-model-server> archiverse-model-server # Adjust path as needed
    cd archiverse-theia
    ```

2.  **Initialize Submodules (if any in `archiverse-theia`):**
    ```bash
    git submodule update --init --recursive
    ```

3.  **Install Dependencies (in `archiverse-theia`):**
    ```bash
    yarn install
    ```
    *(This installs dependencies for all packages and host apps within the `archiverse-theia` workspace and runs initial builds via the `prepare` script).*

4.  **Install Dependencies (in `archiverse-model-server`):**
    ```bash
    cd ../archiverse-model-server # Adjust path as needed
    yarn install
    yarn build # Or appropriate build command for the model server
    cd ../archiverse-theia # Return to the theia directory
    ```

## Running the Electron Example (Development Mode)

Development typically involves running the external **`archiverse-model-server`** process and a **Theia Application** (e.g., Electron app from this repository) concurrently. See [Development Setup](./development/setup.md) for full details.

1.  **Start the External `archiverse-model-server` (Terminal 1):**
    Navigate to the separate `archiverse-model-server` repository directory and start its development server (likely configured for in-memory persistence).
    ```bash
    # Example command - actual command depends on archiverse-model-server repository
    cd ../archiverse-model-server # Adjust path as needed
    yarn start:dev # Or similar script
    ```
    Keep this running. Note the communication endpoint (e.g., RPC port for the Archiverse Model Service API) it logs, as this will be needed for the Theia app.

2.  **Start the Theia Application (e.g., Electron App) (Terminal 2):**
    In the `archiverse-theia` repository directory, start the Theia Application. It needs the address of the running `archiverse-model-server`. Configure this via an environment variable (e.g., `MODEL_SERVER_RPC_URL`).
    ```bash
    # Example commands (check root package.json for actual scripts)
    # Ensure Theia components in this repo are built (usually done by yarn install)

    # Set the environment variable pointing to the model server
    export MODEL_SERVER_RPC_URL=ws://localhost:<port_from_step_1>

    # Start the Theia Application
    yarn start:electron # Or similar start script for the specific Theia Application host
    ```

*Alternatively, use corresponding launch configurations in VS Code if available (these might handle setting environment variables and starting multiple processes).*
