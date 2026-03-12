import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useMemberAuth } from "../context/MemberAuthContext";
import "../css/members-paywall.css";

/**
 * MembersOnlyPaywall
 *
 * Renders an overlay that:
 * 1. Blocks scroll past 100vh when user is not a logged-in member.
 * 2. Shows heading + Login / Sign Up buttons.
 * 3. If member is authenticated → renders nothing (children show freely).
 *
 * Usage:
 *   <MembersOnlyPaywall>
 *     <BlogContent />
 *   </MembersOnlyPaywall>
 */
const MembersOnlyPaywall = ({ children }) => {
  const { isLoggedIn } = useMemberAuth();
  const navigate = useNavigate();
  const scrollBlockRef = useRef(false);

  // Block scroll past 100vh when paywall is active
  useEffect(() => {
    if (isLoggedIn) return;

    const LIMIT = window.innerHeight; // 100vh

    const blockScroll = (e) => {
      if (scrollBlockRef.current) return;
      const scrollY = window.scrollY || window.pageYOffset;
      if (scrollY >= LIMIT - 50) {
        e.preventDefault();
        window.scrollTo({ top: LIMIT - 50 });
        scrollBlockRef.current = true;
        setTimeout(() => {
          scrollBlockRef.current = false;
        }, 100);
      }
    };

    const handleWheel = (e) => {
      const scrollY = window.scrollY || window.pageYOffset;
      if (scrollY >= LIMIT - 55) {
        e.preventDefault();
      }
    };

    const handleKeyDown = (e) => {
      const keys = [" ", "PageDown", "ArrowDown", "End"];
      const scrollY = window.scrollY || window.pageYOffset;
      if (keys.includes(e.key) && scrollY >= LIMIT - 60) {
        e.preventDefault();
      }
    };

    // Touch support
    let touchStartY = 0;
    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchMove = (e) => {
      const touchY = e.touches[0].clientY;
      const scrollY = window.scrollY || window.pageYOffset;
      if (touchStartY > touchY && scrollY >= LIMIT - 55) {
        e.preventDefault();
      }
    };

    window.addEventListener("scroll", blockScroll, { passive: false });
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener("scroll", blockScroll);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [isLoggedIn]);

  // If logged in, render children normally with no restriction
  if (isLoggedIn) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Content is still rendered for SEO but visually clipped */}
      <div className="members-content-preview">{children}</div>

      {/* Paywall overlay */}
      <div className="members-paywall-overlay">
        <div className="members-paywall-gradient" />
        <div className="members-paywall-card">
          <h2 className="members-paywall-heading">
            Exclusive Content for Members
          </h2>
          <p className="members-paywall-subtext">
            Join our expert community to access premium SAP security insights,
            technical guides, and member-only analysis.
          </p>
          <div className="members-paywall-actions">
            <button
              className="members-paywall-btn-login"
              onClick={() => navigate("/member/login")}
            >
              Log In
            </button>
            <button
              className="members-paywall-btn-signup"
              onClick={() => navigate("/member/signup")}
            >
              Sign Up — It's Free
            </button>
          </div>
          <p className="members-paywall-note">
            Already signed up? Your account will be reviewed and approved within
            24 hours.
          </p>
        </div>
      </div>
    </>
  );
};

export default MembersOnlyPaywall;
