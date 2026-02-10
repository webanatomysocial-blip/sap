import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// Removed static metadata import
import { authors } from "../data/authors";
import { LuEye, LuMessageSquare } from "react-icons/lu";
import "../css/LatestBlogs.css";

export default function LatestBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [stats, setStats] = useState({ views: {}, comments: {} });
  // Corrected API base URL
  const API_URL = import.meta.env.VITE_API_URL || "/api";

  useEffect(() => {
    // Fetch latest blogs from API
    fetch(`${API_URL}/posts`)
      .then((data) => {
        // Ensure data is an array
        const blogData = Array.isArray(data) ? data : data.data || [];

        // Map and validate data to prevent crashes
        const mappedData = blogData.map((b) => ({
          ...b,
          // Ensure valid date or fallback to now
          date:
            b.date ||
            b.published_at ||
            b.created_at ||
            new Date().toISOString(),
          image:
            b.image ||
            b.featured_image ||
            "https://placehold.co/600x400?text=No+Image",
          slug: b.slug || b.id,
        }));

        // Sort by date descending and take latest 6
        const sorted = mappedData
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 6);
        setBlogs(sorted);
      })
      .catch((err) => console.error("Error fetching blogs:", err));
  }, []);

  // No fallback to static metadata - API Source of Truth
  const latestBlogs = blogs;

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { month: "long", day: "numeric", year: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  // Get category badge label
  const getCategoryLabel = (category, subCategory) => {
    const categoryLabels = {
      "sap-grc": "SAP GRC",
      "sap-iag": "IAM",
      "sap-licensing": "Licensing",
      "sap-public-cloud": "Cloud",
      "sap-btp-security": "Cybersecurity",
      "sap-cybersecurity": "Cybersecurity",
      podcasts: "Podcast",
      "other-tools": "Tools",
      "sap-access-control": "SAP Access Control",
    };

    return (
      categoryLabels[subCategory] || categoryLabels[category] || "SAP Security"
    );
  };

  return (
    <section className="latest-blogs-section">
      <div className="container">
        <div className="section-header-centered">
          <h2>Latest Blogs & Activity</h2>
          <p>
            Stay updated with the latest insights from our SAP security experts.
          </p>
        </div>

        {/* Blog Cards Grid */}
        <div className="latest-blogs-grid">
          {latestBlogs.map((blog) => (
            <Link
              to={`/blogs/${blog.slug}`}
              key={blog.id}
              className="latest-blog-card"
            >
              <div className="latest-blog-image">
                <img src={blog.image} alt={blog.title} />
                <span className="latest-blog-badge">
                  {getCategoryLabel(blog.category, blog.subCategory)}
                </span>
              </div>
              <div className="latest-blog-content">
                <h3>{blog.title}</h3>
                <p className="latest-blog-excerpt">{blog.excerpt}</p>
                <div className="latest-blog-meta">
                  <span className="latest-blog-author">
                    <i className="bi bi-person-circle"></i>{" "}
                    {authors[blog.author]?.name || blog.author}
                  </span>
                  <div className="latest-blog-stats">
                    <span>
                      <i className="bi bi-eye"></i>{" "}
                      {blog.view_count || blog.views || 0}
                    </span>
                    <span>
                      <i className="bi bi-chat"></i> {blog.comment_count || 0}
                    </span>
                  </div>
                </div>
                <div className="latest-blog-footer">
                  <span className="latest-blog-date">
                    <i className="bi bi-calendar3"></i> {formatDate(blog.date)}
                  </span>
                  <span className="read-more">Read More →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
