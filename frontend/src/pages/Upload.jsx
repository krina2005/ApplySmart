import { useState } from "react";
import "./Upload.css";

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
    <div className="upload-container">
      <h2>Resume Analysis</h2>

      <div className="section">
      <label className="label">Upload Resume (PDF)</label>

      {/* Hidden native input */}
      <input
        type="file"
        id="resume-upload"
        accept=".pdf"
        onChange={(e) => setFile(e.target.files[0])}
        style={{ display: "none" }}
      />

      {/* Custom upload box */}
      <label htmlFor="resume-upload" className="custom-upload">
        <div className="upload-icon">📄</div>

        {!file ? (
          <>
            <p className="upload-title">Click to upload resume</p>
            <p className="upload-subtitle">PDF only • Max 2MB</p>
          </>
        ) : (
          <>
            <p className="upload-title">{file.name}</p>
            <p className="upload-subtitle">File selected successfully</p>
          </>
        )}
      </label>
    </div>


      <div className="section">
        <label className="label">Paste Job Description</label>
        <textarea
          className="textarea"
          rows={8}
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
        />
      </div>

      <button className="analyze-btn" onClick={handleUpload} disabled={loading}>
        {loading ? "Analyzing Resume..." : "Upload & Analyze"}
      </button>

      {result && (
        <div className="result-card">
          <h3>Match Score: {result.match_score}%</h3>

          <p>Matched Skills</p>
          <div className="skill-list">
            {result.matched_skills.map((s, i) => (
              <span key={i} className="skill matched">{s}</span>
            ))}
          </div>

          <p style={{ marginTop: "20px" }}>Missing Skills</p>
          <div className="skill-list">
            {result.missing_skills.map((s, i) => (
              <span key={i} className="skill missing">{s}</span>
            ))}
          </div>

          <p style={{ marginTop: "20px" }}>
            <strong>AI Suggestions:</strong><br />
            {result.ai_suggestions}
          </p>
        </div>
      )}
    </div>
  );
};

export default Upload;
