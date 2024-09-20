import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB4AS6RT4OC_EeJRgt5JDvGQLUfbeP-RqU",
  authDomain: "nwitter-reloaded-d69a9.firebaseapp.com",
  projectId: "nwitter-reloaded-d69a9",
  storageBucket: "nwitter-reloaded-d69a9.appspot.com",
  messagingSenderId: "529861220238",
  appId: "1:529861220238:web:e811ade5f6285c18a8f6df",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const storage = getStorage(app);

export const db = getFirestore(app);
