import React, { useEffect, useRef, useMemo, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link, useParams } from "react-router-dom";
import "../css/blog-post.css";

// Icons and Components
import ShareButton from "./ShareButton";
import BlogSidebar from "./BlogSidebar";
import AuthorBio from "./AuthorBio"; // Keep as fallback
import CommentSection from "./CommentSection";
import SEO from "./SEO";
import AuthorProfile from "./AuthorProfile";
import { authors } from "../data/authors";

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

const BlogLayout = ({
  title,
  content,
  image,
  date,
  author = "Raghu Boddu", // Default or passed prop
  authorImage, // New prop
  sidebarAd = {}, // Sidebar ad data
  dynamicRecentPosts = [], // New prop for passing recent posts if available
}) => {
  const progressBarRef = useRef(null);
  const currentUrl = window.location.href;
  const { blogId } = useParams(); // Get slug from URL
  const [viewCount, setViewCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);

  // Helper to find author ID based on name or ID passed
  const authorId = useMemo(() => {
    if (authors[author]) return author; // It was an ID
    // Search by name
    for (const [key, val] of Object.entries(authors)) {
      if (val.name === author) return key;
    }
    return null;
  }, [author]);

  // Compute Previous and Next Posts - Disabled for now as we are 100% DB driven
  const prevPost = null;
  const nextPost = null;

  const API_URL = import.meta.env.VITE_API_URL || "/api";

  useEffect(() => {
    // Animate Progress Bar
    if (progressBarRef.current) {
      gsap.to(progressBarRef.current, {
        width: "100%",
        ease: "none",
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.3,
        },
      });
    }

    // Views and Comments are now handled via the Post object returned by the API
    // If this component is used with hardcoded metadata (legacy), we fetch stats
    if (blogId && !title) {
      // Future: Migrate this component to fetch POST data by slug from API
    }
  }, [blogId, title]);

  return (
    <div className="blog-post-wrapper">
      <SEO
        title={title}
        description={`${title} - Written by ${author || "SAP Security Expert"}. Read more about ${title} on SAP Security Expert.`}
        image={image}
        url={currentUrl}
        type="article"
        author={author}
        keywords={`SAP Security, ${title}, ${author}, SAP Blog`}
      />
      {/* Reading Progress Bar */}
      {/* <div className="reading-progress-bar" ref={progressBarRef}></div> */}

      <div className="container blog-container">
        {/* Main Content Column */}
        <main className="blog-main-column">
          {/* 1. Featured Image (Top) */}
          {image && (
            <div className="blog-featured-image">
              <img src={image} alt={title} />
            </div>
          )}

          {/* Breadcrumbs Removed */}

          {/* 3. Meta Row: Author, Date, Views */}
          <div className="blog-meta-row">
            <div className="meta-left">
              <span className="meta-author">
                {/* Format: Raghu Boddu, January 23, 2026 */}
                {authorId ? authors[authorId].name : author},
              </span>
              <span className="meta-date" style={{ marginLeft: "5px" }}>
                {date || "October 16, 2025"}
              </span>
              <span className="meta-dot">•</span>
              <span className="meta-read-time">
                <i className="bi bi-clock"></i> 5 min read
              </span>
              <span className="meta-dot">•</span>
              <span className="meta-views">
                <i className="bi bi-eye"></i> {viewCount}
              </span>
              <span className="meta-dot">•</span>
              <span className="meta-comments">
                <i className="bi bi-chat"></i> {commentCount} Comments
              </span>
            </div>

            <div className="meta-right">
              <ShareButton title={title} url={currentUrl} />
            </div>
          </div>

          {/* 4. Title */}
          <h1 className="blog-title">{title}</h1>

          {/* 5. Content Body */}
          <article className="blog-content-body">{content}</article>

          <div className="post-footer-divider"></div>

          {/* Dynamic Author Profile */}
          {authorId ? (
            <div style={{ marginTop: "0px", marginBottom: "40px" }}>
              <AuthorProfile authorId={authorId} />
            </div>
          ) : (
            // Fallback if no dynamic author found
            <AuthorBio authorName={author} authorImage={authorImage} />
          )}

          {/* Dynamic Comment Section */}
          <CommentSection blogId={blogId} />

          {/* Navigation (Previous/Next) */}
          <div className="post-navigation">
            <div className="nav-prev">
              {prevPost && (
                <>
                  <span>&larr; PREVIOUS</span>
                  <Link to={`/${prevPost.category}/${prevPost.slug}`}>
                    {prevPost.title}
                  </Link>
                </>
              )}
            </div>
            <div className="nav-next">
              {nextPost && (
                <>
                  <span>NEXT &rarr;</span>
                  <Link to={`/${nextPost.category}/${nextPost.slug}`}>
                    {nextPost.title}
                  </Link>
                </>
              )}
            </div>
          </div>
        </main>

        {/* Right Sidebar */}
        <div className="blog-sidebar-column">
          <BlogSidebar sidebarAd={sidebarAd} />
        </div>
      </div>
    </div>
  );
};

export default BlogLayout;
