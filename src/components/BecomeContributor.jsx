import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../css/BecomeContributor.css"; // We will create this
import { Helmet } from "react-helmet-async";

const contributorRoles = {
  "LinkedIn Page & Community Engagement Manager": {
    commitment: "~2–3 hours per week",
    count: "2 (max)",
    how_to_contribute: [
      "Create and post engaging LinkedIn content based on newly published articles on sapsecurityexpert.com",
      "Write short, impactful post scripts with the right industry hooks and hashtags",
      "Share posts in relevant SAP Security, GRC, Audit, and Cybersecurity LinkedIn groups",
      "Help grow reach, engagement, and followers organically",
    ],
    ideal_for:
      "Professionals who enjoy content amplification, community building, and thought leadership positioning.",
  },
  "Useful Tools & Solutions Research Contributor": {
    commitment: "Flexible",
    count: "2 (max)",
    how_to_contribute: [
      "Identify SAP Security, GRC, Audit, or Compliance tools that bring real practitioner value",
      "Understand the tool’s purpose, use cases, and differentiation",
      "Coordinate with the tool’s developer/company (vendor-neutral engagement)",
      "Publish an article, overview, or short video on the platform",
      "Ensure clear community disclaimer (non-promotional, informational content)",
    ],
    ideal_for:
      "Consultants, analysts, and solution architects with strong evaluation skills.",
  },
  "Social Media Channel Management": {
    commitment: "Flexible",
    count: "1 (max)",
    how_to_contribute: [
      "Manage and publish content across platforms like LinkedIn, X (Twitter), and YouTube",
      "Repurpose blogs into short posts, visuals, reels, or threads",
      "Maintain consistent community voice and posting cadence",
    ],
    ideal_for:
      "Digital-savvy professionals who enjoy reach, storytelling, and engagement.",
  },
  "Blog & Article Authors": {
    commitment: "Core Contributor",
    count: "10 (max)",
    how_to_contribute: [
      "Write original blogs, tutorials, opinions, or deep-dives on SAP Security, SAP GRC, Audit automation, Compliance etc.",
      "Share real-world experiences, lessons learned, or implementation insights",
    ],
    ideal_for:
      "Practitioners who want to build credibility, visibility, and thought leadership.",
  },
  "Podcast Creation & Publishing Support": {
    commitment: "1 podcast per month",
    count: "2 (max)",
    how_to_contribute: [
      "Assist in identifying industry leaders, experts, and influencers",
      "Coordinate scheduling and content flow",
      "Help with recording, editing, publishing, and promotion",
      "Support episode summaries and highlights for social media",
    ],
    ideal_for:
      "Those interested in storytelling, networking, and industry conversations.",
  },
  "Product Review & Practitioner Analysis Contributor": {
    commitment: "Flexible",
    count: "2 (max)",
    how_to_contribute: [
      "Conduct detailed discussions with product development teams",
      "Gather functional, technical, and roadmap insights",
      "Publish vendor-neutral, practitioner-focused reviews",
      "Highlight strengths, limitations, and ideal use cases",
      "Ensure transparency and community-first disclosure",
    ],
    ideal_for:
      "Senior consultants, auditors, and architects with evaluation experience.",
  },
  "Community Moderation & Knowledge Curation": {
    commitment: "Flexible",
    count: "2 (max)",
    how_to_contribute: [
      "Review submitted content for relevance and quality",
      "Help curate featured articles or monthly highlights",
      "Assist in maintaining community standards and neutrality",
    ],
    ideal_for:
      "Experienced professionals who want to shape industry conversations.",
  },
  "Local Community Champion (Regional Lead)": {
    commitment: "Flexible",
    count: "2 (max)",
    how_to_contribute: [
      "Act as a regional point of contact for the SAP Security Expert community",
      "Promote community initiatives within your local geography",
      "Encourage practitioners to contribute articles, case studies, and insights",
      "Support local meetups, roundtables, webinars, or virtual discussions (where feasible)",
      "Help surface region-specific challenges, trends, and regulatory perspectives",
    ],
    ideal_for:
      "Senior practitioners and community-minded leaders who want to strengthen SAP Security & GRC collaboration in their local ecosystem.",
  },
  "Community Manager (Global)": {
    commitment: "High Impact",
    count: "2 (max)",
    how_to_contribute: [
      "Act as the central coordination point for all contributors and community roles",
      "Onboard, guide, and support contributors across content, social, tools, and podcasts",
      "Define contribution guidelines, quality standards, and publishing cadence",
      "Coordinate content calendars across the website, LinkedIn, podcasts, and other channels",
      "Ensure consistency in tone, neutrality, and community-first principles",
      "Work closely with Local Community Champions to align regional and global initiatives",
    ],
    ideal_for:
      "Highly organized professionals with strong leadership, communication, and ecosystem-building skills.",
  },
};

