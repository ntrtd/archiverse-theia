# Target Deployment Architecture (Kubernetes)

This document outlines the target architecture for deploying the Archiverse Theia application in a cloud-native environment like Kubernetes, focusing on scalability and maintainability. This architecture separates the **Theia Application** environment from the dedicated **Archiverse ontology host** process. Deployment artifacts (Dockerfiles, Helm charts) are managed in the `submodules/archiverse-infra` submodule.

## Core Principles

*   **Microservices Approach:** Decompose the application into independently deployable and scalable units (**Theia Application** Frontend/Backend, **Archiverse ontology host**, Database, MCP Server).
*   **Stateless Components:** Aim for stateless application components (**Theia Application** Backend, **Archiverse ontology host**) where possible, externalizing state to the graph database.
*   **Configuration Management:** Utilize Kubernetes native mechanisms (ConfigMaps, Secrets) managed via Helm charts in `archiverse-infra`.
*   **Service Discovery:** Rely on Kubernetes Services for inter-component communication.

## Component Mapping to Kubernetes Resources

The application components map to the following Kubernetes resources (managed via Helm charts in `submodules/archiverse-infra`):

1.  **Theia Application Frontend:**
    *   **Resource:** Served as static assets. Built from `packages/theia-frontend-*`. Can be included in the **Theia Application** Backend container image or deployed in a separate lightweight web server `Deployment` (e.g., Nginx).
    *   **Scalability:** Scales with the **Theia Application** Backend if served directly, or independently if using a separate web server Deployment.

2.  **Theia Application Backend (Hosting Contributions):**
    *   **Resource:** Kubernetes `Deployment`. Manages pods running the main Theia backend Node.js process (part of the **Theia Application**) containing the proxy/contribution extensions from `packages/theia-backend-extensions/`.
    *   **Resource:** Kubernetes `Service` (e.g., ClusterIP or LoadBalancer/NodePort) to expose the backend pods to the frontend and potentially other internal services (like an MCP server if it needs to call back).
    *   **Scalability:** Can be scaled horizontally based on concurrent user sessions or general load. Requires session affinity if user sessions are stateful within the backend pod itself (though ideally state is externalized).

3.  **Archiverse ontology host (Ontology Logic, Persistence, GLSP Endpoint, Ontology API):**
    *   **Resource:** Kubernetes `Deployment`. Manages pods running the dedicated Node.js process defined in `services/model-server/`, integrating the **Archiverse ontology** logic (using `@ntrtd/archiverse-archie`), bundling a **Persistence Layer** implementation (`persistence-graphdb`), hosting the **GLSP Endpoint/Service**, and exposing the **Archiverse ontology API**.
    *   **Resource:** Kubernetes `Service` (ClusterIP type) to expose the host process pods internally for the **Theia Backend Contributions** (e.g., `glsp-contribution`, Model Hub contributions) to connect to via custom RPC (Sockets).
    *   **Scalability:** Can be scaled horizontally based on the load related to language processing, GLSP operations, model queries (via the API), and graph database interaction intensity.

4.  **Graph Database:**
    *   **Resource:** Kubernetes `StatefulSet` (recommended for databases like Neo4j, JanusGraph requiring stable network IDs/storage). Alternatively, a `Deployment` or an external managed database service.
    *   **Resource:** Kubernetes `Service` (ClusterIP type) to expose the database pods internally to the **Archiverse ontology host**.
    *   **Resource:** `PersistentVolumeClaim` (PVC) and `PersistentVolume` (PV) for storage if using a StatefulSet.
    *   **Scalability:** Depends heavily on the chosen database. Often managed via a dedicated database Helm chart (potentially referenced by `archiverse-infra`).

5.  **MCP Server (for LLM Integration, if used):**
    *   **Resource:** Kubernetes `Deployment`.
    *   **Resource:** Kubernetes `Service` (ClusterIP type).
    *   **Scalability:** Scaled independently based on LLM interaction load.

## Communication Flow in Kubernetes

*   **User -> Frontend:** Via Ingress/LoadBalancer -> **Theia Application** Backend Service (or dedicated web server Service).
*   **Frontend <-> Theia Backend Contributions:** Theia RPC (HTTP/WebSockets) via the **Theia Application** Backend Service.
*   **Theia Backend Contributions <-> Archiverse ontology host:** Custom RPC (e.g., JSON-RPC over TCP/Sockets) via the internal **Archiverse ontology host** Service, targeting the **Archiverse ontology API** or **GLSP Endpoint**.
*   **Archiverse ontology host <-> Graph Database:** Database protocol (e.g., Gremlin WS, Bolt) via the internal Graph Database Service.
*   **Theia Application Backend (AI Core) <-> MCP Server:** HTTP/RPC via the internal MCP Server Service.
*   **MCP Server <-> Theia Backend Contributions:** HTTP/RPC via the internal **Theia Application** Backend Service (if MCP tools need to call back, e.g., to trigger actions via Model Hub contributions).

## Configuration Management (via Helm in `archiverse-infra`)

*   **Theia Application Backend:** Requires the internal DNS name/address of the **Archiverse ontology host** Service and potentially the MCP Server Service. Injected via ConfigMap/Environment Variables.
*   **Archiverse ontology host:** Requires Graph Database connection details (URL, credentials), persistence mode (`graphdb`), seeding options. Database credentials should come from Kubernetes Secrets, other config from ConfigMaps/Environment Variables.
*   **MCP Server:** Requires the internal DNS name/address of the **Theia Application** Backend Service (if callbacks are needed). Injected via ConfigMap/Environment Variables.

## Scalability Considerations Summary

*   **Independent Scaling:** Key benefit. Scale **Theia Application** Frontend (if separate), **Theia Application** Backend, **Archiverse ontology host**, Database, and MCP Server independently based on bottlenecks.
*   **Statelessness:** Design backend components (**Theia Backend Contributions**, **Archiverse ontology host**) to be as stateless as possible, relying on the Graph Database for persistent state. This simplifies horizontal scaling.
*   **Database Choice:** The scalability characteristics of the chosen graph database are critical.
*   **RPC Communication:** Ensure efficient RPC mechanism between **Theia Backend Contributions** and the **Archiverse ontology host**. Consider connection pooling if applicable.

This distributed architecture provides a solid foundation for a scalable, maintainable, and cloud-native deployment of the Archiverse Theia application on Kubernetes, managed via the `archiverse-infra` submodule.
