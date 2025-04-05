# Scenario: Import, AI Review, and Export ArchiMate Model

This scenario describes a common workflow for an enterprise architect using Archiverse Theia.

**Goal:** Import an existing ArchiMate model, leverage AI for analysis and documentation, potentially fix issues identified visually, and export the results.

**Actor:** Enterprise Architect

**Steps:**

1.  **Launch Application:** The architect starts the Archiverse Theia application. The backend connects to the central graph database.
2.  **Navigate Workspace:** The architect uses the Explorer view, which displays a virtual representation of the graph database content (domains, systems, etc.) provided by the `archiverse-graph-vfs`.
3.  **Import ArchiMate Model:**
    *   The architect selects "Import > ArchiMate File" from the menu (`archiverse-menus` / `archiverse-tools-client`).
    *   They choose a local `.archimate` file.
    *   The `archiverse-model-server` (or a dedicated tool service) receives the file, parses it, and uses the Model Service Facade/VFS to create corresponding nodes and relationships in the graph database.
    *   The Explorer view refreshes, showing the imported model elements as virtual files/folders.
4.  **Open Diagram & Review Violations:**
    *   The architect navigates to a newly imported element (e.g., `graphdb://Application/PaymentGateway`) and opens its diagram view (`archiverse-glsp-client`).
    *   The `archiverse-glsp-server` fetches data via the Facade/VFS and generates the `GModel`.
    *   Simultaneously, the underlying Archiverse language server (`archiverse-archie`, potentially running within the Model Server or accessed via the Facade) validates the semantic model represented by the graph data.
    *   Any language violations (e.g., incorrect relationship types, missing mandatory properties based on the Archiverse grammar) are reported.
    *   The `archiverse-glsp-server` includes this validation information in the `GModel` sent to the client.
    *   The `archiverse-glsp-client` renders the diagram, highlighting elements with violations (e.g., red borders, error icons). Hovering over highlighted elements shows the specific error message from the language server.
    *   The architect uses the diagram editor to correct the violations (e.g., changing relationship types, adding missing elements). These actions are sent back through the GLSP server and Facade/VFS to update the graph database. The diagram updates, and highlights disappear as issues are fixed.
5.  **Request AI Analysis & Summary:**
    *   The architect opens the AI Chat view (`@theia/ai-chat-ui`).
    *   They enter a prompt like: "Review the 'Payment Gateway' application, identify potential architectural concerns based on our standards, and provide a summary description."
    *   The prompt is processed by the core Theia AI backend (`@theia/ai-core`, `@theia/ai-ide` agents).
    *   The AI determines it needs context. It uses **MCP tools** (provided by a custom MCP server via `@theia/ai-mcp`) to interact with the **Model Service Facade/VFS**. These tools allow the AI to fetch properties, relationships, and potentially traverse parts of the 'Payment Gateway' model stored in the graph database.
    *   *(Refined AI Interaction):* The AI might also interact directly with the **`archiverse-model-server`** (if it exposes specific analysis functions beyond basic graph access) to leverage domain-specific logic or pre-defined architectural checks.
    *   The LLM analyzes the retrieved graph data and potentially applies configured architectural standards.
    *   The LLM generates feedback (concerns) and a summary description.
    *   The response is displayed in the AI Chat view.
6.  **Save Summary as Document:**
    *   The architect finds the summary useful and clicks a "Save Summary" action (custom command/UI).
    *   The summary text is sent to the backend (e.g., Model Server).
    *   The backend uses the VFS (`vfs.writeFile`) to create a new 'Document' node in the graph (e.g., `graphdb://Documents/PaymentGateway_Summary.md`), storing the summary as a property.
    *   The Explorer view updates to show the new document.
7.  **Export Model:**
    *   The architect selects "Export > ArchiMate File" (`archiverse-menus` / `archiverse-tools-client`).
    *   The backend export service queries the Model Service Facade/VFS to retrieve the current state of the relevant model elements from the graph database.
    *   The service translates the graph data back into the ArchiMate file format.
    *   The user is prompted to save the generated `.archimate` file locally.

**Outcome:** The architect has successfully imported, reviewed (with visual validation feedback), analyzed (with AI assistance leveraging graph data), documented, and exported an ArchiMate model using the integrated Archiverse Theia environment.
