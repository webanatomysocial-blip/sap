import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { blogMetadata } from "../blogs/metadata";
import BlogSidebar from "./BlogSidebar";
import "../css/CategoryPage.css";

const CategoryLayout = ({ categorySlug, displayName }) => {
  // Filter blogs by category slug
  const categoryBlogs = useMemo(() => {
    return blogMetadata
      .filter((blog) => {
        // Parent category logic: sap-security shows its sub-categories
        if (categorySlug === "sap-security") {
          return (
            blog.category === "sap-security" ||
            blog.category === "sap-btp-security" ||
            blog.category === "sap-public-cloud"
          );
        }
        // Direct category or sub-category match
        return (
          blog.category === categorySlug || blog.subCategory === categorySlug
        );
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [categorySlug]);

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
            {categoryBlogs.length === 0 ? (
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
                        <img src={blog.image} alt={blog.title} loading="lazy" />
                      </Link>
                    </div>
                    <div className="blog-card-content">
                      <div className="blog-meta-top">
                        <span className="blog-author">
                          {blog.author || "Raghu Boddu"}
                        </span>
                        <span className="blog-date">{blog.date}</span>
                      </div>

                      <Link
                        to={`/${blog.category}/${blog.slug}`}
                        className="blog-title-link"
                      >
                        <h3>{blog.title}</h3>
                      </Link>

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
