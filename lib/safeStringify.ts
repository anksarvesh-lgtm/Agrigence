export const safeStringify = (data: any, indent?: number) => {
  const seen = new WeakSet();
  
  const replacer = (key: string, value: any) => {
    if (typeof value === 'object' && value !== null) {
      if (value instanceof HTMLElement || value instanceof Window) return '[DOM]';
      
      // Some Firebase or 3rd party classes throw internally. Detect them.
      if (value.constructor) {
        const cn = value.constructor.name;
        // Y2, Ka, etc. are minified Firestore classes usually forming cycles
        if (cn === 'Y2' || cn === 'Ka' || cn === 'Firestore' || cn === 'DocumentReference' || cn === 'CollectionReference' || cn === 'Query') {
           return `[Firebase ${cn}]`;
        }
      }

      if (seen.has(value)) {
        return '[Circular]';
      }
      seen.add(value);
    }
    return value;
  };

  try {
    return JSON.stringify(data, replacer, indent);
  } catch (err) {
    // Fallback if standard JSON.stringify throws immediately due to .toJSON returning a circular object
    const fallbackString = typeof data === 'object' && data !== null ? Object.keys(data).join(', ') : 'unknown';
    console.warn('safeStringify fallback executed:', err instanceof Error ? err.message : String(err));
    return `[Complex Object with keys: ${fallbackString}]`;
  }
};
