import React, { useState, useEffect } from "react";
import "../../css/AdminDashboard.css";

const AdminAds = () => {
  const [ads, setAds] = useState({
    home_left: { image: "", link: "", active: false },
    home_right: { image: "", link: "", active: false },
    sidebar: { image: "", link: "", active: false },
  });

  const [uploading, setUploading] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await fetch("/api/manage_ads.php");
        if (res.ok) {
          const data = await res.json();
          setAds((prev) => ({ ...prev, ...data }));
        }
      } catch (error) {
        console.error("Failed to fetch ads", error);
      }
    };
    fetchAds();
  }, []);

  const handleImageUpload = async (zone, file) => {
    setUploading(zone);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("zone", zone);

    try {
      const res = await fetch("/api/upload_ad_image.php", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (result.status === "success") {
        setAds((prev) => ({
          ...prev,
          [zone]: {
            ...prev[zone],
            image: result.path,
          },
        }));
        setMessage(`Image uploaded for ${zone}`);
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(`Upload failed: ${result.message}`);
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
        return fetch("/api/manage_ads.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(adData),
        });
      });

      await Promise.all(promises);
      setMessage("Ads settings saved successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Save failed", error);
      setMessage("Failed to save changes.");
    }
  };

  const zones = [
    { id: "home_left", label: "Home Page - Left Ad", dimensions: "300x250px" },
    {
      id: "home_right",
      label: "Home Page - Right Ad",
      dimensions: "300x250px",
    },
    { id: "sidebar", label: "Blog Sidebar Ad", dimensions: "300x600px" },
  ];

  return (
    <div className="admin-content">
      <div className="admin-header">
        <h2>Ads Management</h2>
      </div>

      {message && <div className="alert-success">{message}</div>}

      <div className="ads-grid">
        {zones.map((zone) => (
          <div
            key={zone.id}
            className="admin-card"
            style={{ marginBottom: "20px" }}
          >
            <h3>{zone.label}</h3>
            <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
              Required dimensions: {zone.dimensions}
            </p>

            <div className="form-group">
              <label>Status</label>
              <select
                value={ads[zone.id].active ? "true" : "false"}
                onChange={(e) =>
                  handleChange(zone.id, "active", e.target.value === "true")
                }
                className="form-control"
              >
                <option value="false">Inactive</option>
                <option value="true">Active</option>
              </select>
            </div>

            <div className="form-group">
              <label>Ad Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files[0]) {
                    handleImageUpload(zone.id, e.target.files[0]);
                  }
                }}
                className="form-control"
              />
              {uploading === zone.id && <p>Uploading...</p>}
              {ads[zone.id].image && (
                <div style={{ marginTop: "10px" }}>
                  <img
                    src={ads[zone.id].image}
                    alt={`${zone.label} preview`}
                    style={{
                      maxWidth: zone.id === "sidebar" ? "150px" : "150px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                    }}
                  />
                  <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
                    Current: {ads[zone.id].image}
                  </p>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Link URL</label>
              <input
                type="url"
                value={ads[zone.id].link}
                onChange={(e) => handleChange(zone.id, "link", e.target.value)}
                placeholder="https://example.com"
                className="form-control"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="admin-actions">
        <button className="btn-primary" onClick={handleSave}>
          Save All Changes
        </button>
      </div>
    </div>
  );
};

export default AdminAds;
