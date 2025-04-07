# Scenario: Hybrid Enterprise Architecture Ingestion (Unstructured + Dynamics AX)

This scenario describes building a comprehensive Enterprise Architecture (EA) model within Archiverse Theia by integrating information from both unstructured documents and structured data sources, specifically a Microsoft Dynamics AX model store. The goal is to create a unified "as-is" model that can then be used for further analysis, such as planning an ERP upgrade.

**Goal:** Create a holistic EA model in Archiverse Theia by combining insights from various documents with detailed technical information from Dynamics AX.

**Actors:** Enterprise Architect, AI Assistant (Enterprise Architect Agent)

**Pre-requisites:**
*   Configured Theia AI framework with necessary agents.
*   Deployed `ArchiverseModelService`.
*   Deployed custom MCP Servers for Document Processing and potentially Dynamics AX Import (or equivalent import mechanisms).
*   Access to unstructured documents (e.g., process descriptions, strategy papers, system inventories in Word/PDF).
*   Access to the Dynamics AX model store (e.g., database connection or exported artifacts).

**Steps:**

1.  **Ingest Unstructured Documents:**
    *   The architect provides pointers (e.g., file paths, URLs) to the relevant unstructured documents.
    *   An AI agent (or the architect via a command) triggers the **Document Processing MCP Server**.
    *   Tools within this MCP server use text extraction and NLP/LLM techniques to:
        *   Extract raw text content.
        *   Identify potential EA entities (business processes, actors, applications, servers, locations, etc.).
        *   Identify potential relationships between these entities.
    *   The MCP server returns a list of potential entities and relationships, possibly annotated with source document references and confidence scores.
    *   **Definition of Done:** Potential EA elements and relationships extracted from unstructured documents are available as structured data.

2.  **Ingest Structured Dynamics AX Data:**
    *   The architect provides connection details or file paths for the AX model store.
    *   An AI agent (or the architect via a command) triggers the **Dynamics AX Modelstore Importer** (implemented as an MCP tool, external script, or backend contribution).
    *   The importer parses the model store to extract detailed information about AX elements: Tables, Classes, Forms, Menus, Menu Items, Security Roles/Duties/Privileges, Layers, Models, Customizations, etc., including their properties and relationships.
    *   The importer returns a structured list of AX-specific elements and relationships.
    *   **Definition of Done:** Detailed AX application architecture elements and relationships are available as structured data.

3.  **AI-Driven Correlation and Mapping:**
    *   The **Enterprise Architect Agent** receives the outputs from both the unstructured and structured ingestion pipelines.
    *   The agent performs correlation:
        *   It attempts to link entities identified in documents (e.g., "Order Management System") to specific technical components found in the AX data (e.g., a set of related Forms, Tables, and Classes).
        *   This may involve LLM reasoning, string matching, pattern recognition, or potentially interactive clarification with the architect via the chat interface.
    *   The agent maps the correlated and distinct entities/relationships from both sources to the standard Archiverse/ArchiMate ontology (e.g., mapping AX Tables to DataObjects, AX Forms/Classes to ApplicationComponents, business processes from documents to BusinessProcesses). Customizations identified in AX are mapped appropriately, perhaps using stereotypes or specific properties.
    *   The agent identifies and flags potential conflicts or inconsistencies between the sources for later review.
    *   **Definition of Done:** A unified list of proposed `ArchiverseAction` objects (create, update, connect) representing the combined "as-is" EA model, mapped to Archiverse concepts, is generated. Conflicts are noted.

4.  **Stage and Review Proposed Model:**
    *   The Enterprise Architect Agent calls the `archiverse_stage_changes` MCP tool, passing the unified list of `ArchiverseAction` objects.
    *   The `ArchiverseModelService` stores these proposed changes in the temporary staging area.
    *   The architect opens relevant views (e.g., GLSP diagrams, explorer). These views query the `ArchiverseModelService`, which returns the combined view (persisted + staged data).
    *   Staged elements/relationships are displayed with distinct visual styling (e.g., dashed lines, different colors) in the diagrams.
    *   The architect reviews the proposed integrated model, including any flagged conflicts, using the visual preview and potentially a dedicated "Staged Changes" panel.
    *   **Definition of Done:** The proposed integrated EA model is visually presented to the architect as temporary elements within the modeling environment.

5.  **Confirm and Persist Model:**
    *   The architect uses the confirmation UI (panel buttons or context menus) to accept or reject the staged changes (either individually or as a batch).
    *   User actions trigger commands that call the `archiverse_commit_staged_changes` or `archiverse_discard_staged_changes` MCP tools.
    *   The `ArchiverseModelService` persists the accepted changes to the graph database and removes the actions from staging.
    *   UI views refresh to show the final, persisted state of the integrated EA model.
    *   **Definition of Done:** The architect-approved portions of the integrated EA model are persisted in the Archiverse graph database.

**Outcome:** A comprehensive "as-is" Enterprise Architecture model, integrating high-level business and technical information from unstructured documents with detailed application architecture from Dynamics AX, is created within Archiverse Theia. This model provides a foundation for subsequent analysis, such as planning the D365 upgrade, impact analysis, or generating EA documentation.
