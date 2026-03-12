import React from "react";
import { Link, useLocation } from "react-router-dom";

/**
 * AdminSidebar — Dynamic nav based on role and permissions.
 * Props:
 *   onLogout: () => void
 *   role: "admin" | "contributor"
 *   permissions: { can_manage_blogs, can_manage_ads, can_manage_comments, can_manage_announcements }
 */
const AdminSidebar = ({
  onLogout,
  role = "admin",
  permissions = {},
  badges = {},
}) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const isAdmin = role === "admin";

  // Full admin nav
  const adminNavItems = [
    { label: "Dashboard", path: "/admin", icon: "bi-grid-fill" },
    {
      label: "Manage Users",
      path: "/admin/users",
      icon: "bi-person-check-fill",
      badge: badges.pendingMembers,
    },
    {
      label: "Manage Contributors",
      path: "/admin/contributors",
      icon: "bi-people-fill",
      badge: badges.pendingContributors,
    },
    {
      label: "Manage Blogs",
      path: "/admin/blogs",
      icon: "bi-layout-text-window-reverse",
    },
    {
      label: "Blog Review",
      path: "/admin/blog-review",
      icon: "bi-hourglass-split",
      badge: badges.pendingReviews,
    },
    { label: "Manage Ads & Promos", path: "/admin/ads", icon: "bi-images" },
    {
      label: "Manage Comments",
      path: "/admin/comments",
      icon: "bi-chat-left-text-fill",
      badge: badges.pendingComments,
    },
    {
      label: "Manage Announcements",
      path: "/admin/announcements",
      icon: "bi-megaphone-fill",
    },
  ];

  // Contributor sees only their permitted modules
  const contributorNavItems = [
    { label: "Dashboard", path: "/admin", icon: "bi-grid-fill", always: true },
    ...(permissions.can_manage_blogs
      ? [
          {
            label: "My Blogs",
            path: "/admin/blogs",
            icon: "bi-layout-text-window-reverse",
          },
        ]
      : []),
    ...(permissions.can_manage_ads
      ? [{ label: "Manage Ads", path: "/admin/ads", icon: "bi-images" }]
      : []),
    ...(permissions.can_manage_comments
      ? [
          {
            label: "Comments",
            path: "/admin/comments",
            icon: "bi-chat-left-text-fill",
            badge: badges.pendingComments,
          },
        ]
      : []),
    ...(permissions.can_manage_announcements
      ? [
          {
            label: "Announcements",
            path: "/admin/announcements",
            icon: "bi-megaphone-fill",
          },
        ]
      : []),
    ...(permissions.can_review_blogs
      ? [
          {
            label: "Blog Review",
            path: "/admin/blog-review",
            icon: "bi-hourglass-split",
            badge: badges.pendingReviews,
          },
        ]
      : []),
  ];

  const navItems = isAdmin ? adminNavItems : contributorNavItems;

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

      {!isAdmin && (
        <div
          style={{
            padding: "6px 16px 12px",
            fontSize: "0.7rem",
            color: "rgba(255,255,255,0.4)",
            textTransform: "uppercase",
            letterSpacing: "1px",
            fontWeight: 600,
          }}
        >
          Contributor Portal
        </div>
      )}

      <nav className="sidebar-nav" data-lenis-prevent>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item1 ${isActive(item.path) ? "active" : ""}`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingRight: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <i
                className={`bi ${item.icon}`}
                style={{ marginRight: "10px" }}
              ></i>
              <span>{item.label}</span>
            </div>
            {item.badge > 0 && (
              <span
                style={{
                  background: "#ef4444",
                  color: "#fff",
                  borderRadius: "12px",
                  padding: "2px 8px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  minWidth: "24px",
                  textAlign: "center",
                }}
              >
                {item.badge}
              </span>
            )}
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
