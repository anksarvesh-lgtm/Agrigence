## 2025-05-23 - [Critical Security Fix: Remote Code Execution]
**Vulnerability:** Use of `eval()` in `services/pipelineEngine.ts` to execute mathematical transforms.
**Learning:** `eval()` allows execution of arbitrary JavaScript code, including potentially malicious code injected through `operation` configurations.
**Prevention:** Replaced `eval()` with a secure mathematical expression evaluator like `mathjs` which parses and evaluates mathematical expressions without allowing execution of arbitrary JavaScript code.
