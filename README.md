# Adaptive Practice Prerequisite Graph v3.0 (Ultimate Enterprise SOA Edition)

![Java 17+](https://img.shields.io/badge/Java-17%2B-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot 3.2.5](https://img.shields.io/badge/Spring_Boot-3.2.5-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![OpenAPI 3.0](https://img.shields.io/badge/OpenAPI_3.0-Swagger_UI-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)
![Architecture](https://img.shields.io/badge/Architecture-DAG_%26_BKT_SOA-1E40AF?style=for-the-badge)

An enterprise-grade **Service-Oriented Architecture (SOA)** platform that models curriculum competencies as a **Directed Acyclic Prerequisite Graph (DAG)**, computes **Bayesian Knowledge Tracing (BKT)** mastery probabilities $P(L_t)$, enforces **Zone of Proximal Development (ZPD)** prerequisite gating, and automatically unlocks downstream skills upon passing adaptive diagnostic practice.

---

## 👥 Project Team (Team-18) — KLH University
* **K. Srimaan** — `2420030418` *(Team Lead)*
* **Jai Vardhan** — `2420090104`
* **S. Abhinav** — `2420090058`
* **Project Guide:** **Mrs. Venkateshwari Ketineni** *(Department of CSE / CSIT, K L Deemed to be University)*

---

## 🌟 v3.0 Ultimate Enterprise SOA Capabilities

1. **Interactive SVG Directed Acyclic Prerequisite Graph (DAG) Engine (`PrerequisiteGraphService.java`)**
   * Evaluates parent prerequisite dependencies in real time and classifies every curriculum node into **MASTERED** ($\ge 80\%$), **READY TO PRACTICE** (ZPD Frontier — all prerequisites mastered), **REMEDIATION REQUIRED** ($< 70\%$ after practice), or **LOCKED BY PREREQ** (unmastered parent dependency).
   * Renders a live, clickable **SVG DAG Topology Canvas** with animated emerald dependency flow lines for unlocked paths.
2. **Bayesian Knowledge Tracing (BKT) & Kahn's Topological Path Recommender**
   * Computes posterior mastery probability $P(L_t) = P(L_{t-1}) + (1 - P(L_{t-1})) \cdot P(T)$ and generates an optimal study sequence via Kahn's Topological Sort.
3. **Dual-Mode Adaptive Practice & Automatic Downstream Unlocking (`AdaptiveQuizService.java`)**
   * Completing an adaptive diagnostic quiz on a bottleneck node (such as `CS-202: Graph Traversal`) updates its mastery score and **automatically unlocks** downstream dependent nodes (`CS-301: Topological Sort & Shortest Paths`).
4. **SHA-256 Cryptographic Mastery Credentials & LTI 1.3 Webhook Stream**
   * Issues verifiable `KLH-DAG-XXXXXXXX` mastery badges and broadcasts real-time LTI 1.3 telemetry events to **Canvas LMS**, **Coursera Skill Graph**, and **Moodle**.

---

## 🔌 Complete SOA REST API Contract

| HTTP Method | Endpoint URI | Request Params / Payload | Response Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/graph/nodes` | `?status=`, `?domainTrack=`, `?search=` | Returns all DAG skill nodes with BKT probabilities and prerequisite states. |
| `GET` | `/api/graph/nodes/{id}` | Path variable: `id` | Returns a single skill node and its full BKT practice attempt history. |
| `GET` | `/api/graph/analytics` | None | Returns Kahn's topological study sequence, ZPD counts, and mean BKT mastery. |
| `POST` | `/api/graph/nodes` | `SkillNode` JSON | Registers a new curriculum skill node and recomputes DAG topology. |
| `PUT` | `/api/graph/nodes/{id}/practice` | `newMasteryScore`, `masteryThreshold`, `mode`, `remarks` | Logs practice score, updates BKT $P(L_t)$, and unlocks dependent child nodes. |
| `DELETE` | `/api/graph/nodes/{id}` | Path variable: `id` | Removes a skill node from the DAG and recomputes dependencies. |
| `GET` | `/api/assessments/adaptive-quiz` | `?nodeCode=` | Serves adaptive diagnostic multiple-choice questions for the specified skill node. |
| `GET` | `/api/notifications/webhooks` | None | Returns outbound LMS/LTI (Canvas, Coursera, Moodle) webhook logs. |
| `POST` | `/api/notifications/dispatch-sweep` | None | Broadcasts ZPD frontier recommendations to connected LMS platforms. |
| `GET` | `/api/credentials/verify/{hash}` | Path variable: `hash` | Cryptographically verifies a `KLH-DAG-*` mastery credential signature. |

---

## 🚀 Quick Start & Deployment

* **Run Full-Stack with Maven**: `mvn spring-boot:run` → Open `http://localhost:8080` (Swagger UI at `http://localhost:8080/swagger-ui.html`).
* **Run with Docker**: `docker compose up --build`
* **GitHub Pages Live Demo**: Push to GitHub and enable **GitHub Pages** from `/docs` or via **GitHub Actions**.
