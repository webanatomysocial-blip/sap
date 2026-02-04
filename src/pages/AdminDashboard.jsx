import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import "../css/AdminDashboard.css"; // We will create this

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);

  const ADMIN_PIN = "1234"; // Simple frontend protection as requested

  const handleLogin = (e) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      setIsAuthenticated(true);
      fetchApplications();
    } else {
      alert("Incorrect PIN");
    }
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin_applications.php");
      const data = await response.json();
      setApplications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to approve this applicant? An email will be sent.",
      )
    )
      return;

    try {
      const response = await fetch("/api/approve_contributor.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = await response.json();

      if (response.ok && result.status === "success") {
        alert("Application Approved. Email Sent.");
        // Refresh list
        fetchApplications();
      } else {
        alert("Error: " + result.message);
      }
    } catch (error) {
      console.error("Error approving:", error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div
        className="admin-login-container"
        style={{ padding: "100px", textAlign: "center" }}
      >
        <h2>Admin Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Enter PIN"
            style={{ padding: "10px", fontSize: "16px", marginRight: "10px" }}
          />
          <button type="submit" style={{ padding: "10px 20px" }}>
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div
      className="admin-dashboard container"
      style={{ paddingTop: "40px", paddingBottom: "80px" }}
    >
      <Helmet>
        <title>Admin Dashboard | SAP Security Expert</title>
      </Helmet>

      <h1>Contributor Applications</h1>
      <button
        onClick={fetchApplications}
        className="btn-refresh"
        style={{ marginBottom: "20px" }}
      >
        Refresh List
      </button>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="table-responsive">
          <table
            className="admin-table"
            style={{ width: "100%", borderCollapse: "collapse" }}
          >
            <thead>
              <tr style={{ background: "#f1f5f9", textAlign: "left" }}>
                <th style={{ padding: "12px" }}>ID</th>
                <th style={{ padding: "12px" }}>Name</th>
                <th style={{ padding: "12px" }}>Role</th>
                <th style={{ padding: "12px" }}>Status</th>
                <th style={{ padding: "12px" }}>Date</th>
                <th style={{ padding: "12px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {applications.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{ padding: "20px", textAlign: "center" }}
                  >
                    No applications found.
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr
                    key={app.id}
                    style={{ borderBottom: "1px solid #e2e8f0" }}
                  >
                    <td style={{ padding: "12px" }}>{app.id}</td>
                    <td style={{ padding: "12px" }}>
                      <strong>{app.name}</strong>
                      <br />
                      <small>{app.email}</small>
                      <br />
                      <a
                        href={app.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: "0.8rem" }}
                      >
                        LinkedIn
                      </a>
                    </td>
                    <td style={{ padding: "12px" }}>{app.role}</td>
                    <td style={{ padding: "12px" }}>
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          background:
                            app.status === "approved" ? "#dcfce7" : "#fef9c3",
                          color:
                            app.status === "approved" ? "#166534" : "#854d0e",
                        }}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td style={{ padding: "12px" }}>
                      {new Date(app.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {app.status === "pending" && (
                        <button
                          onClick={() => handleApprove(app.id)}
                          style={{
                            background: "#2563eb",
                            color: "white",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
