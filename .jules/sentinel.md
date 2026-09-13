## 2024-05-18 - RCE in Pipeline Engine Transform

**Vulnerability:** The `applyTransform` function in `services/pipelineEngine.ts` uses `eval()` to execute mathematical operations based on user input, leading to Remote Code Execution (RCE).
**Learning:** Prototyping code using `eval()` is highly dangerous, even for simple mathematical operations, as attackers can craft malicious payloads that execute arbitrary code.
**Prevention:** Always use safe evaluation mechanisms (e.g., `new Function()` with strict whitelisting) or dedicated math parsers. Enforce strict input validation using regular expressions to allow only expected characters (numbers, operators) before evaluation.
