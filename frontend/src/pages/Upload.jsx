import { useState } from "react";
import ReactMarkdown from "react-markdown";
import {FileText,UploadCloud,CheckCircle,Briefcase,Sparkles,} from "lucide-react";
import { useDialog } from "../components/DialogProvider";
import "./Upload.css";

const Upload = () => {
  const [file, setFile] = useState(null);
  const [jdText, setJdText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { showAlert } = useDialog();

  const handleUpload = async () => {
    if (!file || !jdText) {
      await showAlert('Please upload a resume and paste a job description.', { variant: 'warning', title: 'Missing Input' });
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("job_description", jdText);
    formData.append("role", "Python Backend Developer");

    try {
      const API_BASE = import.meta.env.VITE_API_URL || "";
      const response = await fetch(`${API_BASE}/analyze-resume`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setResult(data.analysis);
    } catch (error) {
      await showAlert('Backend connection failed. Make sure the AI engine is running.', { variant: 'error', title: 'Connection Failed' });
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

          {/* Resume Upload */}
          <div className="glass-card">
            <h3 className="card-title">
              <FileText size={20} /> Upload Resume
            </h3>

            <input
              type="file"
              id="resume-upload"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files[0])}
              style={{ display: "none" }}
            />

            <label
              htmlFor="resume-upload"
              className={`drop-zone ${file ? "active" : ""}`}
            >
              <div className="upload-icon-large">
                {file ? <CheckCircle /> : <UploadCloud />}
              </div>

              <div className="file-info">
                {file ? (
                  <>
                    <p className="file-name">{file.name}</p>
                    <p className="file-size">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </>
                ) : (
                  <>
                    <p style={{ fontWeight: 600, fontSize: "1.1rem" }}>
                      Click to Browse
                    </p>
                    <p
                      style={{
                        color: "var(--text-secondary)",
                        marginTop: "4px",
                      }}
                    >
                      Supports PDF (Max 2MB)
                    </p>
                  </>
                )}
              </div>
            </label>
          </div>

          {/* Job Description */}
          <div className="glass-card">
            <h3 className="card-title">
              <Briefcase size={20} /> Job Description
            </h3>

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
          <button
            className="analyze-button"
            onClick={handleUpload}
            disabled={loading}
          >
            {loading ? <div className="spinner"></div> : (
              <>
                <Sparkles size={18} /> Analyze Match
              </>
            )}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="results-section glass-card">
            <div style={{ textAlign: "center", marginBottom: "30px" }}>
              <div className="score-badge">
                {result.match_score}% Match
              </div>
            </div>

            <div className="analysis-grid">
              <div>
                <h4 style={{ marginBottom: "15px", color: "#4ade80" }}>
                  Matched Skills
                </h4>
                {result.matched_skills.map((s, i) => (
                  <span key={i} className="skill-tag matched">
                    {s}
                  </span>
                ))}
              </div>

              <div>
                <h4 style={{ marginBottom: "15px", color: "#f87171" }}>
                  Missing Skills
                </h4>
                {result.missing_skills.map((s, i) => (
                  <span key={i} className="skill-tag missing">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginTop: "30px" }}>
              <h4 style={{ marginBottom: "15px", color: "var(--accent)" }}>
                AI Suggestions
              </h4>
              <div className="suggestions-box markdown-content">
                <ReactMarkdown>
                  {result.ai_suggestions}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Upload;
