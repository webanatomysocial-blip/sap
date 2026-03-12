import React from "react";
import ActionMenu from "../ActionMenu";

const AnnouncementList = ({
  announcements,
  onEdit,
  onDelete,
  onReview,
  formatDate,
}) => {
  return (
    <div className="admin-card">
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th className="text-left">Title</th>
              <th className="text-left">Status</th>
              <th className="text-left">Last Updated</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {announcements.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center">
                  No announcements found.
                </td>
              </tr>
            ) : (
              announcements.map((item) => (
                <tr key={item.id}>
                  <td className="text-left">
                    {item.title}
                    {item.submission_status === "edited" && (
                      <span
                        className="pending-badge"
                        style={{
                          marginLeft: "10px",
                          fontSize: "0.7rem",
                          padding: "2px 6px",
                          background: "#fef3c7",
                          color: "#d97706",
                        }}
                      >
                        Edited — Pending Approval
                      </span>
                    )}
                  </td>
                  <td className="text-left">
                    {/* ... (Status badges) ... */}
                    {item.status === "approved" ||
                    item.status === "published" ||
                    item.status === "active" ? (
                      <span
                        style={{
                          background: "#dcfce7",
                          color: "#166534",
                          padding: "4px 8px",
                          borderRadius: "12px",
                          fontSize: "0.75rem",
                          fontWeight: "bold",
                        }}
                      >
                        Live
                      </span>
                    ) : item.submission_status === "edited" ? (
                      <span
                        style={{
                          background: "#fef9c3",
                          color: "#854d0e",
                          padding: "4px 8px",
                          borderRadius: "12px",
                          fontSize: "0.75rem",
                          fontWeight: "bold",
                        }}
                      >
                        Pending
                      </span>
                    ) : (
                      <span
                        style={{
                          background: "#f1f5f9",
                          color: "#64748b",
                          padding: "4px 8px",
                          borderRadius: "12px",
                          fontSize: "0.75rem",
                          fontWeight: "bold",
                        }}
                      >
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="text-left">
                    <span
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--slate-500)",
                        fontWeight: "500",
                      }}
                    >
                      {formatDate(item.date)}
                    </span>
                  </td>
                  <td className="text-center">
                    <ActionMenu>
                      {item.submission_status === "edited" && (
                        <>
                          <button
                            className="action-menu-item success"
                            onClick={() => onReview(item.id, "approve")}
                            style={{ color: "var(--success-green)" }}
                          >
                            <i className="bi bi-check-circle"></i> Approve Edit
                          </button>
                          <button
                            className="action-menu-item danger"
                            onClick={() => onReview(item.id, "reject")}
                          >
                            <i className="bi bi-x-circle"></i> Reject Edit
                          </button>
                          <div className="action-menu-separator"></div>
                        </>
                      )}
                      <button
                        className="action-menu-item"
                        onClick={() => onEdit(item)}
                      >
                        <i className="bi bi-pencil-square"></i> Edit
                      </button>
                      <div className="action-menu-separator"></div>
                      <button
                        className="action-menu-item danger"
                        onClick={() => onDelete(item.id)}
                      >
                        <i className="bi bi-trash"></i> Delete
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
  );
};

export default AnnouncementList;
