const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf-8');

content = content.replace(/\.exists\(\)/g, ".exists");

fs.writeFileSync('server.ts', content, 'utf-8');
console.log('Fixed snapshot.exists');
