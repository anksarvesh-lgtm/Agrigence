## 2024-05-24 - [Fix unauthenticated admin endpoints]
**Vulnerability:** Admin endpoints under `/api/admin` (like `/api/admin/blob/upload` and `/api/admin/generate-daily-blog`) lacked authentication entirely.
**Learning:** Grouping routes under an `/admin` prefix does not automatically protect them. An explicit middleware that performs authentication/authorization needs to be used for every sensitive route.
**Prevention:** Always verify that a middleware handling authentication checks is actively passed to the `app.post`/`app.get` definition for any admin or privileged route.
