import { db, auth } from "./firebase-config.js";
import {
  collection, getDocs, addDoc, query, where
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

let studentEmail = "";

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Not logged in!");
    window.location.href = "index.html";
    return;
  }

  studentEmail = user.email.toLowerCase();

  await loadApprovedTeachers();
  await loadAppointments();
});

async function loadApprovedTeachers() {
  const teacherSnap = await getDocs(collection(db, "teachers"));
  const list = document.getElementById("teacher-list");
  list.innerHTML = "";

  if (teacherSnap.empty) {
    list.innerHTML = "<p>No teachers available yet.</p>";
    return;
  }

  teacherSnap.forEach((docSnap) => {
    const t = docSnap.data();
    list.innerHTML += `
      <div class="teacher-card">
        ${t.name} | ${t.branch} | ${t.subject}
        <button onclick="book('${t.email.toLowerCase()}')">Book</button>
      </div>`;
  });
}

window.book = async (teacherEmail) => {
  const date = prompt("Enter appointment date (YYYY-MM-DD):");
  if (!date) return;

  await addDoc(collection(db, "appointments"), {
    studentEmail: studentEmail.toLowerCase(),
    teacherEmail: teacherEmail.toLowerCase(),
    date,
    status: "pending"
  });
  alert("Appointment booked successfully!");
  await loadAppointments();
};

async function loadAppointments() {
  const q = query(collection(db, "appointments"), where("studentEmail", "==", studentEmail));
  const snapshot = await getDocs(q);
  const container = document.getElementById("appointments");
  container.innerHTML = "";

  if (snapshot.empty) {
    container.innerHTML = "<p>No appointments booked yet.</p>";
    return;
  }

  snapshot.forEach((docSnap) => {
    const a = docSnap.data();
    container.innerHTML += `
      <div class="appointment-card">
        <strong>Date:</strong> ${a.date} <br>
        <strong>Status:</strong> ${a.status}
      </div>
    `;
  });
}
