# Frontend Extensions (`extensions/client/`)

This section details the planned frontend Theia extensions responsible for user interface elements and client-side logic.

## `archiverse-glsp-client`

*   **Purpose:** Provides the user interface for GLSP-based diagram viewing and editing.
*   **Responsibilities:**
    *   Integrate with the GLSP framework and potentially Sprotty for diagram rendering.
    *   Define Theia editor factories or openers for diagram types.
    *   Communicate with the `archiverse-glsp-server` (backend) to request diagram models (`GModel`) and send editing operations.
    *   Render the received `GModel` visually.
    *   Handle user interactions within the diagram (selection, dragging, creating elements/connections) and translate them into GLSP operations.

## `archiverse-forms-client`

*   **Purpose:** Provides form-based UIs for viewing and editing the properties of model elements.
*   **Responsibilities:**
    *   Define Theia views or editors that render as forms.
    *   Fetch the data for a selected model element (likely via a backend service that uses the VFS/Model Service Facade).
    *   Dynamically generate form fields based on the element's properties and type.
    *   Handle user input in the forms.
    *   Send updated data back to the backend for persistence when the user saves changes.

## `archiverse-editor-widgets`

*   **Purpose:** Enhances the standard Monaco editor with custom widgets or features specific to Archiverse.
*   **Responsibilities:**
    *   Could include custom decorators, code lenses, or embedded UI elements within the text editor for `.archiverse` files (if textual editing is supported alongside VFS).
    *   Might provide specialized input controls or visualizations for specific property types within forms or other views.

## `archiverse-menus`

*   **Purpose:** Adds custom menus, submenus, and commands to Theia's main menu bar, context menus, etc.
*   **Responsibilities:**
    *   Define menu contributions using Theia's `MenuContribution` interface.
    *   Register commands associated with menu items.
    *   Provide actions relevant to Archiverse modeling, such as creating new elements, triggering tools, or opening specific views.

## `archiverse-tools-client`

*   **Purpose:** Provides the user interface for specialized modeling tools.
*   **Responsibilities:**
    *   Offer UI for triggering import/export operations (e.g., ArchiMate format).
    *   Provide interfaces for connecting to or interacting with external model stores (e.g., Axon Ivy Model Store, if applicable).
    *   Communicate with corresponding backend services (potentially within the `archiverse-model-server` or dedicated tool extensions) to execute the tool logic.
