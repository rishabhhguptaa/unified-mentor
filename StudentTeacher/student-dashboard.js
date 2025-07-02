import { db, auth } from "./firebase-config.js";
import {
  collection, getDocs, addDoc
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

let studentEmail = "";

onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("Not logged in!");
    window.location.href = "index.html";
    return;
  }

  studentEmail = user.email;
  loadTeachers();
  loadAppointments();
});

async function loadTeachers() {
  const teacherSnap = await getDocs(collection(db, "teachers"));
  const list = document.getElementById("teacher-list");
  list.innerHTML = "<h3>Available Teachers</h3>";

  teacherSnap.forEach((docSnap) => {
    const t = docSnap.data();
    list.innerHTML += `
      <div class="card">
        <strong>${t.name}</strong><br>
        ${t.branch} | ${t.subject}<br>
        <button onclick="book('${t.email}')">Book</button>
      </div>`;
  });
}

async function loadAppointments() {
  const appointSnap = await getDocs(collection(db, "appointments"));
  const container = document.getElementById("appointment-status");
  container.innerHTML = "<h3>Your Appointments</h3>";

  appointSnap.forEach(docSnap => {
    const a = docSnap.data();
    if (a.studentEmail.toLowerCase() === studentEmail.toLowerCase()) {
      container.innerHTML += `
        <div class="card">
          <strong>Teacher:</strong> ${a.teacherEmail}<br>
          <strong>Date:</strong> ${a.date}<br>
          <strong>Status:</strong> ${a.status}
        </div>
      `;
    }
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
  loadAppointments();
};
