import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "../css/BecomeContributor.css";
import { Helmet } from "react-helmet-async";
import { applyContributor } from "../services/api";

import useScrollLock from "../hooks/useScrollLock";

const ContributorApplication = () => {
  const location = useLocation();
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // success | error

  useScrollLock(showTermsModal);

  const [formData, setFormData] = useState({
    // Section 1
    fullName: "",
    email: "",
    linkedin: "",
    country: "",
    organization: "",
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
    contributionTypes: {
      articles: false,
      caseStudies: false,
      tutorials: false,
      opinion: false,
      research: false,
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
        window.scrollTo(0, 0);
      } else {
        console.error("Server error:", result.message);
        setSubmitStatus("error");
      }
    } catch (error) {
      console.error("Network error submitting application:", error);
      setSubmitStatus("error");
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
                    <label>Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group half">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group half">
                    <label>LinkedIn Profile URL *</label>
                    <input
                      type="url"
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group half">
                    <label>Country / Region *</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group half">
                    <label>Organization / Company Name</label>
                    <input
                      type="text"
                      name="organization"
                      value={formData.organization}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group half">
                    <label>Current Designation</label>
                    <input
                      type="text"
                      name="designation"
                      value={formData.designation}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group full">
                    <label>Applying for Role</label>
                    <input
                      type="text"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      readOnly
                      style={{
                        backgroundColor: "#f1f5f9",
                        cursor: "not-allowed",
                      }}
                    />
                    <small>Selected from previous page</small>
                  </div>
                </div>
              </div>

              {/* Section 2: Contributor Profile */}
              <div className="form-section">
                <h3>2. Contributor Profile</h3>
                <div className="form-group">
                  <label>Area(s) of Expertise</label>
                  <div className="checkbox-grid">
                    <label className="checkbox-item">
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
                      />
                      SAP Security
                    </label>
                    <label className="checkbox-item">
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
                      />
                      SAP GRC (Access Control, Process Control, RM)
                    </label>
                    <label className="checkbox-item">
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
                      />
                      Audit & Compliance
                    </label>
                    <label className="checkbox-item">
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
                      />
                      Cybersecurity
                    </label>
                    <label className="checkbox-item">
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
                      />
                      IAM / Cloud Security
                    </label>
                    <label className="checkbox-item">
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
                      />
                      Data Security & Privacy
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>Other Expertise</label>
                  <input
                    type="text"
                    name="otherExpertiseText"
                    placeholder="Specify if any"
                    value={formData.otherExpertiseText}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Total Years of Experience</label>
                  <input
                    type="number"
                    name="yearsExperience"
                    value={formData.yearsExperience}
                    onChange={handleInputChange}
                    placeholder="e.g. 5"
                  />
                </div>

                <div className="form-group">
                  <label>How much time can you spend per week?</label>
                  <input
                    type="text"
                    name="weeklyTime"
                    value={formData.weeklyTime}
                    onChange={handleInputChange}
                    placeholder="e.g. 2-3 hours"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Are you open to volunteer for physical events? (Yes/No)
                  </label>
                  <select
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
                  <label>
                    Are you open for specific product evaluations? (Yes/No)
                  </label>
                  <select
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
                  <label>Short Bio (100-150 words)</label>
                  <textarea
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
                  <label>Type of Contribution</label>
                  <div className="checkbox-grid three-col">
                    <label className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={formData.contributionTypes.articles}
                        onChange={(e) =>
                          handleCheckboxGroupChange(
                            "contributionTypes",
                            "articles",
                            e.target.checked,
                          )
                        }
                      />
                      Articles / Blogs
                    </label>
                    <label className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={formData.contributionTypes.caseStudies}
                        onChange={(e) =>
                          handleCheckboxGroupChange(
                            "contributionTypes",
                            "caseStudies",
                            e.target.checked,
                          )
                        }
                      />
                      Case Studies
                    </label>
                    <label className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={formData.contributionTypes.tutorials}
                        onChange={(e) =>
                          handleCheckboxGroupChange(
                            "contributionTypes",
                            "tutorials",
                            e.target.checked,
                          )
                        }
                      />
                      Technical Tutorials
                    </label>
                    <label className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={formData.contributionTypes.opinion}
                        onChange={(e) =>
                          handleCheckboxGroupChange(
                            "contributionTypes",
                            "opinion",
                            e.target.checked,
                          )
                        }
                      />
                      Opinion / Thought Leadership
                    </label>
                    <label className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={formData.contributionTypes.research}
                        onChange={(e) =>
                          handleCheckboxGroupChange(
                            "contributionTypes",
                            "research",
                            e.target.checked,
                          )
                        }
                      />
                      Research / Whitepapers
                    </label>
                    <label className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={formData.contributionTypes.tools}
                        onChange={(e) =>
                          handleCheckboxGroupChange(
                            "contributionTypes",
                            "tools",
                            e.target.checked,
                          )
                        }
                      />
                      Tools / Utilities
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>Proposed Topic(s) / Themes</label>
                  <textarea
                    name="proposedTopics"
                    placeholder="What would you like to write about?"
                    rows="2"
                    value={formData.proposedTopics}
                    onChange={handleInputChange}
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Have you contributed elsewhere?</label>
                  <select
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
                    <label>If yes, please provide links to your work</label>
                    <textarea
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
                  <label>Preferred Contribution Frequency</label>
                  <select
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
                  <label>Primary Motivation for Contributing</label>
                  <input
                    type="text"
                    name="primaryMotivation"
                    placeholder="Knowledge sharing, visibility, community impact, etc."
                    value={formData.primaryMotivation}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Section 5: Compliance - Simple checkboxes, T&C is final step */}
              <div className="form-section">
                <h3>5. Compliance & Consent</h3>
                <div className="checkbox-group block-layout">
                  <label className="checkbox-item full-width">
                    <input type="checkbox" required />I confirm that the
                    submitted content will be original and not infringe on
                    copyrights.
                  </label>
                  <label className="checkbox-item full-width">
                    <input type="checkbox" required />I agree that the editorial
                    team may review, edit, or suggest changes before publishing.
                  </label>
                </div>
              </div>

              {/* Section 6: Optional Info */}
              <div className="form-section">
                <h3>6. Optional Info</h3>
                <div className="form-row">
                  <div className="form-group full">
                    <label>Profile Photo</label>
                    <input
                      type="file"
                      name="profilePhoto"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          profilePhoto: e.target.files[0],
                        })
                      }
                      accept="image/*"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group half">
                    <label>Personal Website / Blog</label>
                    <input
                      type="url"
                      name="personalWebsite"
                      value={formData.personalWebsite}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group half">
                    <label>Twitter / X Handle</label>
                    <input
                      type="text"
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
                  className="btn-submit-application"
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
          <div className="modal-content">
            <div className="modal-header">
              <h2>Terms & Conditions of Use</h2>
              <button
                className="close-modal"
                onClick={() => setShowTermsModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body-scroll">
              <p>
                <strong>Last Updated: 30th Jan 2026</strong>
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
              </ul>

              <h4>2. Grant of License</h4>
              <p>
                By submitting Content to SAP Security Expert, you grant us a
                worldwide, non-exclusive, royalty-free, perpetual, irrevocable,
                and sublicensable right to use, reproduce, modify, adapt,
                publish, translate, distribute, perform, and display such
                Content in any media format and through any media channels.
              </p>

              <h4>7. Indemnification</h4>
              <p>
                You agree to indemnify, defend, and hold harmless the Platform,
                its owners, editors, operators, affiliates, partners, and
                representatives from and against any and all claims, damages,
                losses, liabilities, costs, and expenses (including reasonable
                legal fees) arising from or related to your Content.
              </p>

              {/* ... (Other T&C sections can be added here) ... */}

              <div
                style={{
                  marginTop: "20px",
                  padding: "10px",
                  background: "#f0f9ff",
                  borderRadius: "4px",
                }}
              >
                <p style={{ marginBottom: 0, fontSize: "0.9rem" }}>
                  <strong>
                    By clicking "Agree & Submit Application" below, you confirm
                    that you have read, understood, and accepted these Terms &
                    Conditions.
                  </strong>
                </p>
              </div>
            </div>
            <div
              className="modal-footer"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <button
                className="btn-text-only"
                onClick={() => setShowTermsModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#64748b",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button className="btn-accept-terms" onClick={handleFinalSubmit}>
                Agree & Submit Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContributorApplication;
