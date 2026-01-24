import React, { useState } from "react";
import { Link } from "react-router-dom";
import { BsSearch } from "react-icons/bs";
import { blogMetadata } from "../blogs/metadata";
import { categories } from "../data/categories";
import "../css/BlogSidebar.css";

const BlogSidebar = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter posts based on search term
  const filteredPosts = blogMetadata
    .filter((post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()),
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
        <ul className="latest-posts-list">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <li key={post.id} className="latest-post-item">
                <Link to={`/${post.category}/${post.slug}`}>{post.title}</Link>
              </li>
            ))
          ) : (
            <li className="latest-post-item">No posts found.</li>
          )}
        </ul>
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
    </aside>
  );
};

export default BlogSidebar;
