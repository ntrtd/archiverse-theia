# AI Architecture

This document details the technical architecture enabling AI integration within Archiverse Theia. It outlines the core components, their responsibilities, and how they interact to provide intelligent modeling assistance while leveraging the Archiverse ontology.

## Architecture Overview

The AI integration follows a layered approach, utilizing the standard Theia AI framework as a foundation and extending it with custom components aware of the Archiverse domain. The key principle is to enable AI agents, managed by Theia, to interact with the Archiverse model data via a controlled interface (MCP tools) that reflects the model's semantics.

```mermaid
graph TD
    subgraph "User Interface (Browser/Renderer)"
        UI_Chat[@theia/ai-chat-ui]
        UI_GLSP[theia-frontend-glsp]
        UI_Confirm[Confirmation UI (Panel/Dialog)]
    end

    subgraph Theia Application Backend Process
        TheiaAICore[@theia/ai-core & Agents]
        TheiaChatBE[@theia/ai-chat]
        TheiaMCP[@theia/ai-mcp]
        TheiaBackendContribs[Backend Contributions <br/> (GLSP Proxy, AI Confirm Handler)]
    end

    subgraph Custom Archiverse MCP Server Process
        MCP_Server[MCP Server]
        ToolImpl[Generated Tool Implementations]
    end

    subgraph Archiverse Ontology Host Process
        ModelService[ArchiverseModelService Facade <br/> (RPC Endpoint)]
        Staging[Staging Area (Optional)]
        LangiumServices[Langium Services <br/> (using @ntrtd/archiverse-archie)]
        Persistence[Persistence Layer <br/> (GraphDB/InMemory)]
    end

    subgraph External Services
        LLM[LLM Service <br/> (OpenAI, etc.)]
        GraphDB[(Graph Database)]
    end

    %% User Interaction Flow
    UI_Chat -- Theia RPC --> TheiaChatBE;
    TheiaChatBE -- Interacts with --> TheiaAICore;
    UI_Confirm -- Theia RPC --> TheiaBackendContribs; %% Confirmation actions
    UI_GLSP -- Theia RPC/WS --> TheiaBackendContribs; %% GLSP diagram data

    %% AI Core Flow
    TheiaAICore -- Connects to --> LLM;
    TheiaAICore -- Instructs --> TheiaMCP;

    %% MCP Tool Flow
    TheiaMCP -- MCP Protocol --> MCP_Server;
    MCP_Server -- Hosts --> ToolImpl;
    ToolImpl -- RPC --> ModelService;

    %% Model Service Flow
    ModelService -- Uses --> LangiumServices;
    ModelService -- Uses --> Persistence;
    ModelService -- Manages --> Staging;
    Persistence -- Accesses --> GraphDB;

    %% Synchronization Flow
    ModelService -- Triggers Events --> TheiaBackendContribs; %% Event notification
    TheiaBackendContribs -- Theia RPC/WS --> UI_GLSP; %% Diagram updates
    TheiaBackendContribs -- Theia RPC --> UI_Chat; %% Status updates

    %% Styling (Optional)
    style MCP_Server fill:#f9d,stroke:#333,stroke-width:2px
    style ToolImpl fill:#f9d,stroke:#333,stroke-width:2px
    style ModelService fill:#ccf,stroke:#333,stroke-width:2px
    style Staging fill:#ccf,stroke:#333,stroke-width:1px,stroke-dasharray: 5 5
    style LangiumServices fill:#ccf,stroke:#333,stroke-width:1px
    style Persistence fill:#ccf,stroke:#333,stroke-width:1px
```

## Core Components

1.  **Theia AI Framework (`@theia/ai-*` packages):** Runs within the main **Theia Application** backend process.
    *   Provides the core services for managing LLM connections (`@theia/ai-core`), handling chat interactions (`@theia/ai-chat`), running AI agents (`@theia/ai-ide`), and connecting to tool servers via MCP (`@theia/ai-mcp`).
    *   Acts as the orchestrator, receiving user prompts, invoking the appropriate LLM and agent, and managing the tool execution lifecycle via `@theia/ai-mcp`.

2.  **`ArchiverseModelService` Facade:** Resides within the separate **Archiverse ontology host** process (`services/model-server`).
    *   Provides a stable, programmatic API (likely RPC-based) for accessing and modifying the Archiverse model.
    *   Encapsulates the core logic involving Langium services (parsing, validation, linking based on the `@ntrtd/archiverse-archie` grammar) and the persistence layer.
    *   Crucially, it understands the Archiverse metamodel and provides methods reflecting its concepts (e.g., `createElement(type, properties)`, `findRelatedElements(uri, relationshipType)`, `applyBatch(actions)`).
    *   If the visual preview workflow is implemented, this service also manages the temporary staging area for uncommitted changes.

3.  **Custom Archiverse MCP Server:** A dedicated, standalone process.
    *   **Role:** Acts as the essential bridge translating generic AI tool requests (from `@theia/ai-mcp`) into specific, ontology-aware operations on the `ArchiverseModelService`.
    *   **Hosts Generated Tools:** This server does not contain significant logic itself but hosts the implementations of the MCP tools.

