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
  
  if (content.includes('saveToolHistory')) continue;
  
  const setResultMatch = content.match(/setResult\((.*?)\);/);
  if (!setResultMatch) continue;
  
  const toolNameMatch = content.match(/<h1[^>]*>(.*?)<\/h1>/);
  const toolName = toolNameMatch ? toolNameMatch[1] : dir;
  
  if (!content.includes('useAuth')) {
    content = `import { useAuth } from '../../App';\n` + content;
  }
  if (!content.includes('mockBackend')) {
    content = `import { mockBackend } from '../../services/mockBackend';\n` + content;
  }
  if (!content.includes('isPlanExpired')) {
    content = `import { isPlanExpired } from '../../utils/planAccess';\n` + content;
  }
  
  if (!content.includes('const { user')) {
    content = content.replace(/const [a-zA-Z]+: React\.FC = \(\) => \{/, `$&
  const { user, planDetails } = useAuth();
  const isPlanActive = user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || (planDetails && planDetails.id !== 'free' && !isPlanExpired(user)));`);
  }
  
  const historyCode = `
    if (user && isPlanActive) {
      try {
        mockBackend.saveToolHistory({
          userId: user.id,
          toolName: '${toolName}',
          inputData: { timestamp: new Date().toISOString() },
          outputData: ${setResultMatch[1]},
          status: 'SUCCESS',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error("Failed to save tool history", error);
      }
    }
  `;
  
  content = content.replace(setResultMatch[0], setResultMatch[0] + historyCode);
  fs.writeFileSync(filePath, content);
  console.log(`Updated ${filePath}`);
}
