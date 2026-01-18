import { useState } from "react";

const Upload = () => {
  const [file, setFile] = useState(null);
  const [jdText, setJdText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file || !jdText) {
      alert("Please upload resume and paste job description");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("resume", file); // MUST match FastAPI param
    formData.append("job_description", jdText);
    formData.append("role", "Python Backend Developer");

    try {
      const response = await fetch("http://localhost:8000/analyze-resume", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setResult(data.analysis);
    } catch (error) {
      alert("Backend connection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "800px" }}>
      <h2>Upload Resume</h2>

      {/* Resume Upload */}
      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setFile(e.target.files[0])}
      />

      {/* JD Input */}
      <textarea
        placeholder="Paste Job Description here..."
        rows={8}
        style={{ width: "100%", marginTop: "20px" }}
        value={jdText}
        onChange={(e) => setJdText(e.target.value)}
      />

      <br /><br />

      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Analyzing..." : "Upload & Analyze"}
      </button>

      {/* Results */}
      {result && (
        <div style={{ marginTop: "30px" }}>
          <h3>Match Score: {result.match_score}%</h3>

          <p><strong>Matched Skills:</strong></p>
          <ul>
            {result.matched_skills.map((skill, idx) => (
              <li key={idx}>{skill}</li>
            ))}
          </ul>

          <p><strong>Missing Skills:</strong></p>
          <ul>
            {result.missing_skills.map((skill, idx) => (
              <li key={idx}>{skill}</li>
            ))}
          </ul>

          <p><strong>AI Suggestions:</strong></p>
          <p>{result.ai_suggestions}</p>
        </div>
      )}
    </div>
  );
};

export default Upload;
