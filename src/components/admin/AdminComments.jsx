import React, { useState, useEffect } from "react";
import "../../css/AdminDashboard.css";
import useScrollLock from "../../hooks/useScrollLock";
// import { API_BASE_URL } from "../../config";
import ActionMenu from "./ActionMenu";
import { useToast } from "../../context/ToastContext";
import { useConfirm } from "../../context/ConfirmationContext";

const AdminComments = () => {
  const [comments, setComments] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [editingComment, setEditingComment] = useState(null);
  const [viewingComment, setViewingComment] = useState(null);
  const [editText, setEditText] = useState("");
  const { addToast } = useToast();
  const { openConfirm } = useConfirm();

  useScrollLock(!!editingComment);

  const fetchComments = async () => {
    try {
      const res = await fetch("/api/admin/comments");
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Fetch comments failed", error);
      addToast("Failed to fetch comments", "error");
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch("/api/admin/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        fetchComments();
        addToast(`Comment ${newStatus} successfully`, "success");
      } else {
        addToast("Failed to update status", "error");
      }
    } catch (error) {
      console.error("Status update failed", error);
      addToast("Error updating status", "error");
    }
  };

  const handleEdit = (comment) => {
    setEditingComment(comment);
    setEditText(comment.text);
  };

  const handleView = (comment) => {
    setViewingComment(comment);
  };

  const handleSaveEdit = async () => {
    try {
      const res = await fetch("/api/admin/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingComment.id,
          action: "edit",
          content: editText,
        }),
      });
      if (res.ok) {
        setEditingComment(null);
        setEditText("");
        fetchComments();
        addToast("Comment updated successfully", "success");
      } else {
        addToast("Failed to update comment", "error");
      }
    } catch (error) {
      console.error("Edit failed", error);
      addToast("Error updating comment", "error");
    }
  };

  const handleDelete = (id) => {
    openConfirm({
      title: "Delete Comment?",
      message: "Are you sure you want to delete this comment?",
      confirmText: "Delete",
      isDanger: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/comments?id=${id}`, {
            method: "DELETE",
          });
          if (res.ok) {
            fetchComments();
            addToast("Comment deleted successfully", "success");
          } else {
            addToast("Failed to delete comment", "error");
          }
        } catch (error) {
          console.error("Delete failed", error);
          addToast("Error deleting comment", "error");
        }
      },
    });
  };

  const filteredComments = comments.filter((c) => {
    if (filter === "all") return true;
    return c.status === filter;
  });

  return (
    <div className="admin-content">
      <div className="admin-header-actions">
        <div className="admin-title-group">
          <h2>Comments</h2>
          <button className="btn-primary" onClick={fetchComments}>
            <i className="bi bi-arrow-clockwise"></i> Refresh
          </button>
        </div>
        <div className="filter-group">
          <button
            className={`btn-filter ${filter === "pending" ? "active" : ""}`}
            onClick={() => setFilter("pending")}
          >
            Pending
          </button>
          <button
            className={`btn-filter ${filter === "approved" ? "active" : ""}`}
            onClick={() => setFilter("approved")}
          >
            Approved
          </button>
          <button
            className={`btn-filter ${filter === "rejected" ? "active" : ""}`}
            onClick={() => setFilter("rejected")}
          >
            Rejected
          </button>
          <button
            className={`btn-filter ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="text-left col-author">Author / Email</th>
                <th className="text-left col-content">Comment</th>
                <th className="text-left col-post">Post</th>
                <th className="text-left col-date">Date</th>
                <th className="col-status">Status</th>
                <th className="col-actions text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredComments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">
                    No {filter !== "all" ? filter : ""} comments found
                  </td>
                </tr>
              ) : (
                filteredComments.map((comment) => (
                  <tr key={comment.id}>
                    <td className="text-left col-author">
                      <div className="author-info">
                        <span className="author-name">{comment.author}</span>
                        {comment.email && (
                          <span className="author-email" title={comment.email}>
                            {comment.email}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="text-left col-content">
                      {comment.parent_id && (
                        <div className="reply-indicator">
                          <span className="badge-reply">
                            Reply to #{comment.parent_id}
                          </span>
                        </div>
                      )}
                      <div
                        className="comment-text-truncate"
                        title={comment.text}
                      >
                        {comment.text}
                      </div>
                      {comment.edited_at && (
                        <small className="edited-indicator">
                          (Edited:{" "}
                          {new Date(comment.edited_at).toLocaleDateString(
                            "en-US",
                            { month: "long", day: "numeric", year: "numeric" },
                          )}
                          )
                        </small>
                      )}
                    </td>
                    <td className="text-left col-post">
                      {comment.slug ? (
                        <span className="col-post-truncate">
                          <a
                            href={`/blogs/${comment.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="post-link"
                            title={comment.slug}
                          >
                            View Post
                          </a>
                        </span>
                      ) : (
                        <span className="post-id-fallback">
                          ID: {comment.post_id}
                        </span>
                      )}
                    </td>
                    <td className="text-left col-date">
                      <span className="comment-date">
                        {new Date(comment.date).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </td>
                    <td className="col-status">
                      <span
                        className={`status-badge status-${comment.status || "pending"}`}
                      >
                        {comment.status || "pending"}
                      </span>
                    </td>
                    <td className="col-actions text-center">
                      <ActionMenu>
                        {comment.status !== "approved" && (
                          <button
                            className="btn-approve"
                            onClick={() =>
                              handleStatusChange(comment.id, "approved")
                            }
                          >
                            Approve
                          </button>
                        )}

                        {/* Show Reject button only if not approved and not rejected */}
                        {comment.status !== "approved" &&
                          comment.status !== "rejected" && (
                            <button
                              className="btn-reject"
                              onClick={() =>
                                handleStatusChange(comment.id, "rejected")
                              }
                            >
                              Reject
                            </button>
                          )}

                        {/* Always show View/Edit regardless of tab */}
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(comment)}
                        >
                          View/Edit
                        </button>

                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(comment.id)}
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

      {/* Edit Modal */}
      {editingComment && (
        <div className="modal-overlay" onClick={() => setEditingComment(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Comment</h3>
              <button
                className="modal-close-btn"
                onClick={() => setEditingComment(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body" data-lenis-prevent>
              <div className="form-group">
                <label className="form-label">
                  Author Info: <strong>{editingComment.author}</strong>{" "}
                  {editingComment.email && `<${editingComment.email}>`}
                </label>
              </div>
              <div className="form-group">
                <label className="form-label">Target Post:</label>
                {editingComment.slug ? (
                  <a
                    href={`/blogs/${editingComment.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="post-link"
                    style={{ display: "block", marginTop: "4px" }}
                  >
                    View Post: {editingComment.slug}
                  </a>
                ) : (
                  <span className="post-id-fallback">
                    Internal ID: {editingComment.post_id}
                  </span>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Comment Text</label>
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows="5"
                  className="form-control"
                />
              </div>
              {editingComment.original_text && (
                <div className="form-group">
                  <label className="form-label">Original Text</label>
                  <p
                    style={{
                      background: "#f3f4f6",
                      padding: "8px",
                      borderRadius: "4px",
                      fontSize: "0.9rem",
                    }}
                  >
                    {editingComment.original_text}
                  </p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setEditingComment(null)}
              >
                Cancel
              </button>
              <button className="btn-primary" onClick={handleSaveEdit}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Comment Modal */}
      {viewingComment && (
        <div className="modal-overlay" onClick={() => setViewingComment(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>View Comment</h3>
              <button
                className="modal-close-btn"
                onClick={() => setViewingComment(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body" data-lenis-prevent>
              <div className="comment-view-details">
                <div className="view-group">
                  <label>Author</label>
                  <p>{viewingComment.author}</p>
                </div>
                {viewingComment.email && (
                  <div className="view-group">
                    <label>Email</label>
                    <p>{viewingComment.email}</p>
                  </div>
                )}
                <div className="view-group">
                  <label>Full Comment</label>
                  <div className="full-comment-content">
                    {viewingComment.text}
                  </div>
                </div>
                <div className="view-meta-grid">
                  <div className="view-group">
                    <label>Post ID</label>
                    <p>{viewingComment.post_id}</p>
                  </div>
                  <div className="view-group">
                    <label>Date</label>
                    <p>
                      {new Date(viewingComment.date).toLocaleDateString(
                        "en-US",
                        { month: "long", day: "numeric", year: "numeric" },
                      )}
                    </p>
                  </div>
                  <div className="view-group">
                    <label>Status</label>
                    <span
                      className={`status-badge status-${viewingComment.status}`}
                    >
                      {viewingComment.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-primary"
                onClick={() => setViewingComment(null)}
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

export default AdminComments;
