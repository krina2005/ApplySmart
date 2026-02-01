function checkResume() {
  const input = document.getElementById("resumeInput");
  const resultBox = document.getElementById("result");

  if (!input.files.length) {
    alert("Please upload a resume PDF");
    return;
  }

  const file = input.files[0];

  /* FILE TYPE */
  if (file.type !== "application/pdf") {
    alert("Only PDF files are allowed");
    return;
  }

  /* FILE SIZE (2MB) */
  if (file.size > 2 * 1024 * 1024) {
    alert("File size must be under 2MB");
    return;
  }

  /* SIMULATED AI ANALYSIS */
  const score = generateScore();
  const feedback = generateFeedback(score);

  resultBox.classList.remove("hidden");
  resultBox.innerHTML = `
    <div class="score ${score > 75 ? "good" : score > 50 ? "warn" : "bad"}">
      ATS Score: ${score} / 100
    </div>

    <h3>AI Feedback</h3>
    <ul>
      ${feedback.map(f => `<li>${f}</li>`).join("")}
    </ul>
  `;
}

/* ===== FAKE AI SCORE ===== */
function generateScore() {
  return Math.floor(Math.random() * 40) + 50;
}

/* ===== FAKE AI FEEDBACK ===== */
function generateFeedback(score) {
  const tips = [];

  if (score < 70) {
    tips.push("Add more relevant technical skills");
    tips.push("Improve resume formatting for ATS systems");
    tips.push("Include measurable achievements");
  } else {
    tips.push("Resume formatting is ATS friendly");
    tips.push("Good use of keywords");
    tips.push("Clear and concise structure");
  }

  tips.push("Add a professional summary section");
  tips.push("Avoid using images or tables in resume");

  return tips;
}
