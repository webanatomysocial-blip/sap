import React, { useRef, useState, useEffect, useCallback } from "react";

const TableScrollContainer = ({ children }) => {
  const scrollRef = useRef(null);
  const [showControls, setShowControls] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      // Use a small buffer to avoid floating point issues
      setShowControls(scrollWidth > clientWidth + 1);
      setCanScrollLeft(scrollLeft > 2);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  }, []);

  useEffect(() => {
    // Initial check and set up observer for content changes
    checkScroll();
    
    const element = scrollRef.current;
    if (!element) return;

    window.addEventListener("resize", checkScroll);
    
    // Check scroll on any click or mouseup in case content changed (like expansion)
    element.addEventListener("mouseup", checkScroll);

    return () => {
      window.removeEventListener("resize", checkScroll);
      element.removeEventListener("mouseup", checkScroll);
    };
  }, [checkScroll, children]);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = Math.min(scrollRef.current.clientWidth * 0.8, 400);
      const target =
        direction === "left"
          ? scrollRef.current.scrollLeft - scrollAmount
          : scrollRef.current.scrollLeft + scrollAmount;

      scrollRef.current.scrollTo({
        left: target,
        behavior: "smooth",
      });
      
      // Re-check after smooth scroll completes (approximate)
      setTimeout(checkScroll, 400);
    }
  };

  // Calculate dynamic sticky offset for child table headers
  // Offset = Admin Header (80px) + (Scroll Controls (44px) if visible)


  return (
    <div 
      className="admin-table-scroll-container"
    >
      {/* Scroll Navigation Controls - Highlighted as requested */}
      {showControls && (
        <div className="table-scroll-controls highlighted">
          <span className="scroll-hint-text">Scroll Table</span>
          <button
            className="scroll-nav-btn primary-nav"
            onClick={() => handleScroll("left")}
            disabled={!canScrollLeft}
            title="Scroll Left"
          >
            <i className="bi bi-arrow-left"></i>
          </button>
          <div className="scroll-nav-divider"></div>
          <button
            className="scroll-nav-btn primary-nav"
            onClick={() => handleScroll("right")}
            disabled={!canScrollRight}
            title="Scroll Right"
          >
            <i className="bi bi-arrow-right"></i>
          </button>
        </div>
      )}
      <div 
        className="admin-table-wrapper" 
        ref={scrollRef}
        onScroll={checkScroll}
      >
        {children}
      </div>
    </div>
  );
};

export default TableScrollContainer;
