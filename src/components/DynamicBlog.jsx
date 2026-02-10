import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { getPostBySlug } from "../services/api";
import BlogLayout from "./BlogLayout";

export default function DynamicBlog() {
  const { blogId } = useParams(); // Expecting slug or id
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarAd, setSidebarAd] = useState({
    active: false,
    image: "",
    link: "",
  });

  // Corrected API base URL
  const API_URL = import.meta.env.VITE_API_URL || "/api";

  // Check for Virtual Blog (API) + Track Views
  useEffect(() => {
    if (!blogId) return;

    setLoading(true);
    setError(null);

    // Generate or retrieve viewer UUID from localStorage
    let viewerId = localStorage.getItem("viewer_id");
    if (!viewerId) {
      viewerId =
        "viewer_" + Math.random().toString(36).substr(2, 9) + Date.now();
      localStorage.setItem("viewer_id", viewerId);
    }

    // Fetch blog from API
    getPostBySlug(blogId)
      .then((response) => {
        // Handle both simple JSON and Laravel Resource response
        let postData = response.data || response;

        // If returns an array (Laravel sometimes does this), take the first item
        if (Array.isArray(postData)) {
          postData = postData[0];
        }

        if (!postData || (!postData.title && !postData.id)) {
          throw new Error("Blog not found");
        }

        setBlog(postData);
        setLoading(false);

        // Track view for virtual blog
        if (postData.id || postData.slug) {
          const postId = postData.slug || postData.id;
          fetch(`${API_URL}/views`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ post_id: postId, viewer_id: viewerId }),
          }).catch((err) => console.error("View tracking failed:", err));
        }
      })
      .catch((err) => {
        console.error("Error loading blog details from API", err);
        setError("Blog not found");
        setBlog(null);
        setLoading(false);
      });

    // Fetch sidebar ad
    fetch(`${API_URL}/ads?zone=sidebar`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.active) {
          setSidebarAd(data);
        }
      })
      .catch(() => {
        // Silent fail for ads
      });
  }, [blogId, API_URL]);

  // RENDER LOADING
  if (loading) {
    return (
      <div style={{ padding: "100px", textAlign: "center" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading Blog...</p>
      </div>
    );
  }

  // RENDER ERROR
  if (error || !blog) {
    return (
      <div style={{ padding: "100px", textAlign: "center" }}>
        <h1>404 - Blog Not Found</h1>
        <p>
          The article you are looking for does not exist or has been removed.
        </p>
        <Link
          to="/blogs"
          style={{ textDecoration: "underline", color: "blue" }}
        >
          Back to Blogs
        </Link>
      </div>
    );
  }

  // RENDER BLOG (Database Content)
  return (
    <>
      <Helmet>
        <title>
          {blog.title
            ? `${blog.title} | SAP Security Expert`
            : "Blog | SAP Security Expert"}
        </title>
        <meta
          name="description"
          content={blog.excerpt || blog.meta_description || ""}
        />
        {/* Open Graph tags for social sharing */}
        <meta property="og:title" content={blog.title} />
        <meta property="og:description" content={blog.excerpt} />
        <meta property="og:image" content={blog.image || blog.featured_image} />
        <meta property="og:type" content="article" />
      </Helmet>

      <BlogLayout
        title={blog.title}
        content={
          <div
            className="blog-content-body"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        }
        image={blog.image || blog.featured_image}
        date={blog.date || blog.published_at || blog.created_at}
        author={blog.author || "Admin"}
        category={blog.category}
        sidebarAd={sidebarAd}
        // Pass recent posts if needed, but BlogLayout might handle logic or we can fetch them here.
        // For now, let's keep it simple. BlogLayout might need dynamicRecentPosts prop?
        // Let's implement dynamicRecentPosts logic here briefly or pass empty if BlogLayout handles it.
        // Based on previous code, DynamicBlog was passing it.
        dynamicRecentPosts={[]}
      />
    </>
  );
}
