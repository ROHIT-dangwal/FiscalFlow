import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCB90P0gIRkFrQMnt4-Vo0aI3cutViUjPI",
  authDomain: "fiscalflow-4765b.firebaseapp.com",
  projectId: "fiscalflow-4765b",
  storageBucket: "fiscalflow-4765b.firebasestorage.app",
  messagingSenderId: "891692929739",
  appId: "1:891692929739:web:d9089b5cedf4a69fb0814e",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
