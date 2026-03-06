import React, { useState } from "react";
import { LuX, LuCalendar, LuTag, LuUser } from "react-icons/lu";

/**
 * BlogPreviewModal — Display a blog post's content and metadata for review.
 * 75% / 25% Two-column layout.
 */
const BlogPreviewModal = ({
  blog,
  onClose,
  onApprove,
  onReject,
  isReviewing,
}) => {
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");

  if (!blog) return null;

  // Score label helpers
  const getSeoLabel = (score) => {
    if (score >= 80) return "Good";
    if (score >= 60) return "Average";
    return "Poor";
  };

  const getSeoColor = (score) => {
    if (score >= 80) return { bg: "#dcfce7", text: "#166534" };
    if (score >= 60) return { bg: "#fef9c3", text: "#854d0e" };
    return { bg: "#fee2e2", text: "#991b1b" };
  };

  const getPlagLabel = (score) => {
    if (!score || score <= 0) return "Not checked";
    if (score >= 95) return "Safe";
    if (score >= 85) return "Caution";
    return "Warning";
  };

  const getPlagColor = (score) => {
    if (!score || score <= 0) return { bg: "#f1f5f9", text: "#64748b" };
    if (score >= 95) return { bg: "#dcfce7", text: "#166534" };
    if (score >= 85) return { bg: "#ffedd5", text: "#c2410c" };
    return { bg: "#fee2e2", text: "#991b1b" };
  };

  // If the blog is an edited live version, show the draft fields instead of the live fields.
  const isEdited = blog.submission_status === "edited";
  const previewData = {
    ...blog,
    title: isEdited ? blog.draft_title || blog.title : blog.title,
    content: isEdited ? blog.draft_content || blog.content : blog.content,
    image: isEdited ? blog.draft_image || blog.image : blog.image,
    category: isEdited ? blog.draft_category || blog.category : blog.category,
    meta_title: isEdited
      ? blog.draft_meta_title || blog.meta_title
      : blog.meta_title,
    meta_description: isEdited
      ? blog.draft_meta_description || blog.meta_description
      : blog.meta_description,
    meta_keywords: isEdited
      ? blog.draft_meta_keywords || blog.meta_keywords
      : blog.meta_keywords,
    cta_title: isEdited
      ? blog.draft_cta_title || blog.cta_title
      : blog.cta_title,
    cta_description: isEdited
      ? blog.draft_cta_description || blog.cta_description
      : blog.cta_description,
    cta_button_text: isEdited
      ? blog.draft_cta_button_text || blog.cta_button_text
      : blog.cta_button_text,
    cta_button_link: isEdited
      ? blog.draft_cta_button_link || blog.cta_button_link
      : blog.cta_button_link,
  };

  const handleRejectClick = () => {
    if (!rejectMode) {
      setRejectMode(true);
      return;
    }

    if (!rejectReason.trim()) {
      setRejectError("A rejection reason is mandatory.");
      return;
    }

    setRejectError("");
    onReject(rejectReason);
  };

  const seoScore = previewData.seo_score || 0;
  const seoCol = getSeoColor(seoScore);
  const plagScore = previewData.plagiarism_score;
  const plagCol = getPlagColor(plagScore);

  const authorName = previewData.author_name || "Guest Author";
  const authorImage = previewData.author_image
    ? previewData.author_image.startsWith("http")
      ? previewData.author_image
      : `${import.meta.env.VITE_API_URL || ""}${previewData.author_image}`
    : "https://placehold.co/100x100?text=Author";
  const authorBio =
    previewData.author_bio || "Expert SAP Security contributor.";

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="modal-content"
        data-lenis-prevent
        style={{
          width: "95%",
          maxWidth: "1400px",
          padding: 0,
          maxHeight: "95vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          className="modal-header"
          style={{
            background: "#fff",
            zIndex: 10,
            padding: "16px 24px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h3 style={{ margin: 0 }}>
              Review Submission: {previewData.title}
            </h3>
            <p
              style={{
                margin: "2px 0 0",
                fontSize: "0.85rem",
                color: "#64748b",
              }}
            >
              Please review the content, formatting, and SEO details before
              approving.
            </p>
          </div>
          <button
            className="close-btn"
            onClick={onClose}
            style={{
              fontSize: "1.5rem",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#64748b",
            }}
          >
            <LuX />
          </button>
        </div>

        {/* Two-Column Body */}
        <div
          className="modal-body"
          onWheel={(e) => e.stopPropagation()}
          style={{
            display: "flex",
            flex: 1,
            overflow: "hidden", // Let inner columns scroll
          }}
        >
          {/* Left Column - 75% */}
          <div
            style={{
              flex: "0 0 75%",
              padding: "24px",
              overflowY: "auto",
              borderRight: "1px solid #e2e8f0",
              background: "#fafafa",
            }}
          >
            {/* Metadata / SEO Section */}
            <div
              style={{
                background: "#fff",
                padding: "20px 24px",
                borderRadius: "12px",
                border: "1px solid #f1f5f9",
                marginBottom: "24px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
              }}
            >
              <h4
                style={{
                  margin: "0 0 16px",
                  color: "#1e293b",
                  fontSize: "1.1rem",
                }}
              >
                SEO & Meta Information
              </h4>
              <div style={{ display: "grid", gap: "12px", fontSize: "0.9rem" }}>
                <div>
                  <strong style={{ color: "#475569" }}>SEO Title:</strong>
                  <div
                    style={{
                      padding: "8px",
                      background: "#f8fafc",
                      borderRadius: "4px",
                      border: "1px solid #f1f5f9",
                      marginTop: "4px",
                    }}
                  >
                    {previewData.meta_title || "Not provided"}
                  </div>
                </div>
                <div>
                  <strong style={{ color: "#475569" }}>
                    Meta Description:
                  </strong>
                  <div
                    style={{
                      padding: "8px",
                      background: "#f8fafc",
                      borderRadius: "4px",
                      border: "1px solid #f1f5f9",
                      marginTop: "4px",
                    }}
                  >
                    {previewData.meta_description || "Not provided"}
                  </div>
                </div>
                <div>
                  <strong style={{ color: "#475569" }}>Focus Keywords:</strong>
                  <div
                    style={{
                      padding: "8px",
                      background: "#f8fafc",
                      borderRadius: "4px",
                      border: "1px solid #f1f5f9",
                      marginTop: "4px",
                    }}
                  >
                    {previewData.meta_keywords || "Not provided"}
                  </div>
                </div>
              </div>
            </div>

            {/* Frontend Preview Match Section */}
            <div
              style={{
                background: "#fff",
                padding: "32px",
                borderRadius: "12px",
                border: "1px solid #f1f5f9",
                boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
              }}
            >
              <div
                style={{
                  borderBottom: "1px dashed #cbd5e1",
                  paddingBottom: "12px",
                  marginBottom: "24px",
                }}
              >
                <span
                  style={{
                    fontSize: "0.8rem",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    color: "#94a3b8",
                    fontWeight: "bold",
                  }}
                >
                  Frontend Content Preview
                </span>
              </div>

              <div
                style={{
                  width: "100%",
                  borderRadius: 12,
                  overflow: "hidden",
                  marginBottom: 24,
                  background: "#f8fafc",
                  aspectRatio: "16/9",
                }}
              >
                <img
                  src={
                    previewData.image ||
                    "https://placehold.co/600x400?text=No+Image"
                  }
                  alt={previewData.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <h1
                  style={{
                    fontSize: "2.2rem",
                    fontWeight: 800,
                    color: "#0f172a",
                    marginBottom: 16,
                    lineHeight: 1.2,
                  }}
                >
                  {previewData.title}
                </h1>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 16,
                    color: "#64748b",
                    fontSize: "0.9rem",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <LuUser style={{ fontSize: 16 }} />
                    <span>{authorName}</span>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <LuCalendar style={{ fontSize: 16 }} />
                    <span>
                      {new Date(blog.date).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <LuTag style={{ fontSize: 16 }} />
                    <span style={{ textTransform: "capitalize" }}>
                      {previewData.category?.replace("-", " ")}
                    </span>
                  </div>
                </div>
              </div>

              <div
                className="blog-preview-body ql-editor"
                style={{
                  fontSize: "1.125rem",
                  lineHeight: 1.8,
                  color: "#334155",
                  padding: 0,
                }}
                dangerouslySetInnerHTML={{ __html: previewData.content }}
              />

              {/* Call to Action */}
              {(previewData.cta_title || previewData.cta_button_text) && (
                <div
                  style={{
                    marginTop: "40px",
                    padding: "30px",
                    background:
                      "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                    borderRadius: "12px",
                    textAlign: "center",
                    color: "#fff",
                  }}
                >
                  {previewData.cta_title && (
                    <h3
                      style={{
                        fontSize: "1.5rem",
                        marginBottom: "12px",
                        color: "#fff",
                      }}
                    >
                      {previewData.cta_title}
                    </h3>
                  )}
                  {previewData.cta_description && (
                    <p style={{ color: "#cbd5e1", marginBottom: "24px" }}>
                      {previewData.cta_description}
                    </p>
                  )}
                  {previewData.cta_button_text &&
                    previewData.cta_button_link && (
                      <a
                        href={previewData.cta_button_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-approve"
                        style={{
                          display: "inline-block",
                          padding: "12px 28px",
                          textDecoration: "none",
                          borderRadius: "8px",
                          fontWeight: "bold",
                          background: "#3b82f6",
                          color: "#fff",
                        }}
                      >
                        {previewData.cta_button_text}
                      </a>
                    )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Fixed Width for Readability */}
          <div
            style={{
              flex: "0 0 320px",
              padding: "24px",
              background: "#fff",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            {/* Author Details Block */}
            <div
              style={{
                background: "#f8fafc",
                borderRadius: "16px",
                padding: "24px",
                border: "1px solid #f1f5f9",
              }}
            >
              <h4
                style={{
                  margin: "0 0 16px",
                  color: "#1e293b",
                  fontSize: "1rem",
                }}
              >
                Author Profile
              </h4>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background: "#e2e8f0",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {authorImage ? (
                    <img
                      src={authorImage}
                      alt={authorName}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <LuUser style={{ fontSize: "40px", color: "#94a3b8" }} />
                  )}
                </div>
                <div>
                  <h5
                    style={{
                      margin: "0 0 4px",
                      fontSize: "1.1rem",
                      color: "#0f172a",
                    }}
                  >
                    {authorName}
                  </h5>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.85rem",
                    color: "#64748b",
                    lineHeight: "1.5",
                  }}
                >
                  {authorBio}
                </p>
              </div>
            </div>

            {/* Scores Block */}
            <div
              style={{
                background: "#f8fafc",
                borderRadius: "12px",
                padding: "20px",
                border: "1px solid #e2e8f0",
              }}
            >
              <h4
                style={{
                  margin: "0 0 16px",
                  color: "#1e293b",
                  fontSize: "1rem",
                }}
              >
                Quality Metrics
              </h4>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.9rem",
                      color: "#475569",
                      fontWeight: 600,
                    }}
                  >
                    SEO Score
                  </span>
                  <div
                    style={{
                      background: seoCol.bg,
                      color: seoCol.text,
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "0.85rem",
                      fontWeight: "bold",
                    }}
                  >
                    {seoScore}/100 ({getSeoLabel(seoScore)})
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.9rem",
                      color: "#475569",
                      fontWeight: 600,
                    }}
                  >
                    Plagiarism
                  </span>
                  <div
                    style={{
                      background: plagCol.bg,
                      color: plagCol.text,
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "0.85rem",
                      fontWeight: "bold",
                    }}
                  >
                    {plagScore === -1
                      ? "Check Failed"
                      : plagScore > 0
                        ? `${plagScore}% (${getPlagLabel(plagScore)})`
                        : "Not Checked"}
                  </div>
                </div>
              </div>
            </div>

            {/* Rejection Feedback (Existing) */}
            {previewData.rejection_feedback && (
              <div
                style={{
                  background: "#fff1f2",
                  borderRadius: "12px",
                  padding: "20px",
                  border: "1px solid #fecaca",
                }}
              >
                <h4
                  style={{
                    margin: "0 0 12px",
                    color: "#991b1b",
                    fontSize: "1rem",
                  }}
                >
                  Past Rejection Feedback
                </h4>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.9rem",
                    color: "#b91c1c",
                    lineHeight: "1.5",
                  }}
                >
                  {previewData.rejection_feedback}
                </p>
              </div>
            )}

            {/* Rejection Form Box */}
            {rejectMode && (
              <div
                style={{
                  background: "#fee2e2",
                  border: "1px solid #fca5a5",
                  borderRadius: "12px",
                  padding: "20px",
                  animation: "modalFadeIn 0.3s ease-out",
                }}
              >
                <h4
                  style={{
                    margin: "0 0 12px",
                    color: "#991b1b",
                    fontSize: "1rem",
                  }}
                >
                  Rejection Feedback
                </h4>
                <p
                  style={{
                    margin: "0 0 12px",
                    fontSize: "0.8rem",
                    color: "#b91c1c",
                  }}
                >
                  Please provide a detailed reason for rejection. This will be
                  visible to the author.
                </p>
                <textarea
                  value={rejectReason}
                  onChange={(e) => {
                    setRejectReason(e.target.value);
                    if (e.target.value.trim()) setRejectError("");
                  }}
                  placeholder="Enter rejection reasons or requested changes..."
                  style={{
                    width: "100%",
                    minHeight: "100px",
                    resize: "vertical",
                    padding: "10px",
                    borderRadius: "6px",
                    border: rejectError
                      ? "2px solid #ef4444"
                      : "1px solid #fca5a5",
                    fontSize: "0.9rem",
                    fontFamily: "inherit",
                    outline: "none",
                  }}
                  autoFocus
                />
                {rejectError && (
                  <p
                    style={{
                      color: "#ef4444",
                      fontSize: "0.8rem",
                      margin: "8px 0 0",
                      fontWeight: "bold",
                    }}
                  >
                    {rejectError}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div
          className="modal-footer"
          style={{
            background: "#f8fafc",
            borderTop: "1px solid #e2e8f0",
            padding: "16px 24px",
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
          }}
        >
          <button
            className="btn-secondary"
            onClick={onClose}
            disabled={isReviewing}
            style={{ background: "#fff", border: "1px solid #cbd5e1" }}
          >
            Close
          </button>

          <button
            className="btn-danger"
            onClick={handleRejectClick}
            disabled={isReviewing}
            style={{ minWidth: "120px" }}
          >
            {isReviewing && rejectMode
              ? "Rejecting..."
              : rejectMode
                ? "Confirm Rejection"
                : "Reject"}
          </button>

          <button
            className="btn-success"
            onClick={onApprove}
            disabled={isReviewing || rejectMode}
            style={{
              opacity: rejectMode ? 0.5 : 1,
              whiteSpace: "normal",
              height: "auto",
              padding: "10px 16px",
              minWidth: "140px",
            }}
          >
            {isReviewing && !rejectMode ? "Approving..." : "Approve & Publish"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogPreviewModal;
