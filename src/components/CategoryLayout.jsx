import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { authors } from "../data/authors";
import BlogSidebar from "./BlogSidebar";
import "../css/CategoryPage.css";

const CategoryLayout = ({ categorySlug, displayName }) => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch blogs from API
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/manage_blogs.php");

        if (!response.ok) {
          throw new Error("Failed to fetch blogs");
        }

        const data = await response.json();
        setBlogs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching blogs:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Filter blogs by category slug
  const categoryBlogs = useMemo(() => {
    if (!blogs.length) return [];

    return blogs
      .filter((blog) => {
        // Parent category logic: sap-security shows its sub-categories
        if (categorySlug === "sap-security") {
          return (
            blog.category === "sap-security" ||
            blog.category === "sap-btp-security" ||
            blog.category === "sap-public-cloud"
          );
        }
        if (categorySlug === "sap-grc") {
          return (
            blog.category === "sap-grc" ||
            blog.subCategory === "sap-grc" ||
            blog.category === "sap-access-control" ||
            blog.subCategory === "sap-access-control" ||
            blog.category === "sap-process-control" ||
            blog.subCategory === "sap-process-control" ||
            blog.category === "sap-iag" ||
            blog.subCategory === "sap-iag"
          );
        }
        // Direct category or sub-category match
        return (
          blog.category === categorySlug || blog.subCategory === categorySlug
        );
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [blogs, categorySlug]);

  return (
    <div className="category-page-wrapper">
      {/* Header */}
      <div className="category-header-section">
        <div className="container">
          <div className="breadcrumbs">
            <Link to="/">Home</Link> &gt; <span>{displayName}</span>
          </div>
          <h1>{displayName}</h1>
        </div>
      </div>

      <div className="category-content container">
        <div className="category-layout-grid">
          {/* Main Content: Blog Grid */}
          <div className="category-main-column">
            {loading ? (
              <div className="loading-state">
                <p>Loading blogs...</p>
              </div>
            ) : error ? (
              <div className="error-state">
                <p>Error loading blogs: {error}</p>
                <Link to="/" className="btn-primary">
                  Go Home
                </Link>
              </div>
            ) : categoryBlogs.length === 0 ? (
              <div className="no-posts">
                <p>No posts found in this category.</p>
                <Link to="/" className="btn-primary">
                  Go Home
                </Link>
              </div>
            ) : (
              <div className="blog-grid-2-col">
                {categoryBlogs.map((blog) => (
                  <div key={blog.id} className="blog-grid-card">
                    <div className="blog-card-image">
                      <Link to={`/${blog.category}/${blog.slug}`}>
                        <img
                          src={blog.image || "/placeholder-image.jpg"}
                          alt={blog.title}
                          loading="lazy"
                        />
                      </Link>
                    </div>
                    <div className="blog-card-content">
                      <div className="blog-meta-top">
                        <span className="blog-author">
                          <i className="bi bi-person-circle"></i>{" "}
                          {authors[blog.author]?.name || blog.author || "Admin"}
                        </span>
                        <span className="blog-date">
                          <i className="bi bi-calendar3"></i>{" "}
                          {new Date(blog.date).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      <Link
                        to={`/${blog.category}/${blog.slug}`}
                        className="blog-title-link"
                      >
                        <h3>{blog.title}</h3>
                      </Link>

                      {blog.excerpt && (
                        <p className="blog-excerpt">{blog.excerpt}</p>
                      )}

                      <Link
                        to={`/${blog.category}/${blog.slug}`}
                        className="read-more-link"
                      >
                        Read More &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="category-sidebar-column">
            <BlogSidebar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryLayout;
