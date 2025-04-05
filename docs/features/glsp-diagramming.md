# Feature: GLSP Diagramming

This feature enables users to view and edit Archiverse models graphically using diagrams powered by the Graphical Language Server Platform (GLSP).

## Concept

Instead of (or in addition to) viewing model element properties as text (e.g., JSON/YAML via the VFS), users can open visual representations. GLSP provides the framework for connecting a frontend diagram editor with a backend server that understands the model's semantics and graphical layout.

## Architecture Components

*   **`archiverse-glsp-client` (Frontend Extension):**
    *   Responsible for rendering diagrams using a GLSP-compatible library (like Sprotty).
    *   Registers itself as an editor or opener for specific model elements or virtual files provided by the VFS.
    *   Communicates with the `archiverse-glsp-server` using the GLSP protocol over a websocket or similar connection.
    *   Sends user actions (e.g., moving a node, creating an edge) to the server.
    *   Receives graphical model (`GModel`) updates from the server and updates the rendered diagram.
*   **`archiverse-glsp-server` (Backend Extension):**
    *   Implements the GLSP server logic.
    *   Receives requests from the client (e.g., "get diagram for node X", "user created edge Y").
    *   **Fetches Semantic Data:** Interacts with the "Model Service Facade" (which uses the `archiverse-graph-vfs`) to retrieve the underlying semantic data for the requested diagram elements from the graph database.
    *   **Generates GModel:** Translates the semantic data into a graphical representation (`GModel`) suitable for the client renderer. This involves mapping Archiverse elements and relationships to shapes, lines, labels, etc. It might also involve layout calculations.
    *   **Processes Operations:** Translates graphical operations received from the client (e.g., creating a shape) into semantic model updates (e.g., creating a new node in the graph database via the Model Service Facade/VFS).
    *   Sends `GModel` updates back to the client.

## Data Flow (Opening a Diagram)

1.  User selects a virtual file/node (e.g., `graphdb://System/SysA`) in the Explorer and chooses to open it as a diagram.
2.  Theia routes this to the `archiverse-glsp-client`.
3.  Client requests the `GModel` for `graphdb://System/SysA` from the `archiverse-glsp-server`.
4.  Server requests semantic data for "SysA" (and potentially related elements) from the Model Service Facade/VFS.
5.  VFS queries the graph database.
6.  VFS returns semantic data to the Model Service Facade.
7.  Facade provides structured data to the GLSP Server.
8.  Server generates the `GModel` based on the semantic data.
9.  Server sends the `GModel` to the Client.
10. Client renders the diagram using Sprotty/GLSP libraries.

## Data Flow (Editing a Diagram)

1.  User performs an action (e.g., drags a node).
2.  Client translates this into a GLSP operation and sends it to the Server.
3.  Server receives the operation.
4.  Server translates the graphical operation into a semantic change (e.g., update position property).
5.  Server requests the semantic update via the Model Service Facade/VFS.
6.  VFS updates the corresponding node/property in the graph database.
7.  (Potentially) Server regenerates the relevant part of the `GModel` and sends an update back to the client (and potentially other interested clients via model change events).

*(Further details needed: Specific GModel mapping, layout strategies, handling of different diagram types)*
