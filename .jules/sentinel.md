## 2024-05-18 - Missing Authentication on Admin Endpoints
**Vulnerability:** Several backend endpoints with the `/api/admin/*` prefix (like `/api/admin/blob/upload`, `/api/admin/generate-daily-blog`, etc.) were missing authentication, allowing unauthenticated attackers to upload/delete files or trigger admin jobs.
**Learning:** Prefixing a route with `/admin` does not implicitly secure it. Every sensitive endpoint needs explicit middleware or authentication checks to prevent unauthorized access or data modification.
**Prevention:** Always use dedicated authorization middleware (e.g., `requireAdminAuth`) on all sensitive administrative routes and ensure that environment-based secrets (like `ADMIN_API_KEY`) are properly configured and validated.
