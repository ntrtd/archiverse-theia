# Scenario: Import, AI Review, and Export ArchiMate Model

This scenario describes a common workflow for an enterprise architect using Archiverse Theia.

**Goal:** Import an existing ArchiMate model, leverage AI for analysis and documentation, potentially fix issues identified visually, and export the results.

**Actor:** Enterprise Architect

**Steps:**

# Scenario: Import, AI Review, and Export ArchiMate Model

This scenario describes a common workflow for an enterprise architect using Archiverse Theia, following the CrossModel-aligned architecture.

**Goal:** Import an existing ArchiMate model, leverage AI for analysis and documentation, potentially fix issues identified visually, and export the results.

**Actor:** Enterprise Architect

**Steps:**

1.  **Launch Application & Connect Services:**
    *   The architect launches the Archiverse Theia application (e.g., `apps/electron-app`).
    *   The separate `apps/server-process` **Node.js process** is started (either automatically by a backend contribution in Electron, or externally).
        *   *Initialization:* This process initializes Langium services from `submodules/archiverse-archie`, injects a persistence implementation (e.g., `packages/persistence-inmemory` for dev), starts the internal GLSP Server, and exposes the `ArchimateModelService` RPC facade.
    *   The selected persistence layer (e.g., `persistence-inmemory`) initializes. If `persistence-graphdb` is used, it connects to the configured database and performs seeding if required.
    *   The **Theia backend Node.js process** (part of the Electron app) starts, loading contributions from `packages/theia-backend-extensions/`, including the Model Hub framework if used.
    *   Backend contributions (e.g., `glsp-contribution`, Model Hub contributions) establish RPC connections to the `ArchimateModelService` facade and/or the GLSP Server endpoint in the running `apps/server-process`.
    *   **Definition of Done (Step 1):**
        *   The `apps/server-process` starts successfully, initializing Langium services, the selected persistence layer, the GLSP server, and the `ArchimateModelService` RPC facade.
        *   The persistence layer connects successfully if applicable (e.g., to a local TinkerPop instance for dev).
        *   The Theia backend process starts successfully.
        *   Theia backend contributions successfully establish RPC connections to the `apps/server-process`.

2.  **Navigate Workspace via Custom Explorer:**
    *   The architect focuses on the custom `theia-frontend-explorer` view.
    *   The explorer view uses Theia RPC (or Model Hub client API) to call a structural query method on a backend contribution (e.g., `ArchimateQueryServiceContribution` in `packages/theia-backend-extensions/`).
    *   The backend contribution relays this request via custom RPC to the `ArchimateModelService` facade in the `apps/server-process`.
    *   The `ArchimateModelService` uses the injected persistence layer to execute the corresponding graph query.
    *   Query results are returned via RPC to the backend contribution, which forwards them (as `ElementDescriptor[]`) via Theia RPC (or Model Hub) to the `theia-frontend-explorer`.
    *   The explorer view renders the received elements.
    *   Expanding nodes triggers subsequent calls following the same communication path (Explorer -> Theia RPC -> Backend Contribution -> Custom RPC -> Server Process -> Persistence -> DB -> Persistence -> Server Process -> Custom RPC -> Backend Contribution -> Theia RPC -> Explorer).
    *   **Definition of Done (Step 2):**
        *   The `theia-frontend-explorer` view is visible and functional.
        *   The view successfully requests and receives top-level `ElementDescriptor[]` data via the full communication chain.
        *   The top-level elements are correctly displayed.
        *   Expanding elements successfully fetches and displays child elements.

3.  **Import ArchiMate Model:**
    *   The architect selects "Import > ArchiMate File" from the menu (provided by `theia-frontend-menus`).
    *   The UI (`theia-frontend-tools`) triggers a Theia command handled by an import contribution in `packages/theia-backend-extensions/`.
    *   The import contribution receives the file content/path, parses the `.archimate` file, and translates it into a structured format.
    *   The import contribution makes one or more RPC calls to the `ArchimateModelService` facade in `apps/server-process` (e.g., `createOrUpdateElementsFromData(...)`) providing the structured data.
    *   The `ArchimateModelService` uses the injected persistence layer to create/update the corresponding nodes/relationships in the data source.
    *   Upon successful persistence, the `ArchimateModelService` might trigger an event or return success via RPC to the import contribution.
    *   The import contribution (if using Model Hub) emits Model Hub change events, or alternatively, the `server-process` could emit events over a dedicated channel that backend contributions subscribe to.
    *   The `theia-frontend-explorer`, listening to relevant events (Model Hub or custom), refreshes its view.
    *   **Definition of Done (Step 3):**
        *   The import menu action is functional.
        *   The backend import contribution successfully parses the file.
        *   The contribution successfully communicates the data via RPC to the `ArchimateModelService`.
        *   The `ArchimateModelService` successfully instructs the persistence layer to update the data source.
        *   Change events are propagated correctly.
        *   The `theia-frontend-explorer` view updates automatically.

