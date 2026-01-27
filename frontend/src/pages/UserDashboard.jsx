import React, { useState } from "react";
import "./UserDashboard.css";

const companies = [
  {
    id: 1,
    name: "Google",
    domain: "AI",
    tech: ["Python", "React", "ML"],
    location: "Bangalore",
  },
  {
    id: 2,
    name: "Amazon",
    domain: "Cloud",
    tech: ["AWS", "Java", "Docker"],
    location: "Hyderabad",
  },
  {
    id: 3,
    name: "Microsoft",
    domain: "Web",
    tech: ["React", "Node", "Azure"],
    location: "Pune",
  },
  {
    id: 4,
    name: "StartupX",
    domain: "Web",
    tech: ["MERN", "MongoDB"],
    location: "Remote",
  },
];

const UserDashboard = () => {
  const [domainFilter, setDomainFilter] = useState("");
  const [techFilter, setTechFilter] = useState("");
  const [searchStatus, setSearchStatus] = useState("");

  const [applications, setApplications] = useState([
    { company: "Google", status: "Accepted" },
    { company: "Amazon", status: "Pending" },
    { company: "Microsoft", status: "Rejected" },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [resumeFile, setResumeFile] = useState(null);

  const filteredCompanies = companies.filter((c) => {
    return (
      (domainFilter === "" ||
        c.domain.toLowerCase().includes(domainFilter.toLowerCase())) &&
      (techFilter === "" ||
        c.tech.join(" ").toLowerCase().includes(techFilter.toLowerCase()))
    );
  });

  const filteredApplications = applications.filter((a) =>
    a.company.toLowerCase().includes(searchStatus.toLowerCase())
  );

  const handleSubmitResume = () => {
    if (!resumeFile) {
      alert("Please upload your resume");
      return;
    }

    // prevent duplicate applications
    const alreadyApplied = applications.some(
      (app) => app.company === selectedCompany
    );

    if (alreadyApplied) {
      alert("You have already applied to this company");
      return;
    }

    setApplications((prev) => [
      ...prev,
      { company: selectedCompany, status: "Pending" },
    ]);

    setShowModal(false);
    setResumeFile(null);
  };

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">User Dashboard</h1>
      <p className="dashboard-subtitle">
        Discover companies and track your applications
      </p>

      {/* FILTER SECTION */}
      <div className="filter-box">
        <input
          type="text"
          placeholder="Filter by interest (AI, Web, Cloud)"
          value={domainFilter}
          onChange={(e) => setDomainFilter(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter by tech stack (React, Python)"
          value={techFilter}
          onChange={(e) => setTechFilter(e.target.value)}
        />
      </div>

      {/* COMPANY LIST */}
      <div className="section">
        <h2>Suggested Companies</h2>
        <div className="card-grid">
          {filteredCompanies.map((company) => (
            <div className="company-card" key={company.id}>
              <h3>{company.name}</h3>
              <p><span>Domain:</span> {company.domain}</p>
              <p><span>Tech:</span> {company.tech.join(", ")}</p>
              <p><span>Location:</span> {company.location}</p>

              <button
                className="apply-btn"
                onClick={() => {
                  setSelectedCompany(company.name);
                  setShowModal(true);
                }}
              >
                Upload Resume & Apply
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* STATUS SECTION */}
      <div className="section">
        <h2>Application Status</h2>
        <input
          type="text"
          className="status-search"
          placeholder="Search company name"
          value={searchStatus}
          onChange={(e) => setSearchStatus(e.target.value)}
        />

        <div className="status-list">
          {filteredApplications.map((app, index) => (
            <div className="status-card" key={index}>
              <strong>{app.company}</strong>
              <span
                className={`status ${app.status.toLowerCase()}`}
              >
                {app.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* RESUME UPLOAD MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Upload Resume</h3>
            <p>
              Applying for <strong>{selectedCompany}</strong>
            </p>

            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setResumeFile(e.target.files[0])}
            />

            <div className="modal-actions">
              <button
                className="modal-btn submit"
                onClick={handleSubmitResume}
              >
                Submit
              </button>
              <button
                className="modal-btn cancel"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
