## 2024-05-25 - Missing Authentication on Admin Endpoints
**Vulnerability:** Admin backend routes (e.g., `/api/admin/blob/upload`, `/api/admin/generate-daily-blog`) were completely unauthenticated, allowing any user to trigger administrative actions. Grouping routes under an `/admin` prefix does not automatically secure them.
**Learning:** We must explicitly apply authentication middleware to all sensitive routes. Do not assume that route prefixing implies security.
**Prevention:** Always verify that an authorization check (like `requireAdminAuth`) is explicitly included in the route definition for any endpoint performing administrative or sensitive operations.
