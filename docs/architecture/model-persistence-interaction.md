# Architecture: Model Persistence and Interaction

A core aspect of Archiverse Theia is its use of a graph database (or an in-memory equivalent) as the central repository for model data. Interaction with this data source is managed via the separate **Archiverse ontology host** process (`services/model-server`). This process integrates the logic derived from the **Archiverse ontology** (defined in `@ntrtd/archiverse-archie` and implemented via Langium), hosts a **Persistence Layer**, hosts the **GLSP Endpoint/Service**, and exposes the **Archiverse ontology API** for communication. Frontend and backend components interact with the **Archiverse ontology host** via RPC.

## Concept

The application uses:

*   **Centralized Archiverse ontology host (`services/model-server`):** This standalone Node.js process hosts and orchestrates key backend functions, designed to run as an independent service (e.g., a Kubernetes container):
    *   The **Archiverse ontology** logic: Handles language intelligence (parsing, validation, AST management, document store), built using Langium and the `@ntrtd/archiverse-archie` package.
    *   The **Persistence Layer**: Manages communication with the data source (GraphDB/in-memory).
    *   The **GLSP Endpoint/Service**: Provides graphical diagramming capabilities.
    *   The **Archiverse ontology API**: An internal API providing unified, non-LSP access to the ontology logic (document store) and the Persistence Layer for other components within the host (like the GLSP service) or external RPC callers.
    The host exposes this combined functionality via RPC endpoints based on the Archiverse ontology API.
*   **Theia Backend Contributions (`packages/theia-backend-extensions/`):** These components run in the main Theia backend process (within the **Theia Application** hosts). They act as RPC clients to the API exposed by the **Archiverse ontology host**. If **Theia Model Hub** is used, these contributions implement its interfaces (`ModelPersistenceContribution`, `ModelServiceContribution`) and translate Model Hub requests into RPC calls to the **Archiverse ontology host**.
*   **URI Identification:** Model elements are identified by custom URIs (e.g., `graphdb://Application/PaymentGateway`). These URIs are used throughout the system, including in RPC calls and **Theia Model Hub** interactions, to reference specific model elements within the data source managed by the **Archiverse ontology host**.
*   **Custom Explorer (`packages/theia-frontend-explorer`):** A dedicated frontend view within the **Theia Application**. It communicates via Theia RPC with a backend contribution (e.g., `ArchiverseQueryServiceContribution`), which in turn makes RPC calls to the **Archiverse ontology host** API to fetch structural data.
*   **Editors (GLSP, Forms):** Frontend editors within the **Theia Application** (`packages/theia-frontend-glsp`, `packages/theia-frontend-forms`). They request model data for a specific `graphdb://` URI. This request goes through the Theia backend contributions (either directly or via **Theia Model Hub**), which then make RPC calls to the **Archiverse ontology host** API to load the data via the **Persistence Layer**. Saving works similarly in reverse.

## Architecture Components Involved

*   **`services/model-server` (Archiverse ontology host):**
    *   Integrates the **Archiverse ontology** logic (using `@ntrtd/archiverse-archie`).
    *   Hosts the active **Persistence Layer** (`persistence-graphdb` or `persistence-inmemory`).
    *   Hosts the **GLSP Endpoint/Service**.
    *   Exposes the **Archiverse ontology API** over RPC.
*   **`packages/theia-backend-extensions/`:**
    *   Run within the **Theia Application** backend.
    *   Contains contributions like `glsp-contribution` and potentially **Theia Model Hub** contributions.
    *   Act as RPC clients to the **Archiverse ontology host** API.
*   **`packages/theia-frontend-explorer`:**
    *   Runs within the **Theia Application** frontend.
    *   Custom Theia view UI.
    *   Communicates via Theia RPC with backend contributions to fetch data.
    *   Triggers commands to open editors using `graphdb://` URIs.
*   **`packages/theia-frontend-glsp` / `packages/theia-frontend-forms`:**
    *   Run within the **Theia Application** frontend.
    *   Frontend editors activated based on `graphdb://` URIs.
    *   Communicate via Theia RPC/WebSockets with backend contributions to request/update model data, which in turn communicate with the **Archiverse ontology host**.

## Benefits

*   Clear separation of concerns between core ontology/persistence logic (**Archiverse ontology host** integrating **Archiverse ontology** logic and **Persistence Layer**), Theia backend integration (`theia-backend-extensions`), and UI presentation (`theia-frontend-*`).
*   Allows the **Archiverse ontology host** to run independently (e.g., as a container), facilitating different deployment scenarios and scaling.
*   Enables a custom, potentially richer browsing experience tailored to graph structures compared to a standard file tree, driven by queries to the **Archiverse ontology host**.
