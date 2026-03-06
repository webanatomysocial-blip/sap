import React from "react";

const AnnouncementModal = ({
  isOpen,
  editingId,
  formData,
  handleChange,
  handleClose,
  handleSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>{editingId ? "Edit Announcement" : "New Announcement"}</h3>
          <button className="modal-close-btn" onClick={handleClose}>
            ×
          </button>
        </div>
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            overflow: "hidden",
            minHeight: 0,
          }}
        >
          <div className="modal-body" data-lenis-prevent="true">
            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                maxLength={100}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Display Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="form-control"
                min={new Date().toISOString().split("T")[0]}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Link (Optional)</label>
              <input
                type="url"
                name="link"
                value={formData.link || ""}
                onChange={handleChange}
                placeholder="https://..."
                className="form-control"
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingId ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnnouncementModal;
