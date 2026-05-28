## 2024-05-24 - Fix Hardcoded API Key
**Vulnerability:** A hardcoded API key for `api.data.gov.in` was found in `components/MandiHeroWidget.tsx` and `pages/KisanHub/MandiBhav.tsx`.
**Learning:** Hardcoding secrets exposes credentials in client-side bundles and source control, leading to potential unauthorized access and API quota exhaustion.
**Prevention:** Always use environment variables (`import.meta.env`) for storing and accessing sensitive credentials in frontend applications.
