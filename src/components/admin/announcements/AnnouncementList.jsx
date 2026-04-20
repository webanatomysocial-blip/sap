import React from "react";
import ActionMenu from "../ActionMenu";
import TableScrollContainer from "../TableScrollContainer";

const AnnouncementList = ({
  announcements,
  onEdit,
  onDelete,
  onReview,
  formatDate,
}) => {
  return (
    <div className="admin-card">
      <TableScrollContainer>
        <table className="admin-table">
          <thead>
              <tr>
                <th className="col-xxl text-left">Title</th>
                <th className="col-sm text-center">Status</th>
                <th className="col-md text-left">Updated</th>
                <th className="col-actions text-center">Actions</th>
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
                  <td className="col-xxl text-left wrap-text">
                    <strong className="truncate-2" style={{ fontSize: "0.85rem" }}>{item.title}</strong>
                    {item.submission_status === "edited" && (
                      <span
                        className="pending-badge"
                        style={{
                          marginLeft: "10px",
                          fontSize: "0.65rem",
                          padding: "1px 5px",
                          background: "#fef3c7",
                          color: "#d97706",
                        }}
                      >
                        REV
                      </span>
                    )}
                  </td>
                  <td className="col-sm text-center">
                    {item.status === "approved" ||
                    item.status === "published" ||
                    item.status === "active" ? (
                      <span className="status-badge status-live" style={{ fontSize: "0.7rem", padding: "2px 6px" }}>Live</span>
                    ) : item.submission_status === "edited" ? (
                      <span className="status-badge status-pending" style={{ fontSize: "0.7rem", padding: "2px 6px" }}>Pnd</span>
                    ) : (
                      <span className="status-badge status-draft" style={{ fontSize: "0.7rem", padding: "2px 6px" }}>Drt</span>
                    )}
                  </td>
                  <td className="col-md text-left">
                    <span
                      style={{
                        fontSize: "0.80rem",
                        color: "var(--slate-500)",
                        fontWeight: "500",
                      }}
                    >
                      {formatDate(item.date)}
                    </span>
                  </td>
                  <td className="col-actions text-center">
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
      </TableScrollContainer>
    </div>
  );
};

export default AnnouncementList;
