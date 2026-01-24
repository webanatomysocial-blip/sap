import React from "react";
import "../css/Sidebar.css";

const RightSidebar = () => {
  return (
    <div className="sidebar-right">
      <div className="sidebar-section announcements">
        <h3>Announcements</h3>
        <div className="announcement-item">
          <span className="badge new">New</span>
          <p>Welcome to the new SAP Security Expert community! 🚀</p>
        </div>
        <div className="announcement-item">
          <span className="badge event">Event</span>
          <p>Webinar: SAP IAG Migration Strategies - Nov 20th.</p>
        </div>
      </div>

      <div className="sidebar-section ad-placeholder">
        <div className="ad-content">
          <p>Sponsor Ad</p>
          <div
            style={{
              height: "250px",
              background: "#e5e7eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Box Ad 300x250
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
