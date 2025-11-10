// src/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyC9TQe-cLCm8RRVCpOBcC4M62JEkLe9ii4",
  authDomain: "iot-vehicules.firebaseapp.com",
  databaseURL: "https://iot-vehicules-default-rtdb.firebaseio.com",
  projectId: "iot-vehicules",
  storageBucket: "iot-vehicules.firebasestorage.app",
  messagingSenderId: "483778905921",
  appId: "1:483778905921:web:a004b83a5859b8df2a43c0"
};

// Initialisation Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database, ref, onValue };
