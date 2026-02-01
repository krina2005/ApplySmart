import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./CompanyDashboard.css";

const CompanyApplications = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [applications, setApplications] = useState([]);

    useEffect(() => {
        const fetchApplications = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate("/login/company");
                return;
            }

            try {
                // Fetch applications where job belongs to this company
                // Since we have RLS policies, simple select on applications should work if policy is correct
                // BUT current policy is: exists (select 1 from jobs ...)
                // We should also join with jobs to get job title

                const { data, error } = await supabase
                    .from('applications')
                    .select(`
                        id,
                        status,
                        created_at,
                        resume_url,
                        jobs (
                            title
                        ),
                        user_id
                    `)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setApplications(data || []);
            } catch (error) {
                console.error("Error fetching applications:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, [navigate]);

    return (
        <div className="company-dashboard-container">
            <div className="dashboard-card">
                <div className="card-header">
                    <h2 className="card-title">Applications Received</h2>
                </div>

                {loading ? (
                    <p style={{ textAlign: "center", color: "#fff" }}>Loading applications...</p>
                ) : applications.length === 0 ? (
                    <div className="empty-state">
                        <p>No applications received yet.</p>
                    </div>
                ) : (
                    <div className="applications-list">
                        <table style={{ width: "100%", color: "#fff", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ borderBottom: "1px solid #444", textAlign: "left" }}>
                                    <th style={{ padding: "10px" }}>Job Role</th>
                                    <th style={{ padding: "10px" }}>Date</th>
                                    <th style={{ padding: "10px" }}>Status</th>
                                    <th style={{ padding: "10px" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {applications.map((app) => (
                                    <tr key={app.id} style={{ borderBottom: "1px solid #333" }}>
                                        <td style={{ padding: "10px" }}>{app.jobs?.title}</td>
                                        <td style={{ padding: "10px" }}>{new Date(app.created_at).toLocaleDateString()}</td>
                                        <td style={{ padding: "10px" }}>
                                            <span className={`status-badge ${app.status.toLowerCase()}`}>
                                                {app.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: "10px" }}>
                                            {/* Future: Add Resume View & Status Update */}
                                            <button className="btn-secondary" style={{ padding: "5px 10px", fontSize: "0.8em" }}>View</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompanyApplications;
