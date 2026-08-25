export type NodeType = "filter" | "select" | "transform" | "aggregate" | "join" | "input";

export const executePipeline = (nodes: any[], edges: any[], initialData: any[]) => {
  // 1. Sort nodes based on edges (topological sort)
  const sortedNodes = sortNodes(nodes, edges);
  
  let currentData = [...initialData];

  // 2. Execute each node in order
  for (const node of sortedNodes) {
    if (!node.data?.config) continue; // Skip nodes without config

    switch (node.data.type) {
      case "filter":
        currentData = applyFilter(currentData, node.data.config);
        break;
      case "select":
        currentData = applySelect(currentData, node.data.config);
        break;
      case "transform":
        currentData = applyTransform(currentData, node.data.config);
        break;
      case "aggregate":
        currentData = applyAggregate(currentData, node.data.config);
        break;
      default:
        break;
    }
  }

  return currentData;
};

// --- Helper: Topological Sort ---
const sortNodes = (nodes: any[], edges: any[]) => {
  const graph = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  nodes.forEach(n => {
    graph.set(n.id, []);
    inDegree.set(n.id, 0);
  });

  edges.forEach(e => {
    if (graph.has(e.source) && inDegree.has(e.target)) {
      graph.get(e.source)!.push(e.target);
      inDegree.set(e.target, inDegree.get(e.target)! + 1);
    }
  });

  const queue: string[] = [];
  inDegree.forEach((degree, id) => {
    if (degree === 0) queue.push(id);
  });

  const sorted: any[] = [];
  while (queue.length > 0) {
    const id = queue.shift()!;
    const node = nodes.find(n => n.id === id);
    if (node) sorted.push(node);

    graph.get(id)?.forEach(neighbor => {
      inDegree.set(neighbor, inDegree.get(neighbor)! - 1);
      if (inDegree.get(neighbor) === 0) {
        queue.push(neighbor);
      }
    });
  }

  return sorted;
};

// --- Node Logic Functions ---

const applyFilter = (data: any[], config: any) => {
  const { column, operator, value } = config;
  if (!column || !operator || value === undefined) return data;

  return data.filter((row) => {
    switch (operator) {
      case ">": return row[column] > value;
      case "<": return row[column] < value;
      case "==": return row[column] == value;
      case "!=": return row[column] != value;
      default: return true;
    }
  });
};

const applySelect = (data: any[], config: any) => {
  const { columns } = config;
  if (!columns || !Array.isArray(columns) || columns.length === 0) return data;

  return data.map((row) => {
    const newRow: any = {};
    columns.forEach((col: string) => {
      newRow[col] = row[col];
    });
    return newRow;
  });
};

const applyTransform = (data: any[], config: any) => {
  const { column, operation } = config;
  if (!column || !operation) return data;

  return data.map((row) => {
    try {
      // SECURITY: Replace 'x' with the actual row value, defaulting to 0 if undefined.
      const safeOp = String(operation).replace(/x/g, String(row[column] || 0));

      // SECURITY: Strict regex validation for basic math operations to prevent RCE.
      // Only allows digits, basic math operators, parentheses, decimal points, and spaces.
      if (!/^[-+*/().\s\d]+$/.test(safeOp)) {
        throw new Error("Invalid characters in transform operation. Only math expressions are allowed.");
      }

      // SECURITY: Replace unsafe eval with new Function now that input is strictly validated
      return {
        ...row,
        [column]: new Function(`return (${safeOp})`)()
      };
    } catch (e) {
      console.error("Transform error:", e);
      return row;
    }
  });
};

const applyAggregate = (data: any[], config: any) => {
  const { column, type } = config;
  if (!column || !type || data.length === 0) return data;

  if (type === "sum") {
    return [{ result: data.reduce((acc, row) => acc + (Number(row[column]) || 0), 0) }];
  }

  if (type === "avg") {
    const sum = data.reduce((acc, row) => acc + (Number(row[column]) || 0), 0);
    return [{ result: sum / data.length }];
  }
  
  if (type === "count") {
    return [{ result: data.length }];
  }

  return data;
};
