import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useDialog } from "../components/DialogProvider";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const { showAlert, showConfirm } = useDialog();

  // ── FETCH ──────────────────────────────────────────────
  const fetchCompanies = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("company_profiles")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching companies:", error);
    } else {
      setCompanies(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // ── ACTIONS ─────────────────────────────────────────────

  const approveCompany = async (id) => {
    setActionLoading(id);
    const { error } = await supabase
      .from("company_profiles")
      .update({ is_approved: true, is_banned: false })
      .eq("id", id);

    if (error) {
      await showAlert('Error approving company: ' + error.message, { variant: 'error', title: 'Action Failed' });
    } else {
      setCompanies((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, is_approved: true, is_banned: false } : c
        )
      );
    }
    setActionLoading(null);
  };

  const rejectCompany = async (id, name) => {
    const confirmed = await showConfirm(`Reject "${name}"? They will NOT be able to log in.`, { variant: 'error', title: 'Reject Company', confirmLabel: 'Yes, Reject', cancelLabel: 'Cancel' });
    if (!confirmed) return;
    setActionLoading(id);
    const { error } = await supabase
      .from("company_profiles")
      .update({ is_approved: false, is_banned: true })
      .eq("id", id);

    if (error) {
      await showAlert('Error rejecting company: ' + error.message, { variant: 'error', title: 'Action Failed' });
    } else {
      setCompanies((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, is_approved: false, is_banned: true } : c
        )
      );
    }
    setActionLoading(null);
  };

  const removeCompany = async (id, name) => {
    const confirmed = await showConfirm(`Remove "${name}" from the platform?\n\nThey will be banned and cannot log in again.`, { variant: 'error', title: 'Ban Company', confirmLabel: 'Yes, Remove', cancelLabel: 'Cancel' });
    if (!confirmed) return;

    setActionLoading(id);
    const { error } = await supabase
      .from("company_profiles")
      .update({ is_approved: false, is_banned: true })
      .eq("id", id);

    if (error) {
      await showAlert('Error removing company: ' + error.message, { variant: 'error', title: 'Action Failed' });
    } else {
      setCompanies((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, is_approved: false, is_banned: true } : c
        )
      );
      // Switch to banned tab so admin can see the result
      setActiveTab("banned");
    }
    setActionLoading(null);
  };

  const restoreCompany = async (id) => {
    setActionLoading(id);
    const { error } = await supabase
      .from("company_profiles")
      .update({ is_approved: true, is_banned: false })
      .eq("id", id);

    if (error) {
      await showAlert('Error restoring company: ' + error.message, { variant: 'error', title: 'Action Failed' });
    } else {
      setCompanies((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, is_approved: true, is_banned: false } : c
        )
      );
      setActiveTab("approved");
    }
    setActionLoading(null);
  };

  // ── DERIVED DATA ─────────────────────────────────────────
  const pending  = companies.filter((c) => !c.is_approved && !c.is_banned);
  const approved = companies.filter((c) => c.is_approved  && !c.is_banned);
  const banned   = companies.filter((c) => c.is_banned);

  const tabList =
    activeTab === "pending"
      ? pending
      : activeTab === "approved"
      ? approved
      : banned;

  const filtered = tabList.filter((c) =>
    c.company_name?.toLowerCase().includes(search.toLowerCase())
  );

  // ── RENDER ───────────────────────────────────────────────
  return (
    <div className="admin-container">

      {/* ── HEADER ── */}
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Admin Dashboard</h1>
          <p className="admin-subtitle">
            Manage company registrations and control platform access
          </p>
        </div>

        <div className="admin-stats">
          <div className="stat-card">
            <span className="stat-num pending-num">{pending.length}</span>
            <p>Pending</p>
          </div>
          <div className="stat-card">
            <span className="stat-num approved-num">{approved.length}</span>
            <p>Approved</p>
          </div>
          <div className="stat-card">
            <span className="stat-num banned-num">{banned.length}</span>
            <p>Banned</p>
          </div>
          <div className="stat-card">
            <span className="stat-num">{companies.length}</span>
            <p>Total</p>
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === "pending" ? "active-tab" : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          ⏳ Pending Approval
          {pending.length > 0 && (
            <span className="tab-badge pending-badge">{pending.length}</span>
          )}
        </button>
        <button
          className={`admin-tab ${activeTab === "approved" ? "active-tab" : ""}`}
          onClick={() => setActiveTab("approved")}
        >
          ✅ Approved
          <span className="tab-badge approved-badge">{approved.length}</span>
        </button>
        <button
          className={`admin-tab ${activeTab === "banned" ? "active-tab" : ""}`}
          onClick={() => setActiveTab("banned")}
        >
          🚫 Banned
          {banned.length > 0 && (
            <span className="tab-badge banned-badge">{banned.length}</span>
          )}
        </button>
      </div>

      {/* ── SEARCH ── */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <button className="refresh-btn" onClick={fetchCompanies} title="Refresh">
          ↻
        </button>
      </div>

      {/* ── TABLE ── */}
      {loading ? (
        <div className="admin-loading">Loading companies…</div>
      ) : (
        <table className="company-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Industry</th>
              <th>Location</th>
              <th>Website</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-row">
                  {search
                    ? "No companies match your search"
                    : activeTab === "pending"
                    ? "No companies awaiting approval 🎉"
                    : activeTab === "approved"
                    ? "No approved companies yet"
                    : "No banned companies"}
                </td>
              </tr>
            ) : (
              filtered.map((company) => (
                <tr key={company.id} className={actionLoading === company.id ? "row-loading" : ""}>
                  <td className="td-company">
                    <span className="company-name-text">{company.company_name || "—"}</span>
                    <span className="company-email-text">{company.email || ""}</span>
                  </td>
                  <td>{company.industry || "—"}</td>
                  <td>{company.location || "—"}</td>
                  <td>
                    {company.website ? (
                      <a href={company.website} target="_blank" rel="noreferrer">
                        {company.website.replace(/^https?:\/\//, "")}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    {company.is_banned ? (
                      <span className="badge badge-banned">Banned</span>
                    ) : company.is_approved ? (
                      <span className="badge badge-approved">Approved</span>
                    ) : (
                      <span className="badge badge-pending">Pending</span>
                    )}
                  </td>
                  <td className="action-cell">
                    {/* PENDING → Approve or Reject */}
                    {!company.is_approved && !company.is_banned && (
                      <>
                        <button
                          className="approve-btn"
                          onClick={() => approveCompany(company.id)}
                          disabled={actionLoading === company.id}
                        >
                          {actionLoading === company.id ? "…" : "Approve"}
                        </button>
                        <button
                          className="reject-btn"
                          onClick={() => rejectCompany(company.id, company.company_name)}
                          disabled={actionLoading === company.id}
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {/* APPROVED → Remove */}
                    {company.is_approved && !company.is_banned && (
                      <button
                        className="delete-btn"
                        onClick={() => removeCompany(company.id, company.company_name)}
                        disabled={actionLoading === company.id}
                      >
                        {actionLoading === company.id ? "…" : "Remove"}
                      </button>
                    )}

                    {/* BANNED → Restore */}
                    {company.is_banned && (
                      <button
                        className="restore-btn"
                        onClick={() => restoreCompany(company.id)}
                        disabled={actionLoading === company.id}
                      >
                        {actionLoading === company.id ? "…" : "Restore"}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminDashboard;
