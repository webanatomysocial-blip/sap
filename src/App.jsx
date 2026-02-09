import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/Layout";
import Home from "./pages/Home";
import Blogs from "./components/Blog";
import DynamicBlog from "./components/DynamicBlog";

// New Separate Category Pages
// New Separate Category Pages
import SapSecurity from "./pages/categories/SapSecurity";
import SapS4Hana from "./pages/categories/SapS4Hana";
import SapFiori from "./pages/categories/SapFiori";
import SapBtpSecurity from "./pages/categories/SapBtpSecurity";
import SapPublicCloud from "./pages/categories/SapPublicCloud";
import SapSac from "./pages/categories/SapSac";
import SapCis from "./pages/categories/SapCis";
import SapSuccessFactors from "./pages/categories/SapSuccessFactors";
import SapOther from "./pages/categories/SapOther";

import SapAccessControl from "./pages/categories/SapAccessControl";
import SapProcessControl from "./pages/categories/SapProcessControl";
import SapIag from "./pages/categories/SapIag";
import SapGrc from "./pages/categories/SapGrc";

import SapCybersecurity from "./pages/categories/SapCybersecurity";
import SapLicensing from "./pages/categories/SapLicensing";
import ProductReviews from "./pages/categories/ProductReviews";
import Podcasts from "./pages/categories/Podcasts";
import Videos from "./pages/categories/Videos";
import OtherTools from "./pages/categories/OtherTools";
import Contact from "./pages/Contact";
import ContactUs from "./pages/ContactUs";
import BecomeContributor from "./components/BecomeContributor";
import ContributorApplication from "./pages/ContributorApplication";
import AdminLayout from "./components/admin/AdminLayout";
import AdminHome from "./components/admin/AdminHome";
import AdminContributors from "./components/admin/AdminContributors";
import AdminAnnouncements from "./components/admin/AdminAnnouncements";
import AdminComments from "./components/admin/AdminComments";
import AdminAds from "./components/admin/AdminAds";
import AdminBlogs from "./components/admin/AdminBlogs";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="blogs" element={<Blogs />} />
        <Route path="blogs/:blogId" element={<DynamicBlog />} />

        {/* SAP Security Routes */}
        <Route path="sap-security" element={<SapSecurity />} />
        <Route path="sap-security/:blogId" element={<DynamicBlog />} />

        <Route path="sap-s4hana-security" element={<SapS4Hana />} />
        <Route path="sap-s4hana-security/:blogId" element={<DynamicBlog />} />

        <Route path="sap-fiori-security" element={<SapFiori />} />
        <Route path="sap-fiori-security/:blogId" element={<DynamicBlog />} />

        <Route path="sap-btp-security" element={<SapBtpSecurity />} />
        <Route path="sap-btp-security/:blogId" element={<DynamicBlog />} />

        <Route path="sap-public-cloud" element={<SapPublicCloud />} />
        <Route path="sap-public-cloud/:blogId" element={<DynamicBlog />} />

        <Route path="sap-sac-security" element={<SapSac />} />
        <Route path="sap-sac-security/:blogId" element={<DynamicBlog />} />

        <Route path="sap-cis" element={<SapCis />} />
        <Route path="sap-cis/:blogId" element={<DynamicBlog />} />

        <Route
          path="sap-successfactors-security"
          element={<SapSuccessFactors />}
        />
        <Route
          path="sap-successfactors-security/:blogId"
          element={<DynamicBlog />}
        />

        <Route path="sap-security-other" element={<SapOther />} />
        <Route path="sap-security-other/:blogId" element={<DynamicBlog />} />

        {/* GRC & IAG Routes */}
        <Route path="sap-access-control" element={<SapAccessControl />} />
        <Route path="sap-access-control/:blogId" element={<DynamicBlog />} />

        <Route path="sap-process-control" element={<SapProcessControl />} />
        <Route path="sap-process-control/:blogId" element={<DynamicBlog />} />

        <Route path="sap-iag" element={<SapIag />} />
        <Route path="sap-iag/:blogId" element={<DynamicBlog />} />

        <Route path="sap-grc" element={<SapGrc />} />
        <Route path="sap-grc/:blogId" element={<DynamicBlog />} />

        <Route path="sap-cybersecurity" element={<SapCybersecurity />} />
        <Route path="sap-cybersecurity/:blogId" element={<DynamicBlog />} />

        <Route path="sap-licensing" element={<SapLicensing />} />
        <Route path="sap-licensing/:blogId" element={<DynamicBlog />} />

        {/* Resources Routes */}
        <Route path="product-reviews" element={<ProductReviews />} />
        <Route path="product-reviews/:blogId" element={<DynamicBlog />} />

        <Route path="podcasts" element={<Podcasts />} />
        <Route path="podcasts/:blogId" element={<DynamicBlog />} />

        <Route path="videos" element={<Videos />} />
        <Route path="videos/:blogId" element={<DynamicBlog />} />

        <Route path="other-tools" element={<OtherTools />} />
        <Route path="other-tools/:blogId" element={<DynamicBlog />} />

        <Route path="become-a-contributor" element={<BecomeContributor />} />
        <Route path="apply-contributor" element={<ContributorApplication />} />
        <Route path="contact-us" element={<ContactUs />} />
      </Route>

      {/* Admin Dashboard */}
      <Route
        path="/admin"
        element={<Navigate to="/admin-dashboard" replace />}
      />
      <Route path="/admin-dashboard" element={<AdminLayout />}>
        <Route index element={<AdminHome />} />
        <Route path="contributors" element={<AdminContributors />} />
        <Route path="announcements" element={<AdminAnnouncements />} />
        <Route path="comments" element={<AdminComments />} />
        <Route path="ads" element={<AdminAds />} />
        <Route path="blogs" element={<AdminBlogs />} />

        {/* Support legacy route format if needed, OR redirect. 
            For now, we can keep the dynamic one as a fallback for unknown categories if desired, 
            but the user asked for separate pages. We will assume explicit routes covers everything in the nav.
        */}
      </Route>
    </Routes>
  );
}

export default App;
