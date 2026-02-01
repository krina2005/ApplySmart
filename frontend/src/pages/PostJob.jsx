import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./CompanyDashboard.css"; // Reuse styling for now or create new

const PostJob = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        location: "",
        type: "Full-time",
        description: "",
        requirements: ""
    });

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate("/login/company");
                return;
            }
            setUser(user);
        };
        checkUser();
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from('jobs')
                .insert([
                    {
                        company_id: user.id,
                        title: formData.title,
                        location: formData.location,
                        type: formData.type,
                        description: formData.description,
                        requirements: formData.requirements
                    }
                ]);

            if (error) throw error;

            alert("Job posted successfully!");
            navigate("/company-dashboard"); // Redirect to dashboard or stay?
        } catch (error) {
            console.error("Error posting job:", error);
            alert("Error posting job: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="company-dashboard-container">
            <div className="dashboard-card">
                <div className="card-header">
                    <h2 className="card-title">Post a New Job</h2>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Job Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g. Senior React Developer"
                            required
                            className="form-input"
                        />
                    </div>

                    <div className="grid-2-col">
                        <div className="form-group">
                            <label className="form-label">Location</label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="e.g. Remote, New York"
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Job Type</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="form-select"
                            >
                                <option value="Full-time">Full-time</option>
                                <option value="Part-time">Part-time</option>
                                <option value="Contract">Contract</option>
                                <option value="Internship">Internship</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Job responsibilities..."
                            className="form-textarea"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Requirements</label>
                        <textarea
                            name="requirements"
                            value={formData.requirements}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Skills and qualifications..."
                            className="form-textarea"
                        />
                    </div>

                    <div className="action-buttons">
                        <button
                            type="submit"
                            className="btn-primary btn-save"
                            disabled={loading}
                        >
                            {loading ? "Posting..." : "Post Job"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PostJob;
