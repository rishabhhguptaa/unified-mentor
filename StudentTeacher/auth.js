import { db, auth } from "./firebase-config.js";
import {
  collection, doc, getDoc, setDoc, query, where, getDocs
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

const regForm = document.getElementById('register-form');
if (regForm) {
  regForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    // Check if email already registered in users collection (case insensitive)
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const qSnap = await getDocs(q);

    if (!qSnap.empty) {
      alert("Email already registered. Please login.");
      return;
    }

    // Create user auth account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // For students and teachers, approved is false initially.
    // Admin auto approved
    const approved = role === "admin" ? true : false;

    await setDoc(doc(db, "users", userCredential.user.uid), {
      name, email, role, approved
    });

    alert("Registered successfully! Wait for admin approval before login.");
    regForm.reset();
  });
}

const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userSnap = await getDoc(doc(db, "users", user.uid));

      if (!userSnap.exists()) {
        alert("User data not found!");
        return;
      }

      const userData = userSnap.data();

      // Admin can login without approval
      if (userData.role !== "admin" && userData.approved !== true) {
        alert("You need admin approval to login.");
        return;
      }

      // Redirect based on role
      if (userData.role === "admin") {
        window.location.href = "admin.html";
      } else if (userData.role === "teacher") {
        window.location.href = "teacher-dashboard.html";
      } else {
        window.location.href = "student-dashboard.html";
      }

    } catch (error) {
      alert("Login failed: " + error.message);
    }
  });
}
