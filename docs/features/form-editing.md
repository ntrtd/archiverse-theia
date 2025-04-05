# Feature: Form-Based Editing

This feature allows users to view and edit the properties of Archiverse model elements using structured forms instead of raw text (like JSON/YAML) or diagrams.

## Concept

Provide a user-friendly way to manage the attributes of model elements. When a user selects a node (represented as a virtual file via the VFS), a dedicated form view can be opened, displaying its properties with appropriate input controls based on their data types (string, number, boolean, date, enumerations, potentially relationships).

## Architecture Components

*   **`archiverse-forms-client` (Frontend Extension):**
    *   Responsible for rendering the form UI.
    *   Registers itself as an editor or view for specific model element types or virtual files.
    *   When opened for a specific element (e.g., `graphdb://User/user123`), it requests the element's data from a backend service.
    *   Dynamically generates UI controls (text fields, checkboxes, dropdowns, date pickers, etc.) based on the properties defined in the Archiverse schema for that element type.
    *   Populates the controls with the current property values received from the backend.
    *   Handles user input and updates the internal state of the form.
    *   When the user saves, it sends the complete set of updated property data back to the backend service for persistence.
*   **Backend Service (Potentially within `archiverse-model-server` or a dedicated service):**
    *   Provides an endpoint for the `archiverse-forms-client` to fetch element data. This service interacts with the "Model Service Facade" or VFS to get data from the graph database.
    *   Provides an endpoint to receive updated data from the client. This service interacts with the Facade/VFS to update the corresponding node properties in the graph database.

## Data Flow (Opening a Form)

1.  User selects a virtual file/node (e.g., `graphdb://User/user123`) and chooses to open it with the Form Editor.
2.  Theia routes this to the `archiverse-forms-client`.
3.  Client requests data for `graphdb://User/user123` from the backend model service.
4.  Backend service requests semantic data for "user123" from the Model Service Facade/VFS.
5.  VFS queries the graph database for the node's properties.
6.  Data is returned through the Facade to the backend service.
7.  Backend service sends the property data (e.g., as JSON) to the Client.
8.  Client uses the data and the Archiverse schema definition for "User" to render the appropriate form controls with current values.

## Data Flow (Saving a Form)

1.  User modifies properties in the form and clicks "Save".
2.  Client gathers all current property values from the form controls.
3.  Client sends the complete set of updated data to the backend model service endpoint for `graphdb://User/user123`.
4.  Backend service requests an update operation via the Model Service Facade/VFS.
5.  VFS translates this into graph database operations to update the properties of the "user123" node.
6.  (Potentially) Backend service confirms success to the client and triggers model change events for other views (like diagrams) to update.

*(Further details needed: Specific UI library for forms, handling complex property types like lists or relationships, validation logic)*
