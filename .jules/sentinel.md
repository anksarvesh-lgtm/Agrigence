## 2024-05-24 - Unauthenticated Admin Endpoints Exposed
**Vulnerability:** Admin endpoints for uploading/deleting blobs, triggering manual generation, and triggering mandi updates were publicly exposed without authentication checks in `server.ts`.
**Learning:** Even though endpoints might be internal tools, they require explicit protection. Grouping them under `/api/admin/` is insufficient if the router isn't secured.
**Prevention:** Always ensure any endpoint that mutates data, uploads/deletes resources, or triggers heavy computation is protected via authentication middleware like `requireAdminAuth`.
