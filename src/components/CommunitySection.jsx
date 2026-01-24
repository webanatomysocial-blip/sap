import React, { useState } from "react";
import { Link } from "react-router-dom";
import { blogMetadata } from "../blogs/metadata";
import "../css/CommunitySection.css";

export default function CommunitySection() {
  const [activeMembersTab, setActiveMembersTab] = useState("Active");
  const [groupsTab, setGroupsTab] = useState("Popular");

  // Get recent posts (latest 5)
  const recentPosts = [...blogMetadata]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // Get featured article (most recent)
  const featuredArticle = blogMetadata[0];

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { month: "short", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  // Dummy announcements
  const announcements = [
    {
      title: "10 Best Practices for SAP GRC Role Design",
      date: "Mar 01 2025",
      views: 18,
      comments: 7,
    },
    {
      title: "SAP IAG Roadmap – What to Expect Next",
      date: "Mar 01 2025",
      views: 23,
      comments: 9,
    },
  ];

  // Recent activity (using blog data)
  const recentActivity = [...blogMetadata]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);

  // Trending topics
  const trendingTopics = [
    "#SAPGRC",
    "#LicenseCompliance",
    "#S4HANASecurity",
    "#SAP4HANACloud",
    "#IAM",
    "#GRC",
  ];

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
                {recentPosts.slice(0, 3).map((post, i) => (
                  <Link
                    key={i}
                    to={`/blogs/${post.slug}`}
                    className="topic-item"
                  >
                    <span className="topic-label">R</span>
                    <div className="topic-info">
                      <span className="topic-title">{post.title}</span>
                      <span className="topic-meta">By {post.author}</span>
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

            {/* Advertisement */}
            <div className="widget ad-widget">
              <span className="ad-label">Advertisement</span>
            </div>

            {/* Trending Topics */}
            <div className="widget">
              <div className="widget-header">
                <h3>Trending Topics</h3>
              </div>
              <div className="trending-tags">
                {trendingTopics.map((tag, i) => (
                  <span key={i} className="trending-tag">
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
                  <i className="bi bi-eye"></i> {featuredArticle.views}
                </span>
                <span>
                  <i className="bi bi-chat"></i> 32
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
                {recentActivity.map((activity, i) => (
                  <Link
                    key={i}
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
                          {activity.author}
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
              <Link to="/blogs" className="view-all-link-center">
                View All Community Activity →
              </Link>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="community-right">
            {/* Announcements */}
            {/* <div className="widget">
              <div className="widget-header">
                <h3>Announcements</h3>
              </div>
              <div className="announcements-list">
                {announcements.map((announcement, i) => (
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
                ))}
              </div>
              <Link to="/announcements" className="view-all-link">
                View All Announcements →
              </Link>
            </div> */}

            {/* Advertisement */}
            <div className="widget ad-widget">
              <span className="ad-label">Advertisement</span>
            </div>

            {/* Newsletter */}
            <div className="widget newsletter-widget">
              <div className="newsletter-icon">
                <i className="bi bi-envelope"></i>
              </div>
              <h3>Newsletter</h3>
              <p>Check Latest Updates</p>
              <form className="newsletter-form">
                <input type="email" placeholder="Enter Your Email" />
                <button type="submit">→</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
