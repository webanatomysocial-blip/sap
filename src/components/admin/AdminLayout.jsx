import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import "../../css/AdminDashboard.css";
import "../../css/admin-profile.css";

import { useToast } from "../../context/ToastContext";
import { LuChevronDown, LuUser, LuKey, LuLogOut } from "react-icons/lu";
import ProfileEditModal from "./ProfileEditModal";
import ResetPasswordModal from "./ResetPasswordModal";
import { getAdminProfile } from "../../services/api";

const AdminLayout = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [adminData, setAdminData] = useState({
    full_name: "",
    username: "",
    profile_image: "",
  });

  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();

  useEffect(() => {
    const auth = localStorage.getItem("adminAuth");
    if (auth === "true") {
      setIsAuthenticated(true);
      fetchProfile();
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      const response = await axios.post("/api/login", {
        username,
        password,
      });

      if (response.data.status === "success") {
        addToast("Login successful! Redirecting...", "success");
        localStorage.setItem("adminAuth", "true");
        localStorage.setItem("adminUser", JSON.stringify(response.data.user));
        if (response.data.csrf_token) {
          localStorage.setItem("csrf_token", response.data.csrf_token);
        }

        // Small delay to show success message
        setTimeout(() => {
          setIsAuthenticated(true);
          fetchProfile();
        }, 800);
      }
    } catch (error) {
      addToast(
        error.response?.data?.message || "Login failed. Please try again.",
        "error",
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    localStorage.removeItem("adminUser");
    localStorage.removeItem("csrf_token");
    setIsAuthenticated(false);
    navigate("/");
    addToast("Logged out successfully", "success");
  };

  const handleProfileUpdate = (newImage) => {
    fetchProfile();
  };

  // Map routes to titles
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

  if (!isAuthenticated) {
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

  return (
    <div className="admin-container">
      <AdminSidebar onLogout={handleLogout} />
      <main className="admin-main">
        <header className="admin-header">
          <div className="header-title">
            <h2>{getPageTitle()}</h2>
          </div>

          <div
            className="header-user"
            onClick={() => setShowDropdown((prev) => !prev)}
            ref={dropdownRef}
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
            <div className="user-meta">
              <span className="user-name">
                {adminData.full_name || adminData.username || "Admin User"}
              </span>
              <span className="user-role">Super Admin</span>
            </div>
            <LuChevronDown
              className={`chevron-icon ${showDropdown ? "rotate" : ""}`}
            />

            {showDropdown && (
              <div
                className="profile-dropdown-menu"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="dropdown-item"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDropdown(false);
                    setShowProfileModal(true);
                  }}
                >
                  <LuUser /> Profile
                </button>
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
          <Outlet />
        </div>
      </main>

      <ProfileEditModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onUpdate={handleProfileUpdate}
      />
      <ResetPasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  );
};

export default AdminLayout;
