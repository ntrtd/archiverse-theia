# Architecture: Model Persistence and Interaction

A core aspect of the Archiverse system is how model data is stored and how the user interface components interact with that data. This architecture relies heavily on separating the core logic and persistence into an external service (`archiverse-model-server`), a pattern that contrasts with simpler implementations but shares conceptual similarities with the process separation found in the `crossmodel` reference implementation (`submodules/crossmodel`).

Interaction with the central data repository (e.g., a graph database or in-memory store) is exclusively managed by the external **`archiverse-model-server`** process (developed in a separate repository, e.g., https://github.com/ntrtd/archiverse-model-server). This external process is the single source of truth for model data and domain logic. It integrates:
*   The **Archiverse ontology** logic (using Langium based on the grammar from the external `@ntrtd/archiverse-ontology` package).
*   The **Persistence Layer** implementations (handling GraphDB, in-memory, etc.).
*   The **GLSP Server** logic for diagramming.
*   The **Archiverse Model Service API**, exposing functionality via RPC.

Frontend and backend components developed within *this* `archiverse-theia` repository are clients to this external server, communicating primarily via RPC.

## Conceptual Overview and Comparison with `crossmodel`

The system employs the following key components and interaction patterns:

*   **External `archiverse-model-server` Process:**
    *   **Role:** Hosts all core domain logic: Langium services, persistence adapters, GLSP server, and the Model Service Facade API. It's the authoritative source for model state.
    *   **`crossmodel` Comparison:** `crossmodel` also uses a separate server process (launched by `submodules/crossmodel/extensions/crossmodel-lang/src/extension.ts` and defined in `main.ts`) to host its Langium, GLSP, and Model Servers. The key difference is that `crossmodel`'s server process is bundled within its repository and managed by a VS Code extension, whereas `archiverse-model-server` is a fully independent external service/repository.

*   **Theia Backend Contributions (`packages/theia-backend-extensions/` - This Repo):**
    *   **Role:** Run within the main Theia backend process (part of `hosts/*`). They serve as **proxies** or **adaptors** between the Theia frontend and the external `archiverse-model-server`. They receive Theia RPC calls from the frontend and translate them into custom RPC calls (using `packages/protocol`) to the external server's Model Service API. They also handle proxying for LSP and potentially GLSP communication.
    *   **`crossmodel` Comparison:** This proxy pattern is directly comparable to how `crossmodel`'s backend contributions (e.g., in `submodules/crossmodel/packages/core/`) act as clients to its internal server process, forwarding requests received from the frontend via Theia RPC to the appropriate server (Langium, GLSP, Model Server) using different protocols (LSP, GLSP Protocol, Custom RPC).

*   **URI Identification:**
    *   **Role:** Model elements are identified by custom URIs (e.g., `graphdb://Application/PaymentGateway`). These URIs act as stable identifiers across the system, used in frontend views, editor inputs, and RPC calls to specify the target element within the dataset managed by `archiverse-model-server`.
    *   **`crossmodel` Comparison:** `crossmodel` uses standard file URIs (`file://...`) as its primary identifiers, as its model is more closely tied to the workspace file structure. Archiverse's use of custom URIs reflects its potential decoupling from a traditional file system, especially when using a graph database backend.

*   **Frontend Components (`packages/theia-frontend-*` - This Repo):**
    *   **Custom Explorer (`theia-frontend-explorer`):** Provides a domain-specific view of the model hierarchy or structure. It uses Theia RPC to communicate with a backend contribution, which then queries the external `archiverse-model-server` via the Model Service API to get the data needed for display.
    *   **Editors (GLSP, Forms, Text):**
        *   `theia-frontend-glsp`: The GLSP client, rendering diagrams based on GModels received from the external GLSP Server (via WebSockets, likely proxied). Sends user actions back to the GLSP server. Comparable to `submodules/crossmodel/packages/glsp-client`.
        *   `theia-frontend-forms`: Provides form-based editing, likely using Theia RPC to communicate with a backend contribution that interacts with the external `archiverse-model-server` via the Model Service API. Comparable to `submodules/crossmodel/packages/form-client`.
        *   Text Editors (Standard Theia/Monaco): Interact with the Langium services in the external `archiverse-model-server` via the Language Server Protocol (LSP), typically proxied through the Theia backend.
    *   **`crossmodel` Comparison:** The pattern of specialized frontend clients communicating through the Theia backend to dedicated server components (GLSP, Model Server, Langium/LSP) is fundamentally similar in both architectures.

*   **Model Service Facade (`ArchiverseModelService` API - Exposed by External Server):**
    *   **Role:** Provides a unified, high-level API over the core functionalities (language services, persistence, etc.) within the `archiverse-model-server`. This simplifies interaction for clients like the Theia Backend Contributions.
    *   **`crossmodel` Comparison:** `crossmodel` explicitly implements a `ModelServiceFacade` (`submodules/crossmodel/extensions/crossmodel-lang/src/model-server/model-service.ts`) for similar reasons – to provide a stable, non-LSP interface for accessing and manipulating the semantic model held by Langium, especially for the GLSP and Form servers/clients.

## Communication Flow Example (Loading a Diagram)

1.  User triggers an action to open a diagram associated with a specific model element URI (e.g., `graphdb://...`).
2.  The Theia frontend (e.g., the Explorer) makes a request (e.g., via command or Theia RPC) to a Theia Backend Contribution (in `packages/theia-backend-extensions/`).
3.  The Theia Backend Contribution initiates a WebSocket connection (or uses an existing one) to the GLSP Server endpoint within the external `archiverse-model-server`.
4.  The Backend Contribution sends a request (GLSP protocol) to the GLSP Server to fetch the graphical model (GModel) corresponding to the URI.
5.  The GLSP Server (in `archiverse-model-server`):
    *   Likely interacts with the Langium services (also in `archiverse-model-server`) via the Model Service Facade or directly to get the relevant semantic model (AST) fragment from the document store or persistence layer.
    *   Translates the semantic model fragment into a graphical representation (GModel).
    *   Sends the GModel back to the requesting Theia Backend Contribution via the WebSocket.
6.  The Theia Backend Contribution forwards the GModel (or relevant update actions) to the `theia-frontend-glsp` component in the frontend via the WebSocket connection.
7.  `theia-frontend-glsp` receives the GModel and renders the diagram.

## Benefits of This Architecture

*   **Clear Separation of Concerns:** Strongly decouples UI (frontend extensions), IDE integration/proxy logic (backend contributions), and core domain/language/persistence logic (external server). This mirrors the separation principle applied in `crossmodel`, enhancing modularity.
*   **Independent Scalability & Deployment:** The external `archiverse-model-server` can be developed, tested, deployed (e.g., as a microservice), and scaled independently of the Theia IDE application.
*   **Reusability of Core Logic:** The `archiverse-model-server` can potentially serve other clients beyond Theia (e.g., web viewers, CLI tools, other IDEs) via its defined APIs (Model Service RPC, LSP, GLSP).
*   **Technology Flexibility:** Allows choosing the most appropriate technologies for the core server (Node.js is common for Langium/GLSP) independently of the Theia environment.
