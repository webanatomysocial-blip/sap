import React, { useState, useEffect, useRef } from "react";
import {
  LuUser,
  LuPhone,
  LuMapPin,
  LuUpload,
  LuX,
  LuTriangleAlert,
} from "react-icons/lu";
import useScrollLock from "../hooks/useScrollLock";
import { updateMemberProfile } from "../services/api";
import { useToast } from "../context/ToastContext";
import { useMemberAuth } from "../context/MemberAuthContext";

const MemberProfileModal = ({ isOpen, onClose }) => {
  const { member, updateMember } = useMemberAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    location: "",
    company_name: "",
    job_role: "",
  });
  const [preview, setPreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);
  const { addToast } = useToast();

  useScrollLock(isOpen);

  useEffect(() => {
    if (isOpen && member) {
      setFormData({
        name: member.name || "",
        phone: member.phone || "",
        location: member.location || "",
        company_name: member.company_name || "",
        job_role: member.job_role || "",
      });
      setPreview(member.profile_image || null);
      setError("");
      setImageFile(null);
    }
  }, [isOpen, member]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate image
    if (file.size > 2 * 1024 * 1024) {
      setError("Image size must be less than 2MB");
      return;
    }

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const data = new FormData();
    data.append("name", formData.name);
    data.append("phone", formData.phone);
    data.append("location", formData.location);
    data.append("company_name", formData.company_name);
    data.append("job_role", formData.job_role);
    if (imageFile) {
      data.append("profile_image", imageFile);
    }
    if (member?.profile_image) {
      data.append("current_image", member.profile_image);
    }

    try {
      const res = await updateMemberProfile(data);
      if (res.data.status === "success") {
        addToast("Profile updated successfully", "success");
        updateMember(res.data.member);
        onClose();
      } else {
        setError(res.data.message || "Failed to update profile.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update profile. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Profile Settings</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <LuX />
          </button>
        </div>

        <div className="modal-body" data-lenis-prevent="true">
          <form id="member-profile-form" onSubmit={handleSubmit}>
            {error && (
              <div
                className="form-error"
                style={{
                  marginBottom: "20px",
                  padding: "12px",
                  background: "#fef2f2",
                  color: "#991b1b",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <LuTriangleAlert /> {error}
              </div>
            )}

            <div
              className="profile-image-section"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <div
                className="avatar-preview"
                style={{
                  position: "relative",
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  background: "#f8fafc",
                  border: "2px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "visible",
                  marginBottom: "12px",
                }}
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="Profile"
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <LuUser size={40} color="#cbd5e1" />
                )}
                <label
                  className="upload-badge"
                  style={{
                    position: "absolute",
                    bottom: "2px",
                    right: "2px",
                    width: "30px",
                    height: "30px",
                    background: "#1e293b",
                    color: "white",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    border: "2px solid white",
                    fontSize: "14px",
                  }}
                >
                  <LuUpload />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/jpeg,image/png,image/webp"
                    hidden
                  />
                </label>
              </div>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b" }}>
                Recommended: Square JPG, PNG or WebP
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: "relative" }}>
                <LuUser
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94a3b8",
                  }}
                />
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Full Name"
                  required
                  style={{ paddingLeft: "40px" }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div style={{ position: "relative" }}>
                <LuPhone
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94a3b8",
                  }}
                />
                <input
                  type="tel"
                  className="form-control"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="Phone Number"
                  style={{ paddingLeft: "40px" }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Location</label>
              <div style={{ position: "relative" }}>
                <LuMapPin
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94a3b8",
                  }}
                />
                <input
                  type="text"
                  className="form-control"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="e.g. Hyderabad, India"
                  style={{ paddingLeft: "40px" }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Company Name</label>
              <div style={{ position: "relative" }}>
                <i
                  className="bi bi-building"
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94a3b8",
                  }}
                />
                <input
                  type="text"
                  className="form-control"
                  value={formData.company_name}
                  onChange={(e) =>
                    setFormData({ ...formData, company_name: e.target.value })
                  }
                  placeholder="Company Name"
                  style={{ paddingLeft: "40px" }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Job Role</label>
              <div style={{ position: "relative" }}>
                <i
                  className="bi bi-briefcase"
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94a3b8",
                  }}
                />
                <input
                  type="text"
                  className="form-control"
                  value={formData.job_role}
                  onChange={(e) =>
                    setFormData({ ...formData, job_role: e.target.value })
                  }
                  placeholder="Job Role"
                  style={{ paddingLeft: "40px" }}
                />
              </div>
            </div>
          </form>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn-cancel"
            onClick={onClose}
            style={{ flex: 1 }}
          >
            Cancel
          </button>
          <button
            form="member-profile-form"
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ flex: 1, backgroundColor: "#ee5e42" }}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberProfileModal;
