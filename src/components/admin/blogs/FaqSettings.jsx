import React from "react";
import SimpleRTE from "../SimpleRTE";

const FaqSettings = ({
  faqs,
  handleFAQChange,
  addFAQ,
  removeFAQ,
  rteImageUpload,
}) => {
  return (
    <div className="admin-card">
      <h3
        style={{
          marginBottom: "20px",
          color: "#1e293b",
          fontSize: "1.2rem",
          paddingBottom: "12px",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        FAQs
      </h3>
      {faqs.map((faq, index) => (
        <div key={index} className="faq-editor-item">
          <input
            placeholder="Question"
            value={faq.question}
            onChange={(e) => handleFAQChange(index, "question", e.target.value)}
            className="form-control"
            style={{ marginBottom: "8px" }}
          />
          <div
            style={{
              marginTop: "8px",
              border: "1px solid #ccc",
              padding: "10px",
              borderRadius: "5px",
            }}
          >
            <label className="form-label">Answer (Rich Text)</label>
            <SimpleRTE
              value={faq.answer}
              onChange={(content) => handleFAQChange(index, "answer", content)}
              onImageUpload={rteImageUpload}
            />
          </div>
          <button
            className="btn-delete"
            onClick={() => removeFAQ(index)}
            style={{ marginTop: "8px" }}
          >
            Remove FAQ
          </button>
        </div>
      ))}
      <button
        type="button"
        className="btn-edit"
        onClick={addFAQ}
        style={{ marginTop: "12px" }}
      >
        + Add FAQ
      </button>
    </div>
  );
};

export default FaqSettings;
