import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCPkKWQUt5Dmx86-f7P152WDPM8vfBSIag",
  authDomain: "student-teacher-booking-86914.firebaseapp.com",
  projectId: "student-teacher-booking-86914",
  storageBucket: "student-teacher-booking-86914.firebasestorage.app",
  messagingSenderId: "592564000243",
  appId: "1:592564000243:web:dac45fe3ea945789162e86"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
