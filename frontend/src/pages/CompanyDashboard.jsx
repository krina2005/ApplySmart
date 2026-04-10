import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Footer from '../components/Footer';
import { useDialog } from '../components/DialogProvider';
import './CompanyDashboard.css';

const CompanyDashboard = () => {
    const navigate = useNavigate();
    const { showAlert, showConfirm } = useDialog();
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [user, setUser] = useState(null);
    const [isApproved, setIsApproved] = useState(true); // assume approved until we know otherwise

    // Profile State
    const [profile, setProfile] = useState({
        company_name: '',
        website: '',
        location: '',
        industry: '',
        size: '',
        description: ''
    });

    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);

    useEffect(() => {
        const getProfileAndJobs = async () => {
            try {
                setLoading(true);
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    navigate('/login/company');
                    return;
                }
                setUser(user);

                // Fetch profile
                const { data: profileData, error: profileError } = await supabase
                    .from('company_profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (profileError && profileError.code !== 'PGRST116') {
                    console.error('Error fetching profile:', profileError);
                }

                if (profileData) {
                    setProfile(profileData);
                    setIsApproved(profileData.is_approved === true);
                }

                // Fetch jobs
                const { data: jobsData, error: jobsError } = await supabase
                    .from('jobs')
                    .select('*')
                    .eq('company_id', user.id)
                    .order('created_at', { ascending: false });

                if (jobsError) {
                    console.error('Error fetching jobs:', jobsError);
                } else {
                    setJobs(jobsData || []);
                }

            } catch (error) {
                console.error('Error loading user data:', error.message);
            } finally {
                setLoading(false);
            }
        };

        getProfileAndJobs();
    }, [navigate]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    const handleDeleteJob = async (e, jobId) => {
        e.stopPropagation(); // prevent opening job modal
        const confirmed = await showConfirm(
            'Are you sure you want to delete this job? All applications for this job will also be permanently deleted.',
            { variant: 'error', title: 'Delete Job', confirmLabel: 'Yes, Delete', cancelLabel: 'Cancel' }
        );
        if (!confirmed) return;

        try {
            // Step 1: Delete all applications linked to this job first (FK constraint)
            const { error: appsError } = await supabase
                .from('applications')
                .delete()
                .eq('job_id', jobId);

            if (appsError) throw appsError;

            // Step 2: Now safely delete the job
            const { error: jobError } = await supabase
                .from('jobs')
                .delete()
                .eq('id', jobId)
                .eq('company_id', user.id); // extra safety: only delete own jobs

            if (jobError) throw jobError;

            // Remove from local state immediately
            setJobs(prev => prev.filter(j => j.id !== jobId));
        } catch (error) {
            await showAlert('Failed to delete job: ' + error.message, { variant: 'error', title: 'Delete Failed' });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const { error } = await supabase
                .from('company_profiles')
                .upsert({
                    id: user.id, // Profile ID matches User ID
                    ...profile,
                    updated_at: new Date()
                });

            if (error) throw error;

            await showAlert('Profile updated successfully!', { variant: 'success', title: 'Profile Saved' });
            setIsEditing(false);
        } catch (error) {
            await showAlert('Error updating profile: ' + error.message, { variant: 'error', title: 'Save Failed' });
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#fff' }}>Loading...</div>;

    return (
        <div className="company-dashboard-container">

            {/* ── Pending Approval Banner ── */}
            {!isApproved && (
                <div style={{
                    background: 'linear-gradient(135deg, rgba(255,217,102,0.12), rgba(255,170,0,0.08))',
                    border: '1px solid rgba(255,217,102,0.4)',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                    color: '#ffd966'
                }}>
                    <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>⏳</span>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>
                            Account Pending Admin Approval
                        </div>
                        <div style={{ fontSize: '0.88rem', color: '#c9a940', lineHeight: 1.5 }}>
                            You can set up your profile and explore, but your job postings will
                            <strong> not be visible to applicants</strong> until an admin approves your account.
                            Please allow some time for review.
                        </div>
                    </div>
                </div>
            )}

            <div className="dashboard-card">
                <div className="card-header">
                    <h2 className="card-title">Company Profile</h2>
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="btn-primary"
                        >
                            Edit Profile
                        </button>
                    )}
                </div>

                {isEditing ? (
                    <form onSubmit={handleSave}>
                        <div className="form-group">
                            <label className="form-label">Company Name</label>
                            <input
                                type="text"
                                name="company_name"
                                value={profile.company_name}
                                onChange={handleChange}
                                placeholder="e.g. Acme Corp"
                                required
                                className="form-input"
                            />
                        </div>

                        <div className="grid-2-col">
                            <div className="form-group">
                                <label className="form-label">Website</label>
                                <input
                                    type="url"
                                    name="website"
                                    value={profile.website}
                                    onChange={handleChange}
                                    placeholder="https://"
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={profile.location}
                                    onChange={handleChange}
                                    placeholder="City, Country"
                                    className="form-input"
                                />
                            </div>
                        </div>

                        <div className="grid-2-col">
                            <div className="form-group">
                                <label className="form-label">Industry</label>
                                <input
                                    type="text"
                                    name="industry"
                                    value={profile.industry}
                                    onChange={handleChange}
                                    placeholder="e.g. Technology"
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Company Size</label>
                                <select
                                    name="size"
                                    value={profile.size}
                                    onChange={handleChange}
                                    className="form-select"
                                >
                                    <option value="">Select Size</option>
                                    <option value="1-10">1-10 employees</option>
                                    <option value="11-50">11-50 employees</option>
                                    <option value="51-200">51-200 employees</option>
                                    <option value="201-500">201-500 employees</option>
                                    <option value="500+">500+ employees</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea
                                name="description"
                                value={profile.description}
                                onChange={handleChange}
                                rows="6"
                                placeholder="Describe your company and culture..."
                                className="form-textarea"
                            />
                        </div>

                        <div className="action-buttons">
                            <button
                                type="submit"
                                className="btn-primary btn-save"
                            >
                                Save Profile
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="btn-secondary btn-cancel"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="profile-view">
                        {profile.company_name ? (
                            <>
                                <div className="profile-view-header">
                                    <h3 className="company-name-large">{profile.company_name}</h3>
                                    {(profile.location || profile.industry) && (
                                        <div className="company-meta">
                                            {profile.industry && <span>{profile.industry}</span>}
                                            {profile.industry && profile.location && <span className="meta-separator">•</span>}
                                            {profile.location && <span>{profile.location}</span>}
                                        </div>
                                    )}
                                </div>

                                <div className="info-grid">
                                    {profile.website && (
                                        <div className="info-item">
                                            <span className="info-label">Website</span>
                                            <div className="info-value">
                                                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="info-link">{profile.website}</a>
                                            </div>
                                        </div>
                                    )}
                                    {profile.size && (
                                        <div className="info-item">
                                            <span className="info-label">Size</span>
                                            <div className="info-value">{profile.size}</div>
                                        </div>
                                    )}
                                </div>

                                {profile.description && (
                                    <div className="about-section">
                                        <span className="info-label">About</span>
                                        <p className="about-text">{profile.description}</p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="empty-state">
                                <p>You haven't set up your company profile yet.</p>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="btn-primary"
                                    style={{ marginTop: '1rem' }}
                                >
                                    Create Profile
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="posted-jobs-section">
                <h2 className="section-title">Posted Jobs</h2>
                {jobs.length > 0 ? (
                    <div className="jobs-grid">
                        {jobs.map(job => (
                            <div
                                key={job.id}
                                className="job-card"
                                onClick={() => setSelectedJob(job)}
                            >
                                <div className="job-card-header">
                                    <h3 className="job-title">{job.title}</h3>
                                    <span className="job-type-badge">{job.type}</span>
                                </div>
                                <div className="job-card-body">
                                    <p className="job-location">📍 {job.location}</p>
                                    <p className="job-description-preview">
                                        {job.description?.substring(0, 100)}...
                                    </p>
                                </div>
                                <div className="job-card-footer">
                                    <span className="job-date">Posted: {new Date(job.created_at).toLocaleDateString()}</span>
                                    <button
                                        className="btn-delete-job"
                                        onClick={(e) => handleDeleteJob(e, job.id)}
                                        title="Delete job"
                                        aria-label="Delete job"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="3 6 5 6 21 6" />
                                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                            <path d="M10 11v6" />
                                            <path d="M14 11v6" />
                                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-jobs-state">
                        <p>You haven't posted any jobs yet.</p>
                        <button
                            onClick={() => navigate('/post-job')}
                            className="btn-secondary"
                        >
                            Post a Job
                        </button>
                    </div>
                )}
            </div>

            {selectedJob && (
                <div className="modal-overlay" onClick={() => setSelectedJob(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setSelectedJob(null)}>×</button>

                        <div className="modal-header">
                            <h2 className="modal-title">{selectedJob.title}</h2>
                            <span className="job-type-badge large">{selectedJob.type}</span>
                        </div>

                        <div className="modal-meta">
                            <p className="modal-location">📍 {selectedJob.location}</p>
                            <p className="modal-date">Posted on {new Date(selectedJob.created_at).toLocaleDateString()}</p>
                        </div>

                        <div className="modal-body">
                            <div className="modal-section">
                                <h3>Description</h3>
                                <p>{selectedJob.description}</p>
                            </div>

                            {selectedJob.requirements && (
                                <div className="modal-section">
                                    <h3>Requirements</h3>
                                    <p>{selectedJob.requirements}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            <Footer />
        </div>
    );
};

export default CompanyDashboard;