const BecomeContributor = () => {
  const [selectedRole, setSelectedRole] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    linkedin: "",
    message: "",
  });

  // Terms Checkboxes
  const [termsAccepted, setTermsAccepted] = useState({
    ownership: false,
    editorial: false,
    guidelines: false,
  });

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
    setShowForm(false); // Reset form visibility when role changes
  };

  const handleApplyNow = () => {
    setShowForm(true);
    // Smooth scroll to form
    setTimeout(() => {
      document
        .getElementById("apply-form")
        .scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e) => {
    setTermsAccepted({ ...termsAccepted, [e.target.name]: e.target.checked });
  };

  const allTermsAccepted =
    termsAccepted.ownership &&
    termsAccepted.editorial &&
    termsAccepted.guidelines;

  const handleApplySubmit = (e) => {
    e.preventDefault();
    if (!allTermsAccepted) {
      alert("Please accept the Terms & Conditions to proceed.");
      return;
    }
    // Simulate Email Sending
    // In a real app, this would be a fetch POST to /api/contributor_apply.php
    console.log("Submitting application:", {
      ...formData,
      role: selectedRole,
      timestamp: new Date().toISOString(),
    });
    alert(
      `Thank you ${formData.name}! Your application for "${selectedRole}" has been submitted. We will contact you shortly.`,
    );
    setShowForm(false);
    setFormData({ name: "", email: "", linkedin: "", message: "" });
    setTermsAccepted({ ownership: false, editorial: false, guidelines: false });
  };

  return (
    <div className="contributor-page">
      <Helmet>
        <title>Become a Contributor | SAP Security Expert</title>
      </Helmet>

      <div className="contributor-hero">
        <div className="container">
          <h1>Join the SAP Security Expert Community</h1>
          <p>
            A non-profit, vendor-neutral community built by practitioners, for
            practitioners.
          </p>
        </div>
      </div>

      <div className="container contributor-content">
        <div className="intro-section">
          <p>
            SAP Security Expert (sapsecurityexpert.com) is inviting passionate
            professionals, consultants, and enthusiasts to contribute their
            time, skills, and expertise to help grow this global knowledge
            platform. Contributions are flexible, impactful, and
            recognition-driven - not commercial.
          </p>
        </div>

        {/* Role Selector */}
        <div className="role-selection-section">
          <h2>Choose Your Area of Interest</h2>
          <p>Select a role below to see how you can contribute:</p>
          <select
            className="role-dropdown"
            value={selectedRole}
            onChange={handleRoleChange}
          >
            <option value="" disabled>
              -- Select a Role --
            </option>
            {Object.keys(contributorRoles).map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        {/* Dynamic Role Content */}
        {selectedRole && contributorRoles[selectedRole] && (
          <div className="role-details-card fade-in">
            <h3>{selectedRole}</h3>
            <div className="role-badge">
              Time Commitment: {contributorRoles[selectedRole].commitment}
            </div>
            <div className="role-badge">
              Contributors Needed: {contributorRoles[selectedRole].count}
            </div>

            <div className="role-responsibilities">
              <h4>How you contribute:</h4>
              <ul>
                {contributorRoles[selectedRole].how_to_contribute.map(
                  (item, idx) => (
                    <li key={idx}>{item}</li>
                  ),
                )}
              </ul>
            </div>

            <div className="role-ideal-for">
              <strong>Ideal for:</strong>{" "}
              {contributorRoles[selectedRole].ideal_for}
            </div>

            <Link
              to={`/apply-contributor?role=${encodeURIComponent(selectedRole)}`}
              className="btn-apply-now"
            >
              Apply Now
            </Link>
          </div>
        )}

        {/* Application Form */}
        {showForm && (
          <div id="apply-form" className="application-form-section fade-in">
            <h3>Application Form</h3>
            <form onSubmit={handleApplySubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>LinkedIn Profile URL *</label>
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Why do you want to join? (Optional)</label>
                <textarea
                  name="message"
                  rows="3"
                  value={formData.message}
                  onChange={handleInputChange}
                ></textarea>
              </div>

              {/* T&C Section */}
              <div className="terms-section">
                <button
                  type="button"
                  className="btn-view-terms"
                  onClick={() => setShowTermsModal(true)}
                >
                  Read Terms & Conditions
                </button>

                <div className="checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="ownership"
                      checked={termsAccepted.ownership}
                      onChange={handleCheckboxChange}
                    />
                    I confirm that my submission complies with the Content
                    Ownership and Copyright provisions.
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="editorial"
                      checked={termsAccepted.editorial}
                      onChange={handleCheckboxChange}
                    />
                    I consent to editorial review and publishing discretion.
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="guidelines"
                      checked={termsAccepted.guidelines}
                      onChange={handleCheckboxChange}
                    />
                    I agree to the Terms & Conditions and Community Guidelines.
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="btn-submit-application"
                disabled={!allTermsAccepted}
              >
                Submit Application
              </button>
            </form>
          </div>
        )}

        {/* Why Contribute Section */}
        <div className="why-contribute-section">
          <h3>Why Contribute?</h3>
          <ul>
            <li>Build industry visibility & credibility</li>
            <li>Get recognized as a community contributor / author</li>
            <li>Expand your professional network globally</li>
            <li>Give back to the SAP Security & GRC ecosystem</li>
            <li>Be part of the upcoming publications/books</li>
            <li>Be part of a trusted, non-commercial knowledge movement</li>
          </ul>
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

              <h4>4. License to Publish</h4>
              <p>
                By submitting Content, you grant the Platform a non-exclusive,
                royalty-free, worldwide license to host, reproduce, publish,
                distribute, display, edit, and promote the Content in connection
                with the Platform and its related channels, unless otherwise
                agreed in writing.
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
              </ul>

              <h4>6. Suspension and Termination</h4>
              <p>
                The Platform may, at any time and without prior notice, restrict
                or suspend access if it determines that these Terms have been
                violated.
              </p>

              <h4>7. Disclaimer of Liability</h4>
              <p>
                The Platform does not endorse, verify, or guarantee the accuracy
                of user-submitted Content. All Content is provided “as is”
                without warranties of any kind.
              </p>

              <h4>11. Contact Information</h4>
              <p>
                For questions regarding these Terms or compliance matters,
                please contact: hello@sapsecurityexpert.com
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn-accept-terms"
                onClick={() => setShowTermsModal(false)}
              >
                Close & Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BecomeContributor;
