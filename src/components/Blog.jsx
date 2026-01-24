import React, { useState, useEffect, Suspense } from "react";
import { Link } from "react-router-dom";
import { blogMetadata } from "../blogs/metadata.js";
import "../css/Blog.css";

// Dynamically import all JSX files from blogs folder
// Dynamically import all JSX files from various folders
const blogModules = import.meta.glob(
  [
    "../blogs/*.jsx",
    "../sap-security/*.jsx",
    "../sap-licensing/*.jsx",
    "../sap-iag/*.jsx",
    "../sap-grc/*.jsx",
    "../sap-cybersecurity/*.jsx",
    "../product-reviews/*.jsx",
    "../podcasts/*.jsx",
    "../other-tools/*.jsx",
  ],
  { eager: false },
);
const blogKeys = Object.keys(blogModules);

// Sort blogKeys by date in descending order (most recent first)
const sortedBlogKeys = blogKeys.sort((a, b) => {
  const blogNameA = a.split("/").pop().replace(".jsx", "");
  const blogNameB = b.split("/").pop().replace(".jsx", "");
  const metadataA = blogMetadata.find((blog) => blog.id === blogNameA) || {
    date: "1970-01-01",
  };
  const metadataB = blogMetadata.find((blog) => blog.id === blogNameB) || {
    date: "1970-01-01",
  };
  return new Date(metadataB.date) - new Date(metadataA.date);
});

const Blogs = ({ backgroundColor, limit = 3 }) => {
  // Log props for debugging
  console.log("Blogs component props:", { backgroundColor, limit });

  const totalBlogs = sortedBlogKeys.length;
  // Determine initial number of blogs to show: all for 'all', otherwise use limit
  const initialVisible =
    limit === "all" ? totalBlogs : Math.min(limit, totalBlogs);
  const [visibleCount, setVisibleCount] = useState(initialVisible);

  // Log sortedBlogKeys for debugging
  console.log("Sorted blog keys:", sortedBlogKeys);

  // Preload blog components and images
  useEffect(() => {
    sortedBlogKeys.slice(0, visibleCount).forEach((key) => {
      // Preload blog module
      blogModules[key]().catch((error) => {
        console.error(`Error preloading blog ${key}:`, error);
      });
      // Preload image
      const blogName = key.split("/").pop().replace(".jsx", "");
      const metadata = blogMetadata.find((blog) => blog.id === blogName);
      if (metadata?.image) {
        const img = new Image();
        img.src = metadata.image;
        img.onerror = () => {
          console.error(`Failed to preload image: ${metadata.image}`);
        };
      }
    });
  }, [visibleCount]);

  const loadMore = () => {
    const newCount = totalBlogs;
    setVisibleCount(newCount);
    setTimeout(() => {
      window.lenis?.scrollTo(window.scrollY, { immediate: true });
    }, 0);
  };

  // Only show "Load More" if limit='all' and there are more blogs to load
  const showLoadMore = limit === "all" && visibleCount < totalBlogs;

  return (
    <div className="whole-blog-section" style={{ backgroundColor }}>
      <div className="blogs-container">
        <div className="blogs-grid">
          {sortedBlogKeys.length === 0 && <p>No blogs found.</p>}
          {sortedBlogKeys.slice(0, visibleCount).map((key, index) => {
            const blogName = key.split("/").pop().replace(".jsx", "");
            const metadata = blogMetadata.find(
              (blog) => blog.id === blogName,
            ) || {
              title: blogName,
              slug: blogName.toLowerCase(),
              excerpt: "No excerpt available.",
              image: "/images/placeholder.jpg",
              date: "No date",
            };
            // Log each blog's metadata for debugging
            console.log(
              `Blog: ${blogName}, URL: /blogs/${blogName}, Metadata:`,
              metadata,
            );
            return (
              <div key={index} className="inner-news-blogs-container">
                <Suspense fallback={<BlogCardSkeleton />}>
                  <div className="blog-text">
                    <p className="text-black">BLOG</p>
                    <Link
                      to={`/blogs/${blogName}`}
                      style={{ textDecoration: "none" }}
                    >
                      <p className="sub-big-heading-text-black">
                        {metadata.title}
                      </p>
                    </Link>
                  </div>
                  <div
                    className="image-hover-text-come"
                    style={{ backgroundImage: `url(${metadata.image})` }}
                  >
                    <div className="inner-text-come">
                      <div>
                        <Link
                          to={`/blogs/${blogName}`}
                          style={{ textDecoration: "none" }}
                        >
                          <p className="small-text-black">{metadata.excerpt}</p>
                        </Link>
                      </div>
                      <Link
                        to={`/blogs/${blogName}`}
                        className="read-more-btn-blue"
                        aria-label={`Read more about ${metadata.title}`}
                      >
                        Read More{" "}
                        <i className="bi bi-arrow-right arrow-icon"></i>
                      </Link>
                    </div>
                  </div>
                </Suspense>
              </div>
            );
          })}
        </div>
        {showLoadMore && (
          <button className="load-more" onClick={loadMore}>
            Load More
          </button>
        )}
      </div>
    </div>
  );
};

// Skeleton loader for blog cards
const BlogCardSkeleton = () => (
  <div className="inner-news-blogs-container">
    <div className="blog-text">
      <div className="skeleton-title"></div>
      <div className="skeleton-title"></div>
    </div>
    <div className="image-hover-text-come">
      <div className="inner-text-come">
        <div>
          <div className="skeleton-title"></div>
          <div className="skeleton-excerpt"></div>
        </div>
        <div className="skeleton-link"></div>
      </div>
    </div>
  </div>
);

export default Blogs;
