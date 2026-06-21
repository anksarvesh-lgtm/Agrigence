import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDocFromServer, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, setLogLevel } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAtJrLiAnhN5A4umArJKtqhnWmoXXf27K8",
  authDomain: "gen-lang-client-0276037966.firebaseapp.com",
  projectId: "gen-lang-client-0276037966",
  storageBucket: "gen-lang-client-0276037966.firebasestorage.app",
  messagingSenderId: "455779719985",
  appId: "1:455779719985:web:07fc0a4b6a3234cfdeae10",
  measurementId: "G-ZRQEY0LBJC"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Suppress noisy internal RPC warnings
setLogLevel('error');

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  }),
  experimentalAutoDetectLongPolling: true,
});

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. The client is offline.");
    }
    // Skip logging for other errors, as this is simply a connection test.
  }
}
testConnection();
