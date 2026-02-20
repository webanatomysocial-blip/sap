import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "../css/BecomeContributor.css";
import { Helmet } from "react-helmet-async";
import { applyContributor } from "../services/api";
import { useToast } from "../context/ToastContext";

import useScrollLock from "../hooks/useScrollLock";

const ContributorApplication = () => {
  const location = useLocation();
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // success | error
  const { addToast } = useToast();

  useScrollLock(showTermsModal);

  const [formData, setFormData] = useState({
    // Section 1
    fullName: "",
    email: "",
    linkedin: "",
    country: "",
    organization: "",
    role: location.state?.role || "", // Pre-fill from previous page if available
    designation: "", // Separated from role (which is the contributor role)

    // Section 2
    expertise: {
      sapSecurity: false,
      sapGrc: false,
      sapIag: false,
      sapBtp: false,
      sapCyber: false,
      sapLicensing: false,
      otherExpertise: false,
    },
    otherExpertiseText: "",
    yearsExperience: "",
    shortBio: "",

    // Section 3
    contentTypes: {
      technicalArticle: false,
      opinionPiece: false,
      news: false,
      tools: false,
    },
    proposedTopics: "",
    contributedElsewhere: "No",
    previousWorkLinks: "",

    // Section 4
    preferredFrequency: "One-time",
    primaryMotivation: "",

    // New Fields
    weeklyTime: "",
    volunteerEvents: "", // Yes/No
    productEvaluation: "", // Yes/No

    // Section 5 T&C - Implicitly handled by the modal action now
    // termsAccepted: false, // We will track this via the modal "Agree" action
    agree1: false,
    agree2: false,
    agree3: false,

    // Section 6 Optional
    profilePhoto: null, // File upload handled separately generally, but we'll use simple text for now or just metadata
    personalWebsite: "",
    twitterHandle: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxGroupChange = (section, key, checked) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: checked,
      },
    }));
  };

  // Triggered by "Submit Application" button
  const handleInitialSubmit = (e) => {
    e.preventDefault();
    // Validations passed (HTML5 required fields), so we open T&C
    setShowTermsModal(true);
  };

  // Triggered by "Agree & Submit" in Modal
  const handleFinalSubmit = async () => {
    setShowTermsModal(false);
    setIsSubmitting(true);
    setSubmitStatus(null);

    // Prepare FormData
    const payload = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "expertise" || key === "contributionTypes") {
        payload.append(key, JSON.stringify(formData[key]));
      } else if (key === "profilePhoto") {
        if (formData.profilePhoto instanceof File) {
          payload.append("profilePhoto", formData.profilePhoto);
        }
      } else {
        payload.append(key, formData[key] || "");
      }
    });

    try {
      // Use fetch to allow multipart/form-data
      const API_URL = import.meta.env.VITE_API_URL || "/api";
      const response = await fetch(`${API_URL}/contributors/apply`, {
        method: "POST",
        body: payload,
      });

      const result = await response.json();

      if (response.ok && result.status === "success") {
        setSubmitStatus("success");
        addToast("Application Submitted Successfully!", "success");
        window.scrollTo(0, 0);
      } else {
        console.error("Server error:", result.message);
        setSubmitStatus("error");
        addToast(
          result.message ||
            "Something went wrong while submitting your application. Please try again.",
          "error",
        );
      }
    } catch (error) {
      console.error("Network error submitting application:", error);
      setSubmitStatus("error");
      addToast(
        "We're having trouble connecting to the system. Please check your internet connection and try again.",
        "error",
      );
    } finally {
      setIsSubmitting(false);
      if (submitStatus === "success") {
        window.scrollTo(0, 0);
      }
    }
  };

  return (
    <div className="become-contributor-page">
      <Helmet>
        <title>Apply to Contribute | SAP Security Expert</title>
      </Helmet>

      <div className="contributor-hero">
        <div className="container">
          <h1>Contributor Application</h1>
          <p>Share your expertise with the global SAP Security community.</p>
        </div>
      </div>

      <div className="container contributor-content">
        <div id="application-form" className="application-form-container">
          {submitStatus === "success" ? (
            <div className="success-message-box">
              <i className="bi bi-check-circle-fill"></i>
              <h3>Application Submitted Successfully!</h3>
              <p>
                Thank you for your application. Our team will review your
                profile and get back to you shortly.
              </p>
              <Link to="/" className="btn-apply-now">
                Return to Home
              </Link>
            </div>
          ) : (
            <form onSubmit={handleInitialSubmit} className="detailed-form">
              {/* Section 1: Basic Info */}
              <div className="form-section">
                <h3>1. Basic Information</h3>
                <div className="form-row">
                  <div className="form-group half">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group half">
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group half">
                    <label className="form-label">LinkedIn Profile URL *</label>
                    <input
                      type="url"
                      className="form-control"
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group half">
                    <label className="form-label">Country / Region *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group half">
                    <label className="form-label">
                      Organization / Company Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="organization"
                      value={formData.organization}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group half">
                    <label className="form-label">Current Designation</label>
                    <input
                      type="text"
                      className="form-control"
                      name="designation"
                      value={formData.designation}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group full">
                    <label className="form-label">Applying for Role</label>
                    <input
                      type="text"
                      className="form-control"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      readOnly
                      disabled
                    />
                    <small
                      className="form-error"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Selected from previous page
                    </small>
                  </div>
                </div>
              </div>

              {/* Section 2: Contributor Profile */}
              <div className="form-section">
                <h3>2. Contributor Profile</h3>
                <div className="form-group">
                  <label className="form-label">Area(s) of Expertise</label>
                  <div className="checkbox-group block-layout">
                    <label
                      className="checkbox-item full-width"
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        marginBottom: "10px",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.expertise.sapSecurity}
                        onChange={(e) =>
                          handleCheckboxGroupChange(
                            "expertise",
                            "sapSecurity",
                            e.target.checked,
                          )
                        }
                        style={{ marginTop: "4px", marginRight: "10px" }}
                      />
                      <span
                        className="checkbox-label"
                        style={{ marginLeft: 0 }}
                      >
                        SAP Security (ABAP/Java)
                      </span>
                    </label>
                    <label
                      className="checkbox-item full-width"
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        marginBottom: "10px",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.expertise.sapGrc}
                        onChange={(e) =>
                          handleCheckboxGroupChange(
                            "expertise",
                            "sapGrc",
                            e.target.checked,
                          )
                        }
                        style={{ marginTop: "4px", marginRight: "10px" }}
                      />
                      <span
                        className="checkbox-label"
                        style={{ marginLeft: 0 }}
                      >
                        SAP GRC (Access Control, Process Control, RM)
                      </span>
                    </label>
                    <label
                      className="checkbox-item full-width"
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        marginBottom: "10px",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.expertise.sapIag}
                        onChange={(e) =>
                          handleCheckboxGroupChange(
                            "expertise",
                            "sapIag",
                            e.target.checked,
                          )
                        }
                        style={{ marginTop: "4px", marginRight: "10px" }}
                      />
                      <span
                        className="checkbox-label"
                        style={{ marginLeft: 0 }}
                      >
                        Audit & Compliance
                      </span>
                    </label>
                    <label
                      className="checkbox-item full-width"
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        marginBottom: "10px",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.expertise.sapBtp}
                        onChange={(e) =>
                          handleCheckboxGroupChange(
                            "expertise",
                            "sapBtp",
                            e.target.checked,
                          )
                        }
                        style={{ marginTop: "4px", marginRight: "10px" }}
                      />
                      <span
                        className="checkbox-label"
                        style={{ marginLeft: 0 }}
                      >
                        Cybersecurity
                      </span>
                    </label>
                    <label
                      className="checkbox-item full-width"
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        marginBottom: "10px",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.expertise.sapCyber}
                        onChange={(e) =>
                          handleCheckboxGroupChange(
                            "expertise",
                            "sapCyber",
                            e.target.checked,
                          )
                        }
                        style={{ marginTop: "4px", marginRight: "10px" }}
                      />
                      <span
                        className="checkbox-label"
                        style={{ marginLeft: 0 }}
                      >
                        IAM / Cloud Security
                      </span>
                    </label>
                    <label
                      className="checkbox-item full-width"
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        marginBottom: "10px",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.expertise.sapLicensing}
                        onChange={(e) =>
                          handleCheckboxGroupChange(
                            "expertise",
                            "sapLicensing",
                            e.target.checked,
                          )
                        }
                        style={{ marginTop: "4px", marginRight: "10px" }}
                      />
                      <span
                        className="checkbox-label"
                        style={{ marginLeft: 0 }}
                      >
                        Data Security & Privacy
                      </span>
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Other Expertise</label>
                  <input
                    type="text"
                    className="form-control"
                    name="otherExpertiseText"
                    placeholder="Specify if any"
                    value={formData.otherExpertiseText}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Total Years of Experience
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    name="yearsExperience"
                    value={formData.yearsExperience}
                    onChange={handleInputChange}
                    placeholder="e.g. 5"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    How much time can you spend per week?
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="weeklyTime"
                    value={formData.weeklyTime}
                    onChange={handleInputChange}
                    placeholder="e.g. 2-3 hours"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Are you open to volunteer for physical events? (Yes/No)
                  </label>
                  <select
                    className="form-control"
                    name="volunteerEvents"
                    value={formData.volunteerEvents}
                    onChange={handleInputChange}
                  >
                    <option value="">Select...</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Are you open for specific product evaluations? (Yes/No)
                  </label>
                  <select
                    className="form-control"
                    name="productEvaluation"
                    value={formData.productEvaluation}
                    onChange={handleInputChange}
                  >
                    <option value="">Select...</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Short Bio (100-150 words)
                  </label>
                  <textarea
                    className="form-control"
                    name="shortBio"
                    rows="3"
                    value={formData.shortBio}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
              </div>

              {/* Section 3: Contribution Details */}
              <div className="form-section">
                <h3>3. Contribution Details</h3>
                <div className="form-group">
                  <label className="form-label">Type of Contribution</label>
                  <div className="checkbox-group block-layout">
                    <label
                      className="checkbox-item full-width"
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        marginBottom: "10px",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.contentTypes.technicalArticle}
                        onChange={(e) =>
                          handleCheckboxGroupChange(
                            "contentTypes",
                            "technicalArticle",
                            e.target.checked,
                          )
                        }
                        style={{ marginTop: "4px", marginRight: "10px" }}
                      />
                      <span
                        className="checkbox-label"
                        style={{ marginLeft: 0 }}
                      >
                        Technical Article / Tutorial
                      </span>
                    </label>
                    <label
                      className="checkbox-item full-width"
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        marginBottom: "10px",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.contentTypes.opinionPiece}
                        onChange={(e) =>
                          handleCheckboxGroupChange(
                            "contentTypes",
                            "opinionPiece",
                            e.target.checked,
                          )
                        }
                        style={{ marginTop: "4px", marginRight: "10px" }}
                      />
                      <span
                        className="checkbox-label"
                        style={{ marginLeft: 0 }}
                      >
                        Opinion Piece / Thought Leadership
                      </span>
                    </label>
                    <label
                      className="checkbox-item full-width"
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        marginBottom: "10px",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.contentTypes.news}
                        onChange={(e) =>
                          handleCheckboxGroupChange(
                            "contentTypes",
                            "news",
                            e.target.checked,
                          )
                        }
                        style={{ marginTop: "4px", marginRight: "10px" }}
                      />
                      <span
                        className="checkbox-label"
                        style={{ marginLeft: 0 }}
                      >
                        News / Industry Updates
                      </span>
                    </label>
                    <label
                      className="checkbox-item full-width"
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        marginBottom: "10px",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.contentTypes.tools}
                        onChange={(e) =>
                          handleCheckboxGroupChange(
                            "contentTypes",
                            "tools",
                            e.target.checked,
                          )
                        }
                        style={{ marginTop: "4px", marginRight: "10px" }}
                      />
                      <span
                        className="checkbox-label"
                        style={{ marginLeft: 0 }}
                      >
                        Tools, Scripts, or Resources
                      </span>
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Proposed Topic(s) / Themes
                  </label>
                  <textarea
                    className="form-control"
                    name="proposedTopics"
                    placeholder="What would you like to write about?"
                    rows="2"
                    value={formData.proposedTopics}
                    onChange={handleInputChange}
                  ></textarea>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Have you contributed elsewhere?
                  </label>
                  <select
                    className="form-control"
                    name="contributedElsewhere"
                    value={formData.contributedElsewhere}
                    onChange={handleInputChange}
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>

                {formData.contributedElsewhere === "Yes" && (
                  <div className="form-group fade-in">
                    <label className="form-label">
                      If yes, please provide links to your work
                    </label>
                    <textarea
                      className="form-control"
                      name="previousWorkLinks"
                      rows="2"
                      value={formData.previousWorkLinks}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                )}
              </div>

              {/* Section 4: Content & Availability */}
              <div className="form-section">
                <h3>4. Content & Availability</h3>
                <div className="form-group">
                  <label className="form-label">
                    Preferred Contribution Frequency
                  </label>
                  <select
                    className="form-control"
                    name="preferredFrequency"
                    value={formData.preferredFrequency}
                    onChange={handleInputChange}
                  >
                    <option value="One-time">One-time</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Ad-hoc">Ad-hoc</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Primary Motivation for Contributing
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="primaryMotivation"
                    placeholder="Knowledge sharing, visibility, community impact, etc."
                    value={formData.primaryMotivation}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Section 5: Optional Info */}
              <div className="form-section">
                <h3>5. Optional Info</h3>
                <div className="form-row">
                  <div className="form-group full">
                    <label className="form-label">Profile Photo</label>
                    <input
                      type="file"
                      className="form-control"
                      name="profilePhoto"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          profilePhoto: e.target.files[0],
                        })
                      }
                      accept="image/*"
                      style={{ padding: "8px" }} // File input fix
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group half">
                    <label className="form-label">
                      Personal Website / Blog
                    </label>
                    <input
                      type="url"
                      className="form-control"
                      name="personalWebsite"
                      value={formData.personalWebsite}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group half">
                    <label className="form-label">Twitter / X Handle</label>
                    <input
                      type="text"
                      className="form-control"
                      name="twitterHandle"
                      value={formData.twitterHandle}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="form-footer">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting}
                >
                  Summary & Terms <i className="bi bi-arrow-right"></i>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* T&C Modal */}
      {showTermsModal && (
        <div className="modal-overlay">
          <div
            className="modal-container large-modal"
            style={{
              background: "#fff",
              borderRadius: "12px",
              display: "flex",
              flexDirection: "column",
              boxShadow:
                "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            }}
          >
            <div className="modal-header">
              <h2>Read and Accept Terms &amp; Conditions</h2>
              <button
                className="close-modal"
                onClick={() => setShowTermsModal(false)}
              >
                ×
              </button>
            </div>
            <div
              className="modal-body-scroll t-and-c-content"
              data-lenis-prevent
            >
              <p>
                <strong>Last Updated: 30th Jan 2026</strong>
              </p>
              <p>
                These Terms &amp; Conditions (“Terms”) govern access to and use
                of this platform, including the submission, review, publication,
                and distribution of content (collectively, the “Platform”).
                <br />
                By accessing, using, or submitting content to the Platform, you
                (“Contributor” or “User”) agree to be legally bound by these
                Terms.
                <br />
                If you do not agree to these Terms, you must not access or use
                the Platform.
              </p>

              <h4>1. Content Submission and Ownership Representation</h4>
              <p>
                By submitting any content to the Platform, including but not
                limited to articles, blogs, videos, podcasts, tools, documents,
                images, or other materials (“Content”), you represent and
                warrant that:
              </p>
              <ul>
                <li>
                  You are the original author and owner of the Content, or you
                  possess all necessary rights, permissions, and licenses to
                  submit and publish such Content.
                </li>
                <li>
                  The Content does not infringe upon or violate any copyright,
                  trademark, patent, trade secret, moral right, or other
                  intellectual property or proprietary right of any third party.
                </li>
                <li>
                  Any third-party material included in the Content is properly
                  attributed and used in compliance with applicable licenses and
                  laws.
                </li>
                <li>
                  You acknowledge that you are solely responsible for the
                  Content you submit.
                </li>
              </ul>

              <h4>2. Indemnification</h4>
              <p>
                You agree to indemnify, defend, and hold harmless the Platform,
                its owners, editors, operators, affiliates, partners, and
                representatives from and against any and all claims, damages,
                losses, liabilities, costs, and expenses (including reasonable
                legal fees) arising from or related to:
              </p>
              <ul>
                <li>Your Content;</li>
                <li>Any breach of these Terms;</li>
                <li>
                  Any allegation that your Content infringes or violates
                  third-party rights.
                </li>
              </ul>

              <h4>3. Editorial Review and Publishing Rights</h4>
              <p>
                <strong>3.1 Editorial Discretion</strong>
                <br />
                All submitted Content is subject to editorial review. The
                Platform reserves the unrestricted right to review, edit,
                modify, format, summarize, optimize, or otherwise alter Content
                for quality, accuracy, clarity, compliance, and presentation.
              </p>
              <p>
                <strong>3.2 No Obligation to Publish</strong>
                <br />
                Submission of Content does not guarantee publication. The
                Platform may decline, delay, remove, or unpublish Content at its
                sole discretion, with or without notice.
              </p>
              <p>
                <strong>3.3 Ongoing Compliance</strong>
                <br />
                Content that was previously published may be removed if it later
                fails to comply with editorial standards, legal requirements, or
                community guidelines.
                <br />
                All editorial decisions are final.
              </p>

              <h4>4. License to Publish</h4>
              <p>
                By submitting Content, you grant the Platform a non-exclusive,
                royalty-free, worldwide license to host, reproduce, publish,
                distribute, display, edit, and promote the Content in connection
                with the Platform and its related channels, unless otherwise
                agreed in writing.
                <br />
                Ownership of Content remains with the Contributor unless
                explicitly transferred under a separate agreement.
              </p>

              <h4>5. Acceptable Use and Community Standards</h4>
              <p>
                You agree to use the Platform in a professional, ethical, and
                lawful manner. You must not submit or engage in content or
                conduct that:
              </p>
              <ul>
                <li>
                  Is false, misleading, defamatory, abusive, or discriminatory;
                </li>
                <li>Constitutes plagiarism or misrepresentation;</li>
                <li>
                  Is promotional, spam-driven, or sales-oriented without
                  authorization;
                </li>
                <li>
                  Violates any applicable law, regulation, or contractual
                  obligation.
                </li>
              </ul>
              <p>
                The Platform reserves the right to enforce community standards
                at its sole discretion.
              </p>

              <h4>6. Suspension and Termination</h4>
              <p>The Platform may, at any time and without prior notice:</p>
              <ul>
                <li>Restrict or suspend access;</li>
                <li>Remove Content;</li>
                <li>Permanently terminate contributor privileges;</li>
              </ul>
              <p>
                if it determines that these Terms have been violated or
                enforcement is necessary to protect the Platform or its
                community.
              </p>

              <h4>7. Disclaimer of Liability</h4>
              <p>
                The Platform does not endorse, verify, or guarantee the accuracy
                of user-submitted Content.
                <br />
                All Content is provided “as is” without warranties of any kind.
                <br />
                To the maximum extent permitted by law, the Platform disclaims
                all liability for any loss or damage arising from reliance on
                user-generated Content.
              </p>

              <h4>8. Modifications to Terms</h4>
              <p>
                The Platform reserves the right to modify these Terms at any
                time.
                <br />
                Updated Terms will be effective upon publication. Continued use
                of the Platform constitutes acceptance of the revised Terms.
              </p>

              <h4>9. Governing Law and Jurisdiction</h4>
              <p>
                These Terms shall be governed by and construed in accordance
                with the laws of India, without regard to conflict of law
                principles.
                <br />
                Any disputes arising out of or in connection with these Terms or
                the use of the Platform shall be subject to the exclusive
                jurisdiction of the courts located in Hyderabad, Telangana,
                India.
              </p>

              <h4>10. Severability</h4>
              <p>
                If any provision of these Terms is held to be invalid or
                unenforceable, the remaining provisions shall remain in full
                force and effect.
              </p>

              <h4>11. Contact Information</h4>
              <p>
                For questions regarding these Terms or compliance matters,
                please contact:
                <br />
                hello AT sapsecurityexpert DOT com
              </p>

              <hr
                style={{
                  margin: "20px 0px",
                  borderTop: "1px solid rgb(226, 232, 240)",
                }}
              />

              <div className="consent-checkboxes">
                <label
                  className="checkbox-item full-width"
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    marginBottom: "10px",
                  }}
                >
                  <input
                    type="checkbox"
                    onChange={(e) =>
                      setFormData({ ...formData, agree1: e.target.checked })
                    }
                    style={{ marginTop: "4px", marginRight: "10px" }}
                  />
                  <span>
                    I confirm that the submitted content will be original and
                    not infringe on copyrights.
                  </span>
                </label>
                <label
                  className="checkbox-item full-width"
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    marginBottom: "10px",
                  }}
                >
                  <input
                    type="checkbox"
                    onChange={(e) =>
                      setFormData({ ...formData, agree2: e.target.checked })
                    }
                    style={{ marginTop: "4px", marginRight: "10px" }}
                  />
                  <span>
                    I agree that the editorial team may review, edit, or suggest
                    changes before publishing.
                  </span>
                </label>
                <label
                  className="checkbox-item full-width"
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    marginBottom: "10px",
                  }}
                >
                  <input
                    type="checkbox"
                    onChange={(e) =>
                      setFormData({ ...formData, agree3: e.target.checked })
                    }
                    style={{ marginTop: "4px", marginRight: "10px" }}
                  />
                  <span>
                    I agree to the Terms &amp; Conditions and Community
                    Guidelines.
                  </span>
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-text-only"
                onClick={() => setShowTermsModal(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "500",
                  color: "#64748b",
                }}
              >
                Cancel
              </button>
              <button
                className="btn-accept-terms"
                onClick={handleFinalSubmit}
                disabled={
                  !(formData.agree1 && formData.agree2 && formData.agree3) ||
                  isSubmitting
                }
                style={{
                  background:
                    formData.agree1 && formData.agree2 && formData.agree3
                      ? "#ef4444"
                      : "#94a3b8",
                  color: "#ffffff",
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "6px",
                  fontWeight: "600",
                  cursor:
                    formData.agree1 && formData.agree2 && formData.agree3
                      ? "pointer"
                      : "not-allowed",
                  opacity:
                    formData.agree1 && formData.agree2 && formData.agree3
                      ? 1
                      : 0.6,
                }}
              >
                {isSubmitting ? "Submitting..." : "Agree & Submit Application"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContributorApplication;
