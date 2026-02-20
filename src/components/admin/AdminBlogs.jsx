import React, { useState, useEffect, useMemo } from "react";
import SimpleRTE from "./SimpleRTE";
import "../../css/AdminDashboard.css";
import { authors } from "../../data/authors";
import { useToast } from "../../context/ToastContext";
import { useConfirm } from "../../context/ConfirmationContext";

const AdminBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [view, setView] = useState("list"); // 'list' or 'editor'
  const { addToast } = useToast();
  const { openConfirm } = useConfirm();

  // Initial State
  const initialFormState = {
    id: "",
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    author: "raghu_boddu", // Default to main author ID
    date: new Date().toISOString().split("T")[0],
    image: "",
    category: "sap-security",
    tags: "",
    faqs: [], // Array of { question: "", answer: "" }
    cta_title: "",
    cta_description: "",
    cta_button_text: "",
    cta_button_link: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await fetch("/api/posts");
      if (res.ok) {
        const data = await res.json();
        // Parse FAQs if string
        const parsedData = data.map((blog) => ({
          ...blog,
          faqs:
            typeof blog.faqs === "string"
              ? JSON.parse(blog.faqs || "[]")
              : blog.faqs || [],
        }));
        setBlogs(parsedData);
      }
    } catch (err) {
      console.error(err);
      addToast(
        "We couldn't load the blogs right now. Please try again later.",
        "error",
      );
    }
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      if (name === "title" && !prev.id) {
        newData.slug = generateSlug(value);
      }
      return newData;
    });
  };

  // Content Change Handler
  const handleContentChange = (content) => {
    setFormData((prev) => ({ ...prev, content }));
  };

  // FAQ Handlers
  const handleFAQChange = (index, field, value) => {
    const newFAQs = [...formData.faqs];
    newFAQs[index][field] = value;
    setFormData((prev) => ({ ...prev, faqs: newFAQs }));
  };

  const addFAQ = () => {
    setFormData((prev) => ({
      ...prev,
      faqs: [...prev.faqs, { question: "", answer: "" }],
    }));
  };

  const removeFAQ = (index) => {
    const newFAQs = formData.faqs.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, faqs: newFAQs }));
  };

  // Helper for RTE Image Upload
  const rteImageUpload = async (file) => {
    const body = new FormData();
    body.append("image", file);
    try {
      const res = await fetch("/api/upload_blog_image.php", {
        method: "POST",
        body: body,
      });
      const data = await res.json();
      if (data.status === "success") {
        return data.path;
      } else {
        addToast(
          data.message || "Something went wrong while uploading your image.",
          "error",
        );
      }
    } catch (err) {
      console.error(err);
      addToast(
        "Something went wrong while connecting to the system. Please try again.",
        "error",
      );
    }
    return null;
  };

  const handleImageUpload = async (file) => {
    setUploading(true);
    const body = new FormData();
    body.append("image", file);

    try {
      const res = await fetch("/api/upload_blog_image.php", {
        method: "POST",
        body: body,
      });
      const data = await res.json();
      if (data.status === "success") {
        setFormData((prev) => ({ ...prev, image: data.path }));
        addToast("Image uploaded successfully", "success");
      } else {
        addToast(
          data.message || "Something went wrong while uploading your image.",
          "error",
        );
      }
    } catch (err) {
      console.error(err);
      addToast(
        "Something went wrong while connecting to the system. Please try again.",
        "error",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (blog) => {
    // Ensure nested structures are initialized
    setFormData({
      ...initialFormState, // defaults
      ...blog,
      faqs:
        typeof blog.faqs === "string"
          ? JSON.parse(blog.faqs || "[]")
          : blog.faqs || [],
      // Ensure nulls become empty strings for inputs
      cta_title: blog.cta_title || "",
      cta_description: blog.cta_description || "",
      cta_button_text: blog.cta_button_text || "",
      cta_button_link: blog.cta_button_link || "",
    });
    setView("editor");
  };

  const handleDelete = (id) => {
    openConfirm({
      title: "Delete Blog?",
      message:
        "Are you sure you want to delete this blog? This action cannot be undone.",
      confirmText: "Delete",
      isDanger: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
          if (res.ok) {
            fetchBlogs();
            addToast("Blog deleted successfully", "success");
          } else {
            addToast(
              "Something went wrong while deleting the blog post. Please try again.",
              "error",
            );
          }
        } catch (err) {
          console.error(err);
          addToast(
            "We're having trouble connecting to the system. Please try again.",
            "error",
          );
        }
      },
    });
  };

  const handleSave = async () => {
    // Date validation
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate > new Date()) {
      addToast("Date cannot be in the future.", "error");
      return;
    }

    // Basic validation
    if (!formData.title || !formData.slug) {
      addToast("Title and Slug are required.", "error");
      return;
    }

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        fetchBlogs();
        setView("list");
        resetForm();
        addToast("Blog saved successfully", "success");
      } else {
        addToast(
          "Something went wrong while saving the blog post. Please try again.",
          "error",
        );
      }
    } catch (err) {
      console.error(err);
      addToast(
        "We're having trouble connecting to the system. Please try again.",
        "error",
      );
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
  };

  const authorOptions = Object.entries(authors).map(([id, author]) => ({
    id,
    name: author.name,
  }));

  return (
    <div className="admin-page-wrapper">
      <div className="page-header">
        <h2>Blog Management</h2>
        {view === "list" && (
          <button
            className="btn-approve"
            onClick={() => {
              resetForm();
              setView("editor");
            }}
          >
            + New Blog Post
          </button>
        )}
        {view === "editor" && (
          <button className="btn-reject" onClick={() => setView("list")}>
            Cancel
          </button>
        )}
      </div>

      {view === "list" ? (
        <div className="admin-card">
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="text-left col-title">Title</th>
                  <th className="text-left">Author</th>
                  <th className="text-left">Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.length === 0 ? (
                  <tr>
                    <td colSpan="4">No custom blogs found.</td>
                  </tr>
                ) : (
                  blogs.map((blog) => (
                    <tr key={blog.id}>
                      <td className="text-left col-title" title={blog.title}>
                        {blog.title}
                      </td>
                      <td className="text-left">
                        {authors[blog.author]?.name || blog.author}
                      </td>
                      <td className="text-left">{blog.date}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-edit btn-sm"
                            onClick={() => handleEdit(blog)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn-delete btn-sm"
                            onClick={() => handleDelete(blog.id)}
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
        </div>
      ) : (
        <div className="admin-card">
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              className="form-control"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter blog title"
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

          <div className="form-row">
            <div className="form-group half">
              <label className="form-label">Author</label>
              <select
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                className="form-control"
              >
                {authorOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
                <option value="Admin">Admin (Legacy)</option>
              </select>
            </div>
            <div className="form-group half">
              <label className="form-label">Date</label>
              <input
                className="form-control"
                type="date"
                name="date"
                value={formData.date}
                max={new Date().toISOString().split("T")[0]}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Blog Featured Image</label>
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
              {uploading && (
                <p style={{ fontSize: "0.8rem", color: "#2563eb" }}>
                  Uploading image...
                </p>
              )}
              {formData.image && (
                <div className="image-preview">
                  <img src={formData.image} alt="Blog preview" />
                  <p className="image-path-text">URL: {formData.image}</p>
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="form-control"
            >
              <option value="sap-security">SAP Security</option>
              {/* ... other options same as before ... */}
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

          <div className="editor-section">
            <h3>SEO Settings</h3>
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

          <div className="editor-section">
            <h3>FAQs</h3>
            {formData.faqs.map((faq, index) => (
              <div key={index} className="faq-editor-item">
                <input
                  placeholder="Question"
                  value={faq.question}
                  onChange={(e) =>
                    handleFAQChange(index, "question", e.target.value)
                  }
                  className="form-control"
                  style={{ marginBottom: "8px" }}
                />
                <textarea
                  placeholder="Answer"
                  value={faq.answer}
                  onChange={(e) =>
                    handleFAQChange(index, "answer", e.target.value)
                  }
                  className="form-control"
                  rows="2"
                />
                <button
                  className="btn-delete"
                  onClick={() => removeFAQ(index)}
                  style={{ marginTop: "8px" }}
                >
                  Remove FAQ
                </button>
              </div>
            ))}
            <button
              className="btn-edit"
              onClick={addFAQ}
              style={{ marginTop: "12px" }}
            >
              + Add FAQ
            </button>
          </div>

          <div className="editor-section">
            <h3>Call to Action (CTA)</h3>
            <div className="form-group">
              <label className="form-label">CTA Title</label>
              <input
                name="cta_title"
                value={formData.cta_title}
                onChange={handleInputChange}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label className="form-label">CTA Description</label>
              <textarea
                name="cta_description"
                value={formData.cta_description}
                onChange={handleInputChange}
                className="form-control"
                rows="2"
              />
            </div>
            <div className="form-row">
              <div className="form-group half">
                <label className="form-label">Button Text</label>
                <input
                  name="cta_button_text"
                  value={formData.cta_button_text}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </div>
              <div className="form-group half">
                <label className="form-label">Button Link</label>
                <input
                  name="cta_button_link"
                  value={formData.cta_button_link}
                  onChange={handleInputChange}
                  className="form-control"
                />
              </div>
            </div>
          </div>

          <button className="btn-approve btn-full mt-4" onClick={handleSave}>
            Save Blog Post
          </button>
        </div>
      )}
      <style>{`
            .form-row {
                display: flex;
                gap: 20px;
                margin-bottom: 20px;
            }
            .form-group.half {
                flex: 1;
                margin-bottom: 0;
            }
            .editor-section {
                margin-top: 32px;
                padding-top: 24px;
                border-top: 1px solid #e2e8f0;
            }
            .editor-section h3 {
                font-size: 1.1rem;
                margin-bottom: 16px;
                color: var(--slate-800);
            }
            .faq-editor-item {
                background: #f8fafc;
                padding: 16px;
                border-radius: 8px;
                margin-bottom: 12px;
                border: 1px solid #e2e8f0;
            }
        `}</style>
    </div>
  );
};

export default AdminBlogs;
