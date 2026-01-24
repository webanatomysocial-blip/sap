import React from "react";
import { Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import Home from "./pages/Home";
import Blogs from "./components/Blog";
import DynamicBlog from "./components/DynamicBlog";

// New Separate Category Pages
import SapSecurity from "./pages/categories/SapSecurity";
import SapBtpSecurity from "./pages/categories/SapBtpSecurity";
import SapPublicCloud from "./pages/categories/SapPublicCloud";
import SapLicensing from "./pages/categories/SapLicensing";
import SapIag from "./pages/categories/SapIag";
import SapGrc from "./pages/categories/SapGrc";
import SapCybersecurity from "./pages/categories/SapCybersecurity";
import ProductReviews from "./pages/categories/ProductReviews";
import Podcasts from "./pages/categories/Podcasts";
import OtherTools from "./pages/categories/OtherTools";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="blogs" element={<Blogs />} />

        {/* Specific Category Routes */}
        <Route path="sap-security" element={<SapSecurity />} />
        <Route path="sap-btp-security" element={<SapBtpSecurity />} />
        <Route path="sap-public-cloud" element={<SapPublicCloud />} />
        <Route path="sap-licensing" element={<SapLicensing />} />
        <Route path="sap-iag" element={<SapIag />} />
        <Route path="sap-grc" element={<SapGrc />} />
        <Route path="sap-cybersecurity" element={<SapCybersecurity />} />
        <Route path="product-reviews" element={<ProductReviews />} />
        <Route path="podcasts" element={<Podcasts />} />
        <Route path="other-tools" element={<OtherTools />} />

        {/* Support legacy route format if needed, OR redirect. 
            For now, we can keep the dynamic one as a fallback for unknown categories if desired, 
            but the user asked for separate pages. We will assume explicit routes covers everything in the nav.
        */}

        {/* Dynamic Blog Post Route - Matches /sap-security/some-post-slug */}
        <Route path=":categorySlug/:blogId" element={<DynamicBlog />} />
      </Route>
    </Routes>
  );
}

export default App;
