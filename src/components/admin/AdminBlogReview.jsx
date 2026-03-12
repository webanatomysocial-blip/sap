import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { LuFileText } from "react-icons/lu";
import { useToast } from "../../context/ToastContext";
import { useConfirm } from "../../context/ConfirmationContext";
import { useAuth } from "../../context/AuthContext";
import { getPendingBlogs, reviewBlog } from "../../services/api";
import BlogPreviewModal from "./BlogPreviewModal";
import ActionMenu from "./ActionMenu";
import "../../css/AdminDashboard.css";

/**
 * AdminBlogReview — Dedicated admin-only page for reviewing contributor blog submissions.
 * Route: /admin/blog-review
 * Redirects non-admins back to /admin.
 */
const AdminBlogReview = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState(null);
  const [previewBlog, setPreviewBlog] = useState(null);
  const [recalculating, setRecalculating] = useState({});
  const [activeTab, setActiveTab] = useState("pending"); // "pending" | "rejected"

  const { addToast } = useToast();
  const { openConfirm } = useConfirm();
  const { role, can } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Admins or those with can_review_blogs can access
    if (role && !can("can_review_blogs")) {
      navigate("/admin", { replace: true });
    }
  }, [role, can, navigate]);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPendingBlogs(activeTab);
      setBlogs(Array.isArray(res.data) ? res.data : []);
    } catch {
      addToast(`Failed to load ${activeTab} blogs.`, "error");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const handleApprove = (blog) => {
    openConfirm({
      title: "Approve Blog?",
      message: `Approve "${blog.title}" and publish it to the frontend?`,
      confirmText: "Approve",
      onConfirm: async () => {
        setReviewingId(blog.id);
        try {
          await reviewBlog(blog.id, "approve");
          addToast("Blog approved and published.", "success");
          setPreviewBlog(null);
          setBlogs((prev) => prev.filter((b) => b.id !== blog.id));
        } catch (err) {
          addToast(err.response?.data?.message || "Approval failed.", "error");
        } finally {
          setReviewingId(null);
        }
      },
    });
  };

  const getSeoLabel = (score) => {
    if (score >= 80) return "Good";
    if (score >= 60) return "Average";
    return "Poor";
  };

  const getScoreColor = (score) => {
    if (score >= 80) return { bg: "#dcfce7", text: "#166534" };
    if (score >= 60) return { bg: "#fef9c3", text: "#ca8a04" };
    return { bg: "#fee2e2", text: "#991b1b" };
  };

  const getPlagLabel = (score) => {
    if (score >= 95) return "Safe";
    if (score >= 85) return "Caution";
    return "Warning";
  };

  const getPlagColor = (score) => {
    if (score === null || score === undefined)
      return { bg: "#f1f5f9", text: "#64748b" };
    if (score >= 95) return { bg: "#dcfce7", text: "#166534" };
    if (score >= 85) return { bg: "#ffedd5", text: "#c2410c" };
    return { bg: "#fee2e2", text: "#991b1b" };
  };

  const handleRecalculate = async (blogId) => {
    setRecalculating((prev) => ({ ...prev, [blogId]: true }));
    try {
      const { recalculatePlagiarism } = await import("../../services/api");
      const res = await recalculatePlagiarism(blogId);
      if (res.data.status === "success") {
        const newScore = res.data.plagiarism_score;
        addToast("Plagiarism score updated.", "success");
        setBlogs((prev) =>
          prev.map((b) =>
            b.id === blogId ? { ...b, plagiarism_score: newScore } : b,
          ),
        );
      } else {
        addToast(res.data.message || "Failed to recalculate.", "error");
      }
    } catch (err) {
      addToast("Error during recalculation.", "error");
    } finally {
      setRecalculating((prev) => ({ ...prev, [blogId]: false }));
    }
  };

  const handleReject = (blog) => {
    openConfirm({
      title: "Reject Blog?",
      message: `Reject "${blog.title}"? The contributor will need to resubmit.`,
      confirmText: "Reject",
      isDanger: true,
      onConfirm: async () => {
        setReviewingId(blog.id);
        try {
          await reviewBlog(blog.id, "reject", reason); // Passing reason if any
          addToast("Blog rejected.", "error");
          setPreviewBlog(null);
          setBlogs((prev) => prev.filter((b) => b.id !== blog.id));
        } catch (err) {
          addToast(err.response?.data?.message || "Rejection failed.", "error");
        } finally {
          setReviewingId(null);
        }
      },
    });
  };

  const fmt = (d) => {
    if (!d) return "—";
    try {
      return new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return d;
    }
  };

  const truncate = (s, max = 75) =>
    s && s.length > max ? s.slice(0, max) + "…" : s || "—";
  const cap = (s) =>
    s ? s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "—";

  return (
    <div className="admin-page-wrapper">
      <div className="page-header">
        <div>
          <h3 style={{ margin: 0 }}>Blog Review</h3>
          <p
            style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "#64748b" }}
          >
            Contributor submissions awaiting admin review
          </p>
        </div>
        <div className="status-filter-tabs" style={{ margin: 0 }}>
          <button
            className={activeTab === "pending" ? "active" : ""}
            onClick={() => setActiveTab("pending")}
          >
            Pending Reviews
          </button>
          <button
            className={activeTab === "rejected" ? "active" : ""}
            onClick={() => setActiveTab("rejected")}
          >
            Rejected Content
          </button>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button
            className="btn-primary"
            onClick={fetchPending}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise"></i> Refresh
          </button>
        </div>
      </div>

      <div className="admin-card">
        {loading ? (
          <div
            style={{
              padding: "48px",
              textAlign: "center",
              color: "#94a3b8",
              fontSize: "0.875rem",
            }}
          >
            Loading...
          </div>
        ) : blogs.length === 0 ? (
          <div style={{ padding: "64px 24px", textAlign: "center" }}>
            <LuFileText
              style={{ fontSize: 40, color: "#cbd5e1", marginBottom: 12 }}
            />
            <h3
              style={{ margin: "0 0 6px", color: "#334155", fontSize: "1rem" }}
            >
              {activeTab === "pending"
                ? "No Pending Submissions"
                : "No Rejected Content"}
            </h3>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.875rem" }}>
              {activeTab === "pending"
                ? "All contributor blogs have been reviewed."
                : "There are no rejected blogs to display."}
            </p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table
              className="admin-table"
              style={{ tableLayout: "fixed", width: "100%" }}
            >
              <colgroup>
                <col style={{ width: "28%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "20%" }} />
              </colgroup>
              <thead>
                <tr>
                  <th className="text-left">Title / Author</th>
                  <th className="text-left">Category</th>
                  <th className="text-left">Date</th>
                  <th className="text-center">SEO</th>
                  <th className="text-center">Plag</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((blog) => (
                  <tr key={blog.id}>
                    <td className="text-left">
                      <div
                        style={{
                          fontWeight: 600,
                          color: "#1e293b",
                          fontSize: "0.875rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={blog.title}
                      >
                        {blog.title}
                      </div>
                      <div
                        style={{
                          color: "#94a3b8",
                          fontSize: "0.75rem",
                          marginTop: 2,
                        }}
                      >
                        by {blog.author_name || "Author"} •{" "}
                        <span
                          style={{
                            color:
                              blog.submission_status === "edited"
                                ? "#d97706"
                                : "#64748b",
                            fontWeight: 600,
                          }}
                        >
                          {blog.submission_status === "edited"
                            ? "Edited"
                            : "New"}
                        </span>
                      </div>
                    </td>
                    <td className="text-left">
                      <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                        {cap(blog.category)}
                      </span>
                    </td>
                    <td className="text-left">
                      <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                        {fmt(blog.date)}
                      </span>
                    </td>
                    <td className="text-center">
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: "6px",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          background: getScoreColor(blog.seo_score || 0).bg,
                          color: getScoreColor(blog.seo_score || 0).text,
                        }}
                        title={`${blog.seo_score}% - ${getSeoLabel(blog.seo_score || 0)}`}
                      >
                        {blog.seo_score || 0}
                      </span>
                    </td>
                    <td className="text-center">
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: "6px",
                          fontSize: "0.75rem",
                          fontWeight: "600",
                          background: getPlagColor(blog.plagiarism_score).bg,
                          color: getPlagColor(blog.plagiarism_score).text,
                        }}
                        title={
                          blog.plagiarism_score === -1
                            ? "Check Failed"
                            : blog.plagiarism_score > 0
                              ? `${blog.plagiarism_score}% - ${getPlagLabel(blog.plagiarism_score)}`
                              : "Not checked"
                        }
                      >
                        {recalculating[blog.id]
                          ? "..."
                          : blog.plagiarism_score === -1
                            ? "Fail"
                            : blog.plagiarism_score > 0
                              ? `${blog.plagiarism_score}%`
                              : "N/A"}
                      </span>
                    </td>
                    <td className="text-center">
                      <ActionMenu>
                        <button
                          className="action-menu-item"
                          onClick={() => setPreviewBlog(blog)}
                        >
                          <i className="bi bi-eye"></i> View & Review
                        </button>
                        <button
                          className="action-menu-item"
                          onClick={() => handleRecalculate(blog.id)}
                          disabled={recalculating[blog.id]}
                        >
                          <i
                            className={`bi ${recalculating[blog.id] ? "bi-hourglass-split" : "bi-shield-check"}`}
                          ></i>{" "}
                          Check Plagiarism
                        </button>
                      </ActionMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && blogs.length > 0 && (
          <div
            style={{
              padding: "14px 20px",
              borderTop: "1px solid #f1f5f9",
              fontSize: "0.8rem",
              color: "#94a3b8",
            }}
          >
            {blogs.length} submission{blogs.length !== 1 ? "s" : ""} pending
            review
          </div>
        )}
      </div>

      {previewBlog && (
        <BlogReviewModalWrapper
          blog={previewBlog}
          onClose={() => setPreviewBlog(null)}
          onApprove={() => handleApprove(previewBlog)}
          onReject={(reason) => {
            setReviewingId(previewBlog.id);
            reviewBlog(previewBlog.id, "reject", reason)
              .then(() => {
                addToast("Blog rejected successfully.", "success");
                setBlogs((prev) => prev.filter((b) => b.id !== previewBlog.id));
                setPreviewBlog(null);
              })
              .catch((err) => {
                addToast(
                  err.response?.data?.message || "Rejection failed.",
                  "error",
                );
              })
              .finally(() => {
                setReviewingId(null);
              });
          }}
          isReviewing={reviewingId === previewBlog.id}
        />
      )}
    </div>
  );
};

// Internal Modal Wrapper for Lenis management
const BlogReviewModalWrapper = ({
  blog,
  onClose,
  onApprove,
  onReject,
  isReviewing,
}) => {
  useEffect(() => {
    if (window.__lenis) window.__lenis.stop();
    return () => {
      if (window.__lenis) window.__lenis.start();
    };
  }, []);

  return (
    <BlogPreviewModal
      blog={blog}
      onClose={onClose}
      onApprove={onApprove}
      onReject={onReject}
      isReviewing={isReviewing}
    />
  );
};

export default AdminBlogReview;
