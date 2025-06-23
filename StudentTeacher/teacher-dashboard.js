import { db, auth } from "./firebase-config.js";
import {
  collection, getDocs, updateDoc, doc, query, where
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Not logged in!");
    window.location.href = "index.html";
    return;
  }

  const teacherEmail = user.email.toLowerCase();
  const q = query(collection(db, "appointments"), where("teacherEmail", "==", teacherEmail));
  const snapshot = await getDocs(q);
  const container = document.getElementById("appointments");
  container.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const a = docSnap.data();
    container.innerHTML += `
      <div class="appointment-card">
        <strong>Student:</strong> ${a.studentEmail} <br>
        <strong>Date:</strong> ${a.date} <br>
        <strong>Status:</strong> ${a.status}<br>
        ${(a.status === "pending") ? `
        <button onclick="approve('${docSnap.id}')">Approve</button>
        <button onclick="reject('${docSnap.id}')">Reject</button>` : ""}
      </div>`;
  });
});

window.approve = async (id) => {
  await updateDoc(doc(db, "appointments", id), { status: "approved" });
  location.reload();
};

window.reject = async (id) => {
  await updateDoc(doc(db, "appointments", id), { status: "rejected" });
  location.reload();
};
