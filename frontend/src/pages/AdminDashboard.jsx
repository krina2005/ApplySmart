import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");

  // FETCH COMPANIES FROM SUPABASE
  const fetchCompanies = async () => {
    const { data, error } = await supabase
      .from("company_profiles")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching companies:", error);
    } else {
      setCompanies(data);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // DELETE COMPANY
  const deleteCompany = async (id) => {
    if (!window.confirm("Remove this company?")) return;

    const { error } = await supabase
      .from("company_profiles")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting company:", error);
    } else {
      setCompanies(companies.filter(c => c.id !== id));
    }
  };

  // SEARCH FILTER
  const filteredCompanies = companies.filter(company =>
    company.company_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-container">

      <div className="admin-header">
        <div>
          <h1 className="admin-title">Admin Dashboard</h1>
          <p className="admin-subtitle">
            Manage registered companies and control platform access
          </p>
        </div>

        <div className="admin-stats">
          <div className="stat-card">
            <span>{companies.length}</span>
            <p>Companies</p>
          </div>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      <table className="company-table">
        <thead>
          <tr>
            <th>Company</th>
            <th>Industry</th>
            <th>Location</th>
            <th>Website</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>

          {filteredCompanies.length === 0 ? (
            <tr>
              <td colSpan="5" className="empty-row">
                No companies found
              </td>
            </tr>
          ) : (
            filteredCompanies.map(company => (
              <tr key={company.id}>
                <td>{company.company_name}</td>
                <td>{company.industry}</td>
                <td>{company.location}</td>

                <td>
                  {company.website ? (
                    <a href={company.website} target="_blank" rel="noreferrer">
                      {company.website}
                    </a>
                  ) : (
                    "-"
                  )}
                </td>

                <td>
                  <button
                    className="delete-btn"
                    onClick={() => deleteCompany(company.id)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))
          )}

        </tbody>
      </table>

    </div>
  );
};

export default AdminDashboard;
