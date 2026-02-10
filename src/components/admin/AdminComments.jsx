import React, { useState, useEffect } from "react";
import "../../css/AdminDashboard.css";

const AdminComments = () => {
  const [comments, setComments] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState("");

  const fetchComments = async () => {
    try {
      const res = await fetch("/api/admin/comments");
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Fetch comments failed", error);
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
      }
    } catch (error) {
      console.error("Status update failed", error);
    }
  };

  const handleEdit = (comment) => {
    setEditingComment(comment);
    setEditText(comment.text);
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
      }
    } catch (error) {
      console.error("Edit failed", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        const res = await fetch(`/api/admin/comments?id=${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          fetchComments();
        }
      } catch (error) {
        console.error("Delete failed", error);
      }
    }
  };

  const filteredComments = comments.filter((c) => {
    if (filter === "all") return true;
    return c.status === filter;
  });

  return (
    <div className="admin-content">
      <div className="admin-header-actions">
        <h2>Comments</h2>
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
        <table className="admin-table">
          <thead>
            <tr>
              <th>Author</th>
              <th>Comment</th>
              <th>Post ID</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredComments.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  No {filter !== "all" ? filter : ""} comments found
                </td>
              </tr>
            ) : (
              filteredComments.map((comment) => (
                <tr key={comment.id}>
                  <td>{comment.author}</td>
                  <td>
                    <div style={{ maxWidth: "300px", wordBreak: "break-word" }}>
                      {comment.text}
                      {comment.edited_at && (
                        <small
                          style={{
                            display: "block",
                            color: "#888",
                            marginTop: "4px",
                          }}
                        >
                          (Edited:{" "}
                          {new Date(comment.edited_at).toLocaleDateString()})
                        </small>
                      )}
                    </div>
                  </td>
                  <td>{comment.post_id}</td>
                  <td>{new Date(comment.date).toLocaleDateString()}</td>
                  <td>
                    <span
                      className={`status-badge status-${comment.status || "pending"}`}
                    >
                      {comment.status || "pending"}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
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
                      {comment.status !== "rejected" && (
                        <button
                          className="btn-reject"
                          onClick={() =>
                            handleStatusChange(comment.id, "rejected")
                          }
                        >
                          Reject
                        </button>
                      )}
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(comment)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(comment.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingComment && (
        <div className="modal-overlay" onClick={() => setEditingComment(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Comment</h3>
              <button
                className="close-modal"
                onClick={() => setEditingComment(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Author: {editingComment.author}</label>
              </div>
              <div className="form-group">
                <label>Comment Text</label>
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows="5"
                  className="form-control"
                  style={{ width: "100%" }}
                />
              </div>
              {editingComment.original_text && (
                <div className="form-group">
                  <label>Original Text</label>
                  <p
                    style={{
                      background: "#f3f4f6",
                      padding: "8px",
                      borderRadius: "4px",
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
              <button className="btn-save" onClick={handleSaveEdit}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminComments;
