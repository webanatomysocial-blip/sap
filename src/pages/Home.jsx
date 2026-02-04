import React from "react";
import { Link } from "react-router-dom";
import {
  LuShield,
  LuNetwork,
  LuLock,
  LuFileCheck,
  LuCloud,
  LuKeyRound,
  // LuCheckCircle,
  LuAward,
  LuTarget,
} from "react-icons/lu";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { HiArrowRight } from "react-icons/hi";
import FeaturedInsights from "../components/FeaturedInsights";
import LatestBlogs from "../components/LatestBlogs";
import CommunitySection from "../components/CommunitySection";
import "../css/Home.css";

// Dummy data for visual layout
const activeMembers = [
  {
    name: "John Doe",
    role: "SAP Architect",
    img: "https://i.pravatar.cc/150?img=1",
  },
  {
    name: "Sarah Smith",
    role: "GRC Consultant",
    img: "https://i.pravatar.cc/150?img=5",
  },
  {
    name: "Mike Ross",
    role: "Security Lead",
    img: "https://i.pravatar.cc/150?img=3",
  },
  {
    name: "Emily White",
    role: "BTP Expert",
    img: "https://i.pravatar.cc/150?img=9",
  },
];

// const announcements = [
//   { title: "New SAP Security Patch Day - Oct 2025", date: "2 hours ago" },
//   { title: "Webinar: Moving GRC to the Cloud", date: "1 day ago" },
//   { title: "Community Meetup in Berlin", date: "3 days ago" },
// ];

const featuredInsights = [
  {
    title: "Understanding SAP FUE vs User Metrics",
    category: "Licensing",
    date: "Oct 10",
    img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&q=80",
  },
  {
    title: "Integrating Okta with SAP IAS",
    category: "Security",
    date: "Oct 01",
    img: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=500&q=80",
  },
  {
    title: "Migrating GRC to IAG",
    category: "IAG",
    date: "Oct 12",
    img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&q=80",
  },
  {
    title: "Top VS Code Extensions",
    category: "Tools",
    date: "Oct 28",
    img: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=80",
  },
];

import SEO from "../components/SEO";

export default function Home() {
  return (
    <div className="home-wrapper">
      <SEO
        title="Home"
        description="The leading community for SAP Security, GRC, and BTP professionals. Get the latest insights, tutorials, and best practices."
        url={window.location.href}
      />
      {/* Community Section - Three Column Layout */}
      <CommunitySection />

      <div className="main-layout">
        {/* Featured Insights with Tabs - Dynamic from metadata */}
        <FeaturedInsights id="featured-insights" />

        {/* Latest Blogs & Activity - Dynamic from metadata */}
        <LatestBlogs />

        <div className="container main-layout">
          {/* Explore by Expertise */}
          <section className="expertise-section">
            <div className="section-header-centered">
              <h2>Explore by Expertise</h2>
              <p>
                Deep-dive into specialized SAP security domains with
                expert-curated content.
              </p>
            </div>
            <div className="expertise-grid">
              <Link to="/sap-grc" className="expertise-card-new soft-shadow">
                <div className="expertise-row">
                  <div className="expertise-icon">
                    <LuShield />
                  </div>
                  <h3>SAP GRC</h3>
                </div>
                <div className="expertise-info">
                  <p>Access Control, Process Control, Risk Management.</p>
                  <span className="article-count">
                    Articles <HiArrowRight />
                  </span>
                </div>
              </Link>
              <Link to="/sap-iag" className="expertise-card-new soft-shadow">
                <div className="expertise-row">
                  <div className="expertise-icon">
                    <LuNetwork />
                  </div>
                  <h3>SAP IAG</h3>
                </div>
                <div className="expertise-info">
                  <p>Identity Access Governance in the cloud.</p>
                  <span className="article-count">
                    Articles <HiArrowRight />
                  </span>
                </div>
              </Link>
              <Link
                to="/sap-security"
                className="expertise-card-new soft-shadow"
              >
                <div className="expertise-row">
                  <div className="expertise-icon">
                    <LuLock />
                  </div>
                  <h3>Cybersecurity</h3>
                </div>
                <div className="expertise-info">
                  <p>Threat detection, vulnerability management.</p>
                  <span className="article-count">
                    Articles <HiArrowRight />
                  </span>
                </div>
              </Link>
              <Link
                to="/sap-licensing"
                className="expertise-card-new soft-shadow"
              >
                <div className="expertise-row">
                  <div className="expertise-icon">
                    <LuFileCheck />
                  </div>
                  <h3>License Compliance</h3>
                </div>
                <div className="expertise-info">
                  <p>SAP licensing optimization strategies.</p>
                  <span className="article-count">
                    Articles <HiArrowRight />
                  </span>
                </div>
              </Link>
              <Link
                to="/sap-btp-security"
                className="expertise-card-new soft-shadow"
              >
                <div className="expertise-row">
                  <div className="expertise-icon">
                    <LuCloud />
                  </div>
                  <h3>Cloud Security</h3>
                </div>
                <div className="expertise-info">
                  <p>S/4HANA Cloud, BTP security.</p>
                  <span className="article-count">
                    Articles <HiArrowRight />
                  </span>
                </div>
              </Link>
              <Link
                to="/sap-security"
                className="expertise-card-new soft-shadow"
              >
                <div className="expertise-row">
                  <div className="expertise-icon">
                    <LuKeyRound />
                  </div>
                  <h3>IAM</h3>
                </div>

                <div className="expertise-info">
                  <p>Identity & Access Management best practices.</p>
                  <span className="article-count">
                    Articles <HiArrowRight />
                  </span>
                </div>
              </Link>
            </div>
          </section>
        </div>

        {/* Why SAP Professionals Trust Us */}
        <section className="trust-section-new">
          <div className="container">
            <div className="section-header-centered white">
              <h2>Why SAP Professionals Trust Us</h2>
              <p>Built by SAP security experts, for SAP security experts.</p>
            </div>
            <div className="trust-grid-new">
              <div className="trust-card-new">
                <div className="trust-icon-box">
                  <IoMdCheckmarkCircleOutline />
                  {/* <CircleCheckBig /> */}
                </div>
                <h3>Real-World Experience</h3>
                <p>
                  Content authored by practitioners with hands-on SAP security
                  implementation experience across Fortune 500 companies.
                </p>
              </div>
              <div className="trust-card-new">
                <div className="trust-icon-box">
                  <LuAward />
                </div>
                <h3>Vendor Neutral</h3>
                <p>
                  Unbiased insights without commercial influence. We recommend
                  solutions based on merit, not partnerships.
                </p>
              </div>
              <div className="trust-card-new">
                <div className="trust-icon-box">
                  <LuTarget />
                </div>
                <h3>Actionable Frameworks</h3>
                <p>
                  Ready-to-use templates, checklists, and step-by-step guides
                  you can implement immediately.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stay Ahead of the Curve (Newsletter) */}
        <section className="newsletter-section-new">
          <div className="container">
            <div className="section-header-centered">
              <h2>Stay Ahead of the Curve</h2>
              <p>
                Subscribe to our newsletter for the latest SAP security news,
                <br />
                analysis, and expert commentary delivered to your inbox.
              </p>
            </div>
            <div className="newsletter-form-container">
              <div className="newsletter-form-row">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="newsletter-input"
                />
                <button className="newsletter-btn">Subscribe</button>
              </div>
              <p className="newsletter-disclaimer">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
