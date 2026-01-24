import React from "react";
import { Link } from "react-router-dom";
import "../css/header.css"; // Reusing basic vars, or we can add specific footer css
import whiteLogo from "../assets/sapsecurityexpert-white.png"; // We might want a white version if available, but let's use what we have or filter it
import {
  FaLinkedinIn,
  FaInstagram,
  FaTwitter,
  FaFacebookF,
} from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        backgroundColor: "#111827",
        color: "white",
        padding: "60px 0 20px",
      }}
    >
      <div
        className="container"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "40px",
          marginBottom: "40px",
        }}
      >
        {/* Branch 1 */}
        <div>
          <img
            src={whiteLogo}
            alt="SAP Security Expert"
            style={{
              height: "40px",
              filter: "brightness(0) invert(1)",
              marginBottom: "20px",
            }}
          />
          <p style={{ color: "#9CA3AF", fontSize: "14px", lineHeight: "1.6" }}>
            The leading community for SAP Security, GRC, and BTP professionals.
            Join us to learn, share, and grow.
          </p>
          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <SocialIcon icon={<FaLinkedinIn />} />
            <SocialIcon icon={<FaTwitter />} />
            <SocialIcon icon={<FaInstagram />} />
          </div>
        </div>

        {/* Branch 2 */}
        <div>
          <h4
            style={{
              fontSize: "16px",
              fontWeight: "700",
              marginBottom: "20px",
            }}
          >
            Resources
          </h4>
          <FooterLink to="/sap-security">SAP Security</FooterLink>
          <FooterLink to="/sap-grc">SAP GRC</FooterLink>
          <FooterLink to="/sap-iag">SAP IAG</FooterLink>
          <FooterLink to="/sap-btp-security">BTP Security</FooterLink>
          <FooterLink to="/sap-licensing">SAP Licensing</FooterLink>
          <FooterLink to="/sap-cybersecurity">SAP Cybersecurity</FooterLink>
        </div>

        {/* Branch 3 */}
        <div>
          <h4
            style={{
              fontSize: "16px",
              fontWeight: "700",
              marginBottom: "20px",
            }}
          >
            Explore
          </h4>
          <FooterLink to="/podcasts">Podcasts</FooterLink>
          <FooterLink to="/product-reviews">Product Reviews</FooterLink>
          <FooterLink to="/other-tools">Other Tools</FooterLink>
          {/* <FooterLink to="/about">About Us</FooterLink> */}
        </div>

        {/* Branch 4 */}
        <div>
          <h4
            style={{
              fontSize: "16px",
              fontWeight: "700",
              marginBottom: "20px",
            }}
          >
            Legal & Contact
          </h4>
          <p
            style={{ color: "#9CA3AF", fontSize: "14px", marginBottom: "10px" }}
          >
            hello@sapsecurityexpert.com
          </p>
          {/* <FooterLink to="/privacy">Privacy Policy</FooterLink>
          <FooterLink to="/write-insight">Become a Contributor</FooterLink>
          <FooterLink to="/contact">Contact Support</FooterLink> */}
        </div>
      </div>

      <div
        className="container"
        style={{
          borderTop: "1px solid #374151",
          paddingTop: "20px",
          textAlign: "center",
          fontSize: "14px",
          color: "#6B7280",
        }}
      >
        <p>© {currentYear} SAP Security Expert. All rights reserved.</p>
      </div>
    </footer>
  );
};

const FooterLink = ({ to, children }) => (
  <Link
    to={to}
    style={{
      display: "block",
      color: "#9CA3AF",
      textDecoration: "none",
      marginBottom: "10px",
      fontSize: "14px",
      transition: "color 0.2s",
    }}
    onMouseOver={(e) => (e.target.style.color = "#EE5E42")}
    onMouseOut={(e) => (e.target.style.color = "#9CA3AF")}
  >
    {children}
  </Link>
);

const SocialIcon = ({ icon }) => (
  <div
    style={{
      width: "36px",
      height: "36px",
      borderRadius: "50%",
      background: "#374151",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      cursor: "pointer",
      transition: "background 0.2s",
    }}
    onMouseOver={(e) => (e.currentTarget.style.background = "#EE5E42")}
    onMouseOut={(e) => (e.currentTarget.style.background = "#374151")}
  >
    {icon}
  </div>
);

export default Footer;
