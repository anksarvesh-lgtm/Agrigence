## 2024-08-20 - Missing Authentication on Admin Endpoints
**Vulnerability:** Admin endpoints (`/api/admin/*`) in `server.ts` lacked authentication, allowing unauthorized users to upload/delete blobs and trigger backend processes.
**Learning:** Grouping routes under an `/admin` prefix does not automatically secure them. Each sensitive endpoint must explicitly enforce authentication/authorization.
**Prevention:** Always implement and apply an authentication middleware (e.g., validating an admin key) to any endpoint that performs privileged actions or exposes sensitive data.
