# Archiverse Theia Architecture Overview

This document provides a high-level overview of the Archiverse Theia application architecture. Archiverse Theia serves as the Integrated Development Environment (IDE) front-end for interacting with Archiverse models and leveraging its underlying capabilities.

## Core Philosophy: Separation of Concerns & Deployment Model

Archiverse is architected as a distributed system, emphasizing a clear separation of concerns between the user interface, backend logic, and data storage. This approach enhances modularity, scalability, and maintainability.

*   **Theia Application (`archiverse-theia` - This Repo):** This repository contains the code for the IDE's frontend (UI components like editors and views) and backend extensions that run within the Theia environment. These backend extensions primarily act as **proxies** or **clients** to the core services.
*   **Core Logic Server (`archiverse-model-server` - External Repo):** This is a separate, independently deployable service that encapsulates the core domain logic. It hosts:
    *   The language server (Langium) based on the grammar defined in the external `@ntrtd/archiverse-ontology` package.
    *   Persistence layer implementations for interacting with data storage (e.g., GraphDB).
    *   The GLSP server for rendering graphical diagrams.
    *   A Model Service API (likely RPC-based) that exposes unified functionality to clients.
*   **AI Service (`archiverse-mcp-server` - External Repo):** (Optional) Another external service exposing AI-related tools via the Model Context Protocol (MCP).

**Deployment Model:** This separation facilitates containerized deployment, typically using Kubernetes. The `archiverse-theia` application (running in a container) communicates over the network with the `archiverse-model-server` (running in its own container/pod), which in turn might interact with a database service. Infrastructure definitions (like Dockerfiles and Helm charts) are managed in the `archiverse-infra` repository. This contrasts with simpler models where the backend logic might run directly within the same process or virtual machine as the frontend IDE components. The `crossmodel` reference implementation (`submodules/crossmodel`) also uses process separation but manages the server process startup differently (via a VS Code extension).

## High-Level Components

The system comprises several key components:

1.  **`archiverse-theia` (This Repo):**
    *   **Application Hosts (`hosts/electron-app`, `hosts/browser-app`):** Entry points for running the Theia IDE, either as a desktop application (via Electron) or in a web browser. They assemble the necessary frontend and backend extensions.
    *   **Theia Frontend Extensions (`packages/theia-frontend-*`):** UI components running in the browser/renderer process. These include:
        *   `theia-frontend-explorer`: Custom view for navigating models.
        *   `theia-frontend-glsp`: Client-side rendering for GLSP diagrams.
        *   `theia-frontend-forms`: Potential UI for form-based editing.
        *   Other UI elements and integrations.
        These extensions communicate with the Theia backend via Theia's built-in RPC mechanism.
    *   **Theia Backend Contributions (`packages/theia-backend-extensions/`):** Extensions running within the Theia backend process. Their primary role is to act as **proxies**:
        *   They receive requests from the frontend extensions (via Theia RPC).
        *   They forward these requests over the network (using protocols like custom RPC, LSP, WebSockets) to the appropriate external service (primarily the `archiverse-model-server`).
        *   They handle aspects like connection management and potentially some lightweight data transformation or caching.
    *   **Protocol Package (`packages/protocol`):** Defines the custom RPC data structures and interfaces used for communication between the Theia backend contributions and the `archiverse-model-server`.

2.  **External Components:** These are essential parts of the Archiverse ecosystem but are developed and maintained in separate repositories.
    *   **`archiverse-model-server` (External Repo):** The core backend service. It integrates:
        *   Langium services (parsing, validation, linking).
        *   Persistence layer implementations (GraphDB, etc.).
        *   GLSP Server implementation.
        *   A Model Service Facade API (likely RPC) for external communication.
    *   **`@ntrtd/archiverse-ontology` (External Package):** Contains the Langium grammar defining the Archiverse modeling language. Consumed by the `archiverse-model-server`.
    *   **`archiverse-mcp-server` (Optional External Process):** Provides AI capabilities via the Model Context Protocol (MCP), potentially communicating with the `archiverse-model-server`.
    *   **`archiverse-infra` (External Repository/Submodule):** Contains infrastructure code (Dockerfiles, Helm charts, Terraform/Pulumi scripts) for deploying and managing the Archiverse services in environments like Kubernetes.

## Communication Flow Example (Diagram Rendering)

1.  User opens a model or requests a diagram in the Theia frontend.
2.  The `theia-frontend-glsp` extension (in the browser) sends a request via Theia RPC to its corresponding backend contribution in the Theia backend process.
3.  The Theia backend contribution establishes (or uses an existing) WebSocket connection to the GLSP Server endpoint within the `archiverse-model-server` process.
4.  It forwards the request (following the GLSP protocol) over the WebSocket.
5.  The GLSP Server in `archiverse-model-server`:
    *   Interacts with the Langium services (via the Model Service API) to retrieve the semantic model (AST) for the requested element.
    *   Generates the graphical model (GModel) based on the AST.
    *   Sends the GModel back via the WebSocket connection.
6.  The Theia backend contribution receives the GModel and forwards it to the `theia-frontend-glsp` extension via Theia RPC.
7.  The `theia-frontend-glsp` extension renders the diagram in the user's browser.

*(Similar flows exist for other interactions like text editing (LSP), model saving (custom RPC), etc.)*

## Deployment Considerations (Kubernetes Example)

The distributed nature of this architecture makes it well-suited for container orchestration platforms like Kubernetes.

*   **Separate Deployments:** The `archiverse-theia` application (frontend + backend proxies) and the `archiverse-model-server` would typically run as separate Deployments within the Kubernetes cluster.
*   **Service Discovery:** Kubernetes Services would be used to provide stable internal network addresses for the `archiverse-model-server` Pod(s).
*   **Configuration:** The Theia backend deployment would be configured (e.g., via environment variables injected by Kubernetes) with the Service address of the `archiverse-model-server`. The backend contributions would then use this address to connect.
*   **No Local Spawning:** Unlike development environments or simpler setups, the Theia backend **does not** launch the `archiverse-model-server` process directly. They are independent entities managed by Kubernetes.
*   **Scalability:** Both the Theia application and the `archiverse-model-server` can be scaled independently by adjusting the number of replicas in their respective Deployments.
*   **Multi-Tenancy (Advanced):** Using Kubernetes Operators (like the Theia Cloud Operator referenced in `archiverse-infra`) allows for dynamically creating dedicated instances of Theia and the `archiverse-model-server` per user or team, providing isolation. This requires a more complex setup involving Custom Resource Definitions (CRDs) and an Operator managing the lifecycle of these resources.

This separation of concerns enables flexibility in deployment and scaling, aligning with modern cloud-native application design principles. Infrastructure details and deployment scripts are typically found in the `archiverse-infra` repository.
</write_to_file>
