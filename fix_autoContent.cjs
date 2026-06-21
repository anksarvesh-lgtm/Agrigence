const fs = require('fs');

let content = fs.readFileSync('src/server/autoContentGenerator.ts', 'utf-8');

content = content.replace(/import \{ db \} from '\.\.\/firebase\.ts';/, "import * as admin from 'firebase-admin';\n\nif (!admin.apps.length) {\n  admin.initializeApp();\n}\nconst adminDb = admin.firestore();");
content = content.replace(/import \{ collection, doc, setDoc, getDocs, addDoc \} from 'firebase\/firestore';/, '');

content = content.replace(/const docRef = doc\(db, '([^']+)', ([^)]+)\);/g, "const docRef = adminDb.collection('$1').doc($2);");
content = content.replace(/await setDoc\(docRef, ([^)]+)\);/g, "await docRef.set($1);");

content = content.replace(/await addDoc\(collection\(db, '([^']+)'\), ([^)]+)\);/g, "await adminDb.collection('$1').add($2);");

fs.writeFileSync('src/server/autoContentGenerator.ts', content, 'utf-8');
console.log('Fixed autoContentGenerator');
