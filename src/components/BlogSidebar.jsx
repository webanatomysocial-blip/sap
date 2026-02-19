import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BsSearch } from "react-icons/bs";
// Removed static categories import
import "../css/BlogSidebar.css";

const BlogSidebar = ({ sidebarAd: propSidebarAd = {} }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarAd, setSidebarAd] = useState({
    active: false,
    image: "",
    link: "",
  });
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dynamic Categories State
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || "/api";

  // Helper to format slug to name
  const formatCategoryName = (slug) => {
    if (!slug) return "";
    // Manual overrides for specific acronyms
    const overrides = {
      "sap-grc": "SAP GRC",
      "sap-iag": "SAP IAG",
      "sap-cis": "SAP CIS (IAS/IPS)",
      "sap-sac-security": "SAP SAC Security",
      "sap-btp-security": "SAP BTP Security",
      "sap-s4hana-security": "SAP S/4HANA Security",
      "sap-fiori-security": "SAP Fiori Security",
      "sap-public-cloud": "SAP Public Cloud",
      "sap-successfactors-security": "SuccessFactors",
      "sap-security-other": "Other SAP Security",
      "sap-access-control": "SAP Access Control",
      "sap-process-control": "SAP Process Control",
      "sap-cybersecurity": "SAP Cybersecurity",
      "sap-licensing": "SAP Licensing",
    };
    if (overrides[slug]) return overrides[slug];

    return slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Fetch Categories
  useEffect(() => {
    fetch(`${API_URL}/get_categories.php`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setCategories(data.categories || []);
        }
        setLoadingCategories(false);
      })
      .catch((err) => {
        console.error("Error fetching categories:", err);
        setLoadingCategories(false);
      });
  }, [API_URL]);

  // Fetch Posts for Search & Latest
  useEffect(() => {
    fetch(`${API_URL}/posts`)
      .then((res) => res.json())
      .then((data) => {
        const posts = Array.isArray(data) ? data : data.data || [];
        const mapped = posts.map((b) => ({
          ...b,
          slug: b.slug || b.id,
          date: b.date || b.published_at || b.created_at,
        }));
        setAllPosts(mapped);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching posts for sidebar:", err);
        setLoading(false);
      });
  }, [API_URL]);

  // Fetch Ads (or use prop)
  useEffect(() => {
    // If ad was passed as prop, use it; otherwise fetch
    if (propSidebarAd && propSidebarAd.active) {
      setSidebarAd(propSidebarAd);
    } else {
      fetch(`${API_URL}/ads?zone=blog_sidebar`)
        .then((res) => res.json())
        .then((data) => {
          // Laravel returns an array of ads or single object depending on endpoint implementation
          // Assuming array from previous code
          if (Array.isArray(data) && data.length > 0) {
            const ad = data[0];
            setSidebarAd({
              active: true,
              image: ad.image,
              link: ad.link,
            });
          } else if (data && data.active) {
            setSidebarAd(data);
          } else {
            setSidebarAd({ active: false });
          }
        })
        .catch((err) => console.error("Error fetching ads:", err));
    }
  }, [propSidebarAd, API_URL]);

  const filteredPosts = allPosts
    .filter((post) =>
      post.title
        ? post.title.toLowerCase().includes(searchTerm.toLowerCase())
        : false,
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <aside className="blog-sidebar">
      {/* Search Widget */}
      <div className="sidebar-widget search-widget">
        <div className="search-form">
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="button" aria-label="Search">
            <BsSearch />
          </button>
        </div>
      </div>

      {/* Latest Posts Widget (or Search Results) */}
      <div className="sidebar-widget latest-posts-widget">
        <h3 className="widget-title">
          {searchTerm ? "Search Results" : "Latest Posts"}
        </h3>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <ul className="latest-posts-list">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <li key={post.id} className="latest-post-item">
                  <Link to={`/${post.category || "blogs"}/${post.slug}`}>
                    {post.title}
                  </Link>
                </li>
              ))
            ) : (
              <li className="latest-post-item">No posts found.</li>
            )}
          </ul>
        )}
      </div>

      {/* Categories Widget */}
      <div className="sidebar-widget categories-widget">
        <h3 className="widget-title">Categories</h3>
        {loadingCategories ? (
          <p>Loading categories...</p>
        ) : (
          <ul className="categories-list">
            <li>
              <Link to="/blogs" className="cat-link-all">
                All Categories
              </Link>
            </li>
            {categories.map((slug, idx) => (
              <li key={idx}>
                <Link to={`/${slug}`}>{formatCategoryName(slug)}</Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Dynamic Sidebar Ad */}
      {sidebarAd.active && (
        <div
          className="sidebar-widget promo-widget"
          style={{ textAlign: "center", marginTop: "20px" }}
        >
          <a
            href={sidebarAd.link || "#"}
            target={sidebarAd.link ? "_blank" : "_self"}
            rel="noopener noreferrer"
          >
            <img
              src={sidebarAd.image}
              alt="Sidebar Ad"
              style={{ maxWidth: "100%", borderRadius: "8px" }}
              onError={(e) => (e.target.style.display = "none")}
            />
          </a>
        </div>
      )}
    </aside>
  );
};

export default BlogSidebar;
