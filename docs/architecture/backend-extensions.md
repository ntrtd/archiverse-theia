# Backend Contributions (`packages/theia-backend-extensions/`)

This section details the components running within the main Theia Backend Node.js process (part of the **Theia Application** hosts). These act primarily as contributions or proxies, communicating with the actual backend logic running in the separate **Archiverse ontology host** process (`services/model-server`).

## `glsp-contribution` (within `packages/theia-backend-extensions/`)

*   **Purpose:** Acts as the communication endpoint within the Theia backend for GLSP diagram requests originating from the frontend (`packages/theia-frontend-glsp`). It forwards these requests to the **GLSP Endpoint/Service** running within the **Archiverse ontology host** process.
*   **Responsibilities:**
    *   Registers itself as a Theia backend contribution (e.g., implementing `BackendApplicationContribution`).
    *   Listens for incoming GLSP requests (likely via WebSockets established by the frontend GLSP client).
    *   Establishes and manages a connection (e.g., JSON RPC over Sockets) to the dedicated **GLSP Endpoint/Service** exposed by the **Archiverse ontology host** process.
    *   Forwards incoming GLSP requests from the frontend client to the **GLSP Endpoint/Service** in the **Archiverse ontology host** process.
    *   Relays responses and model updates from the **GLSP Endpoint/Service** back to the frontend client.
*   **Integration:** Runs within the Theia backend process. Communicates with `packages/theia-frontend-glsp` via Theia WebSockets/RPC and with the **GLSP Endpoint/Service** provided by the **Archiverse ontology host** via custom Socket RPC. It does *not* contain the core GLSP logic itself.

## Model Hub Contributions (if used, within `packages/theia-backend-extensions/`)

*   **Purpose:** If **Theia Model Hub** framework is used for managing model access (instead of direct RPC calls from GLSP/Forms contributions), these components integrate Model Hub with the **Archiverse ontology API** exposed by the **Archiverse ontology host** process.
*   **Responsibilities:**
    *   **`ArchiversePersistenceContribution` (Example Name):**
        *   Implements Model Hub's `ModelPersistenceContribution`.
        *   Handles `loadModel(uri)` requests from Model Hub clients (like GLSP or Forms contributions *within the Theia backend*) by making an RPC call to the **Archiverse ontology API** provided by the **Archiverse ontology host** (e.g., `getAstWithDiagnostics(uri)`).
        *   Handles `saveModel(uri, model)` requests by making an RPC call to the **Archiverse ontology API** provided by the **Archiverse ontology host** (e.g., `updateAst(uri, ...)`).
    *   **`ArchiverseQueryServiceContribution` (Example Name):**
        *   Implements Model Hub's `ModelServiceContribution`.
        *   Exposes structural query methods needed by frontend clients (like `theia-frontend-explorer`).
        *   Handles requests by making corresponding RPC calls to the **Archiverse ontology API** provided by the **Archiverse ontology host**.
*   **Integration:** Runs within the Theia backend process alongside **Theia Model Hub**. Acts as an RPC client to the **Archiverse ontology API** provided by the **Archiverse ontology host**. The **Archiverse ontology host** internally uses mechanisms like the **Archiverse ontology API** implementation to provide a stable interface for these RPC calls. (See dedicated documentation for the **Archiverse ontology host** for internal details).

## Other Backend Contributions (e.g., for Tools, Forms)

*   Similar contributions might exist for handling form submissions or triggering import/export tools.
*   These would typically receive requests from their corresponding frontend packages via Theia RPC and then make RPC calls to the **Archiverse ontology API** exposed by the **Archiverse ontology host** process to perform the required actions on the model data.

## Lifecycle Management (Potential for Desktop)

*   In an Electron setup, one of these backend contributions (or a dedicated lifecycle contribution) *may* be responsible for launching and managing the lifecycle of the **Archiverse ontology host** process. In Kubernetes, this is handled externally.
