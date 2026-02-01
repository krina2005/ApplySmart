/* ========= AUTH CHECK ========= */
const currentUser = JSON.parse(localStorage.getItem("currentUser"));

if (!currentUser && !location.pathname.includes("login")) {
  window.location.href = "../login.html";
}

/* ========= DASHBOARD ========= */
const welcome = document.getElementById("welcomeText");
if (welcome && currentUser) {
  welcome.textContent = `Welcome, ${currentUser.name}`;
}

function goUpload() {
  window.location.href = "upload-resume.html";
}

function goStatus() {
  window.location.href = "status.html";
}

function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "../login.html";
}

/* ========= RESUME UPLOAD ========= */
function uploadResume() {
  const fileInput = document.getElementById("resumeFile");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select a resume");
    return;
  }

  /* ===== FILE TYPE CHECK ===== */
  if (file.type !== "application/pdf") {
    alert("Only PDF files are allowed");
    return;
  }

  /* ===== FILE SIZE CHECK (2MB) ===== */
  const maxSize = 2 * 1024 * 1024; // 2MB
  if (file.size > maxSize) {
    alert("File size must be less than 2MB");
    return;
  }

  const reader = new FileReader();

  reader.onload = function () {
    const resumes = JSON.parse(localStorage.getItem("resumes")) || [];

    resumes.push({
      userEmail: currentUser.email,
      fileName: file.name,
      fileData: reader.result, // Base64 PDF
      status: "Pending"
    });

    localStorage.setItem("resumes", JSON.stringify(resumes));
    alert("Resume uploaded successfully!");
    window.location.href = "status.html";
  };

  reader.readAsDataURL(file);
}


/* ========= STATUS PAGE ========= */
const statusContainer = document.getElementById("statusContainer");
if (statusContainer && currentUser) {
  const resumes = JSON.parse(localStorage.getItem("resumes")) || [];

  const userResumes = resumes.filter(
    r => r.userEmail === currentUser.email
  );

  if (userResumes.length === 0) {
    statusContainer.innerHTML = "<p>No resume uploaded yet.</p>";
  } else {
    userResumes.forEach(r => {
      statusContainer.innerHTML += `
        <div class="status-box">
          <h4>${r.fileName}</h4>
          <p>Status: <strong>${r.status}</strong></p>
        </div>
      `;
    });
  }
}
