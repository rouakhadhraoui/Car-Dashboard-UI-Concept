// frontend/src/firebase.js
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC9TQe-cLCm8RRVCpOBcC4M62JEkLe9ii4",
  authDomain: "iot-vehicules.firebaseapp.com",
  databaseURL: "https://iot-vehicules-default-rtdb.firebaseio.com",
  projectId: "iot-vehicules",
  storageBucket: "iot-vehicules.appspot.com",
  messagingSenderId: "483778905921",
  appId: "1:483778905921:web:a004b83a5859b8df2a43c0"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Exporter les références
export { database, ref, onValue };