import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC2fmStlyqaPy8pLnBq18v4e7S4lY3pSJg",
  projectId: "chicken-tracker-83ef8",
  storageBucket: "chicken-tracker-83ef8.appspot.com",
  messagingSenderId: "239230240951",
  appId: "1:239230240951:web:065e7eb9def74836a4e532",
  measurementId: "G-ZNETT8P31V",
};

let firebaseApp;

if (!firebaseApp) {
  firebaseApp = initializeApp(firebaseConfig);
}

export const storage = getStorage(firebaseApp);
