import React from "react";
import { Link } from "react-router-dom";
import "../css/header.css";
import logo from "../assets/sapsecurityexpert-black.png";
import { BsSearch } from "react-icons/bs";
import { FiMenu } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";

const Header = () => {
  return (
    <header className="header-container-premium">
      <div className="header-inner">
        {/* Logo */}
        <Link to="/" className="header-logo">
          <img src={logo} alt="SAP Security Expert" className="logo-img" />
        </Link>

        {/* Desktop Nav - Centered/Right Aligned */}
        <nav className="header-nav-desktop only-windows">
          <Link to="/" className="nav-link">
            Home
          </Link>

          <div className="nav-item">
            <Link to="/sap-security" className="nav-link">
              SAP Security{" "}
              <i
                className="bi bi-chevron-down"
                style={{ fontSize: "10px", marginLeft: "4px" }}
              ></i>
            </Link>
            <div className="dropdown-menu">
              <Link to="/sap-btp-security">SAP BTP Security</Link>
              <Link to="/sap-public-cloud">SAP Public Cloud</Link>
            </div>
          </div>

          <Link to="/sap-licensing" className="nav-link">
            SAP Licensing
          </Link>
          <Link to="/sap-iag" className="nav-link">
            SAP IAG
          </Link>
          <Link to="/sap-grc" className="nav-link">
            SAP GRC
          </Link>
          <Link to="/sap-cybersecurity" className="nav-link">
            SAP Cybersecurity
          </Link>
          <Link to="/product-reviews" className="nav-link">
            Product Reviews
          </Link>
          <Link to="/podcasts" className="nav-link">
            Podcasts
          </Link>
          <Link to="/other-tools" className="nav-link">
            Other Tools
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="header-actions">
          {/* Become a Contributor Button */}
          <Link to="/" className="btn-contributor">
            Become a Contributor
          </Link>

          {/* Mobile Menu */}
          <button className="mobile-menu-btn only-mobile">
            <FiMenu size={24} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
