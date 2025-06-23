import { db, auth } from "./firebase-config.js";
import {
  collection, getDocs, updateDoc, doc, query, where, setDoc
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Not logged in!");
    window.location.href = "index.html";
    return;
  }

  await loadRequests();
  await loadApprovedTeachers();
  await loadApprovedStudents();
});

// Load all users who are NOT approved yet (requests)
async function loadRequests() {
  const requestsList = document.getElementById("requests-list");
  requestsList.innerHTML = "";

  const usersRef = collection(db, "users");
  const q = query(usersRef, where("approved", "==", false));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    requestsList.innerHTML = "<p>No pending requests.</p>";
    return;
  }

  snapshot.forEach(docSnap => {
    const u = docSnap.data();
    requestsList.innerHTML += `
      <div class="request-card">
        <p><strong>Name:</strong> ${u.name}</p>
        <p><strong>Email:</strong> ${u.email}</p>
        <p><strong>Role:</strong> ${u.role}</p>
        <div>
          <button onclick="approveUser('${docSnap.id}', '${u.role}','${u.email}')">Approve</button>
          <button onclick="rejectUser('${docSnap.id}')">Reject</button>
        </div>
      </div>
    `;
  });
}

window.approveUser = async (userId, role,email) => {
  if (role === "teacher") {
    // Ask for teacher details (name, subject, branch) before approving
    const teacherName = prompt("Enter teacher's name:");
    if (!teacherName) return alert("Teacher name is required.");

    const subject = prompt("Enter subject teacher teaches:");
    if (!subject) return alert("Subject is required.");

    const branch = prompt("Enter branch/department:");
    if (!branch) return alert("Branch is required.");

    // Add teacher details to 'teachers' collection
    await setDoc(doc(db, "teachers", userId), {
      name: teacherName,
      subject,
      branch,
      email: email,
      userId: userId
    });
  }

  // Approve user in users collection
  await updateDoc(doc(db, "users", userId), { approved: true });

  alert("User approved successfully!");
  await loadRequests();
  await loadApprovedTeachers();
  await loadApprovedStudents();
}

window.rejectUser = async (userId) => {
  await updateDoc(doc(db, "users", userId), { approved: false });
  alert("User rejected!");
  await loadRequests();
}

async function loadApprovedTeachers() {
  const teacherList = document.getElementById("teacher-list");
  teacherList.innerHTML = "";

  const teachersRef = collection(db, "teachers");
  const snapshot = await getDocs(teachersRef);

  if (snapshot.empty) {
    teacherList.innerHTML = "<p>No approved teachers yet.</p>";
    return;
  }

  snapshot.forEach(docSnap => {
    const t = docSnap.data();
    teacherList.innerHTML += `
      <div class="teacher-card">
        <strong>${t.name}</strong> | ${t.branch} | ${t.subject}
      </div>
    `;
  });
}

async function loadApprovedStudents() {
  const studentList = document.getElementById("student-list");
  studentList.innerHTML = "";

  const usersRef = collection(db, "users");
  const q = query(usersRef, where("role", "==", "student"), where("approved", "==", true));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    studentList.innerHTML = "<p>No approved students yet.</p>";
    return;
  }

  snapshot.forEach(docSnap => {
    const u = docSnap.data();
    studentList.innerHTML += `
      <div class="student-card">${u.name} | ${u.email}</div>
    `;
  });
}
