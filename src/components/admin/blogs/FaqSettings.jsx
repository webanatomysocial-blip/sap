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
        <div
          key={index}
          className="faq-editor-item"
          style={{
            background: "#f8fafc",
            padding: "24px",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            marginBottom: "24px",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
              paddingBottom: "12px",
              borderBottom: "1px dashed #e2e8f0",
            }}
          >
            <span
              style={{
                fontSize: "0.85rem",
                fontWeight: "800",
                color: "var(--slate-500)",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              FAQ #{index + 1}
            </span>
            <button
              type="button"
              className="btn-danger"
              onClick={() => removeFAQ(index)}
              style={{
                padding: "6px 14px",
                fontSize: "0.8rem",
                fontWeight: "700",
                borderRadius: "8px",
              }}
            >
              Remove FAQ
            </button>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              className="form-label"
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "0.85rem",
                fontWeight: "700",
                color: "#475569",
              }}
            >
              Question
            </label>
            <input
              placeholder="What is the main question?"
              value={faq.question}
              onChange={(e) =>
                handleFAQChange(index, "question", e.target.value)
              }
              className="form-control"
              style={{ width: "100%" }}
            />
          </div>

          <div>
            <label
              className="form-label"
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "0.85rem",
                fontWeight: "700",
                color: "#475569",
              }}
            >
              Answer (Rich Text)
            </label>
            <div
              style={{
                background: "#fff",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                overflow: "hidden",
              }}
            >
              <SimpleRTE
                value={faq.answer}
                onChange={(content) =>
                  handleFAQChange(index, "answer", content)
                }
                onImageUpload={rteImageUpload}
              />
            </div>
          </div>
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
