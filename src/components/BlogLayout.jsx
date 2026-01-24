import React, { useEffect, useRef, useMemo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "react-router-dom";
import "../css/blog-post.css";
import { blogMetadata } from "../blogs/metadata.js";

// Icons and Components
import ShareButton from "./ShareButton";
import BlogSidebar from "./BlogSidebar";
import AuthorBio from "./AuthorBio";
import CommentSection from "./CommentSection";

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

const BlogLayout = ({
  title,
  content,
  image,
  date,
  author = "Raghu Boddu", // Default or passed prop
  authorImage, // New prop
}) => {
  const progressBarRef = useRef(null);
  const currentUrl = window.location.href;

  // Compute Previous and Next Posts
  const { prevPost, nextPost } = useMemo(() => {
    const idx = blogMetadata.findIndex((b) => b.title === title);
    return {
      prevPost: idx > 0 ? blogMetadata[idx - 1] : null,
      nextPost: idx < blogMetadata.length - 1 ? blogMetadata[idx + 1] : null,
    };
  }, [title]);

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
  }, []);

  return (
    <div className="blog-post-wrapper">
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

          {/* 3. Meta Row: Author, Date, Share */}
          <div className="blog-meta-row">
            <div className="meta-left">
              <span className="meta-author">
                <i className="bi bi-person"></i> {author}
              </span>
              <span className="meta-dot">•</span>
              <span className="meta-date">
                <i className="bi bi-calendar3"></i> {date || "October 16, 2025"}
              </span>
              <span className="meta-dot">•</span>
              <span className="meta-time">
                <i className="bi bi-clock"></i> 5 min read
              </span>
              <span className="meta-dot">•</span>
              <span className="meta-comments">
                <i className="bi bi-chat"></i> Comments
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

          {/* Author Bio - Passing authorImage */}
          <AuthorBio authorName={author} authorImage={authorImage} />

          {/* Dynamic Comment Section */}
          <CommentSection
            blogId={
              title ? title.replace(/\s+/g, "-").toLowerCase() : "default"
            }
          />

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
          <BlogSidebar />
        </div>
      </div>
    </div>
  );
};

export default BlogLayout;
