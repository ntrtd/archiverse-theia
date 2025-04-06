# Frontend Packages (`packages/theia-frontend-*`)

This section details the planned frontend Theia extensions responsible for user interface elements and client-side logic. These run in the browser/renderer process.

## `theia-frontend-explorer`

*   **Purpose:** Provides a custom Theia view for browsing the structure of the Archiverse model stored in the graph database. Replaces the standard File Explorer for model navigation.
*   **Responsibilities:**
    *   Contribute a custom view to the Theia workbench (e.g., in the left sidebar) using Theia's view contribution points.
    *   Implement the UI for the view (e.g., using React) to display a tree or other representation of model elements.
    *   Use the Model Hub client API (`@theia/modelhub-core/lib/browser`) or direct Theia RPC to call structural query methods exposed by a backend contribution (e.g., `ArchimateQueryServiceContribution` in `packages/theia-backend-extensions/`).
    *   Render the hierarchy based on the `ElementDescriptor` data received from the backend contribution.
    *   Handle user interactions like expanding/collapsing nodes.
    *   Trigger Theia commands when an element is selected (e.g., double-clicked) to open the appropriate editor (GLSP diagram, form) for that element's `graphdb://` URI.

## `theia-frontend-glsp`

*   **Purpose:** Provides the user interface for GLSP-based diagram viewing and editing.
*   **Responsibilities:**
    *   Integrate with the GLSP framework (`@eclipse-glsp/theia-integration`, `@eclipse-glsp/client`) and potentially Sprotty (`@eclipse-glsp/sprotty`) for diagram rendering.
    *   Define Theia editor factories or openers for diagram types associated with `graphdb://` URIs.
    *   Establish a WebSocket connection via the Theia backend's `glsp-contribution` (in `packages/theia-backend-extensions/`) to communicate with the **GLSP Endpoint/Service** running in the **Archiverse ontology host** process.
    *   Send GLSP actions (e.g., `RequestModelAction`, editing operations) to the backend contribution, which forwards them to the GLSP server.
    *   Receive graphical model (`GModel`) updates from the backend contribution (originating from the GLSP server) and update the rendered diagram accordingly.
    *   Handle user interactions within the diagram (selection, dragging, creating elements/connections using tools) and translate them into GLSP operations to be sent to the backend.

## `theia-frontend-forms`

*   **Purpose:** Provides form-based UIs for viewing and editing the properties of model elements.
*   **Responsibilities:**
    *   Define Theia views or editors that render as forms (e.g., triggered when opening a `graphdb://` URI associated with an element suitable for form editing).
    *   Use the Model Hub client API or direct Theia RPC to request the model data (`ArchimateModelRoot`) for the element's `graphdb://` URI. (This request is routed to a backend contribution in `packages/theia-backend-extensions/`, which then makes an RPC call to the **Archiverse ontology host** API).
    *   Dynamically generate form fields based on the properties within the received model data and the element's schema/type (defined in `submodules/archiverse-archie`).
    *   Handle user input in the forms.
    *   When the user saves, use the Model Hub client API or direct Theia RPC to send the updated `ArchimateModelRoot` back to the appropriate backend contribution for persistence via the **Archiverse ontology host** API.

## `theia-frontend-widgets` (Example Name)

*   **Purpose:** Enhances UI components (like forms or potentially specialized text views if needed) with custom widgets specific to Archiverse.
*   **Responsibilities:**
    *   Might provide specialized input controls (e.g., relationship pickers, custom formatters) or visualizations for specific property types within forms or other views.
    *   *(Note: Direct text editing of graph elements via Monaco is less likely in this model; focus shifts to forms and diagrams).*

## `theia-frontend-menus` (Example Name)

*   **Purpose:** Adds custom menus, submenus, and commands to Theia's main menu bar, context menus, etc.
*   **Responsibilities:**
    *   Define menu contributions using Theia's `MenuContribution` interface.
    *   Register commands associated with menu items (e.g., "Create New Application Component", "Import Model").
    *   Provide actions relevant to Archiverse modeling, triggering commands handled by backend contributions or directly manipulating frontend state.

## `theia-frontend-tools` (Example Name)

*   **Purpose:** Provides the user interface for specialized modeling tools (like Import/Export).
*   **Responsibilities:**
    *   Offer UI elements (e.g., dialogs, file choosers, progress indicators) for triggering import/export operations.
    *   Communicate via Theia commands/RPC with corresponding backend contributions (in `packages/theia-backend-extensions/`) to execute the tool logic (which involves parsing files and interacting with the **Archiverse ontology host** API via RPC).
    *   *(External model store interaction might be a separate tool/extension pair).*
