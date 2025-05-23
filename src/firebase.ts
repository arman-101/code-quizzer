import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyAWvhOj_8E9FfHpcLP8m3pqA5ZHuqTncQI",
  authDomain: "codequizwebapp.firebaseapp.com",
  projectId: "codequizwebapp",
  storageBucket: "codequizwebapp.firebasestorage.app",
  messagingSenderId: "478503720013",
  appId: "1:478503720013:web:11397b9b8de253b27f7804",
  measurementId: "G-N1Z8J32FH1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);