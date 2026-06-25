## 2024-05-18 - [Missing Authentication on Admin Endpoints]
**Vulnerability:** The `/api/admin/*` endpoints in `server.ts` were missing authentication, allowing unauthenticated users to trigger actions like deleting blobs or generating blogs.
**Learning:** Grouping routes under an `/admin` prefix does not automatically secure them. Each route needs explicit middleware checks.
**Prevention:** Always implement an authentication middleware and apply it explicitly to all sensitive endpoints, failing securely if configuration is missing.
