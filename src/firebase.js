import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDf5P_yW_Oto_jPT6S8U0jnxVlZjBfKJm8",
  authDomain: "musicplayermsn.firebaseapp.com",
  projectId: "musicplayermsn",
  storageBucket: "musicplayermsn.firebasestorage.app",
  messagingSenderId: "1001161551198",
  appId: "1:1001161551198:web:a46c65b1f053e9a07cb3cf",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;