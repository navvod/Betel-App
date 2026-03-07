import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD88pnIUmNYsaDWrjtkOfSVNMPmZU190rI",
  authDomain: "betelapp-44db8.firebaseapp.com",
  projectId: "betelapp-44db8",
  storageBucket: "betelapp-44db8.firebasestorage.app",
  messagingSenderId: "709586697016",
  appId: "1:709586697016:web:3b7eeb0ac25a40414b9fcd",
  measurementId: "G-QF7EQTKLG6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
