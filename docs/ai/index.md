# AI Integration in Archiverse Theia

This section details the integration of Large Language Models (LLMs) and Artificial Intelligence capabilities within the Archiverse Theia modeling environment. The goal is to enhance the modeling experience by providing intelligent assistance for tasks such as model generation, analysis, explanation, and automation.

## Core Concepts

The AI integration leverages the extensible nature of the Eclipse Theia platform, specifically its AI framework (`@theia/ai-*` packages), combined with custom components tailored for the Archiverse domain. Key aspects include:

*   **Leveraging Theia AI:** Utilizing the core AI services for managing LLM connections, agents, prompts, and context.
*   **Ontology-Aware Tools:** Enabling AI agents to interact meaningfully with the Archiverse model via a custom Model Context Protocol (MCP) server exposing tools generated directly from the Archiverse Langium grammar.
*   **Agent Reasoning:** Employing AI agents that can understand user intent within the modeling context and utilize the available tools effectively.
*   **User Control:** Implementing confirmation workflows (chat-based or visual previews) to ensure users review and approve AI-suggested model modifications before they are persisted.
*   **Seamless User Experience:** Integrating AI features into the existing UI, including the chat view and potentially the GLSP diagramming editor.

## Documentation Structure

*   **[Architecture](./architecture.md):** Details the core components (Theia AI Framework, `ArchiverseModelService`), the crucial role of the Custom MCP Server, the generation of ontology-aware MCP tools, and the overall communication flow.
*   **[Archiverse Intelligence](./archiverse-intelligence.md):** Focuses on the AI's domain-specific capabilities, including specialized agents, ontology-driven reasoning using the generated tools, context expansion techniques, and potentially logical form translation for interpreting prompts within the Archiverse context.
*   **[User Experience](./user-experience.md):** Describes user interaction flows via chat, the mechanisms for user confirmation (chat-based or visual preview/staging), and the user-facing aspects of the visual preview system.
