## 2024-05-18 - RCE in Pipeline Engine
**Vulnerability:** The `applyTransform` function in `services/pipelineEngine.ts` used `eval()` to execute user-provided mathematical transformations on data. This allowed arbitrary code execution (RCE) via malicious input.
**Learning:** `eval()` should never be used on untrusted user input, even for mathematical operations. It poses a severe security risk.
**Prevention:** Use safer alternatives like `new Function()` combined with strict regex-based input validation to allow only mathematical characters, or use dedicated math parsing libraries like `mathjs`.
