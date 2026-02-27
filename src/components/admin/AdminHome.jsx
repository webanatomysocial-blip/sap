import React, { useState, useEffect } from "react";
import "../../css/AdminDashboard.css";
import "../../css/admin-profile.css";
import { LuShieldCheck, LuKey } from "react-icons/lu";
import ResetPasswordModal from "./ResetPasswordModal";

const AdminHome = () => {
  const [stats, setStats] = useState({
    contributors: 0,
    pending_reviews: 0,
    blogs: 0,
    total_views: 0,
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="admin-page-wrapper">
      <div className="page-header">
        <h2>Dashboard</h2>
      </div>

      <div className="admin-card">
        <div className="dashboard-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <i className="bi bi-people"></i>
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.contributors}</span>
              <span className="stat-label">Contributors</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <i className="bi bi-hourglass-split"></i>
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.pending_reviews}</span>
              <span className="stat-label">Pending Reviews</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <i className="bi bi-file-earmark-text"></i>
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.blogs}</span>
              <span className="stat-label">Blog Posts</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <i className="bi bi-eye"></i>
            </div>
            <div className="stat-info">
              <span className="stat-value">
                {stats.total_views > 999
                  ? (stats.total_views / 1000).toFixed(1) + "k"
                  : stats.total_views}
              </span>
              <span className="stat-label">Total Views</span>
            </div>
          </div>
        </div>

        <div
          className="dashboard-sections"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 260px",
            gap: "24px",
            marginTop: "24px",
            paddingTop: "24px",
            borderTop: "1px solid #f1f5f9",
          }}
        >
          <div
            className="dashboard-intro"
            style={{ margin: 0, padding: 0, borderTop: "none" }}
          >
            <h3>Welcome to the SAP Security Expert Admin Panel</h3>
            <p>
              Select a module from the sidebar to confirm approvals or manage
              content.
            </p>
          </div>

          <div className="security-settings-card">
            <div className="security-title">
              <LuShieldCheck /> Security Settings
            </div>
            <p>Keep your account secure by updating your password regularly.</p>
            <button
              className="btn-reset-pw"
              onClick={() => setShowPasswordModal(true)}
            >
              <LuKey /> Reset Password
            </button>
          </div>
        </div>
      </div>

      <ResetPasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  );
};

export default AdminHome;
