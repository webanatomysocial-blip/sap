import React, { useState, useRef, useEffect } from "react";

const ActionMenu = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="action-menu-container" ref={menuRef}>
      <button
        className="action-menu-btn"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        title="More Actions"
      >
        &#8942;
      </button>
      {isOpen && (
        <div className="action-menu-dropdown" onClick={() => setIsOpen(false)}>
          {children}
        </div>
      )}
    </div>
  );
};

export default ActionMenu;
