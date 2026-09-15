
## 2024-05-30 - Fix Remote Code Execution in Pipeline Engine
**Vulnerability:** The pipeline engine's `applyTransform` function used `eval()` to calculate mathematical operations on user data without validation, allowing for arbitrary Remote Code Execution (RCE).
**Learning:** Even internal toolings or prototyped pipeline engines can become attack vectors if untrusted data is evaluated dynamically.
**Prevention:** Avoid `eval()`. Use `new Function()` with strict whitelisting of characters (e.g., `/^[-+*/().%\s\deE]+$/`) or a dedicated, safe math parser instead.
