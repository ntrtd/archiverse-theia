# Development Setup

This guide explains how to set up your environment to develop the Archiverse Theia application.

## Prerequisites

*   **Git:** For cloning the repository and managing submodules.
*   **Node.js:** Version 18 or higher (LTS recommended). Use [nvm](https://github.com/nvm-sh/nvm) or similar to manage Node versions.
*   **Yarn:** Version 1.x (Classic). Install via `npm install -g yarn`.
*   **(Optional) Python & Build Tools:** Required for building native Node.js modules used by some Theia extensions. On macOS, installing Xcode Command Line Tools (`xcode-select --install`) is usually sufficient. On other systems, consult Node.js/`node-gyp` documentation. Ensure `setuptools` is installed for your Python version if using Python 3.12+ (`pip install setuptools`).

## Setup Steps

1.  **Clone the Repository:**
    ```bash
    git clone <repository-url> archiverse-theia
    cd archiverse-theia
    ```

2.  **Initialize Submodules:** Fetch the code for all included submodules (especially `archiverse-archie` and `archiverse-infra`).
    ```bash
    git submodule update --init --recursive
    ```

3.  **Install Dependencies:** Install dependencies for the root workspace and all packages/apps.
    ```bash
    yarn install
    ```
    *(This uses Yarn Workspaces to link local packages/apps).*

## Building the Application (Conceptual)

*(Note: Exact commands depend on the final scripts in the root `package.json`)*

A full build would typically involve:

1.  **Building Submodules:** Ensure necessary submodules like `archiverse-archie` are built.
    ```bash
    # Example: Build archiverse-archie if needed
    yarn --cwd submodules/archiverse-archie build
    ```
2.  **Building Packages & Apps:** Compile TypeScript code for all packages and apps in this repository.
    ```bash
    yarn build # Runs 'tsc' or similar in all workspaces
    ```
3.  **Building Electron App:** Package the Electron application.
    ```bash
    yarn build:electron # Specific script in root package.json
    ```
4.  **Building Browser App:** Package the Browser application.
    ```bash
    yarn build:browser # Specific script in root package.json
    ```

## Running the Application (Development Mode)

Development typically involves running the Theia Electron app and the separate `server-process` concurrently.

1.  **Start the Server Process (with In-Memory Persistence):**
    This process hosts the core language services and persistence layer. For development, we usually use the in-memory persistence.
    ```bash
    # Command to start the server process configured for in-memory persistence
    # This might read environment variables or command-line args to select the persistence module.
    yarn start:server:inmemory
    ```
    *(This command needs to be defined in the root `package.json`. It would likely run `node apps/server-process/lib/main.js --persistence=inmemory` or similar).*
    Keep this process running in a separate terminal. Note the port its RPC service (`ArchimateModelService`) is listening on (this needs to be configured).

2.  **Start the Electron App:**
    The Electron app needs to be configured to connect to the running `server-process`. This configuration might happen via environment variables passed to the start script or potentially Theia preferences (`settings.json`).
    ```bash
    # Ensure necessary components are built (might be part of start script)
    yarn build:electron:dev

    # Start the Electron app
    yarn start:electron
    ```
    *(The `start:electron` script in the root `package.json` would launch the app defined in `apps/electron-app`).*

## Configuring the Persistence Layer (Conceptual)

The `apps/server-process` needs to know which persistence layer (`packages/persistence-inmemory` or `packages/persistence-graphdb`) to use and how to connect to the data source if applicable.

*   **Selection:** This could be controlled via:
    *   **Environment Variable:** e.g., `ARCHIVERSE_PERSISTENCE=inmemory` or `ARCHIVERSE_PERSISTENCE=graphdb`. The `apps/server-process/src/main.ts` would read this variable to load the correct module.
    *   **Command-line Argument:** e.g., `node apps/server-process/lib/main.js --persistence inmemory`.
*   **Connection (for `persistence-graphdb`):**
    *   Database connection details (URL, credentials) should be provided via environment variables (e.g., `GRAPHDB_URL`, `GRAPHDB_USER`, `GRAPHDB_PASSWORD`) or a configuration file. These should **not** be hardcoded. For Kubernetes, these would be injected via Secrets and ConfigMaps defined in `submodules/archiverse-infra`.
    *   For local development with `persistence-graphdb`, you would typically run a graph database locally (e.g., TinkerPop Gremlin Server in Docker or standalone) and set the corresponding environment variables before starting the `server-process`.
        ```bash
        # Example for local Gremlin Server
        export GRAPHDB_URL="ws://localhost:8182/gremlin"
        yarn start:server:graphdb
        ```
*   **Seeding:** The chosen persistence layer (`persistence-graphdb` or `persistence-inmemory`) would handle database seeding based on configuration (e.g., an environment variable `SEED_ON_INIT=true`).

## Configuring Theia Backend <-> Server Process Communication

The Theia backend contributions (in `packages/theia-backend-extensions/`) need to know the address (host/port or socket path) of the `ArchimateModelService` RPC endpoint exposed by the running `apps/server-process`.

*   **Configuration:** This is typically configured via environment variables (e.g., `LANGUAGE_SERVER_RPC_URL`) read by the `theia-backend-bridge` package.
*   **Kubernetes:** The address would be the Kubernetes internal service name for the `server-process` deployment (e.g., `archiverse-server-process.default.svc.cluster.local:PORT`), injected via environment variables managed by Helm charts in `submodules/archiverse-infra`.
*   **Local Development:** When running both locally, the `server-process` would log its listening port, and the Electron app would be started with an environment variable pointing to `localhost:<port>`.

## Building for Production

*(Details TBD - typically involves running build scripts with production flags, e.g., `yarn build --mode production`. The actual container image builds are defined in `submodules/archiverse-infra`)*

## Watching for Changes (Development)

*(Details TBD - typically involves running `yarn watch` in the root, which would trigger parallel watch scripts in relevant packages/apps using tools like `tsc --watch` and potentially `nodemon` for the server process).*