## Ontology-Aware MCP Tools: A Hybrid Approach

Enabling the AI to interact meaningfully with the Archiverse model requires MCP tools that understand the ontology (concepts, properties, relationships). A hybrid approach is used for defining and implementing these tools within the **Custom Archiverse MCP Server**:

1.  **Simple Query Tools (Generated Definitions):**
    *   **Scope:** Basic data retrieval tools like `archiverse_find_<ConceptType>`, `archiverse_get_<ConceptType>`, and `archiverse_find_related_nodes`.
    *   **Definition Generation:** The MCP *definitions* for these tools (name, description, input/output JSON schemas) are **automatically generated** during the build process.
    *   **Source:** The generator uses existing annotations within the Archiverse Langium grammar (e.g., AGAS annotations like `@element`, `@property`, `@description`) to extract the necessary information. Schemas are derived from the generated metamodel interfaces.
    *   **Benefit:** Ensures basic query capabilities stay synchronized with the grammar definition with minimal manual effort. Descriptions from grammar comments guide the LLM.

2.  **Complex Operational & Analytical Tools (Manual Definition):**
    *   **Scope:** More complex tools involving state changes, batch operations, analysis, or intricate logic. Examples include:
        *   `archiverse_apply_batch(actions: ArchiverseAction[])`: Applies multiple changes atomically.
        *   `archiverse_stage_changes(actions: ArchiverseAction[], sessionId: string)`: Stages changes for preview.
        *   `archiverse_commit_staged_changes(sessionId: string, acceptedActionIds: string[])`: Commits staged changes.
        *   `archiverse_discard_staged_changes(sessionId: string, discardedActionIds?: string[])`: Discards staged changes.
        *   Potential future analytical tools (e.g., `archiverse_analyze_impact(uri: string)`, `archiverse_validate_architecture_principles(...)`).
    *   **Definition:** The full MCP specifications (name, description, detailed input/output schemas) for these complex tools are **manually defined** in TypeScript within the Custom Archiverse MCP Server project.
    *   **Rationale:** Defining complex logic, multi-step operations, or analytical procedures within grammar annotations is impractical and clutters the language definition. Manual definition provides the necessary flexibility.

3.  **Tool Implementation (Within MCP Server):**
    *   Regardless of whether the definition was generated or manually created, the **implementation logic** for *all* tools resides within the Custom Archiverse MCP Server project.
    *   **Simple Query Tools:** Implementations typically receive validated arguments, construct parameters for an RPC call to the `ArchiverseModelService`, invoke the corresponding query method (e.g., `modelService.findElement(...)`), and return the result.
    *   **Complex Tools:** Implementations contain the specific logic for batching, staging management, analysis, etc. They make necessary RPC calls (potentially multiple) to the `ArchiverseModelService` to read or write data.
    *   **RPC Interface:** All tool implementations interact with the backend model logic exclusively via the stable RPC interface provided by the `ArchiverseModelService` facade.

**Benefits of Hybrid Approach:**
*   Leverages automation for simple, common query tools, reducing boilerplate and ensuring consistency with the grammar.
*   Provides the necessary flexibility to define and implement complex operational and analytical tools manually without overcomplicating the grammar definition.
*   Keeps all tool implementation logic centralized within the dedicated MCP server project, interacting with the core model service via a clear API boundary.

## Communication Flow

The typical flow for an AI-driven model interaction is:

1.  **User Input:** User interacts via an AI interface (e.g., `@theia/ai-chat-ui`).
2.  **Theia AI Processing:** The prompt is processed by `@theia/ai-core` and relevant agents (`@theia/ai-ide`). The agent determines the required action(s) and identifies the necessary generated MCP tool(s).
3.  **MCP Request:** The agent instructs `@theia/ai-mcp` to invoke the specific tool(s) on the Custom Archiverse MCP Server.
4.  **MCP Server Execution:** The MCP Server receives the request, validates arguments against the generated schema, and executes the corresponding generated tool implementation.
5.  **RPC to Model Service:** The tool implementation makes an RPC call to the appropriate method on the `ArchiverseModelService` facade in the ontology host process.
6.  **Core Logic Execution:** The `ArchiverseModelService` performs the requested operation using Langium services and the persistence layer, potentially interacting with the staging area first if visual preview is enabled.
7.  **Response Propagation:** The result (or error) is returned back up the chain: `ArchiverseModelService` -> MCP Server -> `@theia/ai-mcp` -> AI Agent -> User Interface.
8.  **Synchronization:** If the model was modified, the `ArchiverseModelService` triggers events to ensure other parts of the application (like GLSP diagrams) refresh their views.

This architecture provides a robust and maintainable way to integrate AI, leveraging the strengths of Theia's AI framework while ensuring interactions are grounded in the specific semantics of the Archiverse model via the generated MCP tools.
