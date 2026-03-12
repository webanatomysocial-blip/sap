import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import ContributorDashboard from "./ContributorDashboard";
import "../../css/AdminDashboard.css";
import "../../css/admin-profile.css";

import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { LuChevronDown, LuUser, LuKey, LuLogOut } from "react-icons/lu";
import ProfileEditModal from "./ProfileEditModal";
import ResetPasswordModal from "./ResetPasswordModal";
import {
  getAdminProfile,
  getAdminStats,
  getContributorStats,
} from "../../services/api";

const AdminLayout = () => {
  const { isAuthenticated, role, permissions, setAuth, clearAuth } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [adminData, setAdminData] = useState({
    full_name: "",
    username: "",
    profile_image: "",
  });
  const [badges, setBadges] = useState({
    pendingContributors: 0,
    pendingReviews: 0,
    pendingComments: 0,
    pendingMembers: 0,
  });

  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();

  // Click outside dropdown closes it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch profile and stats when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
      fetchBadges();
    }
  }, [isAuthenticated, location.pathname]);

  const fetchBadges = async () => {
    try {
      if (role === "admin") {
        const res = await getAdminStats();
        setBadges({
          pendingContributors: res.data.pending_contributors || 0,
          pendingReviews: res.data.pending_reviews || 0,
          pendingComments: res.data.pending_comments || 0,
          pendingMembers: res.data.pending_members || 0,
        });
      } else if (role === "contributor") {
        const res = await getContributorStats();
        setBadges({
          pendingContributors: 0,
          pendingReviews: res.data.pending_reviews || 0,
          pendingComments: res.data.pending_comments || 0,
        });
      }
    } catch (err) {
      console.error("Failed to fetch dashboard badges", err);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await getAdminProfile();
      if (res.data.status === "success") {
        setAdminData(res.data.user);
      }
    } catch (err) {
      console.error("Failed to fetch admin profile", err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/login", { username, password });
      if (response.data.status === "success") {
        addToast("Login successful! Redirecting...", "success");
        setAuth({
          user: response.data.user,
          role: response.data.role || "admin",
          permissions: response.data.permissions || {},
          csrf_token: response.data.csrf_token,
        });
        setTimeout(() => {
          fetchProfile();
        }, 400);
      }
    } catch (error) {
      addToast(
        error.response?.data?.message || "Login failed. Please try again.",
        "error",
      );
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate("/admin");
    addToast("Logged out successfully", "success");
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/admin-dashboard" || path === "/admin")
      return "Dashboard Overview";
    if (path.includes("contributors")) return "Contributor Management";
    if (path.includes("comments")) return "Comment Moderation";
    if (path.includes("announcements")) return "Announcements";
    if (path.includes("blogs")) return "Blog Management";
    if (path.includes("ads")) return "Ads & Promotions";
    return "Admin Dashboard";
  };

  // ── Login Screen ────────────────────────────────────────────────────────────
  if (
    !isAuthenticated &&
    (location.pathname === "/admin" || location.pathname === "/admin/")
  ) {
    return (
      <div className="admin-login-wrapper">
        <div className="admin-login-box">
          <h2 style={{ marginBottom: "20px", textAlign: "center" }}>
            Admin Login
          </h2>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn-primary"
              style={{ width: "100%", marginTop: "10px" }}
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Authenticated layout ────────────────────────────────────────────────────
  const isContributor = role === "contributor";

  return (
    <div className="admin-container">
      <AdminSidebar
        onLogout={handleLogout}
        role={role}
        permissions={permissions}
        badges={badges}
      />
      <main className="admin-main">
        <header className="admin-header">
          <div className="header-title">
            <h2>{getPageTitle()}</h2>
          </div>

          <div
            className="header-user"
            onClick={() => setShowDropdown((prev) => !prev)}
            ref={dropdownRef}
            style={{
              padding: "8px",
              background: "#fff",
              border: "1.5px solid var(--slate-200)",
              borderRadius: "40px",
              boxShadow: "var(--shadow-sm)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <div className="user-avatar-circle">
              {adminData.profile_image ? (
                <img src={adminData.profile_image} alt="Avatar" />
              ) : (
                (adminData.full_name || adminData.username || "A")
                  .charAt(0)
                  .toUpperCase()
              )}
            </div>

            <div className="user-meta" style={{ display: "block" }}>
              <div className="user-name">
                {adminData.full_name || adminData.username}
              </div>
              <div className="user-role">{role}</div>
            </div>

            <LuChevronDown
              className={`chevron-icon ${showDropdown ? "rotate" : ""}`}
              style={{
                color: "var(--slate-400)",
                fontSize: "1.2rem",
                transition: "transform 0.3s ease",
                transform: showDropdown ? "rotate(180deg)" : "rotate(0)",
              }}
            />

            {showDropdown && (
              <div
                className="profile-dropdown-menu"
                onClick={(e) => e.stopPropagation()}
              >
                {isAuthenticated && (
                  <button
                    className="dropdown-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDropdown(false);
                      setShowProfileModal(true);
                    }}
                    style={{
                      border: "none",
                      background: "none",
                      padding: "10px 16px",
                      width: "100%",
                      textAlign: "left",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontFamily: "inherit",
                      fontSize: "0.875rem",
                      color: "#475569",
                    }}
                  >
                    <LuUser /> Profile
                  </button>
                )}
                <button
                  className="dropdown-item"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDropdown(false);
                    setShowPasswordModal(true);
                  }}
                >
                  <LuKey /> Reset Password
                </button>
                <button
                  className="dropdown-item logout"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLogout();
                  }}
                >
                  <LuLogOut /> Logout
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="admin-content">
          {/* Route through Outlet for both admin and contributor */}
          <Outlet />
        </div>
      </main>

      <ProfileEditModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onUpdate={fetchProfile}
      />
      <ResetPasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  );
};

export default AdminLayout;
