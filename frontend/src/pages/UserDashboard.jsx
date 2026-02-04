import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import "./UserDashboard.css";

const UserDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [domainFilter, setDomainFilter] = useState("");
  const [searchStatus, setSearchStatus] = useState("");

  const [applications, setApplications] = useState([]);
  const [user, setUser] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [showApplyForm, setShowApplyForm] = useState(false);

  // Fetch Jobs and Applications
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        // Fetch Jobs with Company details
        const { data: jobsData, error: jobsError } = await supabase
          .from('jobs')
          .select(`
            id,
            title,
            location,
            type,
            description,
            company_id,
            company_profiles (
              company_name,
              industry,
              website
            )
          `)
          .order('created_at', { ascending: false });

        if (jobsError) throw jobsError;
        setJobs(jobsData || []);

        if (user) {
          // Fetch Applications
          const { data: appsData, error: appsError } = await supabase
            .from('applications')
            .select(`
              id,
              status,
              created_at,
              job_id,
              jobs (
                title,
                company_profiles (
                  company_name
                )
              )
            `)
            .eq('user_id', user.id);

          if (appsError) throw appsError;
          setApplications(appsData || []);
        }

      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const title = job.title || "";
    const companyName = job.company_profiles?.company_name || "";
    const industry = job.company_profiles?.industry || "";

    // Search by Job Title, Company Name, or Industry
    const term = domainFilter.toLowerCase();
    return (
      domainFilter === "" ||
      title.toLowerCase().includes(term) ||
      companyName.toLowerCase().includes(term) ||
      industry.toLowerCase().includes(term)
    );
  });

  const filteredApplications = applications.filter((app) => {
    const title = app.jobs?.title || "";
    const company = app.jobs?.company_profiles?.company_name || "";
    const term = searchStatus.toLowerCase();

    return title.toLowerCase().includes(term) || company.toLowerCase().includes(term);
  });

  const handleSubmitResume = async () => {
    if (!resumeFile) {
      alert("Please upload your resume");
      return;
    }
    if (!user) {
      alert("Please log in to apply");
      return;
    }

    // prevent duplicate applications
    const alreadyApplied = applications.some(
      (app) => app.job_id === selectedJob.id
    );

    if (alreadyApplied) {
      alert("You have already applied to this job");
      return;
    }

    try {
      // Upload Resume to Supabase Storage
      const fileExt = resumeFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, resumeFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(fileName);

      const { data, error } = await supabase
        .from('applications')
        .insert([
          {
            job_id: selectedJob.id,
            user_id: user.id,
            resume_url: publicUrl,
            status: 'Pending'
          }
        ])
        .select(`
              id,
              status,
              created_at,
              job_id,
              jobs (
                title,
                company_profiles (
                  company_name
                )
              )
            `)
        .single();

      if (error) throw error;

      setApplications((prev) => [...prev, data]);
      alert("Application submitted successfully!");
      setShowModal(false);
      setResumeFile(null);

    } catch (err) {
      console.error("Error applying:", err);
      alert("Failed to apply: " + err.message);
    }
  };

  return (
    <div className="dashboard">
      <p className="dashboard-subtitle">
        Find your dream job and track your applications
      </p>

      {/* FILTER SECTION */}
      <div className="filter-box">
        <input
          type="text"
          placeholder="Search Job Title, Company, or Industry..."
          value={domainFilter}
          onChange={(e) => setDomainFilter(e.target.value)}
          style={{ width: '100%', maxWidth: '400px' }}
        />
      </div>

      {/* JOB LIST */}
      <div className="section">
        <h2>Open Positions</h2>
        {loading ? (
          <p style={{ color: '#fff', textAlign: 'center' }}>Loading jobs...</p>
        ) : error ? (
          <div style={{ textAlign: 'center', color: '#ff6b6b' }}>
            <p>Error loading jobs: {error.message}</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <p style={{ color: '#aaa', textAlign: 'center' }}>No jobs found.</p>
        ) : (
          <div className="card-grid">
            {filteredJobs.map((job) => (
              <div className="company-card" key={job.id}> {/* Keeping classname company-card for style reuse */}
                <h3>{job.title}</h3>
                <p style={{ color: '#aaa', marginBottom: '0.5rem' }}>
                  <span>Company: </span>
                  <strong>{job.company_profiles?.company_name}</strong>
                </p>

                {job.location && <p><span>Location:</span> {job.location}</p>}
                <button
                  className="apply-btn"
                  onClick={() => {
                    setSelectedJob(job);
                    setShowModal(true);
                  }}
                >
                  View Details
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
          placeholder="Search applications..."
          value={searchStatus}
          onChange={(e) => setSearchStatus(e.target.value)}
        />

        <div className="status-list">
          {filteredApplications.length === 0 && (
            <p style={{ color: '#aaa', textAlign: 'center' }}>You haven't applied to any jobs yet.</p>
          )}
          {filteredApplications.map((app) => (
            <div className="status-card" key={app.id}>
              <div>
                <strong>{app.jobs?.title}</strong>
                <div style={{ fontSize: '0.9em', color: '#ccc' }}>
                  {app.jobs?.company_profiles?.company_name}
                </div>
              </div>
              <span
                className={`status ${app.status.toLowerCase()}`}
              >
                {app.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* JOB DETAILS & RESUME UPLOAD MODAL */}
      {showModal && selectedJob && (
        <div className="modal-overlay">
          <div className="modal" style={{ width: '500px', maxWidth: '90%', textAlign: 'left' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{selectedJob.title}</h3>
            <p style={{ color: '#aaa', marginBottom: '1.5rem' }}>
              <strong>{selectedJob.company_profiles?.company_name}</strong>
              {selectedJob.location && <span> • {selectedJob.location}</span>}
              {selectedJob.type && <span> • {selectedJob.type}</span>}
            </p>

            <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '10px' }}>
              <h4 style={{ color: '#4cc3ff', marginBottom: '0.5rem' }}>Job Description</h4>
              <p style={{ color: '#ddd', whiteSpace: 'pre-wrap' }}>{selectedJob.description}</p>

              {selectedJob.requirements && (
                <>
                  <h4 style={{ color: '#4cc3ff', marginTop: '1rem', marginBottom: '0.5rem' }}>Requirements</h4>
                  <p style={{ color: '#ddd', whiteSpace: 'pre-wrap' }}>{selectedJob.requirements}</p>
                </>
              )}
            </div>

            <hr style={{ borderColor: '#1e2a40', margin: '1rem 0' }} />

            {!showApplyForm ? (
              <button
                className="modal-btn submit"
                onClick={() => setShowApplyForm(true)}
                style={{ width: '100%', marginBottom: '1rem' }}
              >
                Apply Now
              </button>
            ) : (
              <>
                <h4 style={{ marginBottom: '0.5rem' }}>Apply for this position</h4>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setResumeFile(e.target.files[0])}
                  style={{ marginBottom: '1rem' }}
                />
              </>
            )}

            <div className="modal-actions">
              {showApplyForm && (
                <button
                  className="modal-btn submit"
                  onClick={handleSubmitResume}
                >
                  Submit Application
                </button>
              )}
              <button
                className="modal-btn cancel"
                onClick={() => {
                  setShowModal(false);
                  setResumeFile(null);
                  setShowApplyForm(false); // Reset apply form visibility
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
