# Feature: Form-Based Editing

This feature allows users to view and edit the properties of Archiverse model elements using structured forms instead of raw text (like JSON/YAML) or diagrams.

## Concept

Provide a user-friendly way to manage the attributes of model elements. When a user selects an element in the custom `theia-frontend-explorer` view or another context, a dedicated form view (`theia-frontend-forms`) can be opened using the element's `graphdb://` URI. This form displays properties with appropriate input controls based on their data types. Data loading and saving likely occurs via Theia's Model Hub framework, communicating through backend contributions to the `ArchiverseModelService` facade in the `apps/server-process`.

## Architecture Components

*   **`theia-frontend-forms` (Frontend Package):**
    *   Responsible for rendering the form UI (e.g., using React, potentially with a library like React Hook Form or Formik).
    *   Registers itself as an editor or view handler for `graphdb://` URIs representing elements suitable for form editing.
    *   When activated for a specific URI (e.g., `graphdb://User/user123`), it uses the **Model Hub client API** (`@theia/modelhub-core/lib/browser`) to request the full model data (`ArchimateModelRoot`) for that URI.
    *   Dynamically generates UI controls (text fields, checkboxes, dropdowns, relationship pickers from `theia-frontend-widgets`) based on the properties within the received `ArchimateModelRoot` and the element's schema/type (defined in `submodules/archiverse-archie`).
    *   Populates the controls with the current property values from the model data.
    *   Handles user input and updates the internal state of the form, potentially performing client-side validation.
    *   When the user saves, it constructs the updated `ArchimateModelRoot` and uses the **Model Hub client API** to send it back to the backend contribution for persistence.
*   **Model Hub Contributions (within `packages/theia-backend-extensions/`):**
    *   Hosts the **`ArchiversePersistenceContribution`** (Example Name).
    *   When the Model Hub framework (running in the Theia backend) receives a `loadModel` request for a `graphdb://` URI from the forms client, it routes the request to the `loadModel` method of the `ArchiversePersistenceContribution`. This contribution makes an RPC call to the `ArchiverseModelService` facade in the `apps/server-process` to fetch the data via the persistence layer.
    *   When the Model Hub receives the updated `ArchimateModelRoot` via a `saveModel` call from the forms client, it routes it to the `saveModel` method of the `ArchiversePersistenceContribution`. This contribution makes an RPC call to the `ArchiverseModelService` facade in the `apps/server-process` to update the data via the persistence layer.
*   **`ArchiverseModelService` Facade (within `apps/server-process/`):**
    *   Receives RPC calls from the `ArchiversePersistenceContribution`.
    *   Uses the injected persistence layer (`persistence-graphdb` or `persistence-inmemory`) to load or save the model data from/to the data source.

## Data Flow (Opening a Form)

1.  User selects an element (e.g., `graphdb://User/user123`) in `theia-frontend-explorer` and triggers an action to open the form editor.
2.  Theia activates the `theia-frontend-forms` editor/view for the URI.
3.  The `theia-frontend-forms` client uses the Model Hub client API to request the model for `graphdb://User/user123`.
4.  The Model Hub framework (in Theia backend) routes this request to the `loadModel` method of the `ArchiversePersistenceContribution` (in `packages/theia-backend-extensions/`).
5.  The `ArchiversePersistenceContribution` makes an RPC call to the `ArchiverseModelService` facade in `apps/server-process`.
6.  The `ArchiverseModelService` uses its injected persistence layer to query the graph database/in-memory store for the data corresponding to `graphdb://User/user123`.
7.  The persistence layer returns the raw data.
8.  The `ArchiverseModelService` transforms the raw data into the serializable `ArchimateModelRoot` format (defined in `@archiverse/archie`).
9.  The `ArchiverseModelService` returns the `ArchimateModelRoot` via RPC to the `ArchiversePersistenceContribution`.
10. The `ArchiversePersistenceContribution` returns the `ArchimateModelRoot` through the Model Hub framework to the `theia-frontend-forms` client.
11. The forms client uses the received `ArchimateModelRoot` data and the element's schema definition to render the appropriate form controls with current values.

## Data Flow (Saving a Form)

1.  User modifies properties in the form and clicks "Save".
2.  The `theia-frontend-forms` client gathers all current property values and constructs the updated `ArchimateModelRoot` object.
3.  The forms client uses the Model Hub client API to save the updated `ArchimateModelRoot` for the URI `graphdb://User/user123`.
4.  The Model Hub framework (in Theia backend) routes this request to the `saveModel` method of the `ArchiversePersistenceContribution` (in `packages/theia-backend-extensions/`).
5.  The `ArchiversePersistenceContribution` makes an RPC call to the `ArchiverseModelService` facade in `apps/server-process`, sending the updated `ArchimateModelRoot`.
6.  The `ArchiverseModelService` uses its injected persistence layer to translate the `ArchimateModelRoot` changes into graph update operations (e.g., updating node properties) and executes them.
7.  (Potentially) The `server-process` confirms success via RPC. The Model Hub framework might trigger model change events (initiated by the backend contribution upon RPC success) for other subscribed clients (like diagrams or the explorer) to update.

*(Further details needed: Specific UI library for forms, handling complex property types like lists or relationships, validation logic implementation)*
