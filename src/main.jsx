// src/main.jsx

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import ScrollToTop from "./components/ScrollToTop";
import "./css/index.css";

import Lenis from "lenis";
import { HelmetProvider } from "react-helmet-async";

// Global Lenis initialization
const lenis = new Lenis({
  duration: 1,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  direction: "vertical",
  gestureDirection: "vertical",
  smooth: true,
  mouseMultiplier: 1,
  smoothTouch: false,
  touchMultiplier: 2,
  infinite: false,
});
window.lenis = lenis;

// FORCE CLEANUP on load (Aggressive)
const removeScrollLock = () => {
  document.body.classList.remove("antigravity-scroll-lock");
  document.body.style.overflow = "auto"; // Force auto
  document.body.style.height = "auto";
};

// Run immediately
removeScrollLock();

// Run repeatedly for 2 seconds to beat any race conditions
const intervalId = setInterval(removeScrollLock, 100);
setTimeout(() => clearInterval(intervalId), 2000);

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

import ErrorBoundary from "./components/ErrorBoundary";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <BrowserRouter>
          <ScrollToTop />
          <App />
        </BrowserRouter>
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
