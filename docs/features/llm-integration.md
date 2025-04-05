# Feature: LLM Integration

This feature aims to leverage Large Language Models (LLMs) to enhance the modeling experience within Archiverse Theia.

## Concept

Integrate LLM capabilities to assist users with tasks such as:

*   Generating model elements based on natural language descriptions.
*   Explaining parts of the model.
*   Suggesting improvements or identifying potential issues.
*   Answering questions about the model data using natural language queries.
*   Automating repetitive modeling tasks.

## Leveraging Theia AI Packages

Instead of creating dedicated `archiverse-llm-client` and `archiverse-llm-server` extensions, the implementation will primarily leverage the existing `@theia/ai-*` framework:

*   **`@theia/ai-core`:** Provides the foundational services for managing LLM connections (configured via Theia settings), defining AI agents, handling prompts, and injecting context variables. This will be the core backend integration point.
*   **`@theia/ai-chat` & `@theia/ai-chat-ui`:** The standard Theia "AI Chat" view provided by `ai-chat-ui` will be used for the user interface. The `@theia/ai-chat` package handles the backend session logic, connecting the UI to the core services.
*   **`@theia/ai-ide`:** This package offers pre-built agents. We will utilize these agents (like the "Orchestrator" and potentially a configured "Architect" agent) to handle user requests. If needed, a minimal custom agent focusing *only* on Archiverse-specific reasoning (beyond tool use) could be registered using `@theia/ai-core` APIs, but the main interaction logic will rely on tools.
*   **`@theia/ai-mcp`:** This remains crucial for enabling the LLM to interact with our graph model.
    *   The core Theia AI backend (using `@theia/ai-mcp`) will connect to configured MCP servers.
    *   We will implement a **custom, standalone MCP Server process**. This server's sole responsibility is to expose tools that interact with our **Model Service Facade/VFS** (likely via HTTP or another RPC mechanism, as it's a separate process).
    *   Example MCP Tools:
        *   `archiverse_get_node_properties(node_uri: string)`: Fetches properties for a given node URI.
        *   `archiverse_find_related_nodes(node_uri: string, relationship_type: string, target_node_type: string)`: Finds related nodes.
        *   `archiverse_create_node(node_type: string, properties: object)`: Creates a new node.
        *   `archiverse_create_relationship(from_uri: string, to_uri: string, relationship_type: string)`: Creates a relationship.
    *   The LLM, when prompted to perform actions on the model, would be instructed (via its system prompt or function calling capabilities) to use these `archiverse_*` tools. The MCP server executes the tool logic, which calls our backend Facade/VFS to interact with the graph database.
*   **`@theia/ai-terminal`:** Could be used to provide LLM assistance for any custom command-line tools developed for managing the Archiverse models or graph database, but is less central to the core modeling interaction.

## Example Workflow (Creating an Element via LLM)

1.  User opens the standard Theia AI Chat view (`@theia/ai-chat-ui`).
2.  User types: "Create a new Application component named 'Reporting Service'."
3.  The chat UI sends the prompt to the core Theia AI backend (`@theia/ai-chat` -> `@theia/ai-core`).
4.  The backend (using agents from `@theia/ai-ide`) determines the intent is to create a node.
5.  The backend instructs the configured LLM to use the `archiverse_create_node` tool (made available via `@theia/ai-mcp` by connecting to our custom MCP server).
6.  LLM invokes `archiverse_create_node(node_type='Application', properties={'name': 'Reporting Service'})`.
7.  The core Theia AI backend, via `@theia/ai-mcp`, sends the tool invocation request to our custom MCP server.
8.  Our custom MCP server receives the request for the `archiverse_create_node` tool. Its implementation calls the Model Service Facade/VFS within the main Theia backend (e.g., via an HTTP request).
9.  The Model Service Facade/VFS creates the new 'Application' node with the name 'Reporting Service' in the graph database.
10. Success is reported back from the Facade/VFS to the MCP server, which reports success back to the core Theia AI backend/LLM.
11. The core Theia AI backend sends a confirmation message ("Okay, I've created the 'Reporting Service' application.") back to the chat UI.
12. **(Crucial Syncing Step):** The VFS/Model Service should emit a model change event. Other components listening to these events (like the Explorer view via the VFS provider, or the GLSP server if a relevant diagram is open) would refresh automatically to show the new node.

## Example Workflow (Querying the Model)

1.  User opens the standard Theia AI Chat view and asks, "Show me all applications connected to the 'AuthService' system."
2.  The chat UI sends the prompt to the core Theia AI backend.
3.  The backend identifies the intent and instructs the LLM to use a relevant tool, e.g., `archiverse_find_related_nodes`.
4.  The LLM invokes `archiverse_find_related_nodes(node_uri='graphdb://System/AuthService', relationship_type='CONNECTS_TO', target_node_type='Application')`.
5.  `@theia/ai-mcp` routes the request to our custom MCP server.
6.  The MCP server tool implementation calls the Model Service Facade/VFS, which translates the request into a graph query.
7.  VFS executes the query against the graph database.
8.  Results are returned through the Facade to the MCP server tool, then back to the core Theia AI backend/LLM, potentially formatted by the LLM.
9.  The core Theia AI backend sends the formatted answer back to the chat UI.
8.  Client displays the list of applications in the chat panel.

*(Further details needed: Specific LLM choices, prompt engineering strategies, definition of LLM tools/functions, security considerations)*
