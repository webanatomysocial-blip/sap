import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// Removed static metadata import
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
    community_left: { active: false, image: "", link: "" },
    community_right: { active: false, image: "", link: "" },
  });

  // Corrected API base URL
  const API_URL = import.meta.env.VITE_API_URL || "/api";

  // Dynamic Data State
  const [featuredArticle, setFeaturedArticle] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Fetch consolidated homepage data
    fetch(`${API_URL}/get_homepage_data.php`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setFeaturedArticle(data.featured || {});
          setRecentActivity(data.recent || []);
          setContributors(data.contributors || []);
          setContributorCount(data.contributors ? data.contributors.length : 0);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Homepage API failed", err);
        setLoading(false);
      });

    // Keep Announcements & Ads separate as they might have different caching/logic
    // Fetch Announcements
    fetch(`${API_URL}/announcements`)
      .then((res) => {
        if (!res.ok) throw new Error("API Error");
        return res.json();
      })
      .then((data) => {
        setAnnouncements(data);
        setLoadingAnnouncements(false);
      })
      .catch((err) => {
        console.warn("Announcement Fetch Failed", err);
        setLoadingAnnouncements(false);
      });

    // Fetch Ads
    fetch(`${API_URL}/ads`)
      .then((res) => res.json())
      .then((data) => {
        // API returns object keyed by zone
        const leftAd = data.community_left || data["community_left"];
        const rightAd = data.community_right || data["community_right"];

        setAdsConfig({
          community_left: leftAd?.active
            ? { active: true, image: leftAd.image, link: leftAd.link }
            : { active: false },
          community_right: rightAd?.active
            ? { active: true, image: rightAd.image, link: rightAd.link }
            : { active: false },
        });
      })
      .catch((err) => console.error("Ads Fetch Failed", err));

    // Fetch total contributor count separately if needed for the big number,
    // or rely on the length of the list if that's what was intended.
    // The user asked for "Latest 3 approved contributors" in list, but maybe total count in stats.
    // Let's keep the specific stats call for the big number if it exists, otherwise fallback.
    fetch(`${API_URL}/stats/community`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.active_contributors) {
          setContributorCount(parseInt(data.active_contributors));
        }
      })
      .catch((err) => console.warn("Stats failed", err));
  }, [API_URL]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const options = { month: "long", day: "numeric", year: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

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
                {recentActivity.map((post) => (
                  <Link
                    key={post.slug}
                    to={
                      post.category
                        ? `/${post.category}/${post.slug}`
                        : `/blogs/${post.slug}`
                    }
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
              {adsConfig.community_left.active ? (
                <a
                  href={adsConfig.community_left.link || "#"}
                  target={adsConfig.community_left.link ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                >
                  <img
                    src={adsConfig.community_left.image}
                    alt="Promotion 1"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                </a>
              ) : (
                <img src={ads1} alt="Promotion 1" />
              )}
            </div>

            {/* Our Contributors (Left Side) */}
            {contributors.length > 0 && (
              <div className="widget">
                <div className="widget-header">
                  <h3>Our Contributors</h3>
                </div>
                <div className="contributors-list-left">
                  {contributors.map((contributor, index) => (
                    <div key={index} className="contributor-card-new">
                      <div className="contributor-avatar">
                        {contributor.profile_image ? (
                          <img
                            src={contributor.profile_image}
                            alt={contributor.full_name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : null}
                        {/* Fallback Avatar if image fails or is missing */}
                        <div
                          className="avatar-fallback"
                          style={{
                            display: contributor.profile_image
                              ? "none"
                              : "flex",
                          }}
                        >
                          {contributor.full_name
                            ? contributor.full_name.charAt(0)
                            : "C"}
                        </div>
                      </div>
                      <div className="contributor-info">
                        <h4>{contributor.full_name}</h4>
                        <span className="joined-date">
                          Joined:{" "}
                          {formatDate(contributor.created_at || new Date())}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CENTER COLUMN */}
          <div className="community-center">
            {/* Featured Insight */}
            {featuredArticle && featuredArticle.title && (
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
                    {featuredArticle.view_count || featuredArticle.views || 0}
                  </span>
                  <span>
                    <i className="bi bi-chat"></i>{" "}
                    {featuredArticle.comment_count || 0}
                  </span>
                </div>
                <Link
                  to={
                    featuredArticle.category
                      ? `/${featuredArticle.category}/${featuredArticle.slug}`
                      : `/blogs/${featuredArticle.slug}`
                  }
                  className="btn-read-insight"
                >
                  Read Full Insight →
                </Link>
              </div>
            )}

            {/* Recent Activity */}
            <div className="widget">
              <div className="widget-header">
                <h3>Recent Activity</h3>
              </div>
              <div className="activity-list">
                {recentActivity.map((activity) => (
                  <Link
                    key={activity.slug}
                    to={
                      activity.category
                        ? `/${activity.category}/${activity.slug}`
                        : `/blogs/${activity.slug}`
                    }
                    className="activity-item"
                  >
                    {/* Handle optional image safely */}
                    {activity.image && (
                      <img src={activity.image} alt={activity.title} />
                    )}
                    <div className="activity-content">
                      <span className="activity-badge">
                        {activity.category
                          ? activity.category.replace("sap-", "").toUpperCase()
                          : "BLOG"}
                      </span>
                      <h4>{activity.title}</h4>
                      <p>
                        {activity.excerpt
                          ? activity.excerpt.substring(0, 100)
                          : ""}
                        ...
                      </p>
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
              {/* FIXED: Using Link for navigation */}
              <Link to="/become-a-contributor" className="view-all-link-center">
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
              {adsConfig.community_right.active ? (
                <a
                  href={adsConfig.community_right.link || "#"}
                  target={adsConfig.community_right.link ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                >
                  <img
                    src={adsConfig.community_right.image}
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

            {/* Approved Contributors List - Removed from Right (Moved to Left) */}

            {/* Newsletter */}
            <div className="widget newsletter-widget">
              <div className="newsletter-icon">
                <i className="bi bi-envelope"></i>
              </div>
              <h3>Subscribe for Expert Insights</h3>
              <p>Check Latest Updates</p>
              <iframe
                src="https://grcwithraghu.substack.com/embed"
                width="100%"
                height="150"
                // style={{
                //   border: "1px solid #EEE",
                //   background: "white",
                //   borderRadius: "8px",
                // }}
                frameBorder="0"
                scrolling="no"
                title="Newsletter Subscription"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
