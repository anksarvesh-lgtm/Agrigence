## 2024-05-18 - [Missing Admin Auth for Blob/Content Generation Endpoints]
**Vulnerability:** Admin routes (`/api/admin/blob/upload`, `/api/admin/blob/delete`, `/api/admin/generate-daily-blog`, `/api/admin/trigger-mandi-update`) were missing explicit authentication and were publicly accessible. Grouping them under the `/api/admin/` prefix does not automatically provide security.
**Learning:** Always verify that critical, restricted operations perform explicit authentication checks on the backend (e.g., via middleware), and do not rely on UI invisibility or URL prefixes for security.
**Prevention:** Implement and enforce robust authentication middleware (like `requireAdminAuth`) on all backend administrative endpoints.
