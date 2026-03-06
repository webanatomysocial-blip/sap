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
      <div className="form-group">
        <label className="form-label">Meta Title</label>
        <input
          name="meta_title"
          value={formData.meta_title || ""}
          onChange={handleInputChange}
          className="form-control"
          placeholder="Custom SEO Title"
        />
      </div>
      <div className="form-group">
        <label className="form-label">Meta Description</label>
        <textarea
          name="meta_description"
          value={formData.meta_description || ""}
          onChange={handleInputChange}
          className="form-control"
          rows="3"
          placeholder="Custom SEO Description"
        />
      </div>
      <div className="form-group">
        <label className="form-label">Meta Keywords</label>
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
