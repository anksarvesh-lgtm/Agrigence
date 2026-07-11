## 2024-05-14 - Missing Authentication on Admin Endpoints
**Vulnerability:** Admin API endpoints in `server.ts` (`/api/admin/*`) were accessible without any authentication, allowing anyone to upload/delete blobs or trigger automation scripts.
**Learning:** Grouping routes under an `/admin` prefix does not automatically protect them. Each sensitive route must explicitly invoke an authentication/authorization middleware.
**Prevention:** Always verify that a robust authentication middleware (like `requireAdminAuth`) is applied to all sensitive or administrative routes during development and code review.
