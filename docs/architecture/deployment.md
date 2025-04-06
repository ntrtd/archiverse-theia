# Target Deployment Architecture (Kubernetes)

This document outlines the target architecture for deploying the Archiverse Theia application in a cloud-native environment like Kubernetes, focusing on scalability and maintainability. This architecture follows the CrossModel pattern, separating the Theia environment from a dedicated Server Process. Deployment artifacts (Dockerfiles, Helm charts) are managed in the `submodules/archiverse-infra` submodule.

## Core Principles

*   **Microservices Approach:** Decompose the application into independently deployable and scalable units (Theia Frontend, Theia Backend, Server Process, Database, MCP Server).
*   **Stateless Components:** Aim for stateless application components (Theia Backend, Server Process) where possible, externalizing state to the graph database.
*   **Configuration Management:** Utilize Kubernetes native mechanisms (ConfigMaps, Secrets) managed via Helm charts in `archiverse-infra`.
*   **Service Discovery:** Rely on Kubernetes Services for inter-component communication.

## Component Mapping to Kubernetes Resources

The application components map to the following Kubernetes resources (managed via Helm charts in `submodules/archiverse-infra`):

1.  **Theia Frontend:**
    *   **Resource:** Served as static assets. Built from `packages/theia-frontend-*`. Can be included in the Theia Backend container image or deployed in a separate lightweight web server `Deployment` (e.g., Nginx).
    *   **Scalability:** Scales with the Theia Backend if served directly, or independently if using a separate web server Deployment.

2.  **Theia Backend (Hosting Contributions):**
    *   **Resource:** Kubernetes `Deployment`. Manages pods running the main Theia backend Node.js process containing the proxy/contribution extensions from `packages/theia-backend-extensions/`.
    *   **Resource:** Kubernetes `Service` (e.g., ClusterIP or LoadBalancer/NodePort) to expose the backend pods to the frontend and potentially other internal services (like an MCP server if it needs to call back).
    *   **Scalability:** Can be scaled horizontally based on concurrent user sessions or general load. Requires session affinity if user sessions are stateful within the backend pod itself (though ideally state is externalized).

3.  **Server Process (Core Logic, GLSP Server, Model Service):**
    *   **Resource:** Kubernetes `Deployment`. Manages pods running the dedicated Node.js process defined in `apps/server-process/`, bundling `archiverse-archie` services, a persistence implementation (`persistence-graphdb`), the actual GLSP server, and the `ArchimateModelService` facade.
    *   **Resource:** Kubernetes `Service` (ClusterIP type) to expose the server process pods internally for the Theia Backend Contributions (e.g., `glsp-contribution`, Model Hub contributions) to connect to via custom RPC (Sockets).
    *   **Scalability:** Can be scaled horizontally based on the load related to language processing, GLSP operations, model queries, and graph database interaction intensity.

4.  **Graph Database:**
    *   **Resource:** Kubernetes `StatefulSet` (recommended for databases like Neo4j, JanusGraph requiring stable network IDs/storage). Alternatively, a `Deployment` or an external managed database service.
    *   **Resource:** Kubernetes `Service` (ClusterIP type) to expose the database pods internally to the `Server Process`.
    *   **Resource:** `PersistentVolumeClaim` (PVC) and `PersistentVolume` (PV) for storage if using a StatefulSet.
    *   **Scalability:** Depends heavily on the chosen database. Often managed via a dedicated database Helm chart (potentially referenced by `archiverse-infra`).

5.  **MCP Server (for LLM Integration, if used):**
    *   **Resource:** Kubernetes `Deployment`.
    *   **Resource:** Kubernetes `Service` (ClusterIP type).
    *   **Scalability:** Scaled independently based on LLM interaction load.

## Communication Flow in Kubernetes

*   **User -> Frontend:** Via Ingress/LoadBalancer -> Theia Backend Service (or dedicated web server Service).
*   **Frontend <-> Theia Backend Contributions:** Theia RPC (HTTP/WebSockets) via the Theia Backend Service.
*   **Theia Backend Contributions <-> Server Process:** Custom RPC (e.g., JSON-RPC over TCP/Sockets) via the internal Server Process Service.
*   **Server Process <-> Graph Database:** Database protocol (e.g., Gremlin WS, Bolt) via the internal Graph Database Service.
*   **Theia Backend (AI Core) <-> MCP Server:** HTTP/RPC via the internal MCP Server Service.
*   **MCP Server <-> Theia Backend Contributions:** HTTP/RPC via the internal Theia Backend Service (if MCP tools need to call back, e.g., to trigger actions via Model Hub contributions).

## Configuration Management (via Helm in `archiverse-infra`)

*   **Theia Backend:** Requires the internal DNS name/address of the Server Process Service and potentially the MCP Server Service. Injected via ConfigMap/Environment Variables.
*   **Server Process:** Requires Graph Database connection details (URL, credentials), persistence mode (`graphdb`), seeding options. Database credentials should come from Kubernetes Secrets, other config from ConfigMaps/Environment Variables.
*   **MCP Server:** Requires the internal DNS name/address of the Theia Backend Service (if callbacks are needed). Injected via ConfigMap/Environment Variables.

## Scalability Considerations Summary

*   **Independent Scaling:** Key benefit. Scale Theia Frontend (if separate), Theia Backend, Server Process, Database, and MCP Server independently based on bottlenecks.
*   **Statelessness:** Design backend components (Theia Backend Contributions, Server Process) to be as stateless as possible, relying on the Graph Database for persistent state. This simplifies horizontal scaling.
*   **Database Choice:** The scalability characteristics of the chosen graph database are critical.
*   **RPC Communication:** Ensure efficient RPC mechanism between Theia Backend Contributions and the Server Process. Consider connection pooling if applicable.

This distributed architecture, following the CrossModel pattern, provides a solid foundation for a scalable, maintainable, and cloud-native deployment of the Archiverse Theia application on Kubernetes, managed via the `archiverse-infra` submodule.
