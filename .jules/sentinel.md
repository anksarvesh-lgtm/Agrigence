## 2024-05-24 - Missing Authentication on Admin Endpoints
**Vulnerability:** Critical admin backend routes (`/api/admin/blob/upload`, `/api/admin/blob/delete`, `/api/admin/generate-daily-blog`, `/api/admin/trigger-mandi-update`) in `server.ts` lacked authentication checks, allowing unauthenticated users to upload/delete files, trigger expensive background processes, or manipulate backend data.
**Learning:** Adding endpoints with `/admin/` in the path does not automatically secure them. A centralized authentication middleware was needed to enforce explicit authorization on critical server endpoints.
**Prevention:** Always implement explicit authentication middleware for sensitive API routes. Do not rely solely on obfuscation or frontend protection for backend endpoints.
