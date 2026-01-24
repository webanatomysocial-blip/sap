import React, { useState } from "react";
import { Link } from "react-router-dom";
import { blogMetadata } from "../blogs/metadata";
import { LuEye, LuMessageSquare } from "react-icons/lu";
import "../css/FeaturedInsights.css";

// Category mapping for tabs
const categoryMapping = {
  All: "all",
  GRC: "sap-grc",
  IAM: "sap-iag",
  Compliance: "sap-licensing",
  Cloud: "sap-public-cloud",
  Hardening: "sap-btp-security",
};

export default function FeaturedInsights({ id }) {
  const [activeTab, setActiveTab] = useState("All");

  // Filter blogs based on active tab
  const getFilteredBlogs = () => {
    if (activeTab === "All") {
      return blogMetadata.slice(0, 4); // Show first 4 for "All"
    }

    const categoryKey = categoryMapping[activeTab];
    return blogMetadata
      .filter(
        (blog) =>
          blog.category === categoryKey || blog.subCategory === categoryKey,
      )
      .slice(0, 4);
  };

  const filteredBlogs = getFilteredBlogs();

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
      podcasts: "Podcast",
      "other-tools": "Tools",
    };

    return (
      categoryLabels[subCategory] || categoryLabels[category] || "SAP Security"
    );
  };

  return (
    <section
      className="featured-insights-section"
      id={id || "featured-insights"}
    >
      <div className="container">
        <div className="section-header-centered">
          <h2>Featured Insights</h2>
          <p>Curated articles & videos to help you stay ahead of the curve.</p>
        </div>

        {/* Tabs */}
        <div className="insights-tabs">
          {Object.keys(categoryMapping).map((tab) => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Blog Cards Grid */}
        <div className="insights-grid">
          {filteredBlogs.map((blog) => (
            <Link
              to={`/blogs/${blog.slug}`}
              key={blog.id}
              className="insight-card"
            >
              <div className="insight-image">
                <img src={blog.image} alt={blog.title} />
                <span className="insight-badge">
                  {getCategoryLabel(blog.category, blog.subCategory)}
                </span>
              </div>
              <div className="insight-content">
                <h3>{blog.title}</h3>
                <p className="insight-excerpt">{blog.excerpt}</p>
                <div className="insight-meta">
                  <span className="insight-author">
                    <i className="bi bi-person-circle"></i> {blog.author}
                  </span>
                  <span className="insight-stats">
                    <LuEye /> {blog.views}
                  </span>
                  <span className="insight-stats">
                    <LuMessageSquare /> 0
                  </span>
                </div>
                <div className="insight-footer">
                  <span className="insight-date">
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
