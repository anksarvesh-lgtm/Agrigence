export const safeStringify = (data: any, indent?: number) => {
  try {
    const seen = new WeakSet();
    return JSON.stringify(data, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        // Handle common circular objects or complex SDK objects
        if (value instanceof HTMLElement || value instanceof Window) return '[Circular/DOM]';
        
        // Detect circularity
        if (seen.has(value)) return '[Circular]';
        seen.add(value);

        // Handle objects with problematic toJSON (like some Firebase internal objects)
        // If an object has toJSON, JSON.stringify calls it first.
        // We can't easily intercept toJSON here, but we can check if the value 
        // looks like a Firebase object and handle it if it's causing issues.
        if (value.constructor && (value.constructor.name === 'Y2' || value.constructor.name === 'Ka')) {
          return `[Firebase ${value.constructor.name}]`;
        }
      }
      return value;
    }, indent);
  } catch (err) {
    console.error('safeStringify failed:', err);
    return '[Unstringifiable Object]';
  }
};
