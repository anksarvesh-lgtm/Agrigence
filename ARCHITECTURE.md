# Enterprise Agriculture Exam Platform Architecture

This document describes the enterprise-grade AI-powered backend infrastructure implemented for the **Agrigence Exam Platform**.

## 1. System Overview

The platform is designed to handle lakhs of concurrent users during high-stakes Mock Tests, with advanced AI evaluation and real-time analytics. It utilizes a modular, event-driven architecture combining Node.js (Express/Vite) for the primary backend flow, Python FastAPI for AI microservices, and a robust data layer consisting of PostgreSQL, Redis, Kafka, and ClickHouse.

Existing branding and environments have been preserved, extending the system rather than rewriting it.

## 2. Infrastructure Flow

```text
Frontend (Existing React/Vite UI)
       |
  [ API Gateway (Traefik/Nginx) ]
       |
[ Node.js/Express Backend Core ] --> [ Vercel Blob / S3 ]
       |
 (Event-Driven)
       |
  [ Kafka Queue ] --> [ Async Workers ] --> [ PostgreSQL (OLTP Primary) ]
       |
[ Redis (Session & Leaderboard Cache) ]
       |
[ ClickHouse (Real-Time Analytics) ]
       |
[ AI FastAPI Services (vLLM / Llama3) ] <--> [ Qdrant (Vector DB) ]
```

## 3. Core Modules (Implemented via `/src/server/enterpriseBackend.ts`)

1. **Auth Module**: JWT rotations, sessions, and multi-tier RBAC for Admins, Reviewers, and Students.
2. **High-Concurrency Test Engine Module**: Uses Redis to store active session attempts and 'Save & Next' states. These states are periodically flushed via Kafka workers to PostgreSQL to prevent DB locking and latency spikes during high-load mock exams.
3. **Analytics & ClickHouse Module**: Generates real-time leaderboard rankings (Global, State, Subject) and tracks weak-topic performance.
4. **AI Generation & Recommendation**: RAG-based doubt resolution, mock test generation, and personalized daily revision routing.
5. **Bulk Ingestion (Docs/PDF/CSV) Module**: Parses bulk questions, validates formats, detects incorrect answers against existing models, and pushes to an Admin Review Queue before publishing.

## 4. Scalability Measures

*   **Redis Buffering**: User inputs during exams are written to Redis, allowing 5-10ms response times.
*   **Kafka Event Queue**: Asynchronous processing logic scales infinitely across worker pods.
*   **Vector Search**: Qdrant utilized for real-time Retrieval Augmented Generation (RAG).
*   **ClickHouse**: For OLAP heavy analytics (percentile ranking calculation for 100K+ students).
