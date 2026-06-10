## 2024-06-10 - [Missing Authentication on Admin Endpoints]
**Vulnerability:** Admin API endpoints (`/api/admin/blob/upload`, `/api/admin/blob/delete`, `/api/admin/generate-daily-blog`, `/api/admin/trigger-mandi-update`) were publicly accessible without any authentication, allowing anyone to upload/delete files or trigger server-side processes.
**Learning:** Even internal or admin-specific routes must always be secured with authentication middleware. Never assume endpoints are safe just because they are not linked in the UI.
**Prevention:** Apply a strict authentication middleware (e.g., checking an API key or bearer token) globally to the entire `/api/admin` path prefix or explicitly on every admin endpoint.
