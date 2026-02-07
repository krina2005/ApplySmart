import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import Footer from "../components/Footer";
import "./UserDashboard.css";
import { 
  Building2, 
  MapPin, 
  Factory, 
  Briefcase,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Globe,
  ChevronDown,
  FileText,
  Upload,
  X,
  Target,
  Award,
  Calendar,
  BarChart3,
  RefreshCw,
  Sparkles,
  AlertCircle
} from "lucide-react";

const UserDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [domainFilter, setDomainFilter] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [expandedCards, setExpandedCards] = useState(new Set());

  const [applications, setApplications] = useState([]);
  const [user, setUser] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [showApplyForm, setShowApplyForm] = useState(false);

  // Additional filter states
  const [jobTypeFilter, setJobTypeFilter] = useState("All");
  const [sortBy, setSortBy] = useState("recent");
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Fetch Jobs and Applications
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

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
          const { data: appsData, error: appsError } = await supabase
            .from('applications')
            .select(`
              id,
              status,
              created_at,
              score,
              rank_analysis,
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

  // Toast notification function
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  // Enhanced filtering with job type
  const filteredJobs = jobs.filter((job) => {
    const title = job.title || "";
    const companyName = job.company_profiles?.company_name || "";
    const industry = job.company_profiles?.industry || "";
    const location = job.location || "";
    const jobType = job.type || "";

    const term = domainFilter.toLowerCase();
    const matchesSearch = domainFilter === "" ||
      title.toLowerCase().includes(term) ||
      companyName.toLowerCase().includes(term) ||
      industry.toLowerCase().includes(term) ||
      location.toLowerCase().includes(term);

    const matchesType = jobTypeFilter === "All" || 
      jobType.toLowerCase().includes(jobTypeFilter.toLowerCase());

    return matchesSearch && matchesType;
  });

  // Enhanced sorting for applications
  const filteredApplications = applications
    .filter((app) => {
      const title = app.jobs?.title || "";
      const company = app.jobs?.company_profiles?.company_name || "";
      const status = app.status || "";
      const term = searchStatus.toLowerCase();

      return title.toLowerCase().includes(term) || 
             company.toLowerCase().includes(term) ||
             status.toLowerCase().includes(term);
    })
    .sort((a, b) => {
      if (sortBy === "recent") {
        return new Date(b.created_at) - new Date(a.created_at);
      } else if (sortBy === "score") {
        return (b.score || 0) - (a.score || 0);
      } else if (sortBy === "status") {
        // CHANGED: Updated to use "Approved" instead of "Accepted"
        const statusOrder = { "Approved": 0, "Pending": 1, "Rejected": 2 };
        return (statusOrder[a.status] || 3) - (statusOrder[b.status] || 3);
      }
      return 0;
    });

  // Application statistics - CHANGED: Using "Approved" instead of "Accepted"
  const appStats = {
    total: applications.length,
    pending: applications.filter(a => a.status === "Pending").length,
    accepted: applications.filter(a => a.status === "Approved").length, // CHANGED HERE
    rejected: applications.filter(a => a.status === "Rejected").length,
  };

  const handleSubmitResume = async () => {
    if (!resumeFile) {
      showToast("Please upload your resume", "error");
      return;
    }
    if (!user) {
      showToast("Please log in to apply", "error");
      return;
    }

    const alreadyApplied = applications.some(
      (app) => app.job_id === selectedJob.id
    );

    if (alreadyApplied) {
      showToast("You have already applied to this job", "error");
      return;
    }

    try {
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
      showToast("Application submitted successfully!");
      setShowModal(false);
      setResumeFile(null);
      setShowApplyForm(false);

    } catch (err) {
      console.error("Error applying:", err);
      showToast("Failed to apply: " + err.message, "error");
    }
  };

  return (
    <div className="dashboard">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === "success" ? (
            <CheckCircle size={18} style={{ marginRight: '0.5rem' }} />
          ) : (
            <AlertCircle size={18} style={{ marginRight: '0.5rem' }} />
          )}
          {toast.message}
        </div>
      )}

      <p className="dashboard-subtitle">
        Find your dream job and track your applications
      </p>

      {/* Application Stats Cards */}
      {applications.length > 0 && (
        <div className="stats-grid">
          <div className="stat-card">
            <Briefcase size={24} style={{ color: '#4cc3ff', marginBottom: '0.5rem' }} />
            <div className="stat-value">{appStats.total}</div>
            <div className="stat-label">Total Applied</div>
          </div>
          <div className="stat-card">
            <Clock size={24} style={{ color: '#ffd966', marginBottom: '0.5rem' }} />
            <div className="stat-value" style={{ color: '#ffd966' }}>{appStats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card">
            <CheckCircle size={24} style={{ color: '#4cff88', marginBottom: '0.5rem' }} />
            <div className="stat-value" style={{ color: '#4cff88' }}>{appStats.accepted}</div>
            {/* CHANGED: Label still says "Accepted" for user-friendly display */}
            <div className="stat-label">Accepted</div>
          </div>
          <div className="stat-card">
            <XCircle size={24} style={{ color: '#ff6b6b', marginBottom: '0.5rem' }} />
            <div className="stat-value" style={{ color: '#ff6b6b' }}>{appStats.rejected}</div>
            <div className="stat-label">Rejected</div>
          </div>
        </div>
      )}

      {/* Filter Section */}
      <div className="filter-box">
        <div style={{ position: 'relative', width: '100%', maxWidth: '500px' }}>
          <Search 
            size={18} 
            style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: '#6f86a3'
            }} 
          />
          <input
            type="text"
            placeholder="Search Job Title, Company, Industry, or Location..."
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            style={{ width: '100%', paddingLeft: '40px' }}
          />
        </div>
      </div>

      {/* Job Type Filter Tabs */}
      <div className="job-type-tabs">
        {["All", "Remote", "Hybrid", "On-site"].map((type) => (
          <button
            key={type}
            className={`job-type-tab ${jobTypeFilter === type ? "active" : ""}`}
            onClick={() => setJobTypeFilter(type)}
          >
            <Filter size={14} style={{ marginRight: '0.3rem' }} />
            {type}
          </button>
        ))}
      </div>

      {/* JOB LIST */}
      <div className="section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>
            <Briefcase size={24} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Open Positions ({filteredJobs.length})
          </h2>
        </div>
        
        {loading ? (
          <div className="skeleton-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton-card"></div>
            ))}
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', color: '#ff6b6b', padding: '2rem' }}>
            <AlertCircle size={48} style={{ marginBottom: '1rem' }} />
            <p>Error loading jobs: {error.message}</p>
            <button 
              onClick={() => window.location.reload()} 
              style={{ 
                marginTop: '1rem', 
                padding: '0.5rem 1rem', 
                background: '#4cc3ff', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <RefreshCw size={16} />
              Retry
            </button>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="empty-state-card" style={{ padding: '3rem', textAlign: 'center' }}>
            <Search size={64} style={{ color: '#4cc3ff', marginBottom: '1rem' }} />
            <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '0.5rem' }}>No jobs found</p>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Try adjusting your filters or search terms
            </p>
            <button 
              onClick={() => { setDomainFilter(""); setJobTypeFilter("All"); }}
              style={{ 
                marginTop: '1.5rem', 
                padding: '0.7rem 1.5rem', 
                background: '#4cc3ff', 
                border: 'none', 
                borderRadius: '20px', 
                cursor: 'pointer', 
                fontWeight: 'bold',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <X size={16} />
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="card-grid">
            {filteredJobs.map((job) => {
              const hasApplied = applications.some(app => app.job_id === job.id);
              
              return (
                <div className="company-card" key={job.id}>
                  {/* Job type badge */}
                  {job.type && (
                    <div className="job-type-badge">
                      <Target size={12} style={{ marginRight: '0.3rem' }} />
                      {job.type}
                    </div>
                  )}
                  
                  <h3>{job.title}</h3>
                  <p style={{ color: '#aaa', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Building2 size={16} />
                    <strong>{job.company_profiles?.company_name}</strong>
                  </p>

                  {job.location && (
                    <p style={{ color: '#8fb6d9', fontSize: '0.9rem', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MapPin size={14} />
                      {job.location}
                    </p>
                  )}
                  
                  {job.company_profiles?.industry && (
                    <p style={{ color: '#8fb6d9', fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Factory size={14} />
                      {job.company_profiles.industry}
                    </p>
                  )}

                  {hasApplied && (
                    <div style={{ 
                      background: 'rgba(76, 255, 136, 0.1)', 
                      color: '#4cff88', 
                      padding: '0.4rem 0.8rem', 
                      borderRadius: '6px', 
                      fontSize: '0.85rem',
                      marginBottom: '0.5rem',
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}>
                      <CheckCircle size={14} />
                      Already Applied
                    </div>
                  )}

                  <button
                    className="apply-btn"
                    onClick={() => {
                      setSelectedJob(job);
                      setShowModal(true);
                    }}
                  >
                    <FileText size={16} style={{ marginRight: '0.5rem' }} />
                    {hasApplied ? "View Details" : "View & Apply"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* STATUS SECTION */}
      <div className="section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <h2>
            <BarChart3 size={24} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Application Status ({applications.length})
          </h2>
          
          {/* Sort dropdown */}
          {applications.length > 0 && (
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                background: '#0c1626',
                border: '1px solid #1e2a40',
                color: '#fff',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              <option value="recent">Most Recent</option>
              <option value="score">Highest Score</option>
              <option value="status">By Status</option>
            </select>
          )}
        </div>

        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
          <Search 
            size={18} 
            style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: '#6f86a3'
            }} 
          />
          <input
            type="text"
            className="status-search"
            placeholder="Search by job title, company, or status..."
            value={searchStatus}
            onChange={(e) => setSearchStatus(e.target.value)}
            style={{ paddingLeft: '40px', width: '100%' }}
          />
        </div>

        <div className="status-list">
          {filteredApplications.length === 0 && applications.length === 0 && (
            <div className="empty-state-card" style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#1e293b', borderRadius: '8px' }}>
              <FileText size={64} style={{ color: '#4cc3ff', marginBottom: '1rem' }} />
              <p style={{ color: '#94a3b8', marginBottom: '0.5rem', fontSize: '1.1rem' }}>No applications yet</p>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Start applying to jobs above to track your applications here
              </p>
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                style={{ 
                  padding: '0.7rem 1.5rem', 
                  background: '#4cc3ff', 
                  border: 'none', 
                  borderRadius: '20px', 
                  cursor: 'pointer', 
                  fontWeight: 'bold',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <TrendingUp size={16} />
                Browse Jobs
              </button>
            </div>
          )}

          {filteredApplications.length === 0 && applications.length > 0 && (
            <div className="empty-state-card" style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#1e293b', borderRadius: '8px' }}>
              <Search size={48} style={{ color: '#94a3b8', marginBottom: '1rem' }} />
              <p style={{ color: '#94a3b8' }}>No applications match your search</p>
              <button 
                onClick={() => setSearchStatus("")}
                style={{ 
                  marginTop: '1rem', 
                  padding: '0.5rem 1rem', 
                  background: '#4cc3ff', 
                  border: 'none', 
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <X size={16} />
                Clear Search
              </button>
            </div>
          )}

          {filteredApplications.map((app) => {
            const hasAIRanking = app.score !== null && app.score !== undefined && app.rank_analysis;
            const analysis = app.rank_analysis || {};
            const isExpanded = expandedCards.has(app.id);

            const toggleExpand = () => {
              setExpandedCards(prev => {
                const newSet = new Set(prev);
                if (newSet.has(app.id)) {
                  newSet.delete(app.id);
                } else {
                  newSet.add(app.id);
                }
                return newSet;
              });
            };

            // Format date
            const appliedDate = new Date(app.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });

            return (
              <div
                className="status-card"
                key={app.id}
                style={{
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: isExpanded ? '1px solid #4cc3ff' : '1px solid #1e2a40'
                }}
                onClick={toggleExpand}
              >
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontSize: '1.1em' }}>{app.jobs?.title}</strong>
                      <div style={{ fontSize: '0.85em', color: '#94a3b8', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Building2 size={12} />
                        {app.jobs?.company_profiles?.company_name}
                      </div>
                      <div style={{ fontSize: '0.75em', color: '#64748b', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Calendar size={12} />
                        Applied on {appliedDate}
                      </div>
                      {hasAIRanking && (
                        <div style={{
                          fontSize: '0.9em',
                          color: app.score > 70 ? '#4caf50' : app.score > 40 ? '#ff9800' : '#f44336',
                          fontWeight: 'bold',
                          marginTop: '0.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}>
                          <Award size={14} />
                          Match: {app.score}%
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span
                        className={`status ${(app.status || 'pending').toLowerCase()}`}
                        style={{ flexShrink: 0 }}
                      >
                        {app.status}
                      </span>
                      <ChevronDown 
                        size={20}
                        style={{
                          color: '#64748b',
                          transition: 'transform 0.2s ease',
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                        }}
                      />
                    </div>
                  </div>

                  {isExpanded && hasAIRanking && (
                    <div style={{
                      backgroundColor: 'rgba(59, 130, 246, 0.05)',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                      borderRadius: '8px',
                      padding: '1rem',
                      marginTop: '1rem'
                    }}>
                      <div style={{
                        fontSize: '0.85em',
                        color: '#94a3b8',
                        marginBottom: '0.75rem',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <Sparkles size={16} />
                        Evaluation Details
                      </div>

                      {analysis.matched_skills && analysis.matched_skills.length > 0 && (
                        <div style={{ marginBottom: '1rem' }}>
                          <div style={{ fontSize: '0.85em', color: '#cbd5e1', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <CheckCircle size={14} />
                            Skills Match: <span style={{ color: '#4caf50', fontWeight: 'bold' }}>
                              {analysis.skill_score}%
                            </span>
                          </div>
                          <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.5rem',
                            marginBottom: '0.5rem'
                          }}>
                            {analysis.matched_skills.slice(0, 5).map((skill, idx) => (
                              <span key={idx} style={{
                                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                                color: '#4caf50',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.75em',
                                border: '1px solid rgba(76, 175, 80, 0.3)'
                              }}>
                                {skill}
                              </span>
                            ))}
                            {analysis.matched_skills.length > 5 && (
                              <span style={{ fontSize: '0.75em', color: '#64748b', alignSelf: 'center' }}>
                                +{analysis.matched_skills.length - 5} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {analysis.missing_skills && analysis.missing_skills.length > 0 && (
                        <div style={{ marginBottom: '1rem' }}>
                          <div style={{ fontSize: '0.85em', color: '#cbd5e1', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <AlertCircle size={14} />
                            Missing Skills
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {analysis.missing_skills.slice(0, 4).map((skill, idx) => (
                              <span key={idx} style={{
                                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                                color: '#f44336',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.75em',
                                border: '1px solid rgba(244, 67, 54, 0.3)'
                              }}>
                                {skill}
                              </span>
                            ))}
                            {analysis.missing_skills.length > 4 && (
                              <span style={{ fontSize: '0.75em', color: '#64748b', alignSelf: 'center' }}>
                                +{analysis.missing_skills.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '0.75rem',
                        paddingTop: '0.75rem',
                        borderTop: '1px solid rgba(148, 163, 184, 0.1)'
                      }}>
                        <div>
                          <div style={{ fontSize: '0.75em', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Target size={12} />
                            Contextual Fit
                          </div>
                          <div style={{ fontSize: '0.9em', fontWeight: 'bold', color: '#e2e8f0' }}>
                            {analysis.semantic_score}%
                          </div>
                        </div>
                        {analysis.experience_years !== undefined && (
                          <div>
                            <div style={{ fontSize: '0.75em', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <Briefcase size={12} />
                              Experience
                            </div>
                            <div style={{ fontSize: '0.9em', fontWeight: 'bold', color: '#e2e8f0' }}>
                              {analysis.experience_years} {analysis.experience_years === 1 ? 'year' : 'years'}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {isExpanded && !hasAIRanking && (
                    <div style={{
                      backgroundColor: 'rgba(148, 163, 184, 0.05)',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      borderRadius: '8px',
                      padding: '1rem',
                      marginTop: '1rem',
                      textAlign: 'center'
                    }}>
                      <Clock size={32} style={{ color: '#94a3b8', marginBottom: '0.5rem' }} />
                      <div style={{ fontSize: '0.9em', color: '#94a3b8' }}>
                        Pending Evaluation
                      </div>
                      <div style={{ fontSize: '0.75em', color: '#64748b', marginTop: '0.25rem' }}>
                        AI ranking will appear once the company reviews applications
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Job Details & Resume Upload Modal */}
      {showModal && selectedJob && (
        <div className="modal-overlay" onClick={() => {
          setShowModal(false);
          setResumeFile(null);
          setShowApplyForm(false);
        }}>
          <div className="modal" style={{ width: '550px', maxWidth: '90%', textAlign: 'left' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{selectedJob.title}</h3>
                <p style={{ color: '#aaa', marginBottom: '1rem' }}>
                  <strong>{selectedJob.company_profiles?.company_name}</strong>
                  {selectedJob.location && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginLeft: '0.5rem' }}>
                      <MapPin size={14} />
                      {selectedJob.location}
                    </span>
                  )}
                  {selectedJob.type && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginLeft: '0.5rem' }}>
                      <Target size={14} />
                      {selectedJob.type}
                    </span>
                  )}
                </p>
              </div>
              <button 
                onClick={() => {
                  setShowModal(false);
                  setResumeFile(null);
                  setShowApplyForm(false);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '0.5rem'
                }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '10px' }}>
              <h4 style={{ color: '#4cc3ff', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={18} />
                Job Description
              </h4>
              <p style={{ color: '#ddd', whiteSpace: 'pre-wrap' }}>{selectedJob.description}</p>

              {selectedJob.requirements && (
                <>
                  <h4 style={{ color: '#4cc3ff', marginTop: '1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={18} />
                    Requirements
                  </h4>
                  <p style={{ color: '#ddd', whiteSpace: 'pre-wrap' }}>{selectedJob.requirements}</p>
                </>
              )}

              {selectedJob.company_profiles?.website && (
                <div style={{ marginTop: '1rem' }}>
                  <a 
                    href={selectedJob.company_profiles.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: '#4cc3ff', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <Globe size={16} />
                    Visit Company Website →
                  </a>
                </div>
              )}
            </div>

            <hr style={{ borderColor: '#1e2a40', margin: '1rem 0' }} />

            {!showApplyForm ? (
              <button
                className="modal-btn submit"
                onClick={() => setShowApplyForm(true)}
                style={{ width: '100%', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                disabled={applications.some(app => app.job_id === selectedJob.id)}
              >
                {applications.some(app => app.job_id === selectedJob.id) ? (
                  <>
                    <CheckCircle size={16} />
                    Already Applied
                  </>
                ) : (
                  <>
                    <FileText size={16} />
                    Apply Now
                  </>
                )}
              </button>
            ) : (
              <>
                <h4 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Upload size={18} />
                  Apply for this position
                </h4>
                <div style={{ 
                  background: '#0c1626', 
                  border: '1px solid #1e2a40', 
                  borderRadius: '8px', 
                  padding: '1rem',
                  marginBottom: '1rem'
                }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#9bb0c9', fontSize: '0.9rem' }}>
                    Upload Resume (PDF, DOC, DOCX)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setResumeFile(e.target.files[0])}
                    style={{ width: '100%' }}
                  />
                  {resumeFile && (
                    <p style={{ color: '#4cff88', marginTop: '0.5rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle size={14} />
                      {resumeFile.name}
                    </p>
                  )}
                </div>
              </>
            )}

            <div className="modal-actions">
              {showApplyForm && (
                <button
                  className="modal-btn submit"
                  onClick={handleSubmitResume}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <Upload size={16} />
                  Submit Application
                </button>
              )}
              <button
                className="modal-btn cancel"
                onClick={() => {
                  setShowModal(false);
                  setResumeFile(null);
                  setShowApplyForm(false);
                }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <X size={16} />
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default UserDashboard;