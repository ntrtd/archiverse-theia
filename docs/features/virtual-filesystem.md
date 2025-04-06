# Feature: Graph Database Backend and Model Interaction

A core aspect of Archiverse Theia is its use of a graph database as the central repository for model data. Interaction with this database is managed via the separate `apps/server-process` which hosts the core language services (`submodules/archiverse-archie`) and a persistence layer (`packages/persistence-graphdb` or `packages/persistence-inmemory`). Frontend and backend components interact with this process via RPC.

## Concept

The application uses:

*   **Centralized Server Process (`apps/server-process`):** This standalone Node.js process handles all direct communication with the graph database (via the injected persistence layer) and manages the core language logic (parsing, validation, AST). It exposes an `ArchimateModelService` RPC facade.
*   **Theia Backend Contributions (`packages/theia-backend-extensions/`):** These components run in the main Theia backend process. They act as RPC clients to the `ArchimateModelService` in the `server-process`. If Model Hub is used, these contributions implement Model Hub interfaces (`ModelPersistenceContribution`, `ModelServiceContribution`) and translate Model Hub requests into RPC calls to the `server-process`.
*   **URI Identification:** Model elements are identified by custom URIs (e.g., `graphdb://Application/PaymentGateway`). These URIs are used throughout the system, including in RPC calls and Model Hub interactions.
*   **Custom Explorer (`packages/theia-frontend-explorer`):** A dedicated frontend view provides the UI for browsing the model structure. It communicates via Theia RPC with a backend contribution (e.g., `ArchimateQueryServiceContribution`), which in turn makes RPC calls to the `ArchimateModelService` in the `server-process` to fetch structural data.
*   **Editors (GLSP, Forms):** Frontend editors (`packages/theia-frontend-glsp`, `packages/theia-frontend-forms`) request model data for a specific `graphdb://` URI. This request goes through the Theia backend contributions (either directly or via Model Hub), which then make RPC calls to the `ArchimateModelService` in the `server-process` to load the data via the persistence layer. Saving works similarly in reverse.

## Architecture Components Involved

*   **`apps/server-process`:**
    *   Hosts `archiverse-archie` Langium services.
    *   Hosts the active persistence implementation (`persistence-graphdb` or `persistence-inmemory`).
    *   Exposes the `ArchimateModelService` RPC facade.
*   **`packages/theia-backend-extensions/`:**
    *   Contains contributions like `glsp-contribution` and potentially Model Hub contributions (`ArchimatePersistenceContribution`, `ArchimateQueryServiceContribution`).
    *   Act as RPC clients to the `ArchimateModelService`.
*   **`packages/theia-frontend-explorer`:**
    *   Custom Theia view UI.
    *   Communicates via Theia RPC with backend contributions to fetch data.
    *   Triggers commands to open editors using `graphdb://` URIs.
*   **`packages/theia-frontend-glsp` / `packages/theia-frontend-forms`:**
    *   Frontend editors activated based on `graphdb://` URIs.
    *   Communicate via Theia RPC/WebSockets with backend contributions (e.g., `glsp-contribution` or Model Hub contributions) to request/update model data.

## Benefits

*   Clear separation of concerns between core language/persistence logic (`server-process`), Theia backend integration (`theia-backend-extensions`), and UI presentation (`theia-frontend-*`).
*   Allows the core logic and persistence layer to run independently, facilitating different deployment scenarios (local process vs. container).
*   Enables a custom, potentially richer browsing experience tailored to graph structures compared to a standard file tree, driven by queries to the `server-process`.
