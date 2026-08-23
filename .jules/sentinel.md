## 2023-10-27 - Missing Authentication on Admin Endpoints
**Vulnerability:** Backend admin routes (`/api/admin/blob/upload`, `/api/admin/blob/delete`, `/api/admin/generate-daily-blog`, `/api/admin/trigger-mandi-update`) were completely exposed without any authentication or authorization checks.
**Learning:** Grouping routes under a specific path prefix like `/admin` in Express does not automatically secure them. Sensitive endpoints must explicitly use middleware to validate authorization headers (e.g., `x-admin-key`).
**Prevention:** Always implement explicit authentication middleware for sensitive endpoints and apply it directly to the route definitions, ensuring environment variables like `ADMIN_API_KEY` are used for validation.
