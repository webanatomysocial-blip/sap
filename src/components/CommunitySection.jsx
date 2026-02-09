import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { blogMetadata } from "../blogs/metadata";
import { authors } from "../data/authors";
import "../css/CommunitySection.css";
import ads1 from "../assets/promotions/promo-1.png";
import ads2 from "../assets/promotions/promo-2.png";

export default function CommunitySection() {
  /* eslint-disable no-unused-vars */
  // Tabs and state placeholders - removing unused ones
  // const [activeMembersTab, setActiveMembersTab] = useState("Newest");
  // const [groupsTab, setGroupsTab] = useState("Popular");
  /* eslint-enable no-unused-vars */

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [contributorCount, setContributorCount] = useState(0);
  const [contributors, setContributors] = useState([]);
  const [stats, setStats] = useState({ views: {}, comments: {} });

  // State for announcements
  const [announcements, setAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);

  // State for Ads
  const [adsConfig, setAdsConfig] = useState({
    home_left: { active: false, image: "", link: "" },
    home_right: { active: false, image: "", link: "" },
  });

  useEffect(() => {
    // Fetch View/Comment Stats
    // Fetch View/Comment Stats (Safe Fallback)
    fetch("/api/stats.php")
      .then((res) => {
        if (!res.ok) throw new Error("API not found");
        return res.json();
      })
      .then((data) => {
        if (data) setStats(data);
      })
      .catch((err) => {
        console.warn("Stats API failed, using defaults:", err);
        setStats({ views: {}, comments: {} });
      });

    fetch("/api/get_community_stats.php")
      .then((res) => {
        if (!res.ok) throw new Error("API not found");
        return res.json();
      })
      .then((data) => {
        if (data && data.active_contributors) {
          setContributorCount(parseInt(data.active_contributors) + 0);
        }
      })
      .catch((err) => console.warn("Community stats API failed:", err));

    // Fetch approved contributors
    fetch("/api/get_approved_contributors.php")
      .then((res) => {
        if (!res.ok) throw new Error("API not found");
        return res.json();
      })
      .then((data) => {
        if (data.status === "success") {
          setContributors(data.contributors || []);
        }
      })
      .catch((err) => console.warn("Contributors API failed:", err));

    // 1. Fetch Announcements
    fetch("/api/get_announcements.php")
      .then((res) => {
        if (!res.ok) throw new Error("API Limit");
        return res.json();
      })
      .then((data) => {
        // Filter active only
        const active = data.filter((a) => !a.status || a.status === "active");
        setAnnouncements(active);
        setLoadingAnnouncements(false);
      })
      .catch((err) => {
        console.warn("Announcement Fetch Failed", err);
        setLoadingAnnouncements(false);
      });

    // 2. Fetch Ads
    fetch("/api/manage_ads.php")
      .then((res) => res.json())
      .then((data) => {
        if (data.home_left)
          setAdsConfig((prev) => ({ ...prev, home_left: data.home_left }));
        if (data.home_right)
          setAdsConfig((prev) => ({ ...prev, home_right: data.home_right }));
      })
      .catch((err) => console.error("Ads Fetch Failed", err));

    // Fetch Trending Topics
    fetch("/api/get_trending_topics.php")
      .then((res) => {
        if (!res.ok) throw new Error("API not found");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          // Extract just the topic names if the API returns objects
          const tags = data.map((item) => item.topic_name);
          setTrendingTopics(tags);
        }
      })
      .catch((err) => console.warn("Trending topics API failed:", err));
  }, []);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;

    try {
      const response = await fetch("/api/send_mail.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: newsletterEmail,
          subject: "New Newsletter Subscription",
          message: "A new user has subscribed to the newsletter.",
        }),
      });

      const result = await response.json();

      if (response.ok && result.status === "success") {
        alert("Thank you for subscribing!");
        setNewsletterEmail("");
      } else {
        alert(result.message || "Subscription failed. Please try again.");
      }
    } catch (error) {
      console.error("Error subscribing:", error);
      alert("An error occurred. Please ensure the backend server is running.");
    }
  };

  // Get recent posts (latest 5)
  const recentPosts = [...blogMetadata]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const recentActivity = recentPosts.slice(0, 3);

  // Get featured article (most recent)
  const featuredArticle = blogMetadata[0];

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { month: "long", day: "numeric", year: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  // Dynamic Data State
  const [trendingTopics, setTrendingTopics] = useState([]);

  useEffect(() => {
    // Fetch Dynamic Ads
    const storedAds = JSON.parse(localStorage.getItem("admin_ads") || "{}");
    if (storedAds.home_left || storedAds.home_right) {
      setAdsConfig({
        home_left: storedAds.home_left || { active: false },
        home_right: storedAds.home_right || { active: false },
      });
    }

    // Fetch Announcements (Try LocalStorage first for Demo)
    const storeAnnouncements = JSON.parse(
      localStorage.getItem("admin_announcements") || "[]",
    );
    if (storeAnnouncements.length > 0) {
      // Filter for active only
      const active = storeAnnouncements.filter((a) => a.status === "active");
      setAnnouncements(active);
    } else {
      fetch("/api/get_announcements.php")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setAnnouncements(data);
        })
        .catch((err) => console.error("Error fetching announcements:", err));
    }

    // Fetch Trending Topics
    fetch("/api/get_trending_topics.php")
      .then((res) => {
        if (!res.ok) throw new Error("API not found");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          // Extract just the topic names if the API returns objects
          const tags = data.map((item) => item.topic_name);
          setTrendingTopics(tags);
        }
      })
      .catch((err) => console.warn("Trending topics API failed:", err));
  }, []);

  const scrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element && window.lenis) {
      window.lenis.scrollTo(element);
    } else if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="community-section">
      <div className="container">
        {/* <div className="community-header">
          <h1>An exclusive community for SAP Security & GRC professionals</h1>
        </div> */}

        <div className="community-grid">
          {/* LEFT COLUMN */}
          <div className="community-left">
            {/* Recent Topics */}
            <div className="widget">
              <div className="widget-header">
                <h3>Recent Topics</h3>
              </div>
              <div className="topics-list">
                {recentPosts.slice(0, 3).map((post) => (
                  <Link
                    key={post.slug}
                    to={`/blogs/${post.slug}`}
                    className="topic-item"
                  >
                    <span className="topic-label">R</span>
                    <div className="topic-info">
                      <span className="topic-title">{post.title}</span>
                      <span className="topic-meta">
                        By {authors[post.author]?.name || post.author}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
              <a
                href="#featured-insights"
                className="view-all-link"
                onClick={(e) => scrollToSection(e, "featured-insights")}
              >
                Browse All Topics →
              </a>
            </div>

            {/* Promotion */}
            <div className="widget promo-widget">
              {adsConfig.home_left.active ? (
                <a
                  href={adsConfig.home_left.link || "#"}
                  target={adsConfig.home_left.link ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                >
                  <img
                    src={adsConfig.home_left.image}
                    alt="Promotion 1"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                </a>
              ) : (
                <img src={ads1} alt="Promotion 1" />
              )}
            </div>

            {/* Trending Topics */}
            <div className="widget">
              <div className="widget-header">
                <h3>Trending Topics</h3>
              </div>
              <div className="trending-tags">
                {trendingTopics.map((tag) => (
                  <span key={tag} className="trending-tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* CENTER COLUMN */}
          <div className="community-center">
            {/* Featured Insight */}
            <div className="featured-insight-card">
              <span className="featured-badge">Featured Insight</span>
              <h2>{featuredArticle.title}</h2>
              <p>{featuredArticle.excerpt}</p>
              <div className="featured-meta">
                <span>
                  <i className="bi bi-clock"></i> 6 min read
                </span>
                <span>
                  <i className="bi bi-eye"></i>{" "}
                  {stats.views[featuredArticle.slug] ||
                    featuredArticle.views ||
                    0}
                </span>
                <span>
                  <i className="bi bi-chat"></i>{" "}
                  {stats.comments[featuredArticle.slug] || 0}
                </span>
              </div>
              <Link
                to={`/blogs/${featuredArticle.slug}`}
                className="btn-read-insight"
              >
                Read Full Insight →
              </Link>
            </div>

            {/* Recent Activity */}
            <div className="widget">
              <div className="widget-header">
                <h3>Recent Activity</h3>
              </div>
              <div className="activity-list">
                {recentActivity.map((activity) => (
                  <Link
                    key={activity.slug}
                    to={`/blogs/${activity.slug}`}
                    className="activity-item"
                  >
                    <img src={activity.image} alt={activity.title} />
                    <div className="activity-content">
                      <span className="activity-badge">
                        {activity.category.replace("sap-", "").toUpperCase()}
                      </span>
                      <h4>{activity.title}</h4>
                      <p>{activity.excerpt.substring(0, 100)}...</p>
                      <div className="activity-meta">
                        <span>
                          <i className="bi bi-person-circle"></i>{" "}
                          {authors[activity.author]?.name || activity.author}
                        </span>
                        <span>{formatDate(activity.date)}</span>
                      </div>
                      <span className="activity-link">
                        Read & Join Discussion →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
              <Link to="/contact" className="view-all-link-center">
                Join the Community →
              </Link>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="community-right">
            {/* Announcements */}
            <div className="widget">
              <div className="widget-header">
                <h3>Announcements</h3>
              </div>
              <div className="announcements-list">
                {announcements.length === 0 ? (
                  <p style={{ fontSize: "0.9rem", color: "#666" }}>
                    No announcements yet.
                  </p>
                ) : (
                  announcements.map((announcement, i) => (
                    <div key={i} className="announcement-item">
                      <h4>{announcement.title}</h4>
                      <div className="announcement-meta">
                        <span>{announcement.date}</span>
                        {/* <span>
                          <i className="bi bi-eye"></i> {announcement.views || 0}
                        </span>
                        <span>
                          <i className="bi bi-chat"></i> {announcement.comments || 0}
                        </span> */}
                        {announcement.link && (
                          <a
                            href={announcement.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ marginLeft: "10px" }}
                          >
                            <i className="bi bi-box-arrow-up-right"></i>
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              {/* <Link to="/announcements" className="view-all-link">
                View All Announcements →
              </Link> */}
            </div>

            {/* Promotion */}
            <div className="widget promo-widget">
              {adsConfig.home_right.active ? (
                <a
                  href={adsConfig.home_right.link || "#"}
                  target={adsConfig.home_right.link ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                >
                  <img
                    src={adsConfig.home_right.image}
                    alt="Promotion 2"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                </a>
              ) : (
                <img src={ads2} alt="Promotion 2" />
              )}
            </div>

            {/* Community Stats / Participants - Unhidden & Dynamic */}
            <div className="widget">
              <div className="widget-header">
                <h3>Community</h3>
              </div>
              <div className="community-stats" style={{ padding: "0 10px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "10px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "2rem",
                      fontWeight: "bold",
                      color: "#2563eb",
                    }}
                  >
                    {contributorCount}
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "#64748b" }}>
                    Active Contributors &<br />
                    Industry Experts
                  </div>
                </div>
                <p style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                  Join the network of SAP Security professionals.
                </p>
              </div>
            </div>

            {/* Approved Contributors List */}
            {contributors.length > 0 && (
              <div className="widget" style={{ marginTop: "20px" }}>
                <div className="widget-header">
                  <h3>Our Contributors</h3>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {contributors.slice(0, 5).map((contributor, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "10px",
                        background: "#f8fafc",
                        borderRadius: "6px",
                        borderLeft: "3px solid #2563eb",
                      }}
                    >
                      <strong style={{ color: "#1e293b", fontSize: "0.95rem" }}>
                        {contributor.full_name}
                      </strong>
                      {contributor.role && (
                        <div
                          style={{
                            fontSize: "0.8rem",
                            color: "#64748b",
                            marginTop: "2px",
                          }}
                        >
                          {contributor.role}
                        </div>
                      )}
                      {contributor.linkedin && (
                        <a
                          href={contributor.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: "0.75rem",
                            color: "#2563eb",
                            marginTop: "4px",
                            display: "inline-block",
                          }}
                        >
                          LinkedIn →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Newsletter */}
            <div className="widget newsletter-widget">
              <div className="newsletter-icon">
                <i className="bi bi-envelope"></i>
              </div>
              <h3>Newsletter</h3>
              <p>Check Latest Updates</p>
              <form
                className="newsletter-form"
                onSubmit={handleNewsletterSubmit}
              >
                <input
                  type="email"
                  placeholder="Enter Your Email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                />
                <button type="submit">→</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
