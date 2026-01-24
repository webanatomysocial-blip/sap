import React from "react";
import { Link } from "react-router-dom";
import { blogMetadata } from "../blogs/metadata";
import { LuEye, LuMessageSquare } from "react-icons/lu";
import "../css/LatestBlogs.css";

export default function LatestBlogs() {
  // Sort blogs by date (newest first) and get the latest 6
  const latestBlogs = [...blogMetadata]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { month: "short", day: "numeric" };
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
    };

    return (
      categoryLabels[subCategory] || categoryLabels[category] || "SAP Security"
    );
  };

  // Check if blog is from the last 7 days
  const isLatest = (dateString) => {
    const blogDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today - blogDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
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
                    <i className="bi bi-person-circle"></i> {blog.author}
                  </span>
                  <span className="latest-blog-stats">
                    <LuEye /> {blog.views}
                  </span>
                  <span className="latest-blog-stats">
                    <LuMessageSquare /> 0
                  </span>
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
