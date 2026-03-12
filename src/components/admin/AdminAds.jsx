import React, { useState, useEffect } from "react";
import ActionMenu from "./ActionMenu";
import "../../css/AdminDashboard.css";
import useScrollLock from "../../hooks/useScrollLock";
import { getAds, saveAd } from "../../services/api";
import api from "../../services/api";

const AdminAds = () => {
  const [ads, setAds] = useState({
    community_left: { image: "", link: "", active: false },
    community_right: { image: "", link: "", active: false },
    blog_sidebar: { image: "", link: "", active: false },
  });

  const [uploading, setUploading] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchAdsData = async () => {
      try {
        const res = await getAds();
        if (res.data) {
          setAds((prev) => ({ ...prev, ...res.data }));
        }
      } catch (error) {
        console.error("Failed to fetch ads", error);
      }
    };
    fetchAdsData();
  }, []);

  const handleImageUpload = async (zone, file) => {
    setUploading(zone);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("zone", zone);

    try {
      const res = await api.post("/upload-ad-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.status === "success") {
        setAds((prev) => ({
          ...prev,
          [zone]: {
            ...prev[zone],
            image: res.data.path,
          },
        }));
        setMessage(`Image uploaded for ${zone}`);
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(`Upload failed: ${res.data.message}`);
      }
    } catch (error) {
      console.error("Upload failed", error);
      setMessage("Upload failed");
    } finally {
      setUploading(null);
    }
  };

  const handleChange = (zone, field, value) => {
    setAds((prev) => ({
      ...prev,
      [zone]: {
        ...prev[zone],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    try {
      const promises = Object.keys(ads).map((zone) => {
        const adData = { ...ads[zone], zone };
        return saveAd(adData);
      });

      await Promise.all(promises);
      setMessage("Ads settings saved successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Save failed", error);
      setMessage("Failed to save changes.");
    }
  };

  const [editingZone, setEditingZone] = useState(null);

  useScrollLock(!!editingZone);

  const zones = [
    {
      id: "community_left",
      label: "Community Page - Left Ad",
      dimensions: "Min 300x300px (1:1 Square)",
    },
    {
      id: "community_right",
      label: "Community Page - Right Ad",
      dimensions: "Min 300x300px (1:1 Square)",
    },
    {
      id: "blog_sidebar",
      label: "Blog Sidebar Ad",
      dimensions: "Min 300x300px (1:1 Square)",
    },
  ];

  const handleEdit = (zoneId) => {
    setEditingZone(zoneId);
  };

  const handleCloseModal = () => {
    setEditingZone(null);
    setMessage("");
  };

  const handleSaveZone = async (e) => {
    e.preventDefault();
    if (!editingZone) return;

    try {
      const zoneData = { ...ads[editingZone], zone: editingZone };
      const res = await saveAd(zoneData);

      if (res.data.status === "success") {
        setMessage("Changes saved successfully!");
        setTimeout(() => {
          handleCloseModal();
        }, 1000);
      } else {
        setMessage("Failed to save.");
      }
    } catch (error) {
      console.error("Save failed", error);
      setMessage("Error saving changes.");
    }
  };

  return (
    <div className="admin-page-wrapper">
      <div className="page-header">
        <h3>Ads & Promotions</h3>
      </div>

      <div className="admin-card">
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="text-left">Zone / Placement</th>
                <th className="text-left">Preview</th>
                <th className="text-left">Link Destination</th>
                <th className="col-status">Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {zones.map((zone) => {
                const ad = ads[zone.id];
                return (
                  <tr key={zone.id}>
                    <td>
                      <strong>{zone.label}</strong>
                      <div className="zone-details">{zone.dimensions}</div>
                    </td>
                    <td>
                      {ad.image ? (
                        <img
                          src={ad.image}
                          alt={zone.label}
                          className="ad-thumbnail"
                        />
                      ) : (
                        <div className="ad-thumbnail-placeholder">
                          <i className="bi bi-image"></i>
                        </div>
                      )}
                    </td>
                    <td>
                      {ad.link ? (
                        <a
                          href={ad.link}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            color: "#1e293b",
                            textDecoration: "underline",
                          }}
                        >
                          {ad.link}
                        </a>
                      ) : (
                        <span style={{ color: "#94a3b8" }}>No link set</span>
                      )}
                    </td>
                    <td className="col-status">
                      <span
                        className={`status-badge ${
                          ad.active ? "status-active" : "status-rejected"
                        }`}
                      >
                        {ad.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="text-center">
                      <ActionMenu>
                        <button
                          className="action-menu-item"
                          onClick={() => handleEdit(zone.id)}
                        >
                          <i className="bi bi-pencil-square"></i> Edit
                        </button>
                      </ActionMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {editingZone && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit {zones.find((z) => z.id === editingZone)?.label}</h3>
              <button className="modal-close-btn" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              {message && (
                <div
                  style={{
                    padding: "10px",
                    background: "#dcfce7",
                    color: "#166534",
                    marginBottom: "15px",
                    borderRadius: "8px",
                    textAlign: "center",
                  }}
                >
                  {message}
                </div>
              )}

              <form id="edit-ad-form" onSubmit={handleSaveZone}>
                <div className="form-group">
                  <label className="admin-checkbox">
                    <input
                      type="checkbox"
                      checked={ads[editingZone].active}
                      onChange={(e) =>
                        handleChange(editingZone, "active", e.target.checked)
                      }
                    />
                    <span></span>
                    Show this ad (Active)
                  </label>
                </div>

                <div className="form-group">
                  <label>Ad Image URL / Upload</label>
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "flex-start",
                    }}
                  >
                    {ads[editingZone].image && (
                      <img
                        src={ads[editingZone].image}
                        style={{
                          width: "80px",
                          height: "80px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                        }}
                        alt="Preview"
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files[0]) {
                            handleImageUpload(editingZone, e.target.files[0]);
                          }
                        }}
                        className="form-control"
                        style={{ marginBottom: "8px" }}
                      />
                      {uploading === editingZone && (
                        <p style={{ color: "#1e293b", fontSize: "0.85rem" }}>
                          Uploading...
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Destination Link</label>
                  <input
                    type="url"
                    value={ads[editingZone].link}
                    onChange={(e) =>
                      handleChange(editingZone, "link", e.target.value.trim())
                    }
                    placeholder="https://..."
                    className="form-control"
                  />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleCloseModal}
              >
                Cancel
              </button>
              <button type="submit" form="edit-ad-form" className="btn-primary">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAds;
