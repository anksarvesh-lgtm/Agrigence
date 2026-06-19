## 2026-06-19 - [Missing Authentication on Admin Routes]
**Vulnerability:** Backend admin routes (/api/admin/*) completely lacked authentication, exposing destructive endpoints (file upload/delete, triggering scripts) to unauthenticated users.
**Learning:** Grouping routes under an '/admin' prefix or commenting 'add auth check here' does not automatically secure them. A dedicated middleware must be explicitly applied.
**Prevention:** Implement and enforce a requireAdminAuth middleware checking headers against ADMIN_API_KEY for all administrative routes.
