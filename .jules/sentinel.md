## 2024-05-18 - [Fix hardcoded data.gov.in API key]
**Vulnerability:** A hardcoded API key for data.gov.in was found in the React frontend codebase (`components/MandiHeroWidget.tsx` and `pages/KisanHub/MandiBhav.tsx`).
**Learning:** Hardcoded API keys in the frontend are exposed to the public and can be easily extracted by an attacker.
**Prevention:** Use environment variables (`.env`) prefixed with `VITE_` to store such keys locally during development, and inject them during build time for production. Avoid committing secrets.
