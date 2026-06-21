const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf-8');

content = content.replace(/configSnap\.data\(\)\.plans/g, "configSnap.data()!.plans");
content = content.replace(/couponSnap\.data\(\)/g, "couponSnap.data()!");
content = content.replace(/userSnap\.data\(\)\.name/g, "userSnap.data()!.name");
content = content.replace(/userSnap\.data\(\)\.email/g, "userSnap.data()!.email");
content = content.replace(/planSnap\.data\(\)/g, "planSnap.data()!");
content = content.replace(/paymentSnap\.data\(\)/g, "paymentSnap.data()!");

fs.writeFileSync('server.ts', content, 'utf-8');
console.log('Fixed undefined data');
