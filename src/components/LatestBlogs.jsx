import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { blogMetadata } from "../blogs/metadata";
import { authors } from "../data/authors";
import { LuEye, LuMessageSquare } from "react-icons/lu";
import "../css/LatestBlogs.css";

export default function LatestBlogs() {
  const [stats, setStats] = useState({ views: {}, comments: {} });

  useEffect(() => {
    fetch("/api/stats.php")
      .then((res) => res.json())
      .then((data) => {
        if (data) setStats(data);
      })
      .catch((err) => console.error("Error fetching stats:", err));
  }, []);

  // Sort blogs by date (newest first) and get the latest 6
  const latestBlogs = [...blogMetadata]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

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
                      {stats.views[blog.slug] || blog.views || 0}
                    </span>
                    <span>
                      <i className="bi bi-chat"></i>{" "}
                      {stats.comments[blog.slug] || 0}
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
