# Feature: GLSP Diagramming

This feature enables users to view and edit Archiverse models graphically using diagrams powered by the Graphical Language Server Platform (GLSP).

## Concept

Users can open visual, editable diagrams representing parts of the Archiverse model. When an element is selected (e.g., in the `theia-frontend-explorer`), its `graphdb://` URI can be used to launch a GLSP-based diagram editor. The frontend GLSP client communicates via the Theia backend (using a `glsp-contribution`) to the actual GLSP server running in the separate `apps/server-process`. This server fetches the necessary model data from the core language services (also in the `server-process`) and translates it into a graphical representation (`GModel`).

## Architecture Components

*   **`theia-frontend-glsp` (Frontend Package):**
    *   Responsible for rendering diagrams using GLSP client libraries (like Sprotty).
    *   Registers itself as an editor or opener for `graphdb://` URIs representing elements suitable for diagramming.
    *   Communicates via Theia RPC/WebSockets with the `glsp-contribution` in the Theia backend process.
    *   Sends user actions performed in the diagram (e.g., moving a node, creating an edge) as GLSP operations to the `glsp-contribution`.
    *   Receives graphical model (`GModel`) updates from the `glsp-contribution` and updates the rendered diagram accordingly.
*   **`glsp-contribution` (within `packages/theia-backend-extensions/`):**
    *   Runs in the main Theia backend process.
    *   Acts as a proxy between the frontend client and the actual GLSP server.
    *   Receives GLSP requests/operations from the frontend via Theia RPC/WebSockets.
    *   Forwards these requests/operations via custom RPC (e.g., Sockets) to the GLSP server in the `apps/server-process`.
    *   Relays responses (`GModel` updates) back from the GLSP server to the frontend.
*   **GLSP Server (within `apps/server-process/`):**
    *   Implements the GLSP server logic (protocol handlers, GModel factory, operation handlers) for the Archiverse domain.
    *   Receives requests and operations from the `glsp-contribution`.
    *   **Fetches Semantic Data:** When requested to generate a diagram for a specific `graphdb://` URI, it interacts *directly* with the `ArchimateModelService` facade (running in the same `server-process`). It requests the full semantic model (`ArchimateModelRoot`) and diagnostics for the given URI. The `ArchimateModelService` uses the injected persistence layer to load data.
    *   **Generates GModel:** Translates the received `ArchimateModelRoot` data into a graphical representation (`GModel`) suitable for the client renderer. This involves mapping Archiverse elements and relationships to shapes, lines, labels, etc., potentially including layout calculations and incorporating validation markers based on diagnostics.
    *   **Processes Operations:** When it receives graphical operations from the client (via the `glsp-contribution`), it translates these into semantic changes. It then calls the `ArchimateModelService` facade (again, within the same process) to update the model via the persistence layer.
    *   Sends `GModel` updates back to the `glsp-contribution` reflecting changes.

## Data Flow (Opening a Diagram)

1.  User selects an element (e.g., `graphdb://System/SysA`) in `theia-frontend-explorer` and triggers opening its diagram.
2.  Theia activates the `theia-frontend-glsp` editor for the URI.
3.  The `theia-frontend-glsp` client establishes a WebSocket connection via the Theia backend to the `glsp-contribution`.
4.  The client sends a `RequestModelAction` via the WebSocket to the `glsp-contribution`.
5.  The `glsp-contribution` forwards the `RequestModelAction` via custom RPC (Socket) to the GLSP Server in `apps/server-process`.
6.  The GLSP Server receives the request. Its `SourceModelStorage` implementation calls the `ArchimateModelService` facade (within the same process) to request the semantic model (`ArchimateModelRoot`) and diagnostics for `graphdb://System/SysA`.
7.  The `ArchimateModelService` uses the injected persistence layer (`persistence-graphdb` or `persistence-inmemory`) to query the data source.
8.  The persistence layer returns the data, which `ArchimateModelService` uses to construct the `ArchimateModelRoot` and run validations.
9.  The `ArchimateModelService` returns the `ArchimateModelRoot` and diagnostics to the GLSP Server's `SourceModelStorage`.
10. The GLSP Server's `GModelFactory` translates the `ArchimateModelRoot` and diagnostics into the graphical `GModel`.
11. The GLSP Server sends the `GModel` via the custom RPC (Socket) back to the `glsp-contribution`.
12. The `glsp-contribution` forwards the `GModel` via WebSocket to the `theia-frontend-glsp` client.
13. The client renders the diagram using Sprotty/GLSP libraries.

## Data Flow (Editing a Diagram)

1.  User performs an action in the diagram (e.g., drags a node).
2.  The `theia-frontend-glsp` client translates this into a GLSP operation and sends it via WebSocket to the `glsp-contribution`.
3.  The `glsp-contribution` forwards the operation via custom RPC (Socket) to the GLSP Server in `apps/server-process`.
4.  The GLSP Server's appropriate operation handler receives the operation.
5.  The handler modifies the semantic model by calling the `ArchimateModelService` facade (within the same process) to update the data via the persistence layer.
6.  The `ArchimateModelService` confirms success back to the GLSP handler.
7.  The GLSP Server potentially regenerates the relevant part of the `GModel` and sends an `UpdateModelAction` via custom RPC (Socket) back to the `glsp-contribution`.
8.  The `glsp-contribution` forwards the `UpdateModelAction` via WebSocket to the `theia-frontend-glsp` client.
9.  The client updates the diagram rendering. (Model Hub events might also be involved if Model Hub is used by other backend contributions).

*(Further details needed: Specific GModel mapping, layout strategies, handling of different diagram types)*
