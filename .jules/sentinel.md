## 2024-05-24 - Initial Memory

## 2024-05-24 - Broken Access Control on Admin Endpoints
**Vulnerability:** Admin endpoints under `/api/admin/*` (`/api/admin/blob/upload`, `/api/admin/blob/delete`, `/api/admin/generate-daily-blog`, `/api/admin/trigger-mandi-update`) in `server.ts` lacked authentication. Anyone could trigger file uploads/deletions or cron jobs without authorization.
**Learning:** Grouping routes under an `/admin` URL path does not automatically secure them. Middlewares must be explicitly imported and injected into the route handlers.
**Prevention:** Always write and implement an authentication middleware for any endpoint that performs privileged actions, and ensure all routes grouped by naming convention share a router-level or explicitly applied auth middleware.
