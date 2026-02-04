import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import "../css/ContactForm.css"; // Reuse existing styles or create new
import { HiOutlineMail } from "react-icons/hi";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    email: "",
    position: "",
    location: "",
    reason: "Advertise with you", // Default
    description: "",
    captcha: "", // Simple math check
  });

  const [captchaAns, setCaptchaAns] = useState("");

  const reasons = [
    "Advertise with you",
    "Questions about Contribution",
    "Interested to be part of the Podcast/Interview",
    "Interested in showcasing our product",
    "Others",
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (captchaAns !== "8") {
      alert("Incorrect Captcha. What is 5 + 3?");
      return;
    }

    alert("Message Sent! We will contact you shortly.");
  };

  return (
    <div className="contact-form-container" style={{ paddingTop: "80px" }}>
      <Helmet>
        <title>Contact Us | SAP Security Expert</title>
        <meta
          name="description"
          content="Get in touch with SAP Security Expert team."
        />
      </Helmet>

      <div className="contact-form-header">
        <h2>Contact Us</h2>
        <p>We'd love to hear from you. Please fill out the form below.</p>
      </div>

      <form
        className="contact-form"
        onSubmit={handleSubmit}
        style={{ maxWidth: "900px", margin: "0 auto" }}
      >
        <div className="form-group">
          <label>Name *</label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Company Name</label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Email ID *</label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Position</label>
          <input
            type="text"
            name="position"
            value={formData.position}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Reason *</label>
          <select name="reason" value={formData.reason} onChange={handleChange}>
            {reasons.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
          ></textarea>
        </div>

        {/* Captcha */}
        <div className="form-group" style={{ width: "150px" }}>
          <label>Captcha: 5 + 3 = ?</label>
          <input
            type="tel"
            value={captchaAns}
            onChange={(e) => setCaptchaAns(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="submit-btn" style={{ width: "100%" }}>
          Send Message
        </button>
      </form>
    </div>
  );
};

export default ContactUs;
