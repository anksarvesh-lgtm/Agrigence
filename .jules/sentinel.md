## 2023-10-27 - Missing Authentication on Admin Endpoints
**Vulnerability:** Admin API endpoints in `server.ts` (e.g., `/api/admin/blob/upload`, `/api/admin/trigger-mandi-update`) were exposed without any authentication, allowing unauthenticated users to upload/delete files or trigger heavy processes.
**Learning:** Backend routes serving admin functionality must always enforce authentication checks on the server-side, regardless of frontend UI protections.
**Prevention:** Implement and apply a generic authentication middleware (`requireAdminAuth`) across all `/api/admin/*` routes to ensure API keys are validated.
