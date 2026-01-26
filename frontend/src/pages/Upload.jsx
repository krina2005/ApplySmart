import { useState } from "react";
import ReactMarkdown from 'react-markdown';
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
    formData.append("resume", file);
    formData.append("job_description", jdText);
    formData.append("role", "Python Backend Developer"); // Maintain existing default

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
    <div className="upload-page">
      <div className="upload-container">

        {/* Header */}
        <div className="header-section">
          <h1 className="page-title">Resume Analyzer</h1>
          <p className="page-subtitle">
            Upload your resume and the job description to get a detailed match report.
          </p>
        </div>

        {/* Input Grid */}
        <div className="upload-grid">
          {/* Left Column: File Upload */}
          <div className="glass-card">
            <h3 className="card-title">📄 Upload Resume</h3>

            <input
              type="file"
              id="resume-upload"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files[0])}
              style={{ display: "none" }}
            />

            <label htmlFor="resume-upload" className={`drop-zone ${file ? "active" : ""}`}>
              <div className="upload-icon-large">{file ? "✅" : "☁️"}</div>
              <div className="file-info">
                {file ? (
                  <>
                    <p className="file-name">{file.name}</p>
                    <p className="file-size">{(file.size / 1024).toFixed(1)} KB</p>
                  </>
                ) : (
                  <>
                    <p style={{ fontWeight: 600, fontSize: "1.1rem" }}>Click to Browse</p>
                    <p style={{ color: "var(--text-secondary)", marginTop: "4px" }}>
                      Supports PDF (Max 2MB)
                    </p>
                  </>
                )}
              </div>
            </label>
          </div>

          {/* Right Column: Job Description */}
          <div className="glass-card">
            <h3 className="card-title">💼 Job Description</h3>
            <textarea
              className="jd-textarea"
              placeholder="Paste the full job description here..."
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="action-bar">
          <button className="analyze-button" onClick={handleUpload} disabled={loading}>
            {loading ? <div className="spinner"></div> : "✨ Analyze Match"}
          </button>
        </div>

        {/* Results Section */}
        {result && (
          <div className="results-section glass-card">
            <div style={{ textAlign: "center", marginBottom: "30px" }}>
              <div className="score-badge">{result.match_score}% Match</div>
            </div>

            <div className="analysis-grid">
              <div>
                <h4 style={{ marginBottom: "15px", color: "#4ade80" }}>Matched Skills</h4>
                <div>
                  {result.matched_skills.map((s, i) => (
                    <span key={i} className="skill-tag matched">{s}</span>
                  ))}
                </div>
              </div>

              <div>
                <h4 style={{ marginBottom: "15px", color: "#f87171" }}>Missing Skills</h4>
                <div>
                  {result.missing_skills.map((s, i) => (
                    <span key={i} className="skill-tag missing">{s}</span>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginTop: "30px" }}>
              <h4 style={{ marginBottom: "15px", color: "var(--accent)" }}>AI Suggestions</h4>
              <div className="suggestions-box markdown-content">
                <ReactMarkdown>{result.ai_suggestions}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Upload;
