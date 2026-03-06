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
import ContributorProfile from "./pages/ContributorProfile";
import AdminLayout from "./components/admin/AdminLayout";
import AdminHome from "./components/admin/AdminHome";
import AdminContributors from "./components/admin/AdminContributors";
import AdminAnnouncements from "./components/admin/AdminAnnouncements";
import AdminComments from "./components/admin/AdminComments";
import AdminAds from "./components/admin/AdminAds";
import AdminBlogs from "./components/admin/AdminBlogs";
import AdminBlogReview from "./components/admin/AdminBlogReview";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import TermsConditions from "./pages/legal/TermsConditions";
import AccessibilityStatement from "./pages/legal/AccessibilityStatement";
import SafetyMovement from "./pages/legal/SafetyMovement";
import SecurityCompliance from "./pages/legal/SecurityCompliance";
import ResponsibleAi from "./pages/legal/ResponsibleAi";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="blogs" element={<Blogs />} />
        <Route path="blog" element={<Navigate to="/blogs" replace />} />
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
        <Route path="contributor/:id" element={<ContributorProfile />} />
        <Route path="contact-us" element={<ContactUs />} />

        {/* Legal Routes */}
        <Route path="privacy-policy" element={<PrivacyPolicy />} />
        <Route path="terms-conditions" element={<TermsConditions />} />
        <Route
          path="accessibility-statement"
          element={<AccessibilityStatement />}
        />
        <Route path="safety-movement" element={<SafetyMovement />} />
        <Route
          path="security-compliance-overview"
          element={<SecurityCompliance />}
        />
        <Route
          path="responsible-ai-automation-statement"
          element={<ResponsibleAi />}
        />
      </Route>

      {/* React Admin Dashboard with ProtectedRoute removed from parent to avoid loop */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route
          index
          element={
            <ProtectedRoute>
              <AdminHome />
            </ProtectedRoute>
          }
        />
        <Route path="dashboard" element={<Navigate to="/admin" replace />} />
        <Route
          path="blogs"
          element={
            <ProtectedRoute>
              <AdminBlogs />
            </ProtectedRoute>
          }
        />
        <Route
          path="blogs/pending"
          element={
            <ProtectedRoute>
              <AdminBlogReview />
            </ProtectedRoute>
          }
        />
        <Route
          path="blog-review"
          element={
            <ProtectedRoute>
              <AdminBlogReview />
            </ProtectedRoute>
          }
        />
        <Route
          path="contributors"
          element={
            <ProtectedRoute>
              <AdminContributors />
            </ProtectedRoute>
          }
        />
        <Route
          path="announcements"
          element={
            <ProtectedRoute>
              <AdminAnnouncements />
            </ProtectedRoute>
          }
        />
        <Route
          path="comments"
          element={
            <ProtectedRoute>
              <AdminComments />
            </ProtectedRoute>
          }
        />
        <Route
          path="ads"
          element={
            <ProtectedRoute>
              <AdminAds />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route
        path="/admin-dashboard"
        element={<Navigate to="/admin" replace />}
      />
    </Routes>
  );
}

export default App;
