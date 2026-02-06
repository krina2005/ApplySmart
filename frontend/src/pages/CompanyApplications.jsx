import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Footer from "../components/Footer";
import "./CompanyDashboard.css";

const CompanyApplications = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [jobsWithApps, setJobsWithApps] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    navigate("/login/company");
                    return;
                }

                // 1. Fetch Company's Jobs
                const { data: jobs, error: jobsError } = await supabase
                    .from('jobs')
                    .select('id, title, created_at')
                    .eq('company_id', user.id)
                    .order('created_at', { ascending: false });

                if (jobsError) throw jobsError;

                // 2. Fetch Applications for these jobs
                // We can use the 'in' filter regarding job_id
                const jobIds = jobs.map(j => j.id);

                if (jobIds.length === 0) {
                    setJobsWithApps([]);
                    setLoading(false);
                    return;
                }

                const { data: applications, error: appsError } = await supabase
                    .from('applications')
                    .select(`
                        id,
                        user_id,
                        resume_url,
                        status,
                        created_at,
                        job_id,
                        score
                    `)
                    .in('job_id', jobIds)
                    .order('created_at', { ascending: false });

                if (appsError) throw appsError;

                // 3. Group Applications by Job
                const grouped = jobs.map(job => {
                    const jobApps = applications.filter(app => app.job_id === job.id);
                    return {
                        ...job,
                        applications: jobApps
                    };
                });

                setJobsWithApps(grouped);

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };



        fetchData();

        // Real-time subscription for application updates
        const subscription = supabase
            .channel('public:applications')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'applications' }, (payload) => {
                const updatedApp = payload.new;
                setJobsWithApps(prevJobs => prevJobs.map(job => {
                    if (job.id === updatedApp.job_id) {
                        return {
                            ...job,
                            applications: job.applications.map(app =>
                                app.id === updatedApp.id ? { ...app, ...updatedApp } : app
                            )
                        };
                    }
                    return job;
                }));
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [navigate]);

    const handleStatusUpdate = async (appId, newStatus) => {
        try {
            const { error } = await supabase
                .from('applications')
                .update({ status: newStatus })
                .eq('id', appId);

            if (error) throw error;

            // Update local state
            setJobsWithApps(prev => prev.map(job => ({
                ...job,
                applications: job.applications.map(app =>
                    app.id === appId ? { ...app, status: newStatus } : app
                )
            })));

        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status");
        }
    };

    return (
        <div className="company-dashboard-container">
            <div className="applications-container" style={{ maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
                <h2 className="section-title" style={{ marginTop: 0 }}>Applications</h2>

                {loading ? (
                    <p style={{ textAlign: "center", color: "#fff" }}>Loading...</p>
                ) : jobsWithApps.length === 0 ? (
                    <div className="empty-state">
                        <p>No jobs posted yet.</p>
                    </div>
                ) : (
                    <div className="job-applications-list">
                        {jobsWithApps.map(job => (
                            <div key={job.id} className="dashboard-card application-group-card" style={{ marginBottom: '2rem' }}>
                                <div className="card-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <h3 className="card-title" style={{ fontSize: '1.4rem' }}>{job.title}</h3>
                                        <span style={{ color: '#8fb6d9', fontSize: '0.9rem' }}>
                                            Posted: {new Date(job.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {(() => {
                                                const pendingCount = job.applications.filter(app => !app.status || app.status === 'Pending').length;
                                                const approvedCount = job.applications.filter(app => app.status === 'Approved').length;
                                                return (
                                                    <>
                                                        {pendingCount > 0 && (
                                                            <span className="app-count-badge" style={{ backgroundColor: 'rgba(255, 152, 0, 0.2)', color: '#ff9800' }}>
                                                                {pendingCount} Pending
                                                            </span>
                                                        )}
                                                        {approvedCount > 0 && (
                                                            <span className="app-count-badge" style={{ backgroundColor: 'rgba(76, 175, 80, 0.2)', color: '#4caf50' }}>
                                                                {approvedCount} Approved
                                                            </span>
                                                        )}
                                                    </>
                                                );
                                            })()}
                                        </div>
                                        {job.applications.filter(app => !app.status || app.status === 'Pending').length > 0 && (
                                            <button
                                                onClick={async () => {
                                                    const pendingApps = job.applications.filter(app => !app.status || app.status === 'Pending');
                                                    if (confirm(`Analyze and rank ${pendingApps.length} pending resume${pendingApps.length !== 1 ? 's' : ''} for this job?`)) {
                                                        try {
                                                            const { data: { session } } = await supabase.auth.getSession();
                                                            const token = session?.access_token;

                                                            if (!token) {
                                                                alert("You must be logged in to rank candidates.");
                                                                return;
                                                            }

                                                            const res = await fetch(`http://localhost:8000/rank-job/${job.id}`, {
                                                                method: 'POST',
                                                                headers: {
                                                                    'Authorization': `Bearer ${token}`
                                                                }
                                                            });
                                                            const data = await res.json();
                                                            if (data.status === 'success') {
                                                                alert(`Ranking complete! Processed ${data.ranked_count} application${data.ranked_count !== 1 ? 's' : ''}.`);
                                                            } else {
                                                                alert("Error: " + data.message);
                                                            }
                                                        } catch (err) {
                                                            alert("Failed to connect to AI engine: " + err.message);
                                                        }
                                                    }
                                                }}
                                                className="btn-secondary"
                                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
                                            >
                                                ✨ AI Rank Pending Candidates
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {job.applications.length === 0 ? (
                                    <p style={{ color: '#6c8a99', fontStyle: 'italic' }}>No applications yet.</p>
                                ) : (
                                    <>
                                        {/* Pending Applications Section */}
                                        {(() => {
                                            const pendingApps = job.applications.filter(app => !app.status || app.status === 'Pending');
                                            return pendingApps.length > 0 && (
                                                <div className="application-section-wrapper">
                                                    <h4 className="application-section-header pending-section-header">
                                                        📋 Pending Applications ({pendingApps.length})
                                                    </h4>
                                                    <div className="table-responsive">
                                                        <table className="applications-table">
                                                            <thead>
                                                                <tr>
                                                                    <th>Applicant</th>
                                                                    <th>Applied Date</th>
                                                                    <th>Resume</th>
                                                                    <th>AI Score</th>
                                                                    <th>Status</th>
                                                                    <th>Actions</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {pendingApps.map(app => (
                                                                    <tr key={app.id}>
                                                                        <td>
                                                                            <div className="applicant-info">
                                                                                <span className="applicant-name">{app.full_name || 'User ' + app.user_id.slice(0, 6)}</span>
                                                                                <span className="applicant-email">{app.email}</span>
                                                                            </div>
                                                                        </td>
                                                                        <td>{new Date(app.created_at).toLocaleDateString()}</td>
                                                                        <td>
                                                                            <a
                                                                                href={app.resume_url}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="view-resume-link"
                                                                            >
                                                                                View PDF
                                                                            </a>
                                                                        </td>
                                                                        {/* <td>
                                                                            {app.score ? (
                                                                                <span className="score-badge" style={{
                                                                                    backgroundColor: app.score > 70 ? 'rgba(76, 175, 80, 0.25)' : app.score > 40 ? 'rgba(255, 152, 0, 0.25)' : 'rgba(244, 67, 54, 0.25)',
                                                                                    color: app.score > 70 ? '#81c784' : app.score > 40 ? '#ffb74d' : '#e57373',
                                                                                    borderRadius: '6px'
                                                                                }}>
                                                                                    {app.score}%
                                                                                </span>
                                                                            ) : (
                                                                                <span style={{ color: '#aaa', fontSize: '0.9em' }}>Not Ranked</span>
                                                                            )}
                                                                        </td> */}
                                                                        <td>
                                                                            {app.score ? (
                                                                                <span className={`score-badge ${app.score > 70 ? "score-high" :
                                                                                    app.score > 40 ? "score-medium" :
                                                                                        "score-low"
                                                                                    }`}>
                                                                                    {app.score}%
                                                                                </span>
                                                                            ) : (
                                                                                <span className="not-ranked">Not Ranked</span>
                                                                            )}
                                                                        </td>

                                                                        <td>
                                                                            <span className={`status-badge ${app.status?.toLowerCase() || 'pending'}`}>
                                                                                {app.status || 'Pending'}
                                                                            </span>
                                                                        </td>
                                                                        <td>
                                                                            <div className="action-buttons-sm">
                                                                                <button
                                                                                    onClick={() => handleStatusUpdate(app.id, 'Approved')}
                                                                                    className="btn-icon btn-approve"
                                                                                    title="Approve"
                                                                                >
                                                                                    ✓
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => handleStatusUpdate(app.id, 'Rejected')}
                                                                                    className="btn-icon btn-reject"
                                                                                    title="Reject"
                                                                                >
                                                                                    ✕
                                                                                </button>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            );
                                        })()}

                                        {/* Approved Applications Section */}
                                        {(() => {
                                            const approvedApps = job.applications.filter(app => app.status === 'Approved');
                                            return approvedApps.length > 0 && (
                                                <div className="application-section-wrapper">
                                                    <h4 className="application-section-header approved-section-header">
                                                        ✅ Approved Applications ({approvedApps.length})
                                                    </h4>
                                                    <div className="table-responsive">
                                                        <table className="applications-table">
                                                            <thead>
                                                                <tr>
                                                                    <th>Applicant</th>
                                                                    <th>Applied Date</th>
                                                                    <th>Resume</th>
                                                                    <th>AI Score</th>
                                                                    <th>Status</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {approvedApps.map(app => (
                                                                    <tr key={app.id} className="approved-row">
                                                                        <td>
                                                                            <div className="applicant-info">
                                                                                <span className="applicant-name">{app.full_name || 'User ' + app.user_id.slice(0, 6)}</span>
                                                                                <span className="applicant-email">{app.email}</span>
                                                                            </div>
                                                                        </td>
                                                                        <td>{new Date(app.created_at).toLocaleDateString()}</td>
                                                                        <td>
                                                                            <a
                                                                                href={app.resume_url}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="view-resume-link"
                                                                            >
                                                                                View PDF
                                                                            </a>
                                                                        </td>
                                                                        <td>
                                                                            {app.score ? (
                                                                                <span className={`score-badge ${app.score > 70 ? "score-high" :
                                                                                    app.score > 40 ? "score-medium" :
                                                                                        "score-low"
                                                                                    }`}>
                                                                                    {app.score}%
                                                                                </span>
                                                                            ) : (
                                                                                <span className="not-ranked">N/A</span>
                                                                            )}
                                                                        </td>
                                                                        <td>
                                                                            <span className={`status-badge ${app.status?.toLowerCase()}`}>
                                                                                {app.status}
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </>
                                )}
                            </div>
                        ))}
                    </div >
                )}
            </div >
            <Footer />
        </div >
    );
};

export default CompanyApplications;
