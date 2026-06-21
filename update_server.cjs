const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf-8');

// Replace import { db } ... and firestore client imports
content = content.replace(/import \{ db \} from '.\/src\/firebase\.ts';/, "import * as admin from 'firebase-admin';\n\nif (!admin.apps.length) {\n  admin.initializeApp();\n}\nconst adminDb = admin.firestore();");
content = content.replace(/import \{ collection, doc, getDoc as fsGetDoc, setDoc, updateDoc, addDoc, getDocs, query, where \} from 'firebase\/firestore';/, '');

// Replace decodeFirebaseToken function to actually use admin.auth
const decodeFirebaseTokenOld = `  // Helper routine to decode the Firebase Auth bearer token safely
  function decodeFirebaseToken(authHeader?: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { email: 'admin@agrigence.com' };
    }
    try {
      const token = authHeader.split(' ')[1];
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
        return { email: payload.email || 'admin@agrigence.com', decoded: payload };
      }
    } catch (e) {
      console.error("Firebase ID Token base64 parse failed:", e);
    }
    return { email: 'admin@agrigence.com' };
  }`;

const decodeFirebaseTokenNew = `  // Helper routine to decode the Firebase Auth bearer token safely
  async function decodeFirebaseToken(authHeader?: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('No auth token');
    }
    try {
      const token = authHeader.split('Bearer ')[1];
      const decoded = await admin.auth().verifyIdToken(token);
      return { email: decoded.email || '', decoded };
    } catch (e) {
      console.error("Firebase ID Token verification failed:", e);
      throw new Error('Invalid token');
    }
  }`;

content = content.replace(decodeFirebaseTokenOld, decodeFirebaseTokenNew);

// Fix usages of decodeFirebaseToken
content = content.replace(/const \{ email: decodedEmail \} = decodeFirebaseToken\(authHeader\);/g, "const { email: decodedEmail } = await decodeFirebaseToken(authHeader);");

// Replace firestore usages
// 1. fsGetDoc(doc(db, 'subscription_plans', planId))
content = content.replace(/fsGetDoc\(doc\(db, '([^']+)', ([^)]+)\)\)/g, "adminDb.collection('$1').doc($2).get()");

// 2. setDoc(doc(db, 'question_banks', bankId), bankMetadata)
content = content.replace(/await setDoc\(doc\(db, '([^']+)', ([^)]+)\), ([^)]+)\);/g, "await adminDb.collection('$1').doc($2).set($3);");
content = content.replace(/await setDoc\(doc\(db, '([^']+)', order\.id\), paymentRecord\);/g, "await adminDb.collection('$1').doc(order.id).set(paymentRecord);");

// 3. updateDoc(doc(db, 'payments', orderId), ...)
content = content.replace(/await updateDoc\(doc\(db, '([^']+)', ([^)]+)\), ([^\)]+)\);/g, "await adminDb.collection('$1').doc($2).update($3);");

// 4. updateDoc(userRef, ...)
content = content.replace(/const userRef = doc\(db, '([^']+)', ([^)]+)\);/g, "const userRef = adminDb.collection('$1').doc($2);");
content = content.replace(/const paymentRef = doc\(db, '([^']+)', ([^)]+)\);/g, "const paymentRef = adminDb.collection('$1').doc($2);");
content = content.replace(/await updateDoc\(userRef, (\{[\s\S]*?\})\);/g, "await userRef.update($1);");
content = content.replace(/await updateDoc\(paymentRef, (\{[\s\S]*?\})\);/g, "await paymentRef.update($1);");

// 5. query(collection(db, 'payments'), where('upiTxnId', '==', paymentId))
content = content.replace(/const q = query\(collection\(db, '([^']+)'\), where\('([^']+)', '==', ([^)]+)\)\);/g, "const snap = await adminDb.collection('$1').where('$2', '==', $3).get();");
content = content.replace(/const snap = await getDocs\(q\);\n/g, "");

// Write back
fs.writeFileSync('server.ts', content, 'utf-8');
console.log('Update applied');
