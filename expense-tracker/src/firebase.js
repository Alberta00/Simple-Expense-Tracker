// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore, serverTimestamp } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDLY3iLdga32RnD2yxt6Dy3lEPeNOG79tw",
  authDomain: "simple-expense-tracker-abada.firebaseapp.com",
  projectId: "simple-expense-tracker-abada",
  storageBucket: "simple-expense-tracker-abada.firebasestorage.app",
  messagingSenderId: "33470236189",
  appId: "1:33470236189:web:d4a671cd09950885cca8f4",
  measurementId: "G-NG682181D1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const now = serverTimestamp;