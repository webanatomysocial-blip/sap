import React, { useState, useEffect, Suspense } from "react";
// Removed static metadata import
import { Link } from "react-router-dom";
import "../css/Blog.css";

const Blogs = ({ backgroundColor, limit = 3, category }) => {
  const [visibleCount, setVisibleCount] = useState(
    limit === "all" ? 10 : limit,
  );
  const [allBlogs, setAllBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || "/api";

    // 2. Get Dynamic Blogs from API - PRIORITY & ONLY SOURCE
    fetch(`${API_URL}/posts`)
      .then((res) => res.json())
      .then((response) => {
        // Laravel Paginated response has 'data' array, or direct array
        const virtualData = Array.isArray(response)
          ? response
          : response.data || [];

        let virtualBlogs = virtualData.map((b) => ({
          ...b,
          type: "virtual",
          image:
            b.image ||
            b.featured_image ||
            "https://placehold.co/600x400?text=No+Image",
          date: b.date || b.published_at || b.created_at,
          // Ensure slug is present
          slug: b.slug || b.id,
        }));

        // Filter by category if provided
        if (category) {
          virtualBlogs = virtualBlogs.filter(
            (b) => b.category === category || b.subCategory === category,
          );
        }

        // Sort by date descending
        const finalBlogs = virtualBlogs.sort((a, b) => {
          return new Date(b.date) - new Date(a.date);
        });

        setAllBlogs(finalBlogs);
        if (limit === "all") setVisibleCount(finalBlogs.length);
        else setVisibleCount(limit);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load blogs from API", err);
        setAllBlogs([]); // Empty state on error
        setLoading(false);
      });
  }, [limit, category]); // Re-run if limit or category changes

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
