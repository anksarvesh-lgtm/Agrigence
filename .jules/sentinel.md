## 2026-06-13 - Remove hardcoded API key in MandiBhav
**Vulnerability:** A hardcoded API key for api.data.gov.in was found in pages/KisanHub/MandiBhav.tsx.
**Learning:** API keys should never be hardcoded into frontend React code as it gets exposed to the client in the compiled bundle.
**Prevention:** Store API keys in environment variables (e.g. VITE_DATA_GOV_API_KEY) and access them via import.meta.env, or better yet, proxy requests through a backend to keep the key entirely secret if it shouldn't be exposed at all.
