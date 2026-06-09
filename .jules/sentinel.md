
## 2025-02-27 - Missing Authentication on Admin Endpoints
**Vulnerability:** The backend routes under `/api/admin/*` in `server.ts` were completely unprotected, allowing any unauthenticated user to access sensitive admin functions like generating blogs, updating mandi prices, or uploading/deleting blobs.
**Learning:** Security controls should never be left as "TODO" or commented out (e.g., `// In production, add auth check here`). Admin endpoints must enforce authentication to prevent unauthorized execution of privileged operations.
**Prevention:** Implement and attach an authentication middleware (like `requireAdminAuth`) to all sensitive routes before pushing code to production.
