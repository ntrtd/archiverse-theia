# Archiverse Intelligence: Reasoning and Capabilities

While the [Architecture](./architecture.md) provides the foundation, the true power of AI integration lies in its ability to understand and reason within the specific domain of the Archiverse ontology. This document explores how AI agents achieve this specialized intelligence.

## Ontology-Driven Reasoning via Generated Tools

The core principle is that AI agents do not interact with a generic representation of the model but rather through **ontology-aware MCP tools** generated directly from the Archiverse Langium grammar.

*   **Semantic Grounding:** Tools like `archiverse_create_ApplicationComponent` or `archiverse_find_related_nodes(node_uri, relationship_type, target_node_type)` provide the AI with operations that directly map to Archiverse concepts and relationships. The tool names, descriptions (from grammar comments), and strongly-typed schemas (from metamodel interfaces) guide the LLM's understanding and usage.
*   **Agent Task Decomposition:** When presented with a user prompt (e.g., "Show applications used by the 'Billing' business process"), the AI agent (likely the `Architect` agent from `@theia/ai-ide`, potentially fine-tuned or augmented) must:
    1.  **Identify Intent:** Recognize the user wants to find related elements.
    2.  **Extract Entities & Types:** Identify 'Billing' as a potential element name and infer its likely type (BusinessProcess based on context or explicit mention). Identify 'applications' as the target type (ApplicationComponent).
    3.  **Determine Relationship:** Infer the relevant Archiverse relationship type connecting BusinessProcess and ApplicationComponent (e.g., `UsedBy` or its inverse, depending on grammar definition).
    4.  **Select Tool:** Choose the appropriate MCP tool, likely `archiverse_find_related_nodes` or potentially a more specific generated tool like `archiverse_find_applications_used_by_business_process`.
    5.  **Map Arguments:** Construct the arguments for the tool. This might require an initial lookup using `archiverse_find_BusinessProcess(name='Billing')` to resolve the name to a specific element URI. The final arguments might look like: `{ node_uri: 'graphdb://BusinessProcess/billing123', relationship_type: 'UsedBy', target_node_type: 'ApplicationComponent' }`.
    6.  **Invoke Tool:** Call the tool via `@theia/ai-mcp`.
    7.  **Format Response:** Present the results returned by the tool (a list of ApplicationComponent URIs/names) clearly to the user.

## Specialized Agents for Archiverse

While the generic agents in `@theia/ai-ide` provide a good starting point, achieving deep Archiverse intelligence might require:

*   **Fine-tuning:** Training or fine-tuning an LLM specifically on Archiverse models, documentation, and examples of Archimate best practices (if feasible and cost-effective).
*   **Custom "Archiverse Architect" Agent:** Developing a dedicated agent within Theia (registered via `@theia/ai-core`). This agent would be specifically designed for modeling tasks:
    *   **Domain-Specific System Prompt:** Instruct the LLM on Archiverse concepts, layers (Business, Application, Technology), viewpoints, relationships, validation rules, and best practices. Explicitly guide it on how to use the generated MCP tools for common modeling operations.
    *   **Enhanced Reasoning Logic:** Potentially include custom logic (beyond LLM calls) for:
        *   Validating proposed changes against complex Archimate rules not easily captured by the basic grammar validation.
        *   Suggesting viewpoint creation or element placement based on context.
        *   Performing more complex multi-step query construction before invoking tools.
*   **Agent Orchestration:** Configuring the `@theia/ai-ide` Orchestrator agent to recognize Archiverse-related prompts and route them preferentially to the custom "Archiverse Architect" agent.

## Context Expansion and Awareness

To provide relevant assistance, the AI needs context beyond the user's immediate prompt.

*   **Selection Context:** When the user invokes AI from a GLSP diagram or the model explorer, the URIs of the selected elements should be automatically injected into the prompt context (e.g., using `@theia/ai-core`'s variable system like `#{selectionUris}`). The agent can then use tools like `archiverse_get_node_properties` to understand the selected elements.
*   **Viewpoint Context:** The AI could be made aware of the current viewpoint being displayed in a GLSP diagram. This might involve passing the viewpoint type or URI as context. The agent could then tailor its responses or suggestions based on the elements and relationships relevant to that viewpoint.
*   **Project Context:** For broader analysis or generation tasks, the agent might need information about the overall project structure or key high-level elements. This could involve the agent proactively using tools like `archiverse_find_node(type='...')` to fetch relevant root elements or summaries.
*   **Contextual Tool Use:** The agent's reasoning should leverage the available context. If the user asks "Connect this to the authentication service" while having an ApplicationComponent selected in the diagram, the agent should use the selection URI as the `from_uri`, infer the type of the selected element, look up the 'authentication service' (potentially using `archiverse_find_node`), and invoke the appropriate `archiverse_create_<Relationship>` tool.

## Logical Form Reasoning (Potential Future Enhancement)

For more complex natural language understanding, especially involving constraints or multi-part queries, translating the user's prompt into an intermediate logical representation before mapping it to tool calls could be beneficial.

*   **Concept:** Instead of directly mapping prompt keywords to tool arguments, the LLM (or a dedicated NLU component) translates the prompt into a structured query or action representation (e.g., using a formal query language or a predefined JSON structure).
*   **Example:** "Show me application components in the core layer that are not assigned to any capability." might be translated to a logical form representing a query for ApplicationComponents with `layer == 'core'` and checking for the absence of an `AssignedTo` relationship pointing to a `Capability`.
*   **Execution:** This logical form is then processed by custom logic within the specialized agent or potentially even the `ArchiverseModelService` to execute the corresponding complex query or sequence of operations.
*   **Benefit:** Allows handling more nuanced and complex user requests than direct keyword-to-tool mapping. Requires significant NLU development effort.

By combining ontology-aware tools, specialized agent logic, and effective context management, the AI integration can move beyond generic assistance to become a truly intelligent partner in the Archiverse modeling process.
