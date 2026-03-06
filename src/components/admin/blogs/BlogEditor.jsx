import React from "react";
import SimpleRTE from "../SimpleRTE";

const BlogEditor = ({
  formData,
  handleInputChange,
  handleContentChange,
  rteImageUpload,
  handleImageUpload,
  uploading,
  imageVersion,
  authors = [], // Received from AdminBlogs
  children, // For sub-sections (SEO, CTA, FAQ)
  onSave,
}) => {
  return (
    <div
      className="blog-editor-layout"
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: "24px",
        alignItems: "start",
      }}
    >
      {/* Left Column: Essential Content */}
      <div
        className="editor-main-col"
        style={{ display: "flex", flexDirection: "column", gap: "24px" }}
      >
        <div className="admin-card">
          <h3
            style={{
              marginBottom: "20px",
              color: "#1e293b",
              fontSize: "1.2rem",
              paddingBottom: "12px",
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            Content Editor
          </h3>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              className="form-control"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter blog title"
              style={{
                fontSize: "1.15rem",
                padding: "12px",
                fontWeight: "600",
              }}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Slug (URL)</label>
            <input
              className="form-control"
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              placeholder="blog-url-slug"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Excerpt (Short Summary)</label>
            <textarea
              className="form-control"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleInputChange}
              rows="3"
              placeholder="Short summary for cards..."
            />
          </div>
          <div className="form-group">
            <label className="form-label">Content (Rich Text)</label>
            <SimpleRTE
              value={formData.content}
              onChange={handleContentChange}
              onImageUpload={rteImageUpload}
            />
          </div>
        </div>

        {/* Dynamic Children (SEO, FAQ, CTA) */}
        <div
          className="editor-dynamic-sections"
          style={{ display: "flex", flexDirection: "column", gap: "24px" }}
        >
          {children}
        </div>
      </div>

      {/* Right Column: Settings & Publishing */}
      <div
        className="editor-side-col"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          position: "sticky",
          top: "24px",
        }}
      >
        <div className="admin-card">
          <h3
            style={{
              marginBottom: "20px",
              color: "#1e293b",
              fontSize: "1.2rem",
              paddingBottom: "12px",
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            Publishing
          </h3>

          <button
            className="btn-approve btn-full"
            onClick={onSave}
            style={{
              padding: "14px",
              fontSize: "1rem",
              fontWeight: "700",
              marginBottom: "24px",
            }}
          >
            <i
              className="bi bi-cloud-arrow-up"
              style={{ marginRight: "8px" }}
            ></i>{" "}
            Save Blog Post
          </button>

          <div className="form-group">
            {" "}
            <label className="form-label">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="form-control"
              style={{ padding: "10px", background: "#f8fafc" }}
            >
              <option value="">Select Category</option>
              <option value="sap-security">SAP Security</option>
              <option value="sap-s4hana-security">SAP S/4HANA Security</option>
              <option value="sap-fiori-security">SAP Fiori Security</option>
              <option value="sap-btp-security">SAP BTP Security</option>
              <option value="sap-public-cloud">SAP Public Cloud</option>
              <option value="sap-sac-security">SAP SAC Security</option>
              <option value="sap-cis">SAP CIS</option>
              <option value="sap-successfactors-security">
                SuccessFactors
              </option>
              <option value="sap-security-other">Other SAP Security</option>
              <option value="sap-access-control">Access Control</option>
              <option value="sap-process-control">Process Control</option>
              <option value="sap-iag">SAP IAG</option>
              <option value="sap-grc">SAP GRC</option>
              <option value="sap-cybersecurity">Cybersecurity</option>
              <option value="sap-licensing">SAP Licensing</option>
              <option value="product-reviews">Product Reviews</option>
              <option value="podcasts">Podcasts</option>
              <option value="videos">Videos</option>
              <option value="other-tools">Other Tools</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Publish Date</label>
            <input
              className="form-control"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="admin-card">
          <h3
            style={{
              marginBottom: "20px",
              color: "#1e293b",
              fontSize: "1.2rem",
              paddingBottom: "12px",
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            Featured Image
          </h3>
          <div
            className="upload-container"
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files[0]) {
                  handleImageUpload(e.target.files[0]);
                }
              }}
              className="form-control"
              style={{ padding: "8px" }}
            />
            <span className="image-hint">Required: 1920x1080 (16:9)</span>

            {uploading && (
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "#3b82f6",
                  fontWeight: "600",
                  marginTop: "4px",
                }}
              >
                <i className="bi bi-hourglass-split"></i> Uploading...
              </p>
            )}

            {formData.image && (
              <div
                className="image-preview"
                style={{
                  marginTop: "12px",
                  borderRadius: "8px",
                  overflow: "hidden",
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                }}
              >
                <img
                  src={`${formData.image}?v=${imageVersion}`}
                  alt="Featured Preview"
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogEditor;
