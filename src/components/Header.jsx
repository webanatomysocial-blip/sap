import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../css/header.css";
import logo from "../assets/sapsecurityexpert-black.png";
import { FiMenu, FiX } from "react-icons/fi";
import { FaChevronDown } from "react-icons/fa";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdowns, setDropdowns] = useState({
    sapSecurity: false,
    sapGrc: false,
    resources: false,
  });

  const closeMenu = () => {
    setMenuOpen(false);
    setDropdowns({ sapSecurity: false, sapGrc: false, resources: false });
  };

  const toggleDropdown = (key) => {
    setDropdowns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <header className="header-container-premium">
      <div className="header-inner">
        {/* Logo */}
        <Link to="/" className="header-logo">
          <img src={logo} alt="SAP Security Expert" className="logo-img" />
        </Link>

        {/* Desktop Nav */}
        <nav className="header-nav-desktop only-windows">
          <Link to="/" className="nav-link">
            Home
          </Link>

          {/* SAP Security Dropdown */}
          <div className="nav-item">
            <Link to="/sap-security" className="nav-link">
              <span>SAP Security</span>
              <FaChevronDown size={10} style={{ marginLeft: "4px" }} />
            </Link>
            <div className="dropdown-menu">
              <Link to="/sap-s4hana-security">SAP S/4HANA Security</Link>
              <Link to="/sap-fiori-security">SAP Fiori Security</Link>
              <Link to="/sap-btp-security">SAP BTP Security</Link>
              <Link to="/sap-public-cloud">SAP Public Cloud Security</Link>
              <Link to="/sap-sac-security">SAP SAC Security</Link>
              <Link to="/sap-cis">SAP CIS (IAS/IPS)</Link>
              <Link to="/sap-successfactors-security">
                SAP SuccessFactors Security
              </Link>
              <Link to="/sap-security-other">Other versions</Link>
            </div>
          </div>

          {/* SAP Access Control & IAG Dropdown */}
          <div className="nav-item">
            <Link to="/sap-grc" className="nav-link">
              <span>SAP GRC & IAG</span>
              <FaChevronDown size={10} style={{ marginLeft: "4px" }} />
            </Link>
            <div className="dropdown-menu">
              <Link to="/sap-access-control">SAP Access Control</Link>
              <Link to="/sap-process-control">SAP Process Control</Link>
              <Link to="/sap-iag">SAP IAG</Link>
            </div>
          </div>

          <Link to="/sap-cybersecurity" className="nav-link">
            SAP Cybersecurity
          </Link>
          <Link to="/sap-licensing" className="nav-link">
            SAP Licensing
          </Link>

          {/* Resources Dropdown */}
          <div className="nav-item">
            <span className="nav-link" style={{ cursor: "pointer" }}>
              <span>Resources</span>
              <FaChevronDown size={10} style={{ marginLeft: "4px" }} />
            </span>
            <div className="dropdown-menu">
              <Link to="/product-reviews">Product Reviews</Link>
              <Link to="/podcasts">Podcasts</Link>
              <Link to="/videos">Videos</Link>
              <Link to="/other-tools">Useful Tools</Link>
            </div>
          </div>

          <Link to="/contact-us" className="nav-link">
            Contact Us
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="header-actions">
          <Link to="/become-a-contributor" className="btn-contributor">
            Become a Contributor
          </Link>

          <button
            className="mobile-menu-btn only-mobile"
            onClick={() => setMenuOpen(true)}
          >
            <FiMenu size={26} />
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <div className="mobile-menu-header">
          <img src={logo} alt="Logo" />
          <button onClick={closeMenu}>
            <FiX size={24} />
          </button>
        </div>

        <nav className="mobile-nav">
          <Link to="/" onClick={closeMenu}>
            Home
          </Link>

          {/* Mobile SAP Security Dropdown */}
          <div className="mobile-dropdown">
            <div
              className="mobile-dropdown-header"
              onClick={() => toggleDropdown("sapSecurity")}
            >
              <span>SAP Security</span>
              <FaChevronDown
                style={{
                  transform: dropdowns.sapSecurity ? "rotate(180deg)" : "none",
                  transition: "transform 0.3s",
                }}
              />
            </div>
            {dropdowns.sapSecurity && (
              <div className="mobile-submenu">
                <Link to="/sap-s4hana-security" onClick={closeMenu}>
                  SAP S/4HANA Security
                </Link>
                <Link to="/sap-fiori-security" onClick={closeMenu}>
                  SAP Fiori Security
                </Link>
                <Link to="/sap-btp-security" onClick={closeMenu}>
                  SAP BTP Security
                </Link>
                <Link to="/sap-public-cloud" onClick={closeMenu}>
                  SAP Public Cloud Security
                </Link>
                <Link to="/sap-sac-security" onClick={closeMenu}>
                  SAP SAC Security
                </Link>
                <Link to="/sap-cis" onClick={closeMenu}>
                  SAP CIS (IAS/IPS)
                </Link>
                <Link to="/sap-successfactors-security" onClick={closeMenu}>
                  SAP SuccessFactors Security
                </Link>
                <Link to="/sap-security-other" onClick={closeMenu}>
                  Other versions
                </Link>
              </div>
            )}
          </div>

          {/* Mobile SAP GRC & IAG Dropdown */}
          <div className="mobile-dropdown">
            <div
              className="mobile-dropdown-header"
              onClick={() => toggleDropdown("sapGrc")}
            >
              <span>SAP GRC & IAG</span>
              <FaChevronDown
                style={{
                  transform: dropdowns.sapGrc ? "rotate(180deg)" : "none",
                  transition: "transform 0.3s",
                }}
              />
            </div>
            {dropdowns.sapGrc && (
              <div className="mobile-submenu">
                <Link to="/sap-access-control" onClick={closeMenu}>
                  SAP Access Control
                </Link>
                <Link to="/sap-process-control" onClick={closeMenu}>
                  SAP Process Control
                </Link>
                <Link to="/sap-iag" onClick={closeMenu}>
                  SAP IAG
                </Link>
                <Link to="/sap-grc" onClick={closeMenu}>
                  SAP GRC
                </Link>
              </div>
            )}
          </div>

          <Link to="/sap-cybersecurity" onClick={closeMenu}>
            SAP Cybersecurity
          </Link>
          <Link to="/sap-licensing" onClick={closeMenu}>
            SAP Licensing
          </Link>

          {/* Mobile Resources Dropdown */}
          <div className="mobile-dropdown">
            <div
              className="mobile-dropdown-header"
              onClick={() => toggleDropdown("resources")}
            >
              <span>Resources</span>
              <FaChevronDown
                style={{
                  transform: dropdowns.resources ? "rotate(180deg)" : "none",
                  transition: "transform 0.3s",
                }}
              />
            </div>
            {dropdowns.resources && (
              <div className="mobile-submenu">
                <Link to="/product-reviews" onClick={closeMenu}>
                  Product Reviews
                </Link>
                <Link to="/podcasts" onClick={closeMenu}>
                  Podcasts
                </Link>
                <Link to="/videos" onClick={closeMenu}>
                  Videos
                </Link>
                <Link to="/other-tools" onClick={closeMenu}>
                  Useful Tools
                </Link>
              </div>
            )}
          </div>

          <Link to="/contact-us" onClick={closeMenu}>
            Contact Us
          </Link>

          <Link
            to="/become-a-contributor"
            onClick={closeMenu}
            className="mobile-cta"
          >
            Become a Contributor
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
