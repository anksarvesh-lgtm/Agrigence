## 2026-07-05 - [Missing Authentication on Admin Endpoints]
**Vulnerability:** Several sensitive admin endpoints in `server.ts` (`/api/admin/blob/upload`, `/api/admin/blob/delete`, `/api/admin/generate-daily-blog`, `/api/admin/trigger-mandi-update`) lacked authentication checks, making them publicly accessible. Grouping them under an `/admin` prefix did not automatically secure them.
**Learning:** In Express applications, routing under an `/admin` prefix does not confer security by itself. Every sensitive endpoint must explicitly invoke an authentication middleware.
**Prevention:** Always apply authentication middleware (e.g., `requireAdminAuth`) explicitly to every sensitive route definition or use a router-level middleware for the entire `/api/admin` path to prevent unauthorized access.
