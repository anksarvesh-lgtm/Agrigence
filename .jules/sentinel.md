## 2024-05-24 - [Unauthenticated Admin Endpoints]
**Vulnerability:** Found unauthenticated admin endpoints for blob operations and triggering jobs in `server.ts`.
**Learning:** Backend routes must explicitly use `requireAdminAuth` middleware; grouping by `/admin` prefix does not automatically secure them.
**Prevention:** Ensure `requireAdminAuth` is consistently used for all admin routes and document this requirement.
