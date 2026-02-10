import React, { useState, useEffect } from "react";
import "../../css/AdminDashboard.css";

const AdminHome = () => {
  const [stats, setStats] = useState({
    contributors: 0,
    pending_reviews: 0,
    blogs: 0,
    total_views: 0,
  });

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
    <div className="admin-overview">
      <div className="dashboard-grid">
        <div className="stat-card">
          <span className="stat-label">Contributors</span>
          <span className="stat-value">{stats.contributors}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Pending Reviews</span>
          <span className="stat-value">{stats.pending_reviews}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Blog Posts</span>
          <span className="stat-value">{stats.blogs}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Views</span>
          <span className="stat-value">
            {stats.total_views > 999
              ? (stats.total_views / 1000).toFixed(1) + "k"
              : stats.total_views}
          </span>
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
