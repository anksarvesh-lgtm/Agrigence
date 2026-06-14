## 2024-06-14 - [Missing Authentication on Admin Endpoints]
**Vulnerability:** CRITICAL - Sensitive admin endpoints (`/api/admin/*`) in `server.ts` were completely missing authentication, exposing data/file modification via direct HTTP requests.
**Learning:** Adding new sensitive routes under an `/admin` prefix doesn't automatically secure them. Express requires explicit middleware on the route level.
**Prevention:** Always verify that any endpoint designed for administrative use explicitly includes the `requireAdminAuth` (or similar) middleware in its route definition.
