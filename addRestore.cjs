const fs = require('fs');
const path = require('path');

const toolsDir = path.join(__dirname, 'tools');
const dirs = fs.readdirSync(toolsDir);

for (const dir of dirs) {
  const toolDir = path.join(toolsDir, dir);
  if (!fs.statSync(toolDir).isDirectory()) continue;
  
  const files = fs.readdirSync(toolDir);
  const pageFile = files.find(f => f.endsWith('Page.tsx') || f.endsWith('Page.jsx') || f.endsWith('index.tsx') || f.includes('Page'));
  if (!pageFile) continue;
  
  const filePath = path.join(toolDir, pageFile);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find all useState declarations
  const stateRegex = /const \[([a-zA-Z0-9_]+),\s*set([a-zA-Z0-9_]+)\]\s*=\s*useState/g;
  let match;
  const states = [];
  while ((match = stateRegex.exec(content)) !== null) {
    if (['result', 'results', 'showFormulas', 'showRules', 'loading', 'error', 'showAdvanced', 'isCalculating', 'activeTab'].includes(match[1])) continue;
    states.push({ name: match[1], setter: 'set' + match[2] });
  }
  
  if (states.length === 0) continue;
  
  // Fix inputData
  const stateNames = states.map(s => s.name).join(', ');
  const inputDataReplacement = states.length === 1 && states[0].name === 'input' ? 'input' : `{ ${stateNames} }`;
  content = content.replace(/inputData:\s*\{\s*timestamp:\s*new Date\(\)\.toISOString\(\)\s*\}/g, `inputData: ${inputDataReplacement}`);
  
  if (content.includes('restoreData')) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed inputData for ${filePath}`);
    continue;
  }
  
  // Add useLocation import if not present
  if (!content.includes('useLocation')) {
    if (content.includes('react-router-dom')) {
      content = content.replace(/import \{([^}]+)\} from 'react-router-dom';/, (m, p1) => `import {${p1}, useLocation} from 'react-router-dom';`);
    } else {
      content = `import { useLocation } from 'react-router-dom';\n` + content;
    }
  }
  
  // Add useEffect import if not present
  if (!content.includes('useEffect')) {
    content = content.replace(/import React, \{([^}]+)\} from 'react';/, (m, p1) => `import React, {${p1}, useEffect} from 'react';`);
  }
  
  // Generate useEffect code
  let useEffectCode = `\n  const location = useLocation();\n  useEffect(() => {\n    if (location.state?.restoreData) {\n      const data = location.state.restoreData;\n`;
  
  if (states.length === 1 && states[0].name === 'input') {
    useEffectCode += `      ${states[0].setter}(data);\n`;
  } else {
    for (const state of states) {
      useEffectCode += `      if (data.${state.name} !== undefined) ${state.setter}(data.${state.name});\n`;
    }
  }
  
  useEffectCode += `    }\n  }, [location.state]);\n`;
  
  // Insert after the last useState
  const lastUseStateIndex = content.lastIndexOf('useState');
  const endOfLine = content.indexOf('\n', lastUseStateIndex);
  
  content = content.slice(0, endOfLine + 1) + useEffectCode + content.slice(endOfLine + 1);
  
  fs.writeFileSync(filePath, content);
  console.log(`Updated ${filePath}`);
}
