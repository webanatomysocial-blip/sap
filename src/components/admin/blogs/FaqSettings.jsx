import React from "react";
import SimpleRTE from "../SimpleRTE";

const FaqSettings = ({
  faqs,
  handleFAQChange,
  addFAQ,
  removeFAQ,
  rteImageUpload,
}) => {
  const [expandedIndex, setExpandedIndex] = React.useState(faqs.length - 1);

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
      {faqs.map((faq, index) => {
        const isExpanded = expandedIndex === index;
        return (
          <div
            key={index}
            className="faq-editor-item"
            style={{
              background: "#f8fafc",
              padding: isExpanded ? "24px" : "12px 24px",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              marginBottom: "16px",
              position: "relative",
              transition: "all 0.3s ease",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
              }}
              onClick={() => setExpandedIndex(isExpanded ? -1 : index)}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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
                {!isExpanded && (
                  <span style={{ fontWeight: 600, color: "var(--slate-900)", fontSize: "0.95rem" }}>
                    {faq.question || "(Empty Question)"}
                  </span>
                )}
              </div>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <button
                  type="button"
                  className="btn-danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFAQ(index);
                  }}
                  style={{
                    padding: "4px 10px",
                    fontSize: "0.75rem",
                    fontWeight: "700",
                    borderRadius: "6px",
                  }}
                >
                  Remove
                </button>
                <i className={`bi bi-chevron-${isExpanded ? "up" : "down"}`} style={{ color: "var(--slate-400)" }}></i>
              </div>
            </div>

            {isExpanded && (
              <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px dashed #e2e8f0" }}>
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
            )}
          </div>
        );
      })}
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
