import React, { useState, useEffect, Suspense } from "react";
import { Link } from "react-router-dom";
import { blogMetadata } from "../blogs/metadata.js";
import "../css/Blog.css";

// Dynamically import all JSX files from blogs folder
// Dynamically import all JSX files from various folders
const blogModules = import.meta.glob(
  [
    "../blogs/*.jsx",
    "../sap-security/*.jsx",
    "../sap-licensing/*.jsx",
    "../sap-iag/*.jsx",
    "../sap-grc/*.jsx",
    "../sap-cybersecurity/*.jsx",
    "../product-reviews/*.jsx",
    "../podcasts/*.jsx",
    "../other-tools/*.jsx",
  ],
  { eager: false },
);
const blogKeys = Object.keys(blogModules);

// Sort blogKeys by date in descending order (most recent first)
const sortedBlogKeys = blogKeys.sort((a, b) => {
  const blogNameA = a.split("/").pop().replace(".jsx", "");
  const blogNameB = b.split("/").pop().replace(".jsx", "");
  const metadataA = blogMetadata.find((blog) => blog.id === blogNameA) || {
    date: "1970-01-01",
  };
  const metadataB = blogMetadata.find((blog) => blog.id === blogNameB) || {
    date: "1970-01-01",
  };
  return new Date(metadataB.date) - new Date(metadataA.date);
});

const Blogs = ({ backgroundColor, limit = 3 }) => {
  const [visibleCount, setVisibleCount] = useState(
    limit === "all" ? 10 : limit,
  );
  const [allBlogs, setAllBlogs] = useState([]);

  useEffect(() => {
    // 1. Get Static Metadata
    const staticBlogs = blogMetadata.map((b) => ({ ...b, type: "static" }));

    // 2. Get Virtual Blogs from API
    fetch("/api/manage_blogs.php")
      .then((res) => res.json())
      .then((virtualData) => {
        const virtualBlogs = virtualData.map((b) => ({
          ...b,
          type: "virtual",
          image: b.image || "https://placehold.co/600x400?text=No+Image",
        }));

        // 3. Merge and Sort
        const combined = [...virtualBlogs, ...staticBlogs].sort((a, b) => {
          return new Date(b.date) - new Date(a.date);
        });

        setAllBlogs(combined);
        if (limit === "all") setVisibleCount(combined.length);
        else setVisibleCount(limit);
      })
      .catch((err) => {
        console.error("Failed to load virtual blogs", err);
        // Fallback to static only
        setAllBlogs(staticBlogs);
        if (limit === "all") setVisibleCount(staticBlogs.length);
        else setVisibleCount(limit);
      });
  }, [limit]); // Re-run if limit changes, though usually static

  const loadMore = () => {
    setVisibleCount(allBlogs.length);
  };

  const showLoadMore = limit === "all" && visibleCount < allBlogs.length;

  return (
    <div className="whole-blog-section" style={{ backgroundColor }}>
      <div className="blogs-container">
        <div className="blogs-grid">
          {allBlogs.length === 0 && <p>No blogs found.</p>}
          {allBlogs.slice(0, visibleCount).map((blog, index) => {
            // Helper to determine link URL
            // If category exists, use it. Otherwise default to 'blogs'
            const categorySlug = blog.category || "blogs";
            const blogUrl = `/${categorySlug}/${blog.slug || blog.id}`;

            return (
              <div
                key={blog.id || index}
                className="inner-news-blogs-container"
              >
                <div className="blog-text">
                  <p className="text-black">BLOG</p>
                  <Link to={blogUrl} style={{ textDecoration: "none" }}>
                    <p className="sub-big-heading-text-black">{blog.title}</p>
                  </Link>
                </div>
                <div
                  className="image-hover-text-come"
                  style={{ backgroundImage: `url(${blog.image})` }}
                >
                  <div className="inner-text-come">
                    <div>
                      <Link to={blogUrl} style={{ textDecoration: "none" }}>
                        <p className="small-text-black">{blog.excerpt}</p>
                      </Link>
                    </div>
                    <Link
                      to={blogUrl}
                      className="read-more-btn-blue"
                      aria-label={`Read more about ${blog.title}`}
                    >
                      Read More <i className="bi bi-arrow-right arrow-icon"></i>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {showLoadMore && (
          <button className="load-more" onClick={loadMore}>
            Load More
          </button>
        )}
      </div>
    </div>
  );
};

// Skeleton loader for blog cards
const BlogCardSkeleton = () => (
  <div className="inner-news-blogs-container">
    <div className="blog-text">
      <div className="skeleton-title"></div>
      <div className="skeleton-title"></div>
    </div>
    <div className="image-hover-text-come">
      <div className="inner-text-come">
        <div>
          <div className="skeleton-title"></div>
          <div className="skeleton-excerpt"></div>
        </div>
        <div className="skeleton-link"></div>
      </div>
    </div>
  </div>
);

export default Blogs;
