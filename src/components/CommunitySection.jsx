import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// Removed static metadata import
// Removed static metadata import
import "../css/CommunitySection.css";
import ads1 from "../assets/promotions/promo-1.png";
import ads2 from "../assets/promotions/promo-2.png";
import {
  getHomepageData,
  getPublicAnnouncements,
  getPublicAds,
  getCommunityStats,
} from "../services/api";

export default function CommunitySection() {
  /* eslint-disable no-unused-vars */
  // Tabs and state placeholders - removing unused ones
  // const [activeMembersTab, setActiveMembersTab] = useState("Newest");
  // const [groupsTab, setGroupsTab] = useState("Popular");
  /* eslint-enable no-unused-vars */

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [contributorCount, setContributorCount] = useState(0);
  const [memberCount, setMemberCount] = useState(0);
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

  // Dynamic Data State
  const [featuredArticle, setFeaturedArticle] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Fetch consolidated homepage data
    getHomepageData()
      .then((res) => {
        const data = res.data;
        if (data.status === "success") {
          setFeaturedArticle(data.featured || {});
          setRecentActivity(
            (data.recent || []).filter(
              (post) =>
                new Date(
                  (post.date || post.created_at || "").replace(" ", "T"),
                ) <= new Date(),
            ),
          );
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
    getPublicAnnouncements()
      .then((res) => {
        setAnnouncements(res.data);
        setLoadingAnnouncements(false);
      })
      .catch((err) => {
        console.warn("Announcement Fetch Failed", err);
        setLoadingAnnouncements(false);
      });

    // Fetch Ads
    getPublicAds()
      .then((res) => {
        const data = res.data;
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
    getCommunityStats()
      .then((res) => {
        const data = res.data;
        if (data && data.active_contributors) {
          setContributorCount(parseInt(data.active_contributors));
        }
        if (data && data.total_members) {
          setMemberCount(parseInt(data.total_members));
        }
      })
      .catch((err) => console.warn("Stats failed", err));
  }, []);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const options = { month: "long", day: "numeric", year: "numeric" };
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
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
                    key={post.slug || post.id}
                    to={
                      post.category
                        ? `/${post.category.toLowerCase().replace(/\s+/g, "-")}/${post.slug || post.id}`
                        : `/blogs/${post.slug || post.id}`
                    }
                    className="topic-item"
                  >
                    {/* Author Avatar */}
                    {post.author_image ? (
                      <img
                        src={post.author_image}
                        alt={post.author_name || post.author}
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          flexShrink: 0,
                          border: "2px solid #e2e8f0",
                        }}
                        onError={(e) => {
                          e.target.src =
                            "https://placehold.co/100x100?text=Author";
                        }}
                      />
                    ) : (
                      <span className="topic-label">
                        {(post.author_name || post.author || "G")
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    )}
                    <div className="topic-info">
                      <span className="topic-title">
                        {post.title}
                        {post.is_members_only === 1 && (
                          <span className="exclusive-mini-badge">
                            <i className="bi bi-lock-fill"></i> Exclusive
                          </span>
                        )}
                      </span>
                      <span className="topic-meta">
                        By {post.author_name || "Guest Author"}
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
                <div className="contributors-list-left" data-lenis-prevent>
                  {contributors.map((contributor, index) => (
                    <Link
                      key={index}
                      to={`/contributor/${contributor.id}`}
                      className="contributor-card-new"
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
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
                    </Link>
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
                      ? `/${featuredArticle.category.toLowerCase().replace(/\s+/g, "-")}/${featuredArticle.slug || featuredArticle.id}`
                      : `/blogs/${featuredArticle.slug || featuredArticle.id}`
                  }
                  className="btn-read-insight"
                >
                  Read Full Insight →
                </Link>
              </div>
            )}

            {/* Recent Activity */}
            {recentActivity && recentActivity.length > 0 && (
              <div className="widget">
                <div className="widget-header">
                  <h3>Recent Activity</h3>
                </div>
                <div className="activity-list">
                  {recentActivity.map((activity) => (
                    <Link
                      key={activity.slug || activity.id}
                      to={
                        activity.category
                          ? `/${activity.category.toLowerCase().replace(/\s+/g, "-")}/${activity.slug || activity.id}`
                          : `/blogs/${activity.slug || activity.id}`
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
                            ? activity.category
                                .replace("sap-", "")
                                .toUpperCase()
                            : "BLOG"}
                        </span>
                        <h4>
                          {activity.title}
                          {activity.is_members_only === 1 && (
                            <span className="exclusive-mini-badge" style={{ marginLeft: '8px' }}>
                              <i className="bi bi-lock-fill"></i> Exclusive
                            </span>
                          )}
                        </h4>
                        <p>
                          {activity.excerpt
                            ? activity.excerpt.substring(0, 100)
                            : ""}
                          ...
                        </p>
                        <div className="activity-meta">
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            {activity.author_image ? (
                              <img
                                src={activity.author_image}
                                alt={activity.author_name || activity.author}
                                style={{
                                  width: "22px",
                                  height: "22px",
                                  borderRadius: "50%",
                                  objectFit: "cover",
                                  border: "1px solid #e2e8f0",
                                }}
                                onError={(e) => {
                                  e.target.src =
                                    "https://placehold.co/100x100?text=Author";
                                }}
                              />
                            ) : (
                              <i className="bi bi-person-circle"></i>
                            )}
                            {activity.author_name || "Guest Author"}
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
                <Link
                  to="/become-a-contributor"
                  className="view-all-link-center"
                >
                  Join the Community →
                </Link>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div className="community-right">
            {/* Announcements */}
            <div className="widget">
              <div className="widget-header">
                <h3>Announcements</h3>
              </div>
              <div className="announcements-list" data-lenis-prevent>
                {!Array.isArray(announcements) || announcements.length === 0 ? (
                  <p style={{ fontSize: "0.9rem", color: "#666" }}>
                    No announcements yet.
                  </p>
                ) : (
                  announcements.map((announcement, i) => (
                    <div key={i} className="announcement-item">
                      <h4>{announcement.title}</h4>
                      <div className="announcement-meta">
                        <span>
                          {(() => {
                            // Handle raw MySQL DATETIME "2026-02-15 00:00:00" or already formatted "February 5, 2026"
                            const raw = announcement.date || "";
                            const isoStr = raw.includes(" ")
                              ? raw.replace(" ", "T") + "Z"
                              : raw;
                            const d = new Date(isoStr);
                            if (isNaN(d.getTime())) return raw;
                            return d.toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                              timeZone: "UTC",
                            });
                          })()}
                        </span>
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
                    {contributorCount + memberCount}
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "#64748b" }}>
                    Total Community Members &<br />
                    Experts
                  </div>
                </div>
                <p style={{ fontSize: "0.85rem", color: "#475569", lineHeight: "1.5" }}>
                  Join <strong>{memberCount} members</strong> and{" "}
                  <strong>{contributorCount} contributors</strong> who are
                  actively securing the SAP ecosystem.
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
