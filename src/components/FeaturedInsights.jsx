import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// blogMetadata import removed
import { authors } from "../data/authors";
import { LuEye, LuMessageSquare } from "react-icons/lu";
import "../css/FeaturedInsights.css";
import "../css/LatestBlogs.css"; // Import LatestBlogs styling

// Category mapping for tabs
const categoryMapping = {
  All: "all",
  "SAP Security": "sap-security",
  "SAP GRC & IAG": "sap-grc", // Updated label
  "SAP Cybersecurity": "sap-cybersecurity", // Updated label
  "SAP Licensing": "sap-licensing", // Updated label
};

export default function FeaturedInsights({ id }) {
  const [activeTab, setActiveTab] = useState("All");
  const [stats, setStats] = useState({ views: {}, comments: {} });
  const [allBlogs, setAllBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || "/api";

  useEffect(() => {
    // Fetch latest blogs from API
    fetch(`${API_URL}/posts`)
      .then((res) => res.json())
      .then((data) => {
        const blogData = Array.isArray(data) ? data : data.data || [];

        const mappedBlogs = blogData.map((b) => ({
          ...b,
          image:
            b.image ||
            b.featured_image ||
            "https://placehold.co/600x400?text=No+Image",
          date:
            b.date ||
            b.published_at ||
            b.created_at ||
            new Date().toISOString(),
          slug: b.slug || b.id,
        }));

        setAllBlogs(mappedBlogs);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching blogs:", err);
        setLoading(false);
      });
  }, [API_URL]);

  // Filter blogs based on active tab
  const getFilteredBlogs = () => {
    if (loading) return [];

    if (activeTab === "All") {
      return allBlogs.slice(0, 3);
    }

    const categoryKey = categoryMapping[activeTab];
    return allBlogs
      .filter((blog) => {
        // Direct match
        if (blog.category === categoryKey || blog.subCategory === categoryKey)
          return true;

        // Parent aggregation logic
        if (categoryKey === "sap-grc") {
          return (
            blog.category === "sap-access-control" ||
            blog.subCategory === "sap-access-control" ||
            blog.category === "sap-process-control" ||
            blog.subCategory === "sap-process-control" ||
            blog.category === "sap-iag" ||
            blog.subCategory === "sap-iag"
          );
        }
        if (categoryKey === "sap-security") {
          return (
            blog.category === "sap-btp-security" ||
            blog.category === "sap-public-cloud" ||
            blog.category === "sap-s4hana-security" ||
            blog.category === "sap-fiori-security"
          );
        }
        return false;
      })
      .slice(0, 3); // Limit to 3
  };

  const filteredBlogs = getFilteredBlogs();

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { month: "long", day: "numeric", year: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  // Get category badge label - Reused from LatestBlogs
  const getCategoryLabel = (category, subCategory) => {
    const categoryLabels = {
      "sap-grc": "SAP GRC",
      "sap-iag": "IAG",
      "sap-licensing": "Licensing",
      "sap-public-cloud": "Cloud",
      "sap-btp-security": "Cybersecurity",
      "sap-cybersecurity": "Cybersecurity",
      podcasts: "Podcast",
      "other-tools": "Tools",
      "sap-access-control": "SAP Access Control",
      "sap-process-control": "SAP Process Control",
      "sap-security": "SAP Security",
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

        {/* Blog Cards Grid - Using LatestBlogs Design */}
        {/* We reuse the class names from LatestBlogs.css which should be imported or shared */}
        <div className="latest-blogs-grid">
          {filteredBlogs.map((blog) => (
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
