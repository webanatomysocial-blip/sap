import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BsSearch } from "react-icons/bs";
import { categories } from "../data/categories";
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

  const API_URL = import.meta.env.VITE_API_URL || "/api";

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
      fetch(`${API_URL}/ads?zone=sidebar`)
        .then((res) => res.json())
        .then((data) => {
          // Laravel returns an array of ads or single object depending on endpoint implementation
          // Assuming array from previous code
          if (Array.isArray(data) && data.length > 0) {
            const ad = data[0];
            setSidebarAd({
              active: true,
              image: ad.image_url,
              link: ad.target_url,
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
        <ul className="categories-list">
          {categories.map((cat, idx) => (
            <li key={idx}>
              {/* Removed /category/ prefix */}
              <Link to={`/${cat.slug}`}>{cat.name}</Link>
            </li>
          ))}
        </ul>
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
