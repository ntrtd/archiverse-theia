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
    *   The core Theia AI backend (using `@theia/ai-mcp`, running within the main Theia Backend process) connects to configured MCP servers.
    *   We will implement a **custom, standalone MCP Server process**. This server exposes tools that allow the LLM to query and manipulate the Archiverse model.
    *   The MCP server tools **do not** interact directly with the graph database or the core language services. Instead, they make calls (e.g., HTTP, RPC) to the **`ArchimateModelService` facade** running in the separate `apps/server-process`.
        *   *Communication Path:* The MCP server could call the `ArchimateModelService` RPC endpoint directly if exposed, or it might call a dedicated API endpoint provided by a contribution in `packages/theia-backend-extensions/` which then relays the call via RPC to the `ArchimateModelService`. The latter approach might be better for centralizing access control and logic related to external callers like the MCP server.
    *   Example MCP Tools:
        *   `archiverse_get_node_properties(node_uri: string)`: Fetches properties for a given node URI. (MCP tool calls `ArchimateModelService` facade, potentially via a backend contribution).
        *   `archiverse_find_related_nodes(node_uri: string, relationship_type: string, target_node_type: string)`: Finds related nodes. (MCP tool calls `ArchimateModelService` facade).
        *   `archiverse_create_node(node_type: string, properties: object)`: Creates a new node. (MCP tool calls `ArchimateModelService` facade).
        *   `archiverse_create_relationship(from_uri: string, to_uri: string, relationship_type: string)`: Creates a relationship. (MCP tool calls `ArchimateModelService` facade).
    *   The `ArchimateModelService` facade (in `apps/server-process`) receives these calls and uses its internal, injected persistence service (`persistence-graphdb` or `persistence-inmemory`) to interact with the actual data source.
    *   The LLM uses these tools via the MCP framework, effectively interacting with the graph through multiple layers (LLM -> Theia AI -> MCP Server -> [Optional Theia Backend Contribution] -> RPC -> `ArchimateModelService` in `server-process` -> Persistence Layer -> Graph DB).
*   **`@theia/ai-terminal`:** Could be used to provide LLM assistance for any custom command-line tools developed for managing the Archiverse models or graph database, but is less central to the core modeling interaction.

## Example Workflow (Creating an Element via LLM)

1.  User opens the standard Theia AI Chat view (`@theia/ai-chat-ui`).
2.  User types: "Create a new Application component named 'Reporting Service'."
3.  The chat UI sends the prompt to the core Theia AI backend (`@theia/ai-chat` -> `@theia/ai-core`) running in the main Theia Backend process.
4.  The backend (using agents from `@theia/ai-ide`) determines the intent is to create a node.
5.  The backend instructs the configured LLM to use the `archiverse_create_node` tool (made available via `@theia/ai-mcp` by connecting to the custom MCP server).
6.  LLM invokes `archiverse_create_node(node_type='Application', properties={'name': 'Reporting Service'})`.
7.  The core Theia AI backend, via `@theia/ai-mcp`, sends the tool invocation request to the custom MCP server process.
8.  The custom MCP server receives the request for the `archiverse_create_node` tool. Its implementation makes a call (e.g., HTTP or RPC) to the **`ArchimateModelService` facade** in the `apps/server-process` (potentially routed via a dedicated API endpoint in `packages/theia-backend-extensions/`).
9.  The `ArchimateModelService` receives the request and uses its injected persistence service to create the new 'Application' node with the name 'Reporting Service' in the graph database.
10. Success is reported back from the `ArchimateModelService` via RPC to the caller (MCP server or backend contribution), which reports success to the MCP server, which reports success back to the core Theia AI backend/LLM.
11. The core Theia AI backend sends a confirmation message ("Okay, I've created the 'Reporting Service' application.") back to the chat UI.
12. **(Crucial Syncing Step):** The `apps/server-process` (specifically the `ArchimateModelService` or persistence layer upon successful write) should notify relevant listeners of the change. If Model Hub is used, this notification might go via RPC back to a Model Hub contribution in `packages/theia-backend-extensions/`, which then uses the Model Hub framework to emit model change events within Theia. Other components listening to these events (like `theia-frontend-explorer` or the GLSP server via its contribution) would refresh automatically.

## Example Workflow (Querying the Model)

1.  User opens the standard Theia AI Chat view and asks, "Show me all applications connected to the 'AuthService' system."
2.  The chat UI sends the prompt to the core Theia AI backend.
3.  The backend identifies the intent and instructs the LLM to use a relevant tool, e.g., `archiverse_find_related_nodes`.
4.  The LLM invokes `archiverse_find_related_nodes(node_uri='graphdb://System/AuthService', relationship_type='CONNECTS_TO', target_node_type='Application')`.
5.  `@theia/ai-mcp` routes the request to the custom MCP server.
6.  The MCP server tool implementation calls the relevant query method on the **`ArchimateModelService` facade** in the `apps/server-process` (potentially via a backend contribution).
7.  The `ArchimateModelService` uses its injected persistence service to execute the corresponding graph query.
8.  Results are returned from the persistence service to the `ArchimateModelService`.
9.  The `ArchimateModelService` returns the results via RPC to the caller (MCP server or backend contribution), which passes them to the MCP server tool, then back to the core Theia AI backend/LLM, potentially formatted by the LLM.
10. The core Theia AI backend sends the formatted answer back to the chat UI.
11. Client displays the list of applications in the chat panel.

*(Further details needed: Specific LLM choices, prompt engineering strategies, definition of LLM tools/functions, security considerations, exact MCP<->ServerProcess communication path)*
