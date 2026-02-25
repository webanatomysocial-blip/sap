import React, { useEffect, useRef, useMemo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "react-router-dom";
import "../css/blog-post.css";

// Icons and Components
import ShareButton from "./ShareButton";
import BlogSidebar from "./BlogSidebar";
import AuthorBio from "./AuthorBio"; // Keep as fallback
import CommentSection from "./CommentSection";
import SEO from "./SEO";
import AuthorProfile from "./AuthorProfile";
import FAQ from "./FAQ";
import { authors } from "../data/authors";

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

const BlogLayout = ({
  blogId,
  title,
  content,
  image,
  date,
  author = "Raghu Boddu", // Default or passed prop
  authorImage, // New prop
  sidebarAd = {}, // Sidebar ad data
  dynamicRecentPosts = [], // New prop for passing recent posts if available
  viewCount = 0,
  commentCount = 0,
  faqs = [],
  cta = {},
  onCommentAdded,
  metaTitle,
  metaDescription,
  metaKeywords,
}) => {
  const progressBarRef = useRef(null);
  const currentUrl = window.location.href;

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

  // Format date correctly e.g., "January 28, 2026"
  const formatDateForm = (dateString) => {
    if (!dateString) return "October 16, 2025";
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    } catch {
      return dateString;
    }
  };

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
  }, [blogId, title]);

  return (
    <div className="blog-post-wrapper">
      <SEO
        title={metaTitle || title}
        description={
          metaDescription ||
          `${title} - Written by ${author || "SAP Security Expert"}. Read more about ${title} on SAP Security Expert.`
        }
        image={image}
        url={currentUrl}
        type="article"
        author={author}
        keywords={metaKeywords || `SAP Security, ${title}, ${author}, SAP Blog`}
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

          {/* 3. Meta Row: Author, Date, Views */}
          <div className="blog-meta-row">
            <div className="meta-left">
              <span className="meta-author">
                {/* Format: Raghu Boddu, January 23, 2026 */}
                {authorId ? authors[authorId].name : author},
              </span>
              <span className="meta-date" style={{ marginLeft: "5px" }}>
                {formatDateForm(date)}
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

          {/* FAQS SECTION */}
          {faqs && faqs.length > 0 && (
            <div
              className="blog-faqs-section"
              style={{ marginTop: "40px", marginBottom: "40px" }}
            >
              <FAQ title="Frequently Asked Questions" faqs={faqs} />
            </div>
          )}

          {/* CTA SECTION */}
          {cta && cta.title && (
            <div
              className="blog-cta-section"
              style={{
                background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
                color: "white",
                padding: "40px",
                borderRadius: "16px",
                textAlign: "center",
                margin: "40px 0",
                boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.4)",
              }}
            >
              <h2
                style={{
                  fontSize: "1.8rem",
                  marginBottom: "16px",
                  color: "white",
                }}
              >
                {cta.title}
              </h2>
              {cta.description && (
                <p
                  style={{
                    fontSize: "1.1rem",
                    marginBottom: "24px",
                    opacity: 0.9,
                  }}
                >
                  {cta.description}
                </p>
              )}
              {cta.buttonText && cta.buttonLink && (
                <a
                  href={cta.buttonLink}
                  className="btn-cta"
                  style={{
                    display: "inline-block",
                    background: "white",
                    color: "#1e40af",
                    padding: "12px 32px",
                    borderRadius: "50px",
                    fontWeight: "bold",
                    textDecoration: "none",
                    transition: "transform 0.2s",
                  }}
                  onMouseOver={(e) =>
                    (e.target.style.transform = "scale(1.05)")
                  }
                  onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
                >
                  {cta.buttonText}
                </a>
              )}
            </div>
          )}

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
          <CommentSection blogId={blogId} onCommentAdded={onCommentAdded} />

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
