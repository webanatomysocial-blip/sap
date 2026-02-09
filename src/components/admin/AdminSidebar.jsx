import React from "react";
import { Link, useLocation } from "react-router-dom";

const AdminSidebar = ({ onLogout }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const navItems = [
    { label: "Dashboard", path: "/admin-dashboard", icon: "bi-grid-fill" },
    {
      label: "Manage Contributors",
      path: "/admin-dashboard/contributors",
      icon: "bi-people-fill",
    },
    {
      label: "Manage Comments",
      path: "/admin-dashboard/comments",
      icon: "bi-chat-left-text-fill",
    },
    {
      label: "Manage Announcements",
      path: "/admin-dashboard/announcements",
      icon: "bi-megaphone-fill",
    },
    {
      label: "Manage Blogs",
      path: "/admin-dashboard/blogs",
      icon: "bi-layout-text-window-reverse",
    },
    {
      label: "Manage Ads & Promos",
      path: "/admin-dashboard/ads",
      icon: "bi-images",
    },
  ];

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <Link to="/" className="sidebar-brand">
          <img
            src="/assets/sapsecurityexpert-white.png"
            alt="SAP Security Expert"
            className="sidebar-logo"
          />
        </Link>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item1 ${isActive(item.path) ? "active" : ""}`}
          >
            <i className={`bi ${item.icon}`}></i>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button onClick={onLogout} className="btn-logout">
          <i className="bi bi-box-arrow-right"></i>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
