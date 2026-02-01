/* ========= ADMIN AUTH CHECK ========= */
const currentAdmin = JSON.parse(localStorage.getItem("currentAdmin"));

if (!currentAdmin) {
  window.location.href = "admin-login.html";
}

/* ========= LOGOUT ========= */
function adminLogout() {
  localStorage.removeItem("currentAdmin");
  window.location.href = "admin-login.html";
}

/* ========= DASHBOARD COUNTS ========= */
const resumes = JSON.parse(localStorage.getItem("resumes")) || [];

const totalEl = document.getElementById("totalResumes");
const pendingEl = document.getElementById("pendingResumes");
const acceptedEl = document.getElementById("acceptedResumes");
const rejectedEl = document.getElementById("rejectedResumes");

if (totalEl) {
  totalEl.textContent = resumes.length;
  pendingEl.textContent = resumes.filter(r => r.status === "Pending").length;
  acceptedEl.textContent = resumes.filter(r => r.status === "Accepted").length;
  rejectedEl.textContent = resumes.filter(r => r.status === "Rejected").length;
}

/* ========= NAVIGATION ========= */
function goToResumes() {
  window.location.href = "resumes.html";
}

/* ========= RESUME MANAGEMENT PAGE ========= */
const resumeList = document.getElementById("resumeList");

if (resumeList) {
  if (resumes.length === 0) {
    resumeList.innerHTML = "<p>No resumes submitted yet.</p>";
  } else {
    renderResumes();
  }
}

function renderResumes() {
  resumeList.innerHTML = "";

  resumes.forEach((resume, index) => {
    resumeList.innerHTML += `
      <div class="status-box">
        <h4>${resume.fileName}</h4>
        <p><strong>User:</strong> ${resume.userEmail}</p>
        <p><strong>Status:</strong> ${resume.status}</p>

        <!-- PDF PREVIEW -->
        <iframe 
          src="${resume.fileData}" 
          width="100%" 
          height="300px"
          style="border: 1px solid #1e293b; border-radius: 8px; margin: 10px 0;">
        </iframe>

        <button onclick="updateStatus(${index}, 'Accepted')" 
          ${resume.status !== "Pending" ? "disabled" : ""}>
          Accept
        </button>

        <button onclick="updateStatus(${index}, 'Rejected')" 
          ${resume.status !== "Pending" ? "disabled" : ""}>
          Reject
        </button>
      </div>
    `;
  });
}


/* ========= UPDATE STATUS ========= */
function updateStatus(index, newStatus) {
  resumes[index].status = newStatus;
  localStorage.setItem("resumes", JSON.stringify(resumes));
  renderResumes();
}
