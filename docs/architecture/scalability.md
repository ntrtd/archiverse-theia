# Scalability Model and Considerations

This document discusses the scalability characteristics of the Archiverse Theia application, particularly in a cloud-native (Kubernetes) deployment scenario.

## Default Scalability Model: Per-User Session Resources

The standard deployment model for Theia-based applications, including the CrossModel-aligned architecture used by Archiverse Theia, typically involves dedicating specific backend resources to each active user session, especially for users requiring **editing capabilities**.

*   **Components per Session:**
    *   **Theia Backend Instance:** One instance of the main Theia backend Node.js process (hosting contributions from `packages/theia-backend-extensions/`) runs per user session. It manages the user's workbench state, UI connections, and acts as a proxy.
    *   **Server Process Instance:** One instance of the `apps/server-process` Node.js process runs per user session. It implements the core Langium services (using grammar from `@archiverse/archie`), hosts the active persistence layer (`packages/persistence-*`), the GLSP server, and the `ArchiverseModelService` facade. It manages the stateful Langium workspace (ASTs, index, scope cache) for that user's view of the model.

*   **Shared Component:**
    *   **Graph Database:** The underlying graph database is the central, shared component accessed concurrently by multiple `Server Process` instances (each serving a different user).

*   **Rationale:** While the core logic *could* potentially be made stateless, managing the Langium workspace state is inherently tied to a user's specific context and loaded documents. Sharing a single `Server Process` among multiple independent users introduces significant complexity in isolating states, managing resources (e.g., memory for multiple ASTs), handling concurrent modifications, and ensuring data consistency. Dedicating a `Server Process` instance per editing session is often more practical and robust.

*   **Resource Implications:** This per-user session model provides a rich, stateful IDE experience but is inherently more **resource-intensive** (CPU, RAM) per user compared to traditional stateless web applications. Scaling for more editors primarily involves **horizontal scaling**: launching more instances (Pods in Kubernetes) of the Theia Backend and Server Process deployments.

## Hybrid Editor/Reader Strategy (Recommended for Scalability)

To optimize resource usage and efficiently support a potentially large number of users who only need read-only access, a hybrid deployment strategy is recommended:

1.  **Full Theia Application (for Editors):**
    *   Users requiring full editing features, diagram interaction, validation feedback, etc., use the complete Archiverse Theia application (Electron or Browser).
    *   This involves running the dedicated Theia Backend and `Server Process` instances per session, as described above.

2.  **Separate Reader Web Application (for Read-Only Users):**
    *   **Application:** Develop a separate, lightweight web application (e.g., `archiverse-reader-app` using React, Vue, Next.js, etc.) specifically for read-only browsing and viewing. This application would *not* use the Theia framework.
    *   **Backend Read API:** This reader app communicates with a dedicated backend API optimized for read-only queries against the graph database.
        *   **Implementation:** This should ideally be a new, stateless microservice (Node.js/Express, Python/Flask, Go, etc.) connecting to the graph database with read-only credentials.
        *   **Functionality:** Exposes optimized REST or GraphQL endpoints for fetching data needed by the reader UI (e.g., get element properties, get elements for a view, find related elements).
        *   **Caching:** This Read API can implement aggressive caching strategies (e.g., using Redis or Memcached) to minimize direct database load for common read requests.
    *   **UI:** The reader app's UI focuses on efficient display and navigation, potentially using simpler rendering libraries than the full GLSP/Sprotty stack if interactivity is limited.
    *   **Deployment:** The Reader App frontend (static assets) and its dedicated Read API service are deployed as standard web components (e.g., separate Deployments/Services in Kubernetes), managed via Helm charts in `submodules/archiverse-infra`.

*   **Benefits:**
    *   **Scalability:** Read-only access is handled by a much lighter, independently scalable web application and API.
    *   **Resource Optimization:** Avoids running resource-intensive Theia backends and `Server Process` instances for read-only users.
    *   **Tailored UX:** Allows for UIs optimized specifically for reading/browsing versus editing.
    *   **Clear Separation:** Decouples the complex editing environment from the read-only consumption path.

## Web Worker Limitations

While Web Workers in the browser can offload computation from the main UI thread, they are **not a viable solution** for running significant parts of the Theia Backend or the `Server Process` logic due to fundamental limitations:

*   **No Node.js APIs:** Workers lack access to essential Node.js modules like `fs` (filesystem) or native database drivers required by persistence layers.
*   **State Management Complexity:** Managing complex, cross-document state like the Langium workspace index, scope cache, and loaded ASTs within the isolated, message-passing context of a worker is highly impractical and inefficient.
*   **Communication Overhead:** Serializing and deserializing potentially large ASTs or complex data structures for communication between the main thread and workers can introduce significant performance bottlenecks.

Web Workers are more suitable for tasks within the **frontend** of the separate **Reader Web Application**, such as:

*   Fetching data from the Read API in the background.
*   Performing client-side data transformations or preparations for the UI thread.

For the main Theia application, scalability relies on optimizing the per-user server-side instances and potentially adopting the hybrid editor/reader application model described above.
