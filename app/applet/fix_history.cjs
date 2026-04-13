const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('dist')) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('.');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  const regex = /mockBackend\.saveToolHistory\(\s*\{([\s\S]*?)\}\s*\)(?!\.catch)/g;
  if (regex.test(content)) {
    content = content.replace(regex, 'mockBackend.saveToolHistory({$1}).catch(console.error)');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Fixed', file);
  }
});
