import React, { useState, useEffect } from "react";
import "../../css/AdminDashboard.css";

const AdminBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [view, setView] = useState("list"); // 'list' or 'editor'
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    author: "User",
    date: new Date().toISOString().split("T")[0],
    image: "",
    category: "sap-security",
    tags: "",
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await fetch("/api/posts");
      if (res.ok) setBlogs(await res.json());
    } catch (err) {
      console.error(err);
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
        // Auto-generate slug only for new posts
        newData.slug = generateSlug(value);
      }
      return newData;
    });
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
      } else {
        alert(data.message || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      alert("Upload error");
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (blog) => {
    setFormData(blog);
    setView("editor");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this blog?")) {
      try {
        const res = await fetch(`/api/posts/${id}`, {
          method: "DELETE",
        });
        if (res.ok) fetchBlogs();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSave = async () => {
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
      } else {
        alert("Failed to save blog");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      id: "",
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      author: "User",
      date: new Date().toISOString().split("T")[0],
      image: "",
      category: "sap-security",
      tags: "",
    });
  };

  return (
    <div className="admin-content">
      <div className="admin-header">
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
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center" }}>
                    No custom blogs found.
                  </td>
                </tr>
              ) : (
                blogs.map((blog) => (
                  <tr key={blog.id}>
                    <td>{blog.title}</td>
                    <td>{blog.author}</td>
                    <td>{blog.date}</td>
                    <td>
                      <button
                        className="btn-edit"
                        style={{ marginRight: "10px" }}
                        onClick={() => handleEdit(blog)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-reject"
                        onClick={() => handleDelete(blog.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="blog-editor-form">
          <div className="form-group">
            <label>Title</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter blog title"
            />
          </div>
          <div className="form-group">
            <label>Slug (URL)</label>
            <input
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              placeholder="blog-url-slug"
            />
          </div>
          <div className="form-group">
            <label>Excerpt (Short Summary)</label>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleInputChange}
              rows="3"
              placeholder="Sort summary for cards..."
            />
          </div>
          <div className="form-group">
            <label>Content (HTML/Text)</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows="15"
              style={{ fontFamily: "monospace" }}
              placeholder="<p>Write your blog content here...</p>"
            />
          </div>
          <div className="form-row">
            <div className="form-group half">
              <label>Author</label>
              <input
                name="author"
                value={formData.author}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group half">
              <label>Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Blog Featured Image</label>
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
              />
              {uploading && (
                <p style={{ fontSize: "0.8rem", color: "#2563eb" }}>
                  Uploading image...
                </p>
              )}
              {formData.image && (
                <div
                  className="image-preview"
                  style={{ position: "relative", display: "inline-block" }}
                >
                  <img
                    src={formData.image}
                    alt="Blog preview"
                    style={{
                      maxWidth: "200px",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                    }}
                  />
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "#64748b",
                      marginTop: "5px",
                    }}
                  >
                    URL: {formData.image}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="form-group">
            <label>Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
            >
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
          <button
            className="btn-approve"
            onClick={handleSave}
            style={{ width: "100%", marginTop: "20px" }}
          >
            Save Blog Post
          </button>
        </div>
      )}
      <style>{`
            .blog-editor-form {
                background: white;
                padding: 24px;
                border-radius: 12px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                max-width: 800px;
                margin: 0 auto;
            }
            .form-row {
                display: flex;
                gap: 20px;
            }
            .form-group.half {
                flex: 1;
            }
        `}</style>
    </div>
  );
};

export default AdminBlogs;
