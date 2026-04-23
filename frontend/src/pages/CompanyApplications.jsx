import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Footer from "../components/Footer";
import { useDialog } from "../components/DialogProvider";
import { 
  ClipboardList, 
  CheckCircle2, 
  Slash, 
  Trash2, 
  Sparkles, 
  Check, 
  X, 
  FileText 
} from "lucide-react";
import SmartIcon from "../components/SmartIcon";
import "./CompanyDashboard.css";

const CompanyApplications = () => {
    const navigate = useNavigate();
    const { showAlert, showConfirm } = useDialog();
    const [loading, setLoading] = useState(true);
    const [jobsWithApps, setJobsWithApps] = useState([]);

    // Function to fetch applications data
    const fetchApplicationsData = async () => {
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

    useEffect(() => {
        fetchApplicationsData();

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
            await showAlert('Failed to update status', { variant: 'error', title: 'Update Failed' });
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
                            <div key={job.id} className="application-group-card">
                                <div className="job-group-header">
                                    <div className="job-group-title">
                                        <h2>{job.title}</h2>
                                        <span className="job-group-date">
                                            Posted: {new Date(job.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                                        <div style={{ display: 'flex', gap: '0.6rem' }}>
                                            {(() => {
                                                const pendingCount = job.applications.filter(app => !app.status || app.status === 'Pending').length;
                                                const approvedCount = job.applications.filter(app => app.status === 'Approved').length;
                                                return (
                                                    <>
                                                        {pendingCount > 0 && (
                                                            <span className="app-count-badge" style={{ borderColor: '#ff9800', color: '#ff9800', background: 'rgba(255, 152, 0, 0.05)' }}>
                                                                {pendingCount} Pending
                                                            </span>
                                                        )}
                                                        {approvedCount > 0 && (
                                                            <span className="app-count-badge" style={{ borderColor: '#4caf50', color: '#4caf50', background: 'rgba(76, 175, 80, 0.05)' }}>
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
                                                    const confirmed = await showConfirm(`Analyze and rank ${pendingApps.length} pending resume${pendingApps.length !== 1 ? 's' : ''} for this job?`, { variant: 'info', title: 'AI Rank Candidates', confirmLabel: 'Run Ranking', cancelLabel: 'Cancel' });
                                                    if (confirmed) {
                                                        try {
                                                            const { data: { session } } = await supabase.auth.getSession();
                                                            const token = session?.access_token;

                                                            if (!token) {
                                                                await showAlert('You must be logged in to rank candidates.', { variant: 'warning', title: 'Not Logged In' });
                                                                return;
                                                            }

                                                            const API_BASE = import.meta.env.VITE_API_URL || "";
                                                            const res = await fetch(`${API_BASE}/rank-job/${job.id}`, {
                                                                method: 'POST',
                                                                headers: {
                                                                    'Authorization': `Bearer ${token}`
                                                                }
                                                            });
                                                            const data = await res.json();
                                                            if (data.status === 'success') {
                                                                await showAlert(`Ranking complete! Processed ${data.ranked_count} application${data.ranked_count !== 1 ? 's' : ''}.`, { variant: 'success', title: 'Ranking Done' });
                                                                await fetchApplicationsData();
                                                            } else {
                                                                await showAlert('Error: ' + data.message, { variant: 'error', title: 'Ranking Failed' });
                                                            }
                                                        } catch (err) {
                                                            await showAlert('Failed to connect to AI engine: ' + err.message, { variant: 'error', title: 'Connection Error' });
                                                        }
                                                    }
                                                }}
                                                className="btn-secondary"
                                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                            >
                                                <SmartIcon icon={Sparkles} size={16} /> AI Rank Candidates
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
                                                        <SmartIcon icon={ClipboardList} variant="soft" size={20} /> Pending Applications ({pendingApps.length})
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
                                                                                View PDF <SmartIcon icon={FileText} size={14} style={{ marginLeft: '0.4rem' }} />
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
                                                                                    <SmartIcon icon={Check} size={16} />
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => handleStatusUpdate(app.id, 'Rejected')}
                                                                                    className="btn-icon btn-reject"
                                                                                    title="Reject"
                                                                                >
                                                                                    <SmartIcon icon={X} size={16} />
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
                                                        <SmartIcon icon={CheckCircle2} variant="soft" size={20} /> Approved Applications ({approvedApps.length})
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
                                                                                View PDF <SmartIcon icon={FileText} size={14} style={{ marginLeft: '0.4rem' }} />
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
