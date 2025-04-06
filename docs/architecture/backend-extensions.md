# Backend Contributions (`packages/theia-backend-extensions/`)

This section details the components running within the main Theia Backend Node.js process. These act primarily as contributions or proxies, communicating with the actual servers running in the separate `apps/server-process`.

## `glsp-contribution` (within `packages/theia-backend-extensions/`)

*   **Purpose:** Acts as the communication endpoint within the Theia backend for GLSP diagram requests originating from the frontend (`packages/theia-frontend-glsp`). It forwards these requests to the actual GLSP server running in the `apps/server-process`.
*   **Responsibilities:**
    *   Registers itself as a Theia backend contribution (e.g., implementing `BackendApplicationContribution`).
    *   Listens for incoming GLSP requests (likely via WebSockets established by the frontend GLSP client).
    *   Establishes and manages a connection (e.g., JSON RPC over Sockets) to the dedicated GLSP server endpoint exposed by the `apps/server-process`.
    *   Forwards incoming GLSP requests from the frontend client to the GLSP server in the `server-process`.
    *   Relays responses and model updates from the GLSP server back to the frontend client.
*   **Integration:** Runs within the Theia backend process. Communicates with `packages/theia-frontend-glsp` via Theia WebSockets/RPC and with the GLSP server in `apps/server-process` via custom Socket RPC. It does *not* contain the core GLSP logic itself.

## Model Hub Contributions (if used, within `packages/theia-backend-extensions/`)

*   **Purpose:** If Theia's Model Hub framework is used for managing model access (instead of direct RPC calls from GLSP/Forms contributions), these components integrate Model Hub with the `ArchimateModelService` facade in the `apps/server-process`.
*   **Responsibilities:**
    *   **`ArchimatePersistenceContribution`:**
        *   Implements Model Hub's `ModelPersistenceContribution`.
        *   Handles `loadModel(uri)` requests from Model Hub clients (like GLSP or Forms contributions *within the Theia backend*) by making an RPC call to the `ArchimateModelService` facade in the `server-process` (e.g., `getAstWithDiagnostics(uri)`).
        *   Handles `saveModel(uri, model)` requests by making an RPC call to the `ArchimateModelService` (e.g., `updateAst(uri, ...)`).
    *   **`ArchimateQueryServiceContribution` (Example Name):**
        *   Implements Model Hub's `ModelServiceContribution`.
        *   Exposes structural query methods needed by frontend clients (like `theia-frontend-explorer`).
        *   Handles requests by making corresponding RPC calls to the `ArchimateModelService` in the `server-process`.
*   **Integration:** Runs within the Theia backend process alongside Model Hub. Acts as an RPC client to the `ArchimateModelService` in the `server-process`.

## Other Backend Contributions (e.g., for Tools, Forms)

*   Similar contributions might exist for handling form submissions or triggering import/export tools.
*   These would typically receive requests from their corresponding frontend packages via Theia RPC and then make RPC calls to the `ArchimateModelService` facade in the `server-process` to perform the required actions on the model data.

## Lifecycle Management (Potential for Desktop)

*   In an Electron setup, one of these backend contributions (or a dedicated lifecycle contribution) *may* be responsible for launching and managing the lifecycle of the `apps/server-process`. In Kubernetes, this is handled externally.
