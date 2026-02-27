import React, { useState, useEffect, useRef } from "react";
import { LuUser, LuMail, LuUpload, LuX, LuTriangleAlert } from "react-icons/lu";
import { getAdminProfile, updateAdminProfile } from "../../services/api";
import { useToast } from "../../context/ToastContext";

const ProfileEditModal = ({ isOpen, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ full_name: "", email: "" });
  const [preview, setPreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);
  const { addToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setError("");
      setImageFile(null);
      fetchProfile();
    }
  }, [isOpen]);

  const fetchProfile = async () => {
    setFetching(true);
    try {
      const res = await getAdminProfile();
      if (res.data.status === "success") {
        const { full_name, email, profile_image } = res.data.user;
        setFormData({ full_name: full_name || "", email: email || "" });
        setPreview(profile_image || null);
      }
    } catch (err) {
      setError("Failed to load profile data. Please try again.");
    } finally {
      setFetching(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const data = new FormData();
    data.append("full_name", formData.full_name);
    data.append("email", formData.email);
    if (imageFile) data.append("profile_image", imageFile);

    try {
      const res = await updateAdminProfile(data);
      if (res.data.status === "success") {
        addToast("Profile updated successfully", "success");
        if (onUpdate) onUpdate(res.data.profile_image);
        onClose();
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
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-content profile-modal">
        <div className="modal-header">
          <h3>Edit Profile</h3>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <LuX />
          </button>
        </div>

        {fetching ? (
          <div className="modal-loading">Loading profile...</div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-form">
            {error && (
              <div className="form-error">
                <LuTriangleAlert /> {error}
              </div>
            )}

            <div className="profile-image-section">
              <div className="avatar-preview">
                {preview ? (
                  <img src={preview} alt="Profile preview" />
                ) : (
                  <div className="avatar-placeholder">
                    <LuUser />
                  </div>
                )}
                <label className="upload-badge" title="Change Photo">
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
              <p className="image-help">
                Square JPG, PNG or WebP — min 300×300px, max 2MB
              </p>
            </div>

            <div className="form-group">
              <label>
                <LuUser /> Full Name
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                placeholder="Your full name"
                required
              />
            </div>

            <div className="form-group">
              <label>
                <LuMail /> Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary btn-md"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfileEditModal;
