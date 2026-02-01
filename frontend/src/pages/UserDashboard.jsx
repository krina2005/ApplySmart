import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import "./UserDashboard.css";



const UserDashboard = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [domainFilter, setDomainFilter] = useState("");
  const [searchStatus, setSearchStatus] = useState("");

  const [applications, setApplications] = useState([
    { company: "Google", status: "Accepted" },
    { company: "Amazon", status: "Pending" },
    { company: "Microsoft", status: "Rejected" },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [resumeFile, setResumeFile] = useState(null);

  // Fetch Companies from Supabase
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const { data, error } = await supabase
          .from('company_profiles')
          .select('*');

        if (error) throw error;
        console.log("Fetched companies:", data);
        setCompanies(data || []);
      } catch (error) {
        console.error("Error fetching companies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const filteredCompanies = companies.filter((c) => {
    const name = c.company_name || "";
    const industry = c.industry || "";
    // const skills = c.tech || []; // Tech stack not yet in DB, using Industry for now

    return (
      (domainFilter === "" ||
        industry.toLowerCase().includes(domainFilter.toLowerCase()) ||
        name.toLowerCase().includes(domainFilter.toLowerCase()))
      // Removed tech filter for now until DB supports it, or mapped to industry
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
          placeholder="Filter by Name or Industry..."
          value={domainFilter}
          onChange={(e) => setDomainFilter(e.target.value)}
          style={{ width: '100%', maxWidth: '400px' }}
        />
        {/* Removed Tech Filter input as data is available yet */}
      </div>

      {/* COMPANY LIST */}
      <div className="section">
        <h2>Suggested Companies</h2>
        {loading ? (
          <p style={{ color: '#fff', textAlign: 'center' }}>Loading companies...</p>
        ) : filteredCompanies.length === 0 ? (
          <p style={{ color: '#aaa', textAlign: 'center' }}>No companies found.</p>
        ) : (
          <div className="card-grid">
            {filteredCompanies.map((company) => (
              <div className="company-card" key={company.id}>
                <h3>{company.company_name}</h3>
                {company.industry && <p><span>Industry:</span> {company.industry}</p>}
                {company.size && <p><span>Size:</span> {company.size}</p>}
                {company.location && <p><span>Location:</span> {company.location}</p>}
                {company.website && (
                  <p>
                    <span>Website:</span> <a href={company.website} target="_blank" rel="noopener noreferrer" style={{ color: '#4cc3ff' }}>Link</a>
                  </p>
                )}

                <button
                  className="apply-btn"
                  onClick={() => {
                    setSelectedCompany(company.company_name);
                    setShowModal(true);
                  }}
                >
                  Upload Resume & Apply
                </button>
              </div>
            ))}
          </div>
        )}
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
