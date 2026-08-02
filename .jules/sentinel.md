## 2024-08-02 - [CRITICAL] Unprotected Admin Endpoints
**Vulnerability:** Admin endpoints under `/api/admin/*` in `server.ts` were publicly accessible without authentication.
**Learning:** Grouping routes under an `/admin` prefix does not automatically secure them. Each route must explicitly use an authentication middleware.
**Prevention:** Implement a standard `requireAdminAuth` middleware and apply it to all current and future `/api/admin/*` routes.
