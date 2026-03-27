import React from "react";

const SeoSettings = ({
  formData,
  handleInputChange,
  getSeoScore,
  getScoreColor,
}) => {
  const currentScore = getSeoScore(formData);
  const color = getScoreColor(currentScore);

  return (
    <div className="admin-card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          paddingBottom: "12px",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <h3 style={{ margin: 0, color: "#1e293b", fontSize: "1.2rem" }}>
          SEO Settings
        </h3>
        <div
          style={{
            padding: "6px 12px",
            borderRadius: "8px",
            fontSize: "0.9rem",
            fontWeight: "bold",
            background: color.bg,
            color: color.text,
          }}
        >
          SEO Score: {currentScore}%
        </div>
      </div>

      <div
        style={{
          background: "#f8fafc",
          padding: "12px",
          borderRadius: "8px",
          marginBottom: "20px",
          fontSize: "0.85rem",
          color: "#64748b",
          border: "1px solid #e2e8f0",
        }}
      >
        <strong style={{ color: "#334155", display: "block", marginBottom: "4px" }}>
          SEO Best Practice Rules:
        </strong>
        <ul style={{ paddingLeft: "18px", margin: 0 }}>
          <li>
            <strong>Title:</strong> 50-70 characters (Ideal for search snippets).
          </li>
          <li>
            <strong>Description:</strong> 120-165 characters (Summarize clearly).
          </li>
          <li>
            <strong>Keywords:</strong> At least 3 comma-separated keywords.
          </li>
          <li>
            <strong>Content:</strong> Aim for 600+ words for better ranking.
          </li>
        </ul>
      </div>

      <div className="form-group">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <label className="form-label">Meta Title</label>
          <span
            style={{
              fontSize: "0.75rem",
              color:
                (formData.meta_title || "").length >= 50 &&
                (formData.meta_title || "").length <= 70
                  ? "#166534"
                  : "#991b1b",
            }}
          >
            {(formData.meta_title || "").length} / 70
          </span>
        </div>
        <input
          name="meta_title"
          value={formData.meta_title || ""}
          onChange={handleInputChange}
          className="form-control"
          placeholder="Custom SEO Title"
          style={{
            borderColor:
              (formData.meta_title || "").length >= 50 &&
              (formData.meta_title || "").length <= 70
                ? "#22c55e"
                : "#ef4444",
          }}
        />
      </div>
      <div className="form-group">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <label className="form-label">Meta Description</label>
          <span
            style={{
              fontSize: "0.75rem",
              color:
                (formData.meta_description || "").length >= 120 &&
                (formData.meta_description || "").length <= 165
                  ? "#166534"
                  : "#991b1b",
            }}
          >
            {(formData.meta_description || "").length} / 165
          </span>
        </div>
        <textarea
          name="meta_description"
          value={formData.meta_description || ""}
          onChange={handleInputChange}
          className="form-control"
          rows="3"
          placeholder="Custom SEO Description"
          style={{
            borderColor:
              (formData.meta_description || "").length >= 120 &&
              (formData.meta_description || "").length <= 165
                ? "#22c55e"
                : "#ef4444",
          }}
        />
      </div>
      <div className="form-group">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <label className="form-label">Meta Keywords</label>
          <span
            style={{
              fontSize: "0.75rem",
              color:
                (formData.meta_keywords || "").split(",").filter((k) => k.trim())
                  .length >= 3
                  ? "#166534"
                  : "#991b1b",
            }}
          >
            {(formData.meta_keywords || "").split(",").filter((k) => k.trim()).length} /
            3 keywords
          </span>
        </div>
        <input
          name="meta_keywords"
          value={formData.meta_keywords || ""}
          onChange={handleInputChange}
          className="form-control"
          placeholder="keyword1, keyword2, keyword3"
        />
      </div>
    </div>
  );
};

export default SeoSettings;
