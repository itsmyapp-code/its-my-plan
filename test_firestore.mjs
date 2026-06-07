import { initializeApp } from 'firebase/app';
import { initializeFirestore, getDocs, collection, setDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDUhh-_2a01rQe6bdaSmlc4QeWaztYOd0E",
  authDomain: "its-my-plan.firebaseapp.com",
  projectId: "its-my-plan",
  storageBucket: "its-my-plan.firebasestorage.app",
  messagingSenderId: "367487188457",
  appId: "1:367487188457:web:fa2450a7ce1eb9e37a9f78",
  measurementId: "G-D3JD11XZRN",
};

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

console.log("Connecting to Firestore...");

try {
  const colRef = collection(db, "test_connection");
  const snap = await getDocs(colRef);
  console.log("Read successful! Documents found:", snap.size);
  
  // Try writing
  const docRef = doc(db, "test_connection", "test_id");
  await setDoc(docRef, { test: true, time: Date.now() });
  console.log("Write successful!");
} catch (error) {
  console.error("Firestore test failed with error:", error);
}

process.exit(0);
