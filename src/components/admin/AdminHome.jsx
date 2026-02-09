import React from "react";
import "../../css/AdminDashboard.css";

const AdminHome = () => {
  return (
    <div className="admin-overview">
      <div className="dashboard-grid">
        <div className="stat-card">
          <span className="stat-label">Contributors</span>
          <span className="stat-value">12</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Pending Reviews</span>
          <span className="stat-value">4</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Blog Posts</span>
          <span className="stat-value">25</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Views</span>
          <span className="stat-value">1.2k</span>
        </div>
      </div>

      <div className="dashboard-intro">
        <h3>Welcome to the SAP Security Expert Admin Panel</h3>
        <p>
          Select a module from the sidebar to confirm approvals or manage
          content.
        </p>
      </div>
    </div>
  );
};

export default AdminHome;
