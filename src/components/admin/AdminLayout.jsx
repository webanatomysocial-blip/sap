import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import "../../css/AdminDashboard.css";

import { useToast } from "../../context/ToastContext";

const AdminLayout = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();

  useEffect(() => {
    const auth = localStorage.getItem("adminAuth");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

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
        // Small delay to show success message
        setTimeout(() => {
          setIsAuthenticated(true);
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
    localStorage.removeItem("adminUser"); // Also remove the user data on logout
    setIsAuthenticated(false);
    navigate("/"); // Redirect to home on logout? Or login? User said "Logout -> Green toast".
    addToast("Logged out successfully", "success");
  };

  // Map routes to titles
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/admin-dashboard") return "Dashboard Overview";
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
          <div className="header-user">
            <div className="user-info">
              <span className="user-name">Admin User</span>
              <span className="user-role">Super Admin</span>
            </div>
            <div className="user-avatar">AD</div>
          </div>
        </header>

        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
