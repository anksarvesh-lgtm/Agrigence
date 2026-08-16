## 2024-05-18 - Missing Authentication on Admin Endpoints
**Vulnerability:** Admin API endpoints in `server.ts` such as `/api/admin/blob/upload` and `/api/admin/generate-daily-blog` did not have any authentication checks, allowing anyone to trigger blob uploads, deletes, or content generation if they knew the endpoint paths. Grouping routes under an `/admin` prefix does not automatically secure them.
**Learning:** Prefixing a route with `/api/admin` provides no security. Authentication middleware must be explicitly applied to the route definition.
**Prevention:** Always use explicit authentication middleware (e.g., `requireAdminAuth`) on administrative and sensitive API routes.
