import React from "react";
import BlogLayout from "../components/BlogLayout";
import featuredImage from "../assets/blogs/public-cloud-auth-upgrade.jpg";
import diagram1 from "../assets/blogs/public-cloud-auth-upgrade-diagram-1.jpg";
import diagram2 from "../assets/blogs/public-cloud-auth-upgrade-diagram-2.jpg";
import diagram3 from "../assets/blogs/public-cloud-auth-upgrade-diagram-3.jpg";
import diagram4 from "../assets/blogs/public-cloud-auth-upgrade-diagram-4.jpg";
import diagram5 from "../assets/blogs/public-cloud-auth-upgrade-diagram-5.jpg";
import diagram6 from "../assets/blogs/public-cloud-auth-upgrade-diagram-6.jpg";
import diagram7 from "../assets/blogs/public-cloud-auth-upgrade-diagram-7.jpg";
import diagram8 from "../assets/blogs/public-cloud-auth-upgrade-diagram-8.jpg";
import diagram9 from "../assets/blogs/public-cloud-auth-upgrade-diagram-9.jpg";

const PublicCloudAuthUpgrade = () => {
  return (
    <BlogLayout
      category="SAP Security"
      title="SAP Public Cloud Authorisation Upgrade- Comprehensive IAM Release Strategy & Execution Guide"
      date="January 17, 2026"
      author="Inderdeep Singh"
      image={featuredImage}
      content={
        <>
          <p>
            Upgrading custom business roles represents the most complex and
            critical phase of the IAM release management process. This phase
            requires systematic attention to multiple areas, each with specific
            requirements and validation steps to ensure comprehensive role
            maintenance.
          </p>

          <div className="blog-inline-image">
            <img src={diagram1} alt="IAM Release Management Process" />
            <p className="image-caption">
              Figure 1: IAM Release Management Lifecycle
            </p>
          </div>

          <h3>Manage Business Role Changes</h3>
          <p>
            Analyse differences between current and upgraded states, adopt
            changes systematically.
          </p>
          <div className="blog-inline-image">
            <img src={diagram2} alt="Manage Business Role Changes" />
          </div>

          <h3>Business Catalogues App</h3>
          <p>
            Replace deprecated catalogues with successor versions and validate
            dependencies.
          </p>
          <div className="blog-inline-image">
            <img src={diagram3} alt="Business Catalogues Management" />
          </div>

          <h3>Maintain Business Roles</h3>
          <p>
            Update restrictions and perform manual adjustments as required by
            business needs.
          </p>
          <div className="blog-inline-image">
            <img src={diagram4} alt="Maintain Business Roles" />
          </div>

          <h3>IAM Key Figures</h3>
          <p>
            Validate unmaintained restriction fields and ensure complete
            configuration.
          </p>
          <div className="blog-inline-image">
            <img src={diagram5} alt="IAM Key Figures Validation" />
          </div>

          <h2>Transport to Test & Production</h2>
          <p>
            The transport phase represents the culmination of all development
            work, moving validated IAM changes through the system landscape to
            Test and Production environments. This phase requires strict
            adherence to transport protocols and comprehensive validation
            procedures.
          </p>

          <div className="blog-inline-image">
            <img src={diagram6} alt="Transport Landscape" />
          </div>

          <ul>
            <li>
              <strong>Development:</strong> All changes originate and are
              validated here
            </li>
            <li>
              <strong>Test:</strong> Business validation and user acceptance
              testing
            </li>
            <li>
              <strong>Production:</strong> Final deployment with monitoring and
              support
            </li>
          </ul>

          <p>
            Perform comprehensive business test scripts for all impacted roles
            before approving transport to Production. These test scripts should
            cover critical business processes, edge cases, and integration
            points to ensure that the upgraded roles function correctly in all
            scenarios.
          </p>

          <p>
            The <strong>Export Software Collection</strong> method provides
            superior consistency and traceability compared to manual transport
            methods. It ensures that all related objects are transported
            together, maintaining dependencies and reducing the risk of
            incomplete or inconsistent deployments. Organisations should
            establish clear approval gates at each stage of the transport
            process, with documented sign-offs from technical teams, business
            stakeholders, and compliance functions.
          </p>

          <div className="blog-inline-image">
            <img src={diagram7} alt="Export Software Collection" />
          </div>

          <ul>
            <li>
              <strong>Recommended Method:</strong> Export Software Collection
              (recommended for consistency and reliability)
            </li>
            <li>
              <strong>Legacy Option:</strong> Manual download/upload (use only
              if Software Collection is unavailable)
            </li>
          </ul>

          <h2>Post-Go-Live QA & Governance</h2>
          <p>
            The post-go-live phase is critical for ensuring that the IAM upgrade
            has been successfully implemented and that all systems are
            functioning as expected. This phase requires systematic validation,
            monitoring, and documentation to confirm that the upgrade objectives
            have been achieved.
          </p>
          <div className="blog-inline-image">
            <img src={diagram8} alt="Post-Go-Live Governance" />
          </div>
          <p>
            Post-go-live validation should be conducted systematically over the
            first few days following Production deployment. Establish clear
            escalation procedures for any issues identified during this period,
            ensuring that technical teams and business stakeholders can respond
            quickly to resolve problems. Document all validation activities,
            test results, and issue resolutions to create a comprehensive audit
            trail that demonstrates due diligence and supports future upgrade
            cycles.
          </p>

          <h2>Common Pitfalls & How to Avoid Them</h2>
          <p>
            Understanding common pitfalls and implementing preventive measures
            is essential for successful IAM upgrade execution. These pitfalls
            have been identified through extensive experience with SAP Public
            Cloud upgrades and represent the most frequent causes of upgrade
            complications.
          </p>
          <div className="blog-inline-image">
            <img src={diagram9} alt="Common Pitfalls and Best Practices" />
          </div>

          <h2>Best Practices for Smooth SAP Public Cloud- IAM Adoption</h2>
          <p>
            Implementing these best practices will significantly improve the
            likelihood of a successful IAM upgrade whilst minimising risks,
            reducing disruption, and ensuring that all stakeholders understand
            their roles and responsibilities throughout the process.
          </p>
          <ul>
            <li>
              <strong>Early Planning:</strong> Start planning 4-5 weeks
              pre-upgrade to allow sufficient time for analysis, stakeholder
              engagement, and preparation
            </li>
            <li>
              <strong>Selective Application:</strong> Never mass-apply changes
              without thorough business review to avoid over-assignment and
              security risks
            </li>
            <li>
              <strong>Catalogue Tracking:</strong> Track all deprecated and
              successor catalogues systematically to ensure complete replacement
              and avoid missing authorisations
            </li>
            <li>
              <strong>Restriction Validation:</strong> Validate role
              restrictions after upgrade using IAM Key Figures to confirm
              complete configuration
            </li>
            <li>
              <strong>Transport Discipline:</strong> Always follow Dev to Test
              to Prod discipline without exceptions to maintain change control
              and system integrity
            </li>
          </ul>
        </>
      }
    />
  );
};

export default PublicCloudAuthUpgrade;
