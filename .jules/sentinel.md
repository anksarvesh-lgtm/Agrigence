## 2024-05-24 - Missing authentication on admin endpoints
**Vulnerability:** The `/api/admin/*` endpoints in `server.ts` (e.g. `/api/admin/blob/upload`, `/api/admin/generate-daily-blog`) were missing authentication/authorization, allowing anyone to trigger internal processes or upload blobs.
**Learning:** Route names starting with `/api/admin/` do not automatically provide authentication unless middleware is explicitly applied to them.
**Prevention:** Always implement explicit authentication middleware for sensitive endpoints instead of relying on obscurity or path names.
