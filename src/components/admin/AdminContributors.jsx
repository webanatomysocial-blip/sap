import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import "../../css/AdminDashboard.css";
// import { API_BASE_URL } from "../../config";
import ActionMenu from "./ActionMenu";
import useScrollLock from "../../hooks/useScrollLock";
import { useToast } from "../../context/ToastContext";
import { useConfirm } from "../../context/ConfirmationContext";

const AdminContributors = () => {
  // Mock Data for Demo
  // No mock data needed, fetching from API
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null); // For modal details
  const { addToast } = useToast();
  const { openConfirm } = useConfirm();

  useScrollLock(!!selectedApp);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/contributors");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setApplications(data);
    } catch (error) {
      console.error("Error fetching applications:", error);
      addToast("Failed to fetch applications", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const response = await fetch("/api/admin/contributors", {
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
        addToast(`Application ${status}.`, "success");
      } else {
        addToast("Failed to update status: " + result.message, "error");
      }
    } catch (error) {
      console.error(`Error updating status to ${status}:`, error);
      addToast("Network error.", "error");
    }
  };

  const handleDelete = (id) => {
    openConfirm({
      title: "Delete Contributor?",
      message: "Are you sure you want to PERMANENTLY delete this contributor?",
      confirmText: "Delete",
      isDanger: true,
      onConfirm: async () => {
        try {
          const response = await fetch("/api/delete_contributor.php", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id }),
          });
          const result = await response.json();
          if (result.status === "success") {
            setApplications((prev) => prev.filter((app) => app.id !== id));
            if (selectedApp && selectedApp.id === id) {
              setSelectedApp(null);
            }
            addToast("Contributor deleted.", "success");
          } else {
            addToast("Failed to delete: " + result.message, "error");
          }
        } catch (error) {
          console.error("Error deleting contributor:", error);
          addToast("Network error.", "error");
        }
      },
    });
  };

  const handleApprove = (id) => {
    openConfirm({
      title: "Approve Applicant",
      message: "Are you sure you want to approve this applicant?",
      confirmText: "Approve",
      onConfirm: () => updateStatus(id, "approved"),
    });
  };

  const handleReject = (id) => {
    openConfirm({
      title: "Reject Applicant",
      message: "Are you sure you want to reject this applicant?",
      confirmText: "Reject",
      isDanger: true,
      onConfirm: () => updateStatus(id, "rejected"),
    });
  };

  return (
    <div className="admin-page-wrapper">
      <div className="page-header">
        <h3>Contributor Management</h3>
        <button onClick={fetchApplications} className="btn-primary">
          <i className="bi bi-arrow-clockwise"></i> Refresh
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="admin-card">
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="col-name text-left">Name</th>
                  <th className="col-role text-left">Role</th>
                  <th className="col-status">Status</th>
                  <th className="col-date text-left">Date</th>
                  <th className="col-actions text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center">
                      No applications found.
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr key={app.id}>
                      <td className="col-name text-left">
                        <strong>{app.name}</strong>
                        <br />
                        <small>{app.email}</small>
                      </td>
                      <td className="col-role text-left">{app.role}</td>
                      <td className="col-status">
                        <span className={`status-badge status-${app.status}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="col-date text-left">
                        {new Date(app.created_at).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="col-actions text-center">
                        <ActionMenu>
                          <button
                            onClick={() => setSelectedApp(app)}
                            className="btn-view"
                          >
                            View
                          </button>

                          {app.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleApprove(app.id)}
                                className="btn-approve"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(app.id)}
                                className="btn-reject"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => handleDelete(app.id)}
                            className="btn-delete"
                          >
                            Delete
                          </button>
                        </ActionMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedApp && (
        <div className="modal-overlay" onClick={() => setSelectedApp(null)}>
          <div
            className="modal-container large"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 style={{ margin: 0 }}>Contributor Details</h2>
              <button
                className="modal-close-btn"
                onClick={() => setSelectedApp(null)}
              >
                ×
              </button>
            </div>

            <div className="modal-body" data-lenis-prevent>
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                {selectedApp.profile_image ? (
                  <img
                    src={selectedApp.profile_image}
                    alt={selectedApp.name}
                    style={{
                      width: "120px",
                      height: "120px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "4px solid #f1f5f9",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "120px",
                      height: "120px",
                      borderRadius: "50%",
                      background: "#e2e8f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto",
                      fontSize: "40px",
                      color: "#64748b",
                      border: "4px solid #f1f5f9",
                    }}
                  >
                    {selectedApp.name.charAt(0)}
                  </div>
                )}
                <h3
                  style={{
                    marginTop: "15px",
                    marginBottom: "5px",
                    fontSize: "1.5rem",
                  }}
                >
                  {selectedApp.name}
                </h3>
                <span className={`status-badge status-${selectedApp.status}`}>
                  {selectedApp.status}
                </span>
              </div>

              <div
                className="detail-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <strong>Email:</strong>
                  <div style={{ color: "#475569" }}>{selectedApp.email}</div>
                </div>
                <div>
                  <strong>Role:</strong>
                  <div style={{ color: "#475569" }}>{selectedApp.role}</div>
                </div>
                <div>
                  <strong>Joined:</strong>
                  <div style={{ color: "#475569" }}>
                    {new Date(selectedApp.created_at).toLocaleDateString(
                      "en-US",
                      { month: "long", day: "numeric", year: "numeric" },
                    )}
                  </div>
                </div>
                <div>
                  <strong>Organization:</strong>
                  <div style={{ color: "#475569" }}>
                    {selectedApp.organization || "N/A"}
                  </div>
                </div>
                <div>
                  <strong>Designation:</strong>
                  <div style={{ color: "#475569" }}>
                    {selectedApp.designation || "N/A"}
                  </div>
                </div>
                <div>
                  <strong>Country:</strong>
                  <div style={{ color: "#475569" }}>
                    {selectedApp.country || "N/A"}
                  </div>
                </div>
                <div>
                  <strong>LinkedIn:</strong>
                  <div>
                    {selectedApp.linkedin ? (
                      <a
                        href={selectedApp.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: "#2563eb",
                          textDecoration: "underline",
                        }}
                      >
                        View Profile
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </div>
                </div>
                <div>
                  <strong>Experience:</strong>
                  <div style={{ color: "#475569" }}>
                    {selectedApp.years_experience || "N/A"} years
                  </div>
                </div>
                <div>
                  <strong>Weekly Availability:</strong>
                  <div style={{ color: "#475569" }}>
                    {selectedApp.weekly_time || "N/A"}
                  </div>
                </div>
                <div>
                  <strong>Preferred Frequency:</strong>
                  <div style={{ color: "#475569" }}>
                    {selectedApp.preferred_frequency || "N/A"}
                  </div>
                </div>
                <div>
                  <strong>Volunteer for Events:</strong>
                  <div style={{ color: "#475569" }}>
                    {selectedApp.volunteer_events || "N/A"}
                  </div>
                </div>
                <div>
                  <strong>Product Evaluation:</strong>
                  <div style={{ color: "#475569" }}>
                    {selectedApp.product_evaluation || "N/A"}
                  </div>
                </div>
                <div>
                  <strong>Personal Website:</strong>
                  <div>
                    {selectedApp.personal_website ? (
                      <a
                        href={selectedApp.personal_website}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "#2563eb" }}
                      >
                        Visit Data
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </div>
                </div>
                <div>
                  <strong>Twitter / X:</strong>
                  <div style={{ color: "#475569" }}>
                    {selectedApp.twitter_handle || "N/A"}
                  </div>
                </div>
                <div>
                  <strong>Contributed Elsewhere:</strong>
                  <div style={{ color: "#475569" }}>
                    {selectedApp.contributed_elsewhere || "N/A"}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <strong>Primary Motivation:</strong>
                <p
                  style={{
                    background: "#f8f9fa",
                    padding: "12px",
                    borderRadius: "6px",
                    marginTop: "5px",
                    color: "#334155",
                  }}
                >
                  {selectedApp.primary_motivation || "N/A"}
                </p>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <strong>Short Bio:</strong>
                <p
                  style={{
                    background: "#f8f9fa",
                    padding: "12px",
                    borderRadius: "6px",
                    marginTop: "5px",
                    lineHeight: "1.5",
                    color: "#334155",
                  }}
                >
                  {selectedApp.short_bio || "No bio provided."}
                </p>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <strong>Contribution Types:</strong>
                <div
                  style={{
                    background: "#f8f9fa",
                    padding: "12px",
                    borderRadius: "6px",
                    marginTop: "5px",
                    color: "#334155",
                  }}
                >
                  {(() => {
                    if (!selectedApp.contribution_types) return "None";
                    try {
                      const types =
                        typeof selectedApp.contribution_types === "string"
                          ? JSON.parse(selectedApp.contribution_types)
                          : selectedApp.contribution_types;
                      if (typeof types === "object" && !Array.isArray(types)) {
                        const active = Object.keys(types).filter(
                          (k) => types[k] === true,
                        );
                        return active.length > 0 ? active.join(", ") : "None";
                      }
                      return JSON.stringify(types);
                    } catch (e) {
                      return selectedApp.contribution_types;
                    }
                  })()}
                </div>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <strong>Proposed Topics:</strong>
                <p
                  style={{
                    background: "#f8f9fa",
                    padding: "12px",
                    borderRadius: "6px",
                    marginTop: "5px",
                    color: "#334155",
                  }}
                >
                  {selectedApp.proposed_topics || "N/A"}
                </p>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <strong>Expertise:</strong>
                <div
                  style={{
                    background: "#f8f9fa",
                    padding: "12px",
                    borderRadius: "6px",
                    marginTop: "5px",
                    color: "#334155",
                  }}
                >
                  {(() => {
                    if (!selectedApp.expertise) return "None listed";
                    try {
                      const exp =
                        typeof selectedApp.expertise === "string"
                          ? JSON.parse(selectedApp.expertise)
                          : selectedApp.expertise;

                      // If object with booleans (from new form)
                      if (!Array.isArray(exp) && typeof exp === "object") {
                        const active = Object.keys(exp).filter(
                          (k) => exp[k] === true,
                        );
                        return active.length > 0
                          ? active.join(", ")
                          : "None listed";
                      }

                      return Array.isArray(exp)
                        ? exp.join(", ")
                        : JSON.stringify(exp);
                    } catch (e) {
                      return selectedApp.expertise;
                    }
                  })()}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              {selectedApp.status !== "approved" && (
                <>
                  <button
                    className="btn-approve"
                    onClick={() => {
                      handleApprove(selectedApp.id);
                      setSelectedApp({ ...selectedApp, status: "approved" });
                    }}
                  >
                    Approve
                  </button>
                  {selectedApp.status !== "rejected" && (
                    <button
                      className="btn-reject"
                      onClick={() => {
                        handleReject(selectedApp.id);
                        setSelectedApp({ ...selectedApp, status: "rejected" });
                      }}
                    >
                      Reject
                    </button>
                  )}
                </>
              )}
              <button
                className="btn-delete"
                onClick={() => {
                  handleDelete(selectedApp.id);
                  setSelectedApp(null);
                }}
              >
                Delete
              </button>
              <button
                className="btn-cancel"
                onClick={() => setSelectedApp(null)}
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
