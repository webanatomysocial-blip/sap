import React, { useState, useEffect } from "react";
import "../../css/AdminDashboard.css";
import useScrollLock from "../../hooks/useScrollLock";
import { useToast } from "../../context/ToastContext";
import { useConfirm } from "../../context/ConfirmationContext";

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const { addToast } = useToast();
  const { openConfirm } = useConfirm();

  useScrollLock(isModalOpen);
  const [formData, setFormData] = useState({
    title: "",
    date: new Date().toISOString().split("T")[0],
    link: "",
    status: "active",
    comments: 0,
  });

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch("/api/admin/announcements");
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data);
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
      addToast("Failed to fetch announcements", "error");
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleOpenModal = (announcement = null) => {
    if (announcement) {
      setEditingId(announcement.id);
      setFormData(announcement);
    } else {
      setEditingId(null);
      setFormData({
        title: "",
        date: new Date().toISOString().split("T")[0],
        link: "",
        status: "active",
        comments: 0,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = { ...formData };
      if (editingId) payload.id = editingId;

      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        fetchAnnouncements();
        handleCloseModal();
        addToast(
          editingId
            ? "Announcement updated successfully"
            : "Announcement created successfully",
          "success",
        );
      } else {
        addToast("Failed to save announcement.", "error");
      }
    } catch (error) {
      console.error("Error saving:", error);
      addToast("Error saving announcement", "error");
    }
  };

  const handleDelete = (id) => {
    openConfirm({
      title: "Delete Announcement?",
      message: "Are you sure you want to delete this announcement?",
      confirmText: "Delete",
      isDanger: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/announcements?id=${id}`, {
            method: "DELETE",
          });
          if (res.ok) {
            fetchAnnouncements();
            addToast("Announcement deleted successfully", "success");
          } else {
            addToast("Failed to delete announcement", "error");
          }
        } catch (error) {
          console.error("Error deleting:", error);
          addToast("Error deleting announcement", "error");
        }
      },
    });
  };

  return (
    <div className="admin-page-wrapper">
      <div className="page-header">
        <h2>Announcements</h2>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          <i className="bi bi-plus-lg"></i> New Announcement
        </button>
      </div>

      <div className="admin-card">
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="text-left">Title</th>
                <th className="text-left">Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {announcements.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center">
                    No announcements found.
                  </td>
                </tr>
              ) : (
                announcements.map((item) => (
                  <tr key={item.id}>
                    <td className="text-left">{item.title}</td>
                    <td className="text-left">{item.date}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-edit btn-sm"
                          onClick={() => handleOpenModal(item)}
                          title="Edit"
                        >
                          Edit
                        </button>
                        <button
                          className="btn-delete btn-sm"
                          onClick={() => handleDelete(item.id)}
                          title="Delete"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>{editingId ? "Edit Announcement" : "New Announcement"}</h3>
              <button className="modal-close-btn" onClick={handleCloseModal}>
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
                minHeight: 0, // Fix for scrolling
              }}
            >
              <div className="modal-body" data-lenis-prevent>
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
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Link (Optional)</label>
                  <input
                    type="url"
                    name="link"
                    value={formData.link}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="form-control"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnnouncements;