4.  **Open Diagram & Review Violations:**
    *   The architect selects an element in `theia-frontend-explorer` and triggers opening its diagram.
    *   The `theia-frontend-glsp` editor is activated. It establishes a WebSocket connection via the Theia backend to the `glsp-contribution` (in `packages/theia-backend-extensions/`).
    *   The client sends a `RequestModelAction` to the `glsp-contribution`.
    *   The `glsp-contribution` forwards the request via custom RPC (Socket) to the GLSP Server in `apps/server-process`.
    *   The GLSP Server receives the request. Its `SourceModelStorage` calls the `ArchimateModelService` facade (in the same process) to get the semantic model (`ArchimateModelRoot`) and diagnostics for the URI.
    *   The `ArchimateModelService` uses the persistence layer to load data and runs Langium validation (`archiverse-archie`).
    *   The `ArchimateModelService` returns the model and diagnostics to the GLSP Server.
    *   The GLSP Server's `GModelFactory` translates the semantic model and diagnostics into a `GModel`.
    *   The `GModel` is sent via custom RPC back to the `glsp-contribution`, which forwards it via WebSocket to the `theia-frontend-glsp` client.
    *   The client renders the diagram, highlighting violations.
    *   The architect edits the diagram. Actions trigger GLSP operations sent via WebSocket -> `glsp-contribution` -> custom RPC -> GLSP Server.
    *   The GLSP Server operation handlers call the `ArchimateModelService` facade (in the same process) to modify the semantic model via the persistence layer.
    *   The GLSP Server sends `UpdateModelAction` back through the `glsp-contribution` to the client.
    *   **Definition of Done (Step 4):**
        *   Diagram view opens successfully.
        *   GLSP server fetches model and diagnostics correctly from the `ArchimateModelService`.
        *   Diagram renders correctly with violation markers.
        *   User edits are persisted via GLSP handlers calling the `ArchimateModelService`.
        *   Diagram view updates automatically.

5.  **Request AI Analysis & Summary:**
    *   The architect uses the Theia AI Chat view (`@theia/ai-chat-ui`).
    *   The prompt is processed by Theia AI Core in the backend process.
    *   The LLM is instructed to use tools from a custom MCP Server.
    *   The MCP Server tool implementation makes calls (HTTP/RPC) to the **`ArchimateModelService` facade** in `apps/server-process` (potentially routed via an API contribution in `packages/theia-backend-extensions/`).
    *   The `ArchimateModelService` uses the persistence layer to execute the query.
    *   Results flow back: DB -> Persistence -> `ArchimateModelService` -> RPC -> [Backend Contribution?] -> MCP Server -> Theia AI -> LLM -> Theia AI -> Chat UI.
    *   **Definition of Done (Step 5):**
        *   AI Chat view functions.
        *   MCP server connects and exposes tools.
        *   LLM invokes correct tools.
        *   MCP tools successfully trigger queries/updates via the `ArchimateModelService` facade.
        *   Query results are correctly passed back through the chain.
        *   LLM generates relevant response displayed in chat.

6.  **Save Summary as Document:**
    *   Architect clicks "Save Summary".
    *   Frontend action handler (`theia-frontend-tools`?) sends text via Theia command/RPC to a backend contribution in `packages/theia-backend-extensions/`.
    *   The backend contribution determines a URI and makes an RPC call to the `ArchimateModelService` facade in `apps/server-process` (e.g., `createNode(...)`).
    *   The `ArchimateModelService` uses the persistence layer to create the 'Document' node in the data source.
    *   Success is reported back via RPC. The backend contribution potentially triggers Model Hub events (or relies on other event mechanisms).
    *   `theia-frontend-explorer` refreshes and shows the new document.
    *   **Definition of Done (Step 6):**
        *   Save action functions.
        *   Backend contribution successfully triggers node creation via RPC to `ArchimateModelService`.
        *   Persistence layer successfully creates the node.
        *   Explorer updates to show the new node.

7.  **Export Model:**
    *   Architect selects "Export > ArchiMate File" (`theia-frontend-menus`).
    *   `theia-frontend-tools` triggers a Theia command handled by an export contribution in `packages/theia-backend-extensions/`.
    *   The export contribution makes an RPC call to the `ArchimateModelService` facade in `apps/server-process` (e.g., `getExportData()`).
    *   The `ArchimateModelService` uses the persistence layer to query the necessary model elements.
    *   The `ArchimateModelService` (or the backend contribution) transforms the data into ArchiMate XML format.
    *   The data/XML is returned via RPC to the export contribution.
    *   The export contribution generates the `.archimate` file content and uses Theia services to trigger a file save dialog.
    *   File is saved locally.
    *   **Definition of Done (Step 7):**
        *   Export action functions.
        *   Backend contribution successfully triggers data retrieval via RPC to `ArchimateModelService`.
        *   Persistence layer successfully returns data.
        *   Data is correctly transformed into valid ArchiMate XML.
        *   File save dialog is triggered, and file saves correctly.

**Outcome:** The architect has successfully imported, reviewed, analyzed, documented, and exported an ArchiMate model using the integrated Archiverse Theia environment. This demonstrates the end-to-end workflow leveraging the CrossModel-aligned architecture (Theia Frontend/Backend Contributions, Server Process, Graph DB/In-Memory, MCP Server) and the communication mechanisms (Theia RPC, Custom RPC, GLSP protocol, HTTP).
