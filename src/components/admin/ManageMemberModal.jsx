import React, { useState } from "react";
import {
  LuX,
  LuShieldCheck,
  LuTriangleAlert,
  LuRefreshCcw,
  LuCopy,
  LuCircleCheck,
} from "react-icons/lu";
import { useToast } from "../../context/ToastContext";
import { resetMemberPassword } from "../../services/api";
import useScrollLock from "../../hooks/useScrollLock";

const ManageMemberModal = ({ member, onClose }) => {
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [newResetPass, setNewResetPass] = useState("");

  const { addToast } = useToast();

  useScrollLock(!!member);

  const handleResetPassword = async () => {
    setResetting(true);
    setNewResetPass("");
    setError("");
    try {
      const res = await resetMemberPassword(member.id);
      if (res.data.status === "success") {
        setNewResetPass(res.data.new_password);
        addToast("Password reset successfully", "success");
      } else {
        setError(res.data.message || "Password reset failed.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Password reset failed. Please check connection.");
    } finally {
      setResetting(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!member) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-container">
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                padding: 10,
                background: "var(--slate-100)",
                borderRadius: 10,
                color: "var(--slate-900)",
              }}
            >
              <LuShieldCheck size={20} />
            </div>
            <div>
              <h3>Manage Member Login</h3>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.8rem",
                  color: "var(--slate-500)",
                }}
              >
                {member.name}
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <LuX size={20} />
          </button>
        </div>

        <div className="modal-body" data-lenis-prevent="true">
          <div className="form-group" style={{ marginBottom: 24 }}>
            <p style={{ color: "var(--slate-600)", fontSize: "0.9rem", lineHeight: 1.5 }}>
              Resetting the password will generate a new random password for <strong>{member.email}</strong>. 
              Please ensure you copy the new password and share it with the member securely.
            </p>
          </div>

          {error && (
            <div className="form-error" style={{ marginBottom: 16 }}>
              <LuTriangleAlert /> {error}
            </div>
          )}

          <div className="form-group">
            <label
              style={{
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontWeight: 600 }}>Login Credentials</span>
              <button
                type="button"
                className="btn-secondary btn-sm"
                onClick={handleResetPassword}
                disabled={resetting}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontSize: "0.85rem",
                  background: "var(--slate-900)",
                  color: "white",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                <LuRefreshCcw className={resetting ? "spin" : ""} style={{ fontSize: 13 }} />
                {resetting ? "Resetting..." : "Generate New Password"}
              </button>
            </label>

            {newResetPass && (
              <div
                style={{
                  background: "#fff7ed",
                  border: "1.5px solid #fdba74",
                  borderRadius: 12,
                  padding: "16px",
                  marginTop: 12,
                }}
              >
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: "0.95rem",
                    color: "#1e293b",
                    marginBottom: 12,
                    display: "flex",
                    flexDirection: "column",
                    gap: 4
                  }}
                >
                  <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "#9a3412", fontWeight: 700 }}>New Password</span>
                  <div style={{ wordBreak: "break-all", background: "white", padding: "8px", borderRadius: "6px", border: "1px solid #fed7aa" }}>
                    {newResetPass}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-secondary btn-sm"
                  onClick={() => copyToClipboard(newResetPass)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "0.85rem",
                    border: "1px solid var(--slate-200)",
                    background: "white",
                    cursor: "pointer"
                  }}
                >
                  {copied ? (
                    <LuCircleCheck style={{ color: "#16a34a" }} />
                  ) : (
                    <LuCopy />
                  )}
                  {copied ? "Copied to Clipboard!" : "Copy New Password"}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer" style={{ borderTop: "1px solid var(--slate-100)", padding: "16px 24px" }}>
          <button 
            type="button" 
            className="btn-secondary" 
            onClick={onClose}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "1px solid var(--slate-200)",
              background: "white",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageMemberModal;
