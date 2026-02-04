import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { blogMetadata } from "../blogs/metadata";
import { authors } from "../data/authors";
import "../css/CommunitySection.css";
import ads1 from "../assets/promotions/promo-1.png";
import ads2 from "../assets/promotions/promo-2.png";

export default function CommunitySection() {
  const [activeMembersTab, setActiveMembersTab] = useState("Active");
  const [groupsTab, setGroupsTab] = useState("Popular");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [contributorCount, setContributorCount] = useState(128); // Default fallback

  useEffect(() => {
    fetch("/api/get_community_stats.php")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.active_contributors) {
          // You might want to add a base number if the DB is empty initially, e.g., +128
          setContributorCount(parseInt(data.active_contributors) + 128);
        }
      })
      .catch((err) => console.error("Error fetching stats:", err));
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
  const [announcements, setAnnouncements] = useState([]);
  const [trendingTopics, setTrendingTopics] = useState([]);

  useEffect(() => {
    // Fetch Announcements
    fetch("/api/get_announcements.php")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAnnouncements(data);
      })
      .catch((err) => console.error("Error fetching announcements:", err));

    // Fetch Trending Topics
    fetch("/api/get_trending_topics.php")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Extract just the topic names if the API returns objects
          const tags = data.map((item) => item.topic_name);
          setTrendingTopics(tags);
        }
      })
      .catch((err) => console.error("Error fetching trending topics:", err));
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
              <img src={ads1} alt="Promotion 1" />
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
                  <i className="bi bi-eye"></i> {featuredArticle.views || 0}
                </span>
                <span>
                  <i className="bi bi-chat"></i> 0
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
                        <span>
                          <i className="bi bi-eye"></i> {announcement.views}
                        </span>
                        <span>
                          <i className="bi bi-chat"></i> {announcement.comments}
                        </span>
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
              <img src={ads2} alt="Promotion 2" />
            </div>

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
