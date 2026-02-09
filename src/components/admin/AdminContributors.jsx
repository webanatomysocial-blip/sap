import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import "../../css/AdminDashboard.css";

const AdminContributors = () => {
  // Mock Data for Demo
  // No mock data needed, fetching from API
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null); // For modal details

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin_applications.php");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setApplications(data);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchApplications();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const response = await fetch("/api/update_contributor_status.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, status }),
      });
      const result = await response.json();
      if (result.status === "success") {
        // Optimistic update or refresh
        setApplications((prev) =>
          prev.map((app) => (app.id === id ? { ...app, status } : app)),
        );
        setSelectedApp(null);
        alert(`Application ${status}.`);
      } else {
        alert("Failed to update status: " + result.message);
      }
    } catch (error) {
      console.error(`Error updating status to ${status}:`, error);
      alert("Network error.");
    }
  };

  const handleApprove = (id) => {
    if (window.confirm("Are you sure you want to approve this applicant?")) {
      updateStatus(id, "approved");
    }
  };

  const handleReject = (id) => {
    if (window.confirm("Are you sure you want to reject this applicant?")) {
      updateStatus(id, "rejected");
    }
  };

  return (
    <div className="admin-contributors-view">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <h3>Pending Requests</h3>
        <button
          onClick={fetchApplications}
          className="btn-refresh"
          style={{ padding: "8px 16px", cursor: "pointer" }}
        >
          <i className="bi bi-arrow-clockwise"></i> Refresh
        </button>
      </div>

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
                    </td>
                    <td style={{ padding: "12px" }}>{app.role}</td>
                    <td style={{ padding: "12px" }}>
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          background:
                            app.status === "approved"
                              ? "#dcfce7"
                              : app.status === "rejected"
                                ? "#fee2e2"
                                : "#fef9c3",
                          color:
                            app.status === "approved"
                              ? "#166534"
                              : app.status === "rejected"
                                ? "#991b1b"
                                : "#854d0e",
                        }}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td style={{ padding: "12px" }}>
                      {new Date(app.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <button
                        onClick={() => setSelectedApp(app)}
                        style={{
                          marginRight: "8px",
                          padding: "6px 12px",
                          background: "#64748b",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                        }}
                      >
                        View
                      </button>
                      {app.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(app.id)}
                            style={{
                              marginRight: "8px",
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
                          <button
                            onClick={() => handleReject(app.id)}
                            style={{
                              background: "#ef4444",
                              color: "white",
                              border: "none",
                              padding: "6px 12px",
                              borderRadius: "4px",
                              cursor: "pointer",
                            }}
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Details Modal */}
      {selectedApp && (
        <div className="modal-overlay">
          <div
            className="modal-content"
            style={{ maxWidth: "800px", width: "95%" }}
          >
            <div className="modal-header">
              <h2>Application Details: {selectedApp.name}</h2>
              <button
                className="close-modal"
                onClick={() => setSelectedApp(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body-scroll">
              <div
                className="detail-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                }}
              >
                <div>
                  <strong>Email:</strong> {selectedApp.email}
                </div>
                <div>
                  <strong>LinkedIn:</strong>{" "}
                  <a
                    href={selectedApp.linkedin}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {selectedApp.linkedin}
                  </a>
                </div>
                <div>
                  <strong>Country:</strong> {selectedApp.country}
                </div>
                <div>
                  <strong>Organization:</strong> {selectedApp.organization}
                </div>
                <div>
                  <strong>Designation:</strong> {selectedApp.designation}
                </div>
                <div>
                  <strong>Role Applied:</strong> {selectedApp.role}
                </div>
                <div>
                  <strong>Experience:</strong> {selectedApp.years_experience}
                </div>
                <div>
                  <strong>Weekly Time:</strong> {selectedApp.weekly_time}
                </div>
                <div>
                  <strong>Volunteer for Events?</strong>{" "}
                  {selectedApp.volunteer_events}
                </div>
                <div>
                  <strong>Product Eval?</strong>{" "}
                  {selectedApp.product_evaluation}
                </div>
                <div>
                  <strong>Frequency:</strong> {selectedApp.preferred_frequency}
                </div>
                <div>
                  <strong>Motivation:</strong> {selectedApp.primary_motivation}
                </div>
              </div>

              <div style={{ marginTop: "20px" }}>
                <strong>Expertise:</strong>
                <pre
                  style={{
                    background: "#f8fafc",
                    padding: "10px",
                    borderRadius: "4px",
                  }}
                >
                  {typeof selectedApp.expertise === "string"
                    ? JSON.stringify(JSON.parse(selectedApp.expertise), null, 2)
                    : JSON.stringify(selectedApp.expertise, null, 2)}
                </pre>
              </div>

              <div style={{ marginTop: "20px" }}>
                <strong>Contribution Types:</strong>
                <pre
                  style={{
                    background: "#f8fafc",
                    padding: "10px",
                    borderRadius: "4px",
                  }}
                >
                  {typeof selectedApp.contribution_types === "string"
                    ? JSON.stringify(
                        JSON.parse(selectedApp.contribution_types),
                        null,
                        2,
                      )
                    : JSON.stringify(selectedApp.contribution_types, null, 2)}
                </pre>
              </div>

              {selectedApp.proposed_topics && (
                <div style={{ marginTop: "20px" }}>
                  <strong>Proposed Topics:</strong>
                  <p>{selectedApp.proposed_topics}</p>
                </div>
              )}

              {selectedApp.message && (
                <div style={{ marginTop: "20px" }}>
                  <strong>Bio/Message:</strong>
                  <p>{selectedApp.message}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setSelectedApp(null)}
                className="btn-text-only"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContributors;
