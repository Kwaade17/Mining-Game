// ==================== FIREBASE BACKEND CONFIGURATION (DEFENSIVE) ====================
let auth = null;
let db = null;
let firebaseActive = false;

if (typeof firebase !== "undefined") {
  // For Firebase JS SDK v7.20.0 and later, measurementId is optil
  const firebaseConfig = {
    apiKey: "AIzaSyBeCPvV6ho9J9wBLH7wHe8j0Usg0pO2ESA",
    authDomain: "gian-app-development.firebaseapp.com",
    databaseURL: "https://gian-app-development-default-rtdb.firebaseio.com",
    projectId: "gian-app-development",
    storageBucket: "gian-app-development.firebasestorage.app",
    messagingSenderId: "750987942732",
    appId: "1:750987942732:web:373b98e40721447b3c4de9",
    measurementId: "G-5QLKWRQ4HT",
  };

  try {
    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.database();
    firebaseActive = true;
  } catch (err) {
    console.error("Firebase initialization failed:", err);
  }
} else {
  console.warn("Firebase SDK not loaded. Running in local Offline-Only mode.");
}