import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import "../css/BecomeContributor.css"; // Reuse styling

const contributorRoles = [
  "LinkedIn Page & Community Engagement Manager",
  "Useful Tools & Solutions Research Contributor",
  "Social Media Channel Management",
  "Blog & Article Authors",
  "Podcast Creation & Publishing Support",
  "Product Review & Practitioner Analysis Contributor",
  "Community Moderation & Knowledge Curation",
  "Local Community Champion (Regional Lead)",
  "Community Manager (Global)",
];

const ContributorApplication = () => {
  const [searchParams] = useSearchParams();
  const preSelectedRole = searchParams.get("role") || "";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    linkedin: "",
    role: preSelectedRole,
    message: "",
  });

  const [tcs, setTcs] = useState({
    ownership: false,
    editorial: false,
    guidelines: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // success | error

  // If URL param changes, update state
  useEffect(() => {
    if (preSelectedRole) {
      setFormData((prev) => ({ ...prev, role: preSelectedRole }));
    }
  }, [preSelectedRole]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e) => {
    setTcs({ ...tcs, [e.target.name]: e.target.checked });
  };

  const allTermsAccepted = tcs.ownership && tcs.editorial && tcs.guidelines;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!allTermsAccepted) {
      alert("Please accept the Terms & Conditions.");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch("/api/apply_contributor.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.status === "success") {
        setSubmitStatus("success");
        setFormData({
          name: "",
          email: "",
          linkedin: "",
          role: "",
          message: "",
        });
        setTcs({ ownership: false, editorial: false, guidelines: false });
      } else {
        setSubmitStatus("error");
        alert(result.message || "Failed to submit application.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setSubmitStatus("error");
      alert("An error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contributor-page">
      <Helmet>
        <title>Apply to Contribute | SAP Security Expert</title>
      </Helmet>

      <div className="contributor-hero" style={{ paddingBottom: "60px" }}>
        <div className="container">
          <h1>Contributor Application</h1>
          <p>Join the community and make an impact.</p>
        </div>
      </div>

      <div className="container contributor-content">
        {submitStatus === "success" ? (
          <div
            className="success-message-box"
            style={{ textAlign: "center", padding: "40px" }}
          >
            <div
              style={{
                fontSize: "3rem",
                color: "#10b981",
                marginBottom: "20px",
              }}
            >
              <i className="bi bi-check-circle-fill"></i>
            </div>
            <h2>Application Submitted!</h2>
            <p>
              Thank you for your interest. We have received your application.
            </p>
            <p>
              Our team will review your profile and get back to you shortly.
            </p>
            <Link
              to="/"
              className="btn-apply-now"
              style={{ marginTop: "20px" }}
            >
              Back to Home
            </Link>
          </div>
        ) : (
          <div
            className="application-form-section"
            style={{ marginTop: "0", maxWidth: "800px" }}
          >
            <h3>Application Form</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>LinkedIn Profile URL *</label>
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Area of Contribution *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="role-dropdown"
                >
                  <option value="" disabled>
                    -- Select a Role --
                  </option>
                  {contributorRoles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Why do you want to join? (Optional - Brief Pitch)</label>
                <textarea
                  name="message"
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                ></textarea>
              </div>

              {/* T&C Section Reuse */}
              <div className="terms-section">
                <h4>Terms & Conditions</h4>
                <div className="checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="ownership"
                      checked={tcs.ownership}
                      onChange={handleCheckboxChange}
                    />
                    I confirm that my submission complies with the Content
                    Ownership provisions.
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="editorial"
                      checked={tcs.editorial}
                      onChange={handleCheckboxChange}
                    />
                    I consent to editorial review and publishing discretion.
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="guidelines"
                      checked={tcs.guidelines}
                      onChange={handleCheckboxChange}
                    />
                    I agree to the Terms & Conditions and Community Guidelines.
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="btn-submit-application"
                disabled={!allTermsAccepted || isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContributorApplication;
