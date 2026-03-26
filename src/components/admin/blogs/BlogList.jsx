import React, { useState } from "react";
import ActionMenu from "../ActionMenu";
import {
  recalculatePlagiarism,
  toggleExclusiveContent,
} from "../../../services/api";
import { useToast } from "../../../context/ToastContext";

const BlogList = ({
  blogs,
  setBlogs,
  onEdit,
  onDelete,
  formatDate,
  getScoreColor,
}) => {
  const [recalculating, setRecalculating] = useState({});
  const [togglingMap, setTogglingMap] = useState({});
  const { addToast } = useToast();

  const handleRecalculate = async (blogId) => {
    setRecalculating((prev) => ({ ...prev, [blogId]: true }));
    try {
      const res = await recalculatePlagiarism(blogId);
      if (res.data.status === "success") {
        const newScore = res.data.plagiarism_score;
        addToast("Plagiarism score updated successfully.", "success");
        setBlogs((prev) =>
          prev.map((b) =>
            b.id === blogId ? { ...b, plagiarism_score: newScore } : b,
          ),
        );
      } else {
        addToast(res.data.message || "Failed to recalculate.", "error");
        // Update local state to show 'Check Failed' if the score didn't change but the API reported error
        setBlogs((prev) =>
          prev.map((b) =>
            b.id === blogId ? { ...b, plagiarism_score: -1 } : b,
          ),
        );
      }
    } catch {
      addToast("Failed to recalculate plagiarism score.", "error");
      setBlogs((prev) =>
        prev.map((b) => (b.id === blogId ? { ...b, plagiarism_score: -1 } : b)),
      );
    } finally {
      setRecalculating((prev) => ({ ...prev, [blogId]: false }));
    }
  };

  const handleToggleExclusive = async (blog) => {
    const newVal = Number(blog.is_members_only) === 1 ? 0 : 1;
    setTogglingMap((prev) => ({ ...prev, [blog.id]: true }));
    try {
      const res = await toggleExclusiveContent({
        id: blog.id,
        is_members_only: newVal,
      });
      if (res.data?.status === "success") {
        addToast(
          `Exclusive content ${newVal ? "enabled" : "disabled"} successfully.`,
          "success",
        );
        setBlogs((prev) =>
          prev.map((b) =>
            b.id === blog.id ? { ...b, is_members_only: newVal } : b,
          ),
        );
      } else {
        addToast(
          res.data?.message || "Failed to update exclusive content",
          "error",
        );
      }
    } catch {
      addToast("Error updating exclusive content flag", "error");
    } finally {
      setTogglingMap((prev) => ({ ...prev, [blog.id]: false }));
    }
  };

  return (
    <div className="admin-card">
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th className="text-left col-title">Title</th>
              <th className="text-left">Slug</th>
              <th className="text-left">Status</th>
              <th className="text-left">Last Updated</th>
              <th className="text-center">Exclusive</th>
              <th className="text-center">SEO Score</th>
              <th className="text-center">Plagiarism Score</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {blogs.length === 0 ? (
              <tr>
                <td colSpan="7">No custom blogs found.</td>
              </tr>
            ) : (
              blogs.map((blog) => (
                <tr key={blog.id}>
                  <td className="text-left col-title">
                    <span
                      title={blog.title}
                      style={{
                        wordBreak: "break-word",
                        display: "block",
                        minWidth: "200px",
                      }}
                    >
                      {blog.title}
                    </span>
                    {/* Status Badges */}
                    {blog.submission_status === "edited" && (
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
                    {blog.submission_status === "submitted" && (
                      <span
                        className="pending-badge"
                        style={{
                          marginLeft: "10px",
                          fontSize: "0.7rem",
                          padding: "2px 6px",
                        }}
                      >
                        Pending Approval
                      </span>
                    )}
                    {blog.submission_status === "rejected" && (
                      <div
                        style={{
                          marginTop: "8px",
                          fontSize: "0.8rem",
                          color: "#991b1b",
                          background: "#fff1f2",
                          padding: "6px 10px",
                          borderRadius: "6px",
                          border: "1px solid #fecaca",
                          width: "fit-content",
                          maxWidth: "350px",
                        }}
                      >
                        <span style={{ fontWeight: "bold" }}>Reason:</span>{" "}
                        {blog.rejection_feedback || "No feedback provided."}
                      </div>
                    )}
                  </td>
                  <td className="text-left">
                    <code style={{ fontSize: "0.8rem", color: "#64748b" }}>
                      {blog.slug || "—"}
                    </code>
                  </td>
                  <td className="text-left">
                    {blog.status === "approved" ||
                    blog.status === "published" ? (
                      new Date(blog.date) > new Date() ? (
                        <span
                          style={{
                            background: "#eff6ff",
                            color: "#1e40af",
                            padding: "4px 8px",
                            borderRadius: "12px",
                            fontSize: "0.75rem",
                            fontWeight: "bold",
                          }}
                        >
                          Scheduled
                        </span>
                      ) : (
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
                      )
                    ) : blog.submission_status === "submitted" ||
                      blog.submission_status === "edited" ? (
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
                      {formatDate(blog.date)}
                    </span>
                  </td>
                  <td className="text-center">
                    <label
                      className={`toggle-switch ${togglingMap[blog.id] ? "toggle-loading" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={Number(blog.is_members_only) === 1}
                        onChange={() => handleToggleExclusive(blog)}
                        disabled={togglingMap[blog.id]}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </td>
                  <td className="text-center">
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "6px",
                        fontSize: "0.8rem",
                        fontWeight: "600",
                        background: getScoreColor(blog.seo_score || 0).bg,
                        color: getScoreColor(blog.seo_score || 0).text,
                      }}
                    >
                      {blog.seo_score || 0}
                    </span>
                  </td>
                  <td className="text-center">
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: "6px",
                        fontSize: "0.8rem",
                        fontWeight: "600",
                        background:
                          blog.plagiarism_score === -1
                            ? "#fee2e2"
                            : blog.plagiarism_score >= 95
                              ? "#dcfce7"
                              : blog.plagiarism_score >= 85
                                ? "#ffedd5"
                                : blog.plagiarism_score > 0
                                  ? "#fee2e2"
                                  : "#f1f5f9",
                        color:
                          blog.plagiarism_score === -1
                            ? "#991b1b"
                            : blog.plagiarism_score >= 95
                              ? "#166534"
                              : blog.plagiarism_score >= 85
                                ? "#c2410c"
                                : blog.plagiarism_score > 0
                                  ? "#991b1b"
                                  : "#64748b",
                      }}
                    >
                      {recalculating[blog.id]
                        ? "Updating..."
                        : blog.plagiarism_score === -1
                          ? "Check Failed"
                          : blog.plagiarism_score > 0
                            ? `${blog.plagiarism_score}%`
                            : "Not Checked"}
                    </span>
                  </td>
                  <td className="text-center">
                    <ActionMenu>
                      <button
                        className="action-menu-item"
                        onClick={() => onEdit(blog)}
                      >
                        <i className="bi bi-pencil-square"></i> Edit
                      </button>
                      <button
                        className="action-menu-item"
                        onClick={() => handleRecalculate(blog.id)}
                        disabled={recalculating[blog.id]}
                      >
                        <i
                          className={`bi ${recalculating[blog.id] ? "bi-hourglass-split" : "bi-shield-check"}`}
                        ></i>{" "}
                        {recalculating[blog.id]
                          ? "Recalculating..."
                          : "Recalculate Plagiarism"}
                      </button>
                      <div className="action-menu-separator"></div>
                      <button
                        className="action-menu-item danger"
                        onClick={() => onDelete(blog.id)}
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

export default BlogList;
