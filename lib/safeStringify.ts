export const safeStringify = (data: any) => {
  const seen = new WeakSet();
  return JSON.stringify(data, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (value instanceof HTMLElement || value instanceof Window) return '[Circular/DOM]';
      if (seen.has(value)) return '[Circular]';
      seen.add(value);
    }
    return value;
  });
};
