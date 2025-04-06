# Archiverse Theia

This repository contains the source code for Archiverse Theia, an integrated modeling environment based on the Eclipse Theia platform, leveraging the Archiverse language and a graph database backend.

## Repository Structure

This project uses a monorepo structure managed by Yarn Workspaces and potentially Lerna. The goal is to facilitate development and refactoring while organizing components logically for potential future containerization or separation into distinct repositories.

```
/archiverse-theia
├── packages/                 # Reusable libraries and Theia extensions
│   ├── core-language/        # Core Langium logic (grammar, parser, validation, linking, scope). Persistence-agnostic.
│   ├── persistence-graphdb/  # Implements persistence using a real GraphDB (e.g., TinkerPop/Gremlin).
│   ├── persistence-inmemory/ # Implements persistence using an in-memory map (for Electron dev/testing).
│   ├── theia-backend-bridge/ # Theia backend extension connecting the backend to core-language via RPC. Injects a persistence implementation.
│   ├── theia-backend-glsp/   # Theia backend extension for GLSP server logic. Uses the bridge.
│   ├── theia-frontend-explorer/ # Theia frontend extension for the custom model explorer view.
│   ├── theia-frontend-glsp/  # Theia frontend extension for GLSP diagram rendering (using Sprotty).
│   ├── theia-frontend-forms/ # Theia frontend extension for form-based editing.
│   ├── ... (other frontend extensions: menus, tools, etc.) ...
│   └── protocol/             # Shared TypeScript types, interfaces, constants between components (e.g., RPC definitions, URIs, events).
├── apps/                     # Runnable applications and processes
│   ├── electron-app/         # Electron shell application. Assembles frontend + backend extensions. Configures which persistence impl to use.
│   ├── browser-app/          # Browser-based Theia shell application (similar assembly).
│   └── language-server-process/ # Standalone Node.js wrapper to run core-language + a selected persistence impl (graphdb or inmemory) as a separate process. Defines the RPC server endpoint.
├── dockerfiles/              # (Future/Documentation) Central location for Dockerfiles defining container builds.
│   ├── Dockerfile.language-server # Blueprint for building the language server process image.
│   ├── Dockerfile.theia-backend   # Blueprint for building the Theia backend image.
│   └── Dockerfile.frontend        # Blueprint for building static frontend assets.
├── docs/                     # Project documentation (architecture, features, setup, scenarios).
├── submodules/               # Git submodules for external dependencies or reference implementations.
├── package.json              # Root workspace config (Yarn Workspaces).
├── lerna.json                # Lerna configuration (optional, for publishing/versioning).
└── tsconfig.base.json        # Base TypeScript configuration, extended by packages/apps.
```

**Rationale:**

*   **`packages/`:** Contains the core building blocks. Separating `core-language` from `persistence-*` allows swapping the backend storage easily (in-memory for dev, graphdb for production). Theia extensions are clearly delineated as `theia-backend-*` or `theia-frontend-*`. The `protocol` package ensures consistent communication interfaces.
*   **`apps/`:** Contains the entry points for running the different parts of the system. `electron-app` and `browser-app` assemble the final Theia application. `language-server-process` explicitly defines the standalone server that runs the core logic + persistence, making it easy to target for containerization or separate execution.
*   **`dockerfiles/`:** While not used for the current Electron build, this directory documents the containerization strategy for each deployable component (`language-server-process`, `theia-backend`, `frontend`), preparing the project for future Kubernetes or Docker Compose deployments.
*   **Monorepo Benefits:** Keeps related code together, simplifies dependency management between local packages, and facilitates cross-cutting changes and refactoring during active development.

This structure supports the immediate goal of developing an Electron application with an in-memory database while providing a clear roadmap and organization for deploying components independently in containerized environments later.

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

*(Note: Specific commands might need adjustment based on the final package.json scripts after refactoring)*

```bash
# Build all packages and the electron app
yarn build:electron

# Start the electron app (likely configured to use persistence-inmemory)
yarn start:electron
```

*or launch corresponding configurations from VS Code.*

*(Sections for Browser App, Developing, Publishing might need updates after refactoring)*
