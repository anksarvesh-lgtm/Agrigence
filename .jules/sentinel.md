## 2024-05-24 - [Missing Authentication on Admin Routes]
**Vulnerability:** The `/api/admin/*` endpoints in `server.ts` lack authentication and authorization checks.
**Learning:** It is crucial to verify that administrative endpoints have proper security measures in place.
**Prevention:** Apply `requireAdminAuth` or a similar authentication middleware to all `/api/admin/*` routes to ensure only authorized personnel can access them.
