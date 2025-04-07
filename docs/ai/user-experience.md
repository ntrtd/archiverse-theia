# AI User Experience

This document describes how users interact with the AI capabilities integrated into Archiverse Theia, focusing on the chat interface, visual previews, and confirmation workflows.

## Primary Interaction: AI Chat View

*   **Interface:** The primary interface for interacting with the AI is the standard Theia "AI Chat" view, provided by `@theia/ai-chat-ui`.
*   **Functionality:** Users can type natural language prompts to:
    *   Ask questions about the model ("What applications realize the 'Order Processing' service?").
    *   Request explanations ("Explain the purpose of the 'CRM System'").
    *   Request model modifications ("Create a Business Actor 'Customer'").
    *   Ask for analysis ("Are there any components not assigned to a layer?").
*   **Context:** The chat interface can leverage context provided by the IDE, such as selected elements in the GLSP diagram or model explorer (see [Archiverse Intelligence](./archiverse-intelligence.md)).
*   **Responses:** The AI agent responds within the chat view, providing text answers, lists of elements, or proposing model changes.

## User Confirmation of Model Changes

A critical aspect of the user experience is ensuring user control over modifications suggested by the AI. Direct application of changes is avoided; instead, a confirmation step is required. Two main workflows are envisioned:

### Workflow 1: Chat-Based Confirmation

1.  **AI Proposes:** After processing a prompt requesting a model change (e.g., "Create X", "Connect Y to Z"), the AI agent determines the necessary actions (potentially a batch of actions). Instead of executing them, it formulates a message in the chat view describing the proposed changes (e.g., "I propose the following:\n - Create ApplicationComponent 'X'\n - Create Association from 'Y' to 'X'").
2.  **Confirmation Buttons:** The chat message includes interactive buttons like "[Apply Changes]" and "[Discard]".
3.  **User Action:** The user reviews the proposal and clicks either "Apply Changes" or "Discard".
4.  **Outcome:**
    *   **Apply:** The AI agent receives confirmation and proceeds to execute the changes by calling the appropriate MCP tool(s) (e.g., `archiverse_apply_batch`). A success message is typically posted back to the chat.
    *   **Discard:** The AI agent abandons the proposed changes and informs the user.
*   **Pros:** Simpler to implement, leverages the existing chat UI.
*   **Cons:** Changes are described textually, requiring the user to mentally map them to the visual model. Less intuitive for complex spatial changes.

### Workflow 2: Visual Preview & Confirmation (More Advanced)

This workflow provides a more integrated experience by showing proposed changes directly within the visual context (e.g., the GLSP diagram).

1.  **AI Stages Changes:** After processing a prompt requesting changes, the AI agent calls the `archiverse_stage_changes` MCP tool. This places the proposed actions into a temporary staging area managed by the `ArchiverseModelService` without altering the persisted model.
2.  **Visual Feedback:**
    *   The GLSP diagram (and potentially other views like the explorer) refreshes.
    *   The `ArchiverseModelService` provides data including both persisted elements and the newly staged elements/changes.
    *   The GLSP client renders the staged items with a distinct visual style (e.g., dashed borders, different color, transparency, overlay icons) indicating they are temporary proposals.
3.  **Review and Confirmation UI:**
    *   The user sees the proposed changes overlaid on the existing diagram.
    *   A dedicated UI element appears for managing these changes:
        *   **Option A: Context Menus:** Right-clicking on a staged element offers "Accept Change" / "Reject Change".
        *   **Option B: "Staged Changes" Panel:** A dedicated panel lists all staged actions with checkboxes. Buttons like "Accept Selected", "Reject Selected", "Accept All", "Reject All" are provided. (This is likely more practical for managing batches).
4.  **User Action:** The user interacts with the confirmation UI to select which changes to accept or reject.
5.  **Commit/Discard:** User actions trigger commands that call the `archiverse_commit_staged_changes` or `archiverse_discard_staged_changes` MCP tools.
6.  **Finalization & Refresh:** The `ArchiverseModelService` either persists the accepted changes or removes the discarded ones from staging. It triggers events causing the UI (e.g., GLSP diagram) to refresh, showing the final state with temporary styling removed.
*   **Pros:** Highly intuitive, allows users to see the exact impact of changes in context before committing. Better for spatial/diagrammatic changes. Allows fine-grained acceptance/rejection.
*   **Cons:** Significantly more complex to implement, requiring changes across the architecture (Model Service, GLSP Server, GLSP Client, Theia Backend).

## Batch Operations

Both confirmation workflows support batch operations. If a user prompt results in multiple actions, the AI proposes/stages the entire batch. The user confirms/rejects the batch (or individual items within it, depending on the UI implementation for the visual preview workflow). The execution (`archiverse_apply_batch` or `archiverse_commit_staged_changes`) aims for atomicity.

The choice between chat-based confirmation and visual preview depends on the desired level of integration and development resources. The visual preview offers a superior UX but requires more effort.
