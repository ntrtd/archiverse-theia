# Development Setup

This guide explains how to set up your environment to develop and run the Archiverse Theia application. It covers both local development (running processes directly on your machine) and development against a Kubernetes cluster (simulating the target deployment environment).

Development focuses on the components within *this* `archiverse-theia` repository (UI extensions, backend proxies, application hosts). However, for the application to function, the external `archiverse-model-server` repository must also be set up and run concurrently (either locally or deployed to the target Kubernetes cluster).

## Prerequisites

*   **Standard Tools:**
    *   **Git:** For cloning repositories (`archiverse-theia`, `archiverse-model-server`, `archiverse-infra`).
    *   **Node.js:** Version 18 or higher (LTS recommended). Use [nvm](https://github.com/nvm-sh/nvm) or similar.
    *   **Yarn:** Version 1.x (Classic). Install globally via `npm install -g yarn`.
    *   **(Optional) Python & Build Tools:** For native Node.js module compilation if needed by specific Theia extensions (See Theia/`node-gyp` docs).
*   **Kubernetes Development Tools (Optional but Recommended):**
    *   **Docker:** For building container images.
    *   **`kubectl`:** Kubernetes CLI tool.
    *   **`helm`:** Kubernetes package manager.
    *   **`skaffold`:** Tool for automating build/deploy workflows for Kubernetes (used by `archiverse-infra`).
    *   **Local Kubernetes Cluster:** Minikube, Kind, Docker Desktop Kubernetes, etc., *OR* access to a remote development/staging cluster.

## Setup Steps (Common Base)

1.  **Clone Repositories:** Clone the necessary Archiverse repositories. It's recommended to place them in adjacent directories to facilitate local path references if needed.
    ```bash
    git clone <repository-url-theia> archiverse-theia
    git clone <repository-url-model-server> archiverse-model-server
    git clone <repository-url-infra> archiverse-infra # Needed for K8s dev/deployment configs
    cd archiverse-theia
    ```
2.  **Initialize Submodules:** Ensure any submodules (like `theia-cloud-helm` within `archiverse-infra`, or potentially others) are initialized.
    ```bash
    # In archiverse-theia
    git submodule update --init --recursive
    # In archiverse-infra
    cd ../archiverse-infra
    git submodule update --init --recursive
    cd ../archiverse-theia
    ```
3.  **Install Dependencies (`archiverse-theia`):** Install dependencies for all Theia packages and host apps within this workspace. This also builds local packages via `prepare`.
    ```bash
    yarn install
    ```
4.  **Install & Build Dependencies (`archiverse-model-server`):** Prepare the external model server.
    ```bash
    cd ../archiverse-model-server # Adjust path as needed
    yarn install
    yarn build # Or the specific build command
    cd ../archiverse-theia
    ```
    *   **`crossmodel` Comparison:** Note the multi-repo dependency setup here, unlike `crossmodel`'s single monorepo `yarn install`.

## Building Theia Components (within `archiverse-theia`)

Building focuses on compiling local TypeScript code and bundling host applications.

*(Note: Exact commands depend on the root `package.json` scripts)*

1.  **Build Packages (`packages/*`):** Automatically done via `yarn install`'s `prepare` step. Manual rebuild: `yarn prepare`.
2.  **Build Electron App Bundle:** `yarn build:electron`. Creates the desktop application bundle.
3.  **Build Browser App Bundle:** `yarn build:browser`. Creates the web application bundle (used for Kubernetes deployment).

*(Building the `archiverse-model-server` container image is handled by processes defined in `archiverse-infra`, often orchestrated by Skaffold or CI/CD).*

## Running - Option 1: Local Development Mode

Run both the `archiverse-model-server` and `archiverse-theia` host as separate local processes.

1.  **Start `archiverse-model-server` (Terminal 1):**
    *   Navigate to its directory and run its dev script.
    ```bash
    cd ../archiverse-model-server
    yarn start:dev # Or similar
    ```
    *   Note the **Model Service API endpoint** address (e.g., `ws://localhost:8080`). Keep this terminal running.

2.  **Start `archiverse-theia` (Terminal 2):**
    *   In the `archiverse-theia` directory, set the `MODEL_SERVER_RPC_URL` environment variable to the address from step 1.
    ```bash
    export MODEL_SERVER_RPC_URL=ws://localhost:8080 # Adjust if needed
    yarn start:electron # For Electron app
    # OR
    # yarn start:browser # For Browser app (access at http://localhost:3000 usually)
    ```
    *   The Theia backend extensions use `MODEL_SERVER_RPC_URL` to connect.

## Running - Option 2: Development Against Kubernetes (using Skaffold)

This approach uses tools defined in `archiverse-infra` to simulate the production deployment environment more closely on a local or remote Kubernetes cluster. It typically leverages Skaffold.

*   **Prerequisites:** Ensure Kubernetes tools (Docker, kubectl, Skaffold, Helm) are installed and configured to point to your target cluster.
*   **Action:** Navigate to the `archiverse-infra` repository directory and use Skaffold commands.
    ```bash
    cd ../archiverse-infra # Adjust path as needed
    # Run Skaffold in development mode (watches files, auto builds/deploys)
    skaffold dev -p <profile_name> # Profile likely defined for dev environment
    # Or run a single deployment cycle
    # skaffold run -p <profile_name>
    ```
*   **What Skaffold Does (typically configured in `archiverse-infra/skaffold.yaml`):**
    *   Builds container images for `archiverse-theia` (browser host) and `archiverse-model-server` if code has changed.
    *   Deploys/updates resources to Kubernetes using Helm charts and/or Kustomize overlays defined in `archiverse-infra`. This includes deploying:
        *   Shared services (Database, Keycloak, Kong, etc.).
        *   The Theia Cloud / Archiverse Operator and CRDs.
        *   Potentially creates a default `ArchiverseSession` CR or relies on a gateway/portal to do so.
    *   Sets up port-forwarding automatically, allowing access to the Theia application frontend (e.g., `http://localhost:PORT_FORWARD_PORT`) and other services via your local machine.
    *   Streams logs and watches for file changes to trigger redeployment.
*   **Configuration:** `MODEL_SERVER_RPC_URL` is handled **within Kubernetes**. The Operator dynamically injects the correct internal Kubernetes Service DNS name into the Theia backend pod when creating session resources. Skaffold simply deploys the manifests that enable this mechanism.

*Refer to `archiverse-infra` documentation and `skaffold.yaml` for specific profiles and commands.*

## Communication Configuration Summary

The method for configuring the `MODEL_SERVER_RPC_URL` (used by `packages/theia-backend-extensions/` to find the model server) depends on the run mode:

*   **Local Development:** Set manually via `export MODEL_SERVER_RPC_URL=ws://localhost:PORT`.
*   **Kubernetes (Operator):** Injected **dynamically** by the Operator into session pods using the internal Kubernetes Service DNS name (e.g., `ws://session-<id>-model-svc.namespace.svc.cluster.local:PORT`). Configuration originates from the Operator's logic reacting to `ArchiverseSession` CRs.
*   **Kubernetes (Shared Server - less likely):** Injected **statically** via the Theia backend's Deployment manifest, pointing to the stable Kubernetes Service DNS name of the shared model server.

## Watching for Changes

*   **Local Development:**
    *   `archiverse-theia`: Use `yarn watch:electron` or `yarn watch:browser` in this repo.
    *   `archiverse-model-server`: Use its specific watch command (e.g., `yarn watch` or `yarn start:dev`) in its repo. Requires manual restarts often.
*   **Kubernetes (Skaffold):** `skaffold dev` handles watching files in configured source directories (across multiple repos if set up) and automatically triggers container rebuilds and redeployments to the cluster.

Choose the development mode that best suits your needs and familiarity with the tools involved. Local development is simpler initially, while Skaffold provides higher fidelity to the production environment.
