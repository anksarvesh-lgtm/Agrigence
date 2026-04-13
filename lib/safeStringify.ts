export const safeStringify = (data: any) => JSON.stringify(data, (key, value) => {
  if (typeof value === 'object' && value !== null) {
    if (value instanceof HTMLElement || value instanceof Window) return '[Circular/DOM]';
    const seen = new WeakSet();
    if (seen.has(value)) return '[Circular]';
    seen.add(value);
  }
  return value;
});
