## 2024-06-20 - Missing Authentication on Admin Endpoints
**Vulnerability:** Backend admin routes in `server.ts` like `/api/admin/blob/upload` and `/api/admin/generate-daily-blog` do not verify the caller's identity.
**Learning:** Prefixing a route with `/api/admin` does not provide security. These endpoints allow any unauthenticated user to upload blobs, delete blobs, and trigger internal cron-like functions.
**Prevention:** Implement a `requireAdminAuth` middleware to check an `x-admin-key` header against an `ADMIN_API_KEY` environment variable. Apply this middleware explicitly to all admin routes.
