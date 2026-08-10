## 2024-05-18 - [Add Admin Authentication to Backend Endpoints]
**Vulnerability:** Missing authentication on critical backend admin endpoints (`/api/admin/*`) which allowed unauthorized access to sensitive operations (file uploads/deletions, triggering daily blog generation).
**Learning:** Grouping routes under an `/admin` path does not magically secure them; explicit authentication middleware is always required. Relying only on frontend route protection leaves backend open to direct API calls.
**Prevention:** Always implement backend route authentication middleware (like `requireAdminAuth`) and explicitly apply it to every sensitive endpoint definition in the Express app.
