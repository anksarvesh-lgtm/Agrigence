## 2024-03-24 - Hardcoded API Key
**Vulnerability:** A hardcoded API key (data.gov.in) was found in `components/MandiHeroWidget.tsx` and `pages/KisanHub/MandiBhav.tsx`.
**Learning:** External API keys embedded directly in client-side code can be extracted and misused by malicious actors.
**Prevention:** Always use environment variables (e.g., `VITE_...` in Vite projects) to inject API keys at build time or fetch them securely from a backend server.
