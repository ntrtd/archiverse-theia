# Handling Multiple Modeling Languages within Archiverse

While the primary focus might be on ArchiMate, Archiverse Theia could potentially incorporate concepts from other modeling languages (e.g., BPMN, UML, custom DSLs) within its overarching grammar or framework. This document discusses the user experience (UX) implications and architectural considerations of such an approach.

## Challenges of a Unified Multi-Domain Grammar

Integrating multiple distinct modeling languages into a single Langium grammar, while technically feasible, presents significant UX challenges:

1.  **Cognitive Overload:** A monolithic grammar exposes users to a potentially vast set of concepts, properties, and relationship types from different domains simultaneously. This increases the learning curve and the risk of applying concepts incorrectly.
2.  **Tooling Complexity:**
    *   **Diagramming (GLSP):** Palettes can become overcrowded with symbols from various languages. Defining valid connections and layout rules between elements originating from different DSLs becomes complex. Maintaining visual consistency across disparate notations is difficult.
    *   **Forms (`theia-frontend-forms`):** Property panels need to be highly dynamic, showing vastly different sets of attributes depending on whether the selected element is an ArchiMate `ApplicationComponent`, a BPMN `Task`, or a custom DSL entity.
    *   **Explorer (`theia-frontend-explorer`):** A single tree mixing diverse element types can be confusing without clear visual cues distinguishing their origin and purpose.
3.  **Conceptual Blurring:** Without clear boundaries or guidance, users might inadvertently mix modeling paradigms, connect elements inappropriately, or use concepts outside their intended semantic scope.
4.  **AI Interaction Ambiguity:** Natural language prompts become harder for AI agents to interpret accurately. A request like "Create a Service" could refer to concepts from multiple integrated languages. The AI requires strong contextual clues or explicit user clarification to resolve such ambiguities.

## UX Mitigation Strategies (for a Unified Grammar)

If a single, multi-domain grammar approach is pursued, the following UX strategies are crucial:

1.  **Strict Namespacing & Visual Differentiation:**
    *   Enforce clear naming conventions or prefixes for types from different domains (e.g., `archimate:ApplicationComponent`, `bpmn:Task`).
    *   Utilize distinct icons, colors, shapes, or visual badges in explorers and diagrams to clearly signal the domain/language of each element.
2.  **Viewpoint-Driven Filtering (Essential):**
    *   This is arguably the most critical mitigation. Rely heavily on specialized GLSP diagram types configured as "Viewpoints."
    *   When a user works within a specific viewpoint (e.g., a "Business Process View"), the GLSP palette, available relationship tools, property panels, and potentially validation rules must be dynamically filtered to primarily show elements and connections relevant to that viewpoint's domain (e.g., BPMN elements plus relevant links to ArchiMate Actors).
    *   This contextual filtering is key to reducing cognitive load and guiding the user.
3.  **Context-Sensitive UI Components:**
    *   Forms and property views must dynamically adapt, displaying only the attributes relevant to the selected element's specific type, derived from its namespace or metamodel definition.
4.  **Explicit AI Context & Disambiguation:**
    *   AI agents need to be explicitly aware of the different domains within the model.
    *   Context injection (e.g., current viewpoint type, selected element type/namespace) is vital for the AI to resolve ambiguity in prompts.
    *   Generated MCP tools should ideally reflect the different domains (e.g., `archiverse_create_bpmn_Task`, `archiverse_create_archimate_ApplicationComponent`) to aid agent reasoning.
    *   The AI might need to ask clarifying questions if a prompt is ambiguous across domains.

## Alternative: Separate Linked Grammars

An alternative architectural approach involves defining separate Langium grammars for each distinct modeling language (e.g., `archiverse-archimate.langium`, `archiverse-bpmn.langium`).

*   **Pros:** Enforces clear separation of concerns. Tooling (validation, palettes, forms) for each language can be more focused and less complex. Reduces the risk of conceptual blurring.
*   **Cons:** Requires robust framework support for managing cross-grammar references (linking an element in one model to an element defined by another grammar). Visualizing and navigating these inter-model links becomes the primary UX challenge. Combined analysis or visualization across models requires specific support.

## Conclusion

Integrating multiple modeling languages within Archiverse Theia requires careful consideration of the UX impact. A unified grammar necessitates strong mitigation strategies, particularly viewpoint-based filtering and clear visual differentiation, to remain usable. Separate linked grammars offer cleaner separation but introduce cross-model linking challenges. The optimal choice depends on the required level of integration and interaction between the different modeling domains.
