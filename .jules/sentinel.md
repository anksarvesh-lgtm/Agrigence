## Sentinel Journal

## 2024-09-14 - Fix RCE Vulnerability in Pipeline Engine
**Vulnerability:** Arbitrary Code Execution (RCE) via `eval()` in `applyTransform` inside `services/pipelineEngine.ts`.
**Learning:** The `eval()` function was being used directly on user-provided transform operations without proper validation, which could allow execution of arbitrary JavaScript.
**Prevention:** Use `new Function()` instead of `eval()` and apply a strict input whitelist regex (e.g. `/^[-+*/().%\s\deE]+$/`) on the operation string to ensure only mathematical expressions are evaluated.
