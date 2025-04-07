# AI Integration in Archiverse

This document provides a comprehensive overview of the AI integration within the Archiverse ecosystem, explaining how it enhances the enterprise architecture modeling experience, the underlying technical approach, and the key components involved.

## Introduction: AI-Enhanced Enterprise Architecture

Archiverse integrates Large Language Models (LLMs) and AI capabilities to transform enterprise architecture modeling, making it more accessible, efficient, and insightful. This integration enables users to:

- Interact with models using natural language
- Generate and modify architectural elements through conversation
- Receive intelligent suggestions and recommendations
- Perform complex analyses and impact assessments
- Extract structured architecture information from various documents
- Generate documentation and explanations of the model

By combining the structured, formal nature of enterprise architecture with the conversational, intuitive capabilities of modern AI, Archiverse makes architecture modeling more approachable for a broader range of stakeholders while enhancing the productivity of experienced architects.

## Architectural Approach

The AI integration follows several key principles:

1. **Ontology-Aware Interaction:** AI agents interact with the model through a controlled interface that respects and understands the Archiverse ontology (based on ArchiMate and potentially other modeling languages).

2. **User Control:** AI-suggested modifications are always subject to user review and confirmation before being applied to the model, either through chat-based confirmation or visual preview workflows.

3. **Leveraging Standard Frameworks:** The implementation builds upon the Eclipse Theia AI framework (`@theia/ai-*`) rather than developing custom AI integration from scratch.

4. **Clear Boundaries:** The AI components interact with the core modeling services through well-defined APIs, maintaining clear architectural boundaries.

5. **Extensibility:** The system is designed to accommodate future AI capabilities and model analysis features without requiring fundamental architectural changes.

## Core Components

### 1. Theia AI Framework (`@theia/ai-*`)

The foundation of AI integration is the Eclipse Theia AI framework:

- **`@theia/ai-core`:** Manages LLM connections, defines agent interfaces, handles prompts and context variables.
- **`@theia/ai-chat`/`@theia/ai-chat-ui`:** Provides the user interface and backend for conversational interaction.
- **`@theia/ai-ide`:** Supplies pre-built agents for IDE tasks, including the "Orchestrator" and "Architect" agents that handle modeling requests.
- **`@theia/ai-mcp`:** The Model Context Protocol integration, enabling the use of specialized tools by the AI.

### 2. Custom Archiverse MCP Server

A dedicated server that exposes Archiverse-specific capabilities to the AI agents:

- **Simple Query Tools:** (e.g., `archiverse_find_ApplicationComponent`, `archiverse_get_BusinessProcess`, `archiverse_find_related_nodes`)  
  Generated automatically from the Archiverse ontology grammar, these tools provide basic data retrieval capabilities with domain-specific schemas and descriptions.

- **Complex Operational Tools:** (e.g., `archiverse_apply_batch`, `archiverse_stage_changes`, `archiverse_commit_staged_changes`)  
  Manually defined, these tools handle more complex tasks like batch modifications, staged changes for visual preview, and advanced analysis.

The MCP server acts as a bridge, translating AI intents into well-formed operations on the Archiverse model by calling the `ArchiverseModelService` API.

### 3. Archiverse Model Server

The core model logic resides in the Archiverse Model Server, which:

- Implements the Langium services for the Archiverse ontology
- Manages model persistence
- Exposes the `ArchiverseModelService` API
- Optionally manages the staging area for visual previews

The separation between the MCP server and model server maintains clear architectural boundaries while providing the AI with all necessary capabilities through a well-designed API.

## User Workflows

### Natural Language Model Creation & Editing

1. The user types a request in the AI Chat view (e.g., "Create a Business Process 'Customer Onboarding' and connect it to the 'Customer' actor").
2. The AI agent (typically the `Architect` agent) analyzes the request, identifies the required actions, and formulates these as MCP tool calls.
3. Depending on the configured workflow:
   - **Chat Confirmation:** The agent describes the proposed changes and asks for confirmation before proceeding.
   - **Visual Preview:** The agent uses `archiverse_stage_changes` to visually display the proposed elements/relationships in the diagram, awaiting user approval.
4. Upon confirmation, the changes are applied to the model, becoming visible across all views.

### Model Querying & Analysis

1. The user asks a question about the model (e.g., "Which applications are affected if the 'Customer Database' changes?").
2. The AI agent uses MCP tools to query the model structure via the `ArchiverseModelService` API.
3. The agent processes the returned data, potentially performing additional analysis or follow-up queries.
4. The agent presents the results in a clear, understandable format, potentially with visual aids or diagrams.

### Document Processing & Model Extraction (Hybrid Approach)

1. The user provides organizational documents (policies, process descriptions, system inventories).
2. A document processing pipeline (potentially using an MCP server) extracts potential architectural entities.
3. The AI agent identifies elements, relationships, and properties from this extracted information.
4. Using MCP tools, the agent proposes model changes to represent this information.
5. The user reviews, potentially modifies, and confirms these changes through chat or visual preview.

## Technical Integration Flow

1. **User Interaction:** User interacts via the AI Chat UI or potentially other contexts (diagram, explorer).
2. **Theia AI Core:** Processes the request, selects an appropriate agent, and provides context.
3. **AI Agent:** Analyzes the request, breaking it down into actions that can be performed using available tools.
4. **MCP Tool Invocation:** The agent instructs `@theia/ai-mcp` to invoke specific tools on the Custom Archiverse MCP Server.
5. **Tool Processing:** The MCP Server validates the request and translates it into one or more calls to the `ArchiverseModelService` API.
6. **Model Service Execution:** The Model Server processes the request, accessing/modifying the model as needed.
7. **Result Propagation:** Results/errors propagate back through the chain to the agent and ultimately the user.
8. **Event Notification:** If the model was changed, events are triggered to update UI components.

## Implementation Approach

The implementation follows a hybrid strategy for MCP tool creation:

1. **Automatic Generation for Query Tools:** Simple retrieval tools are defined automatically based on the Archiverse ontology grammar, ensuring they stay synchronized with language changes.

2. **Manual Definition for Complex Tools:** Operational tools involving multiple steps, state management, or complex logic are defined manually within the MCP server codebase.

3. **Clear Interface with Model Services:** All tools interact with the model exclusively through the `ArchiverseModelService` API, maintaining architectural boundaries.

## Future Directions

The AI integration architecture allows for continuous enhancement:

- **Advanced Analysis Tools:** Adding specialized MCP tools for architectural analysis, pattern detection, or compliance checking.
- **Domain-Specific Agents:** Developing agents with deeper knowledge of specific domains or frameworks.
- **Enhanced Multi-Document Understanding:** Improving the ability to correlate and integrate information from diverse sources.
- **Collaborative Modeling:** Supporting AI-assisted collaborative architecture development among multiple stakeholders.

By maintaining a clean separation between components while providing rich interaction capabilities, the architecture ensures that Archiverse's AI features can evolve alongside advances in AI technology and enterprise architecture best practices.
