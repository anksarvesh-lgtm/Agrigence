## 2024-05-15 - Hardcoded API Key in Frontend
**Vulnerability:** A hardcoded API key (for api.data.gov.in) was discovered in `components/MandiHeroWidget.tsx` and `pages/KisanHub/MandiBhav.tsx`.
**Learning:** Storing API keys directly in source code, especially in frontend components, exposes them to anyone who accesses the application or repository. This could lead to unauthorized API usage and potential quota exhaustion or billing issues.
**Prevention:** Always use environment variables for sensitive data. For Vite frontend applications, use `import.meta.env.VITE_YOUR_VARIABLE_NAME` and document the requirement in `.env.example`.
