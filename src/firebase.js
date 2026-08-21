// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDYChBsFC9EOu_uRO9QuyawiPU-ruZecvk",
  authDomain: "dental-clinic-project-5e2ca.firebaseapp.com",
  projectId: "dental-clinic-project-5e2ca",
  storageBucket: "dental-clinic-project-5e2ca.firebasestorage.app",
  messagingSenderId: "167475073356",
  appId: "1:167475073356:web:33e953a1ac9676b75fffe9",
  measurementId: "G-NCHRFKPJZ3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);