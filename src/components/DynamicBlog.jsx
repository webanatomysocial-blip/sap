import React, { Suspense, useMemo, useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { blogMetadata } from "../blogs/metadata.js";
import { Helmet } from "react-helmet-async";
import BlogLayout from "./BlogLayout"; // Import BlogLayout directly

// Import all blog modules from ../blogs/*.jsx
// Import all blog modules from ../*/*.jsx
const blogModules = import.meta.glob(["../blog-content/*.jsx"]);

// Map module keys to React.lazy components once, outside of render
const lazyBlogComponents = Object.keys(blogModules).reduce((acc, key) => {
  acc[key] = React.lazy(blogModules[key]);
  return acc;
}, {});

export default function DynamicBlog() {
  const { blogId } = useParams(); // Expecting slug or id
  const [virtualBlog, setVirtualBlog] = useState(null);
  const [sidebarAd, setSidebarAd] = useState({
    active: false,
    image: "",
    link: "",
  });

  // Check for Virtual Blog (API)
  useEffect(() => {
    if (!blogId) return;

    fetch("/api/manage_blogs.php")
      .then((res) => res.json())
      .then((all) => {
        const found = all.find((b) => b.slug === blogId || b.id === blogId);
        if (found) setVirtualBlog(found);
        else setVirtualBlog(null);
      })
      .catch((err) => console.error("Error loading blog details", err));

    // Fetch sidebar ad
    fetch("/api/manage_ads.php")
      .then((res) => res.json())
      .then((data) => {
        if (data.sidebar) {
          setSidebarAd(data.sidebar);
        }
      })
      .catch((err) => console.error("Error loading ads", err));
  }, [blogId]);

  // 1. Find metadata based on the URL param (slug or id)
  const metadata = useMemo(() => {
    if (virtualBlog) return virtualBlog; // Use virtual data if found
    if (!blogId) return null;
    return (
      blogMetadata.find((b) => b.slug === blogId || b.id === blogId) || null
    );
  }, [blogId, virtualBlog]);

  // 2. Determine the file path key for import.meta.glob
  const moduleKey = useMemo(() => {
    if (virtualBlog) return null; // No module for virtual blogs
    // If metadata found, look for its ID in filenames
    if (metadata) {
      // E.g. ../blogs/AmbitionPost.jsx or ../sap-licensing/SapLicensing1.jsx
      const key = Object.keys(blogModules).find((k) =>
        k.includes(`/${metadata.id}.jsx`),
      );
      return key;
    }
    // Fallback: try to match the URL param directly to filename
    // E.g. /blogs/AmbitionPost -> matches ../blogs/AmbitionPost.jsx
    const directKey = Object.keys(blogModules).find((k) => {
      const fname = k.split("/").pop().replace(".jsx", "");
      return fname === blogId;
    });
    return directKey;
  }, [metadata, blogId, virtualBlog]);

  // 3. Select the pre-created lazy component
  const BlogComponent = moduleKey ? lazyBlogComponents[moduleKey] : null;

  // 4. Compute 4 recent posts for sidebar
  const recentPosts = useMemo(() => {
    return blogMetadata
      .filter((b) => b.slug !== blogId && b.id !== blogId) // Exclude current
      .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by date descending
      .slice(0, 4) // Take top 4
      .map((b) => ({
        title: b.title,
        link: `/${b.category || "blogs"}/${b.slug}`,
      }));
  }, [blogId]);

  // RENDER VIRTUAL BLOG
  if (virtualBlog) {
    // Render content as HTML if possible, or plain text
    // Note: content is likely HTML from the editor
    return (
      <BlogLayout
        title={virtualBlog.title}
        content={
          <div dangerouslySetInnerHTML={{ __html: virtualBlog.content }} />
        }
        image={virtualBlog.image}
        date={virtualBlog.date}
        author={virtualBlog.author}
        sidebarAd={sidebarAd}
      />
    );
  }

  // RENDER STATIC BLOG
  if (!BlogComponent) {
    return (
      <div style={{ padding: "100px", textAlign: "center" }}>
        <h1>Blog Not Found</h1>
        <p>We couldn't find the post you're looking for.</p>
        <Link
          to="/blogs"
          style={{ textDecoration: "underline", color: "blue" }}
        >
          Back to Blogs
        </Link>
      </div>
    );
  }

  // 5. Render
  // The styled BlogLayout is inside the imported component itself.
  // We just mount it.
  return (
    <>
      <Helmet>
        <title>
          {metadata
            ? `${metadata.title} | SAP Security Expert`
            : "Blog | SAP Security Expert"}
        </title>
        <meta name="description" content={metadata?.metaDescription || ""} />
      </Helmet>

      <Suspense
        fallback={
          <div style={{ padding: "100px", textAlign: "center" }}>
            Loading...
          </div>
        }
      >
        <BlogComponent dynamicRecentPosts={recentPosts} />
      </Suspense>
    </>
  );
}
