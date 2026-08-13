## 2024-05-18 - [Missing Authentication on Admin Routes]
**Vulnerability:** Found several `/api/admin/*` endpoints in `server.ts` that had no authentication checks, allowing unauthenticated users to upload/delete blobs and trigger backend processes.
**Learning:** Grouping routes under an `/admin` prefix does not automatically secure them. Each route must explicitly use an authentication middleware.
**Prevention:** Always implement and enforce authentication middleware (like `requireAdminAuth`) on sensitive endpoints. Do not rely on route prefixes or frontend hiding for security.
