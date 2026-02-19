
START TRANSACTION;
CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT ,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
INSERT INTO users VALUES(1,'admin','$2y$12$dhXL13Y74enBjfq.DZGWAe.CAkgJ5UCCc1FLvPYbt7W5tTYj9vZi6','admin','2026-02-10 07:13:55');
CREATE TABLE blogs (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        excerpt TEXT,
        content TEXT,
        author TEXT ,
        date DATE,
        image TEXT,
        category TEXT ,
        subCategory TEXT,
        tags TEXT,
        view_count INTEGER DEFAULT 0,
        meta_title TEXT,
        meta_description TEXT,
        status TEXT ,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    , faq TEXT DEFAULT NULL, cta_title VARCHAR(255) DEFAULT NULL, cta_description TEXT DEFAULT NULL, cta_button_text VARCHAR(100) DEFAULT NULL, cta_button_link VARCHAR(255) DEFAULT NULL, author_id INTEGER NULL, faqs JSON NULL, meta_keywords TEXT);
INSERT INTO blogs VALUES('sample-blog-1','Welcome to SAP Security Experter','welcome-to-sap-security-expert','This is a sample blog post running on your local SQLite database.','<p>Welcome! This content is being served from a local SQLite database file.HUQWSWUUUPUKA</p>','Admin','2026-02-10','/public/assets/blog-images/blog_698f22d6cd67d_1770988246.jpg','sap-security',NULL,'',1,NULL,NULL,'published','2026-02-10 07:13:55',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO blogs VALUES('sample-blog-2','SAP GRC Access Control 12.0','sap-grc-access-control-12','A comprehensive guide to upgrading your GRC landscape.','<p>Upgrade steps...</p>','Admin','2026-02-09',NULL,'sap-grc',NULL,NULL,7,NULL,NULL,'published','2026-02-10 07:13:55',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO blogs VALUES('sample-blog-3','Fiori Security Best Practices','fiori-security-best-practices','Securing SAP Fiori apps requires a different mindset.','<p>Fiori security...</p>','Admin','2026-02-08',NULL,'sap-public-cloud',NULL,NULL,0,NULL,NULL,'published','2026-02-10 07:13:55',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO blogs VALUES('sample-blog-4','S/4HANA Role Design','s4hana-role-design','How to approach role design in S/4HANA greenfield implementations.','<p>Role design...</p>','Admin','2026-02-07',NULL,'sap-security',NULL,NULL,0,NULL,NULL,'published','2026-02-10 07:13:55',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO blogs VALUES('sample-blog-5','SAP Audit Checklist','sap-audit-compliance-checklist','Prepare for your next audit with this essential checklist.','<p>Audit tips...</p>','Admin','2026-02-06',NULL,'sap-iag',NULL,NULL,0,NULL,NULL,'published','2026-02-10 07:13:55',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO blogs VALUES('sample-blog-6','Intro to SAP BTP Security','intro-to-sap-btp-security','Understanding the fundamentals of security in BTP.','<p>BTP Security...</p>','Admin','2026-02-05',NULL,'sap-btp-security',NULL,NULL,1,NULL,NULL,'published','2026-02-10 07:13:55',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO blogs VALUES('blog_698f24a66717c','udaya','udaya','alkslkdvhajksdbv','dkjvhafjdvaghi;of','User','2026-02-13','/public/assets/blog-images/blog_6992cadada13c_1771227866.jpg','sap-security',NULL,'',0,NULL,NULL,'published','2026-02-13 13:18:30',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
INSERT INTO blogs VALUES('blog_69930c5682f67','Test Blog for Comments','test-comment-flow','','<p>Testing comments.</p>','raghu_boddu','2026-02-16','/public/assets/blog-images/blog_6993136622bc4_1771246438.png','sap-security',NULL,'',1,NULL,NULL,'published','2026-02-16 12:23:50',NULL,'hello','hello','hello','https://hello.com',NULL,'[{"question":"hello ","answer":"hello"}]',NULL);
INSERT INTO blogs VALUES('blog_6993f89941de3','SEO Test Blog','seo-test-blog','This is a test blog for SEO verification.','This is the main content of the SEO verification blog. It should be lengthy enough to be considered a real blog post.&lt;h1&gt;hello&lt;/h1&gt;','raghu_boddu','2026-02-17','','sap-security',NULL,'',42,'hello there','seo-test-blogCustom SEO Title | Verification','published','2026-02-17 05:11:53',NULL,'','','','',NULL,'[]','This is a custom meta description for verification.');
INSERT INTO blogs VALUES('blog_6994007ace4c2','','','','','raghu_boddu','2026-02-17','/public/assets/blog-images/blog_69940065164af_1771307109.png','sap-public-cloud',NULL,'',0,'Refactor Works | SAP Security','Testing the removal of hardcoded array.','published','2026-02-17 05:45:30',NULL,'','','','',NULL,'[]',NULL);
INSERT INTO blogs VALUES('blog_699403be1ac6f','Dynamic Refactor Test','dynamic-refactor-test','This is a test blog for dynamic SEO and layout.','This is the main content of the test blog.','raghu_boddu','2026-02-17','','sap-public-cloud',NULL,'',7,'SEO Title Test','SEO Description Test','published','2026-02-17 05:59:26',NULL,NULL,NULL,NULL,NULL,NULL,'[]','seo, test, dynamic');
INSERT INTO blogs VALUES('blog_audit_controls_001','Why Traditional SAP Audit Controls Fail in Public Cloud','why-traditional-sap-audit-controls-fail-in-public-cloud','Why do SAP audit controls fail? Explore the root causes—from bad design to poor execution—and learn how to build controls that actually work.','<p>Traditional SAP audits were designed for a world where customers owned the system end to end. Auditors validated controls by inspecting configuration screens, reviewing system logs, tracing changes, and confirming that powerful technical access was tightly restricted. Visibility equalled assurance, and depth of access was synonymous with risk.</p><p>SAP S/4HANA Public Cloud fundamentally breaks this model.</p><p>In the public cloud, many of the controls auditors historically relied upon are no longer operated – or even visible – by the customer. Configuration scope is restricted, technical override paths are removed, and critical safeguards are enforced at the platform level. When traditional audit techniques are applied unchanged, they often conclude that “controls are missing,” when in reality those controls have been replaced by preventive design.</p><p>This disconnect is why traditional SAP audit controls fail in Public Cloud.</p><h2>The Shift Audits Struggle to Make</h2><p>The most significant change in SAP Public Cloud is not technical-it is conceptual. Control ownership moves away from the customer and into the platform. Instead of executing and monitoring every control, customers now rely on controls that cannot be bypassed.</p><p>Audits built on system-level testing struggle with this shift because they are optimized for detective validation: proving that something happened correctly after the fact. Public Cloud prioritizes prevention: unsafe actions are simply not possible. The absence of familiar evidence is therefore not a weakness; it is often proof that the control has moved upstream into the architecture.</p><h2>When Visibility No Longer Equals Risk</h2><p>In traditional SAP environments, high visibility often came with high risk. Broad access existed, and controls were required to manage it. In Public Cloud, reduced visibility is intentional and directly correlated with reduced risk. Configuration options are limited, customization paths are standardized, and lifecycle activities are governed by the platform itself.</p><p>Audits that equate “less access” or “less evidence” with “less control” misread this reality. The risk surface has not disappeared – it has shrunk.</p><h2>Assurance Without Direct Control</h2><p>A defining characteristic of Public Cloud audits is reliance on assurance rather than execution. Customers do not validate platform integrity by inspecting internal mechanisms; they rely on provider assurances, independently audited reports, and contractual commitments. This is standard practice across mature cloud ecosystems, but it remains uncomfortable for auditors accustomed to direct system inspection.</p><p>Effective auditing in this model focuses on whether this reliance is understood, documented, and governed – not on attempting to recreate access that the platform intentionally withholds.</p><h2>The Cost of Applying the Wrong Controls</h2><p>When audits insist on legacy control evidence, organizations are forced into defensive behaviours: excessive documentation, manual reconciliations, and compensating controls that exist only to satisfy outdated expectations. These activities consume time and budget without materially improving security.</p><p>Worse, they create false positives – findings that signal non-compliance where none exists. Over time, this erodes confidence in audit outcomes and distracts attention from real risk areas that still require scrutiny, such as access governance, data protection, and operational oversight.</p><h2>What Effective Public Cloud Audits Actually Validate</h2><p>Modern SAP Public Cloud audits derive value not from technical depth, but from control alignment. They assess whether governance structures are in place, responsibilities are clearly defined, approvals are enforced, and reliance on platform controls is consciously managed. Evidence becomes contextual rather than mechanical, reflecting where accountability truly sits.</p><p>This approach produces clearer conclusions, fewer disputes, and more meaningful assurance.</p><h2>Rethinking Audit Maturity</h2><p>Audit maturity in the Public Cloud is no longer measured by how much of the system can be inspected, but by how accurately risk is understood. Auditors who adapt their methods recognize that fewer visible controls often indicate stronger security, not weaker oversight.</p><p>Those who do not risk auditing a modern platform with assumptions designed for a different era.</p><h2>Closing Perspective</h2><p>SAP Public Cloud is not an extension of on-premise SAP, it is a different control paradigm altogether. Traditional SAP audit controls fail not because the platform is less secure, but because the audit lens has not evolved at the same pace.</p><p>Auditors who recalibrate their approach will deliver sharper assurance and greater value. Those who cling to legacy control models will continue to find gaps that exist only on paper, not in reality, within modern SAP environments governed by SAP.</p>','Raghu Boddu','2026-01-25','/assets/blogs/audit-controls-fail.jpg','sap-security',NULL,NULL,1,'Why Traditional SAP Audit Controls Fail in Public Cloud','Why do SAP audit controls fail? Explore the root causes—from bad design to poor execution—and learn how to build controls that actually work.','published','2026-02-17 10:24:56',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'SAP Security, SAP Audit, Public Cloud, SAP S/4HANA, Audit Controls, Compliance, GRC');
CREATE TABLE comments (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        post_id TEXT NOT NULL,
        user_name TEXT NOT NULL,
        email TEXT,
        content TEXT NOT NULL,
        status TEXT ,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    , edited_at DATETIME NULL, original_text TEXT NULL);
INSERT INTO comments VALUES(2,'fiori-security-best-practices','Test','test@test.com','Test comment','approved','2026-02-13 12:45:33',NULL,NULL);
INSERT INTO comments VALUES(3,'fiori-security-best-practices','Test User','test@example.com','Great article on Fiori security!','approved','2026-02-13 13:08:23',NULL,NULL);
INSERT INTO comments VALUES(4,'fiori-security-best-practices','test','test@mosol9.in','testing','approved','2026-02-13 13:09:01',NULL,NULL);
INSERT INTO comments VALUES(5,'fiori-security-best-practices','testing','nitish.vetcha@mosol9.in','testing','approved','2026-02-13 13:09:31',NULL,NULL);
INSERT INTO comments VALUES(6,'fiori-security-best-practices','udaya','test@mosol9.in','testing','approved','2026-02-13 13:10:07',NULL,NULL);
INSERT INTO comments VALUES(7,'sap-grc-access-control-12','udaya','udayamosol9@gmail.com','dslhvfasjkdvajk','approved','2026-02-13 13:17:24',NULL,NULL);
INSERT INTO comments VALUES(8,'udaya','nitish','nitish.vetcha@mosol9.in','testing','approved','2026-02-16 07:02:54',NULL,NULL);
INSERT INTO comments VALUES(9,'blog_1','Test User','test@test.com','This is a very long comment that should definitely wrap because it is extremely long and would otherwise cause the table to overflow significantly if the css is not set up correctly to handle such wrapping behavior in the admin panel view especially for approved comments.','approved','2026-02-17 11:11:44',NULL,NULL);
INSERT INTO comments VALUES(10,'blog_69930c5682f67','Tester approved 1','approved1@example.com','This is approved comment 1','approved','2026-02-18 06:34:19',NULL,NULL);
INSERT INTO comments VALUES(11,'blog_69930c5682f67','Tester approved 2','approved2@example.com','This is approved comment 2','approved','2026-02-18 06:34:19',NULL,NULL);
INSERT INTO comments VALUES(12,'blog_69930c5682f67','Tester approved 3','approved3@example.com','This is approved comment 3','approved','2026-02-18 06:34:19',NULL,NULL);
INSERT INTO comments VALUES(13,'blog_69930c5682f67','Tester approved 4','approved4@example.com','This is approved comment 4','approved','2026-02-18 06:34:19',NULL,NULL);
INSERT INTO comments VALUES(14,'blog_69930c5682f67','Tester approved 5','approved5@example.com','This is approved comment 5','approved','2026-02-18 06:34:19',NULL,NULL);
INSERT INTO comments VALUES(15,'test-comment-flow','Final Tester 1','final1@example.com','This is the final test comment 1','approved','2026-02-18 06:36:50',NULL,NULL);
INSERT INTO comments VALUES(16,'test-comment-flow','Final Tester 2','final2@example.com','This is the final test comment 2','approved','2026-02-18 06:36:50',NULL,NULL);
INSERT INTO comments VALUES(17,'test-comment-flow','Final Tester 3','final3@example.com','This is the final test comment 3','approved','2026-02-18 06:36:50',NULL,NULL);
INSERT INTO comments VALUES(18,'test-comment-flow','Final Tester 4','final4@example.com','This is the final test comment 4','approved','2026-02-18 06:36:50',NULL,NULL);
INSERT INTO comments VALUES(19,'test-comment-flow','Final Tester 5','final5@example.com','This is the final test comment 5','approved','2026-02-18 06:36:50',NULL,NULL);
CREATE TABLE contributors (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        linkedin TEXT,
        country TEXT,
        organization TEXT,
        designation TEXT,
        role TEXT,
        expertise TEXT,
        other_expertise TEXT,
        years_experience TEXT,
        short_bio TEXT,
        contribution_types TEXT,
        proposed_topics TEXT,
        contributed_elsewhere TEXT,
        previous_work_links TEXT,
        preferred_frequency TEXT,
        primary_motivation TEXT,
        weekly_time TEXT,
        volunteer_events TEXT,
        product_evaluation TEXT,
        personal_website TEXT,
        twitter_handle TEXT,
        status TEXT ,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    , image VARCHAR(255));
INSERT INTO contributors VALUES(2,'Dheeraj sai charan reddy','reddydheeraj2109@gmail.com','https://sap.mosol9.in/admin-dashboard/contributors','India','nitishdev','Baking Teacher','Useful Tools & Solutions Research Contributor','{"sapSecurity":true,"sapGrc":true,"sapIag":true,"sapBtp":false,"sapCyber":true,"sapLicensing":false,"otherExpertise":false}','Dancing','','ergb rtu','{"articles":true,"caseStudies":true,"tutorials":true,"opinion":true,"research":true,"tools":false}','ue56nuk','No','','One-time','6nut7','64','Yes','Yes','','','approved','2026-02-13 12:37:25',NULL);
INSERT INTO contributors VALUES(3,'Udaya Sri','udayamosol9@gmail.com','https://www.linkedin.com/in/udaya-sri-230018266/','india','mosol9','hgfghch','Podcast Creation & Publishing Support','{"sapSecurity":true,"sapGrc":false,"sapIag":false,"sapBtp":true,"sapCyber":false,"sapLicensing":false,"otherExpertise":false}','','','dfjkagdsjfhvajsdbgvalj','{"articles":true,"caseStudies":false,"tutorials":false,"opinion":false,"research":false,"tools":true}','sdjkfa;jkdvhkajv','No','','One-time','','','','','https://mosol9.in/','https://mosol9.in/','approved','2026-02-13 13:15:37',NULL);
INSERT INTO contributors VALUES(6,'nitish','nkdgas@gmail.com','https://linkedin.com/in/testuser','India','Test Org','','Useful Tools & Solutions Research Contributor','{"sapSecurity":true,"sapGrc":true,"sapIag":true,"sapBtp":true,"sapCyber":true,"sapLicensing":true,"otherExpertise":false}','4tyw5bu','2','5t6y','{"articles":true,"caseStudies":true,"tutorials":true,"opinion":true,"research":true,"tools":true}','tyunr7i','No','','One-time','tniuu','rybg','Yes','Yes','https://linkedin.com/in/johndoe','','approved','2026-02-16 08:01:17','/assets/contributors/contributor_1771228877_6992cecdc5c76.png');
CREATE TABLE analytics (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        post_id TEXT,
        ip_hash TEXT,
        event_type TEXT DEFAULT 'view',
        path TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
CREATE TABLE announcements (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        title TEXT NOT NULL,
        date DATE NOT NULL,
        views INTEGER DEFAULT 0,
        comments INTEGER DEFAULT 0,
        link TEXT,
        status TEXT ,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
INSERT INTO announcements VALUES(1,'New SAP BTP Security Updates','2026-02-13',120,5,'/blog/sap-btp-security','active','2026-02-13 11:24:05');
INSERT INTO announcements VALUES(2,'Upcoming Webinar on SAP Cloud Security','2026-02-15',80,3,'/events/webinar','active','2026-02-13 11:24:05');
INSERT INTO announcements VALUES(3,'SAP Security Best Practices Guide Released','2026-02-10',200,12,'/blog/best-practices','active','2026-02-13 11:24:05');
INSERT INTO announcements VALUES(4,'dsivahjfvbhajkbf','2026-02-13',0,0,'','active','2026-02-13 13:19:32');
CREATE TABLE ads (
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        zone TEXT NOT NULL UNIQUE,
        image TEXT,
        link TEXT,
        active INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    , status VARCHAR(20) );
INSERT INTO ads VALUES(1,'home_left','/public/assets/ads/ad_home_left_1771218380.png','',0,'2026-02-13 12:25:48','inactive');
INSERT INTO ads VALUES(2,'home_right','/assets/ads/ad_home_right_1770986427.png','',0,'2026-02-13 12:25:48','inactive');
INSERT INTO ads VALUES(3,'sidebar','','',0,'2026-02-13 12:25:48','inactive');
INSERT INTO ads VALUES(4,'community_promotion','/assets/promotions/promo-1.png','https://example.com',1,'2026-02-16 05:24:19','active');
INSERT INTO ads VALUES(5,'blog_sidebar','/assets/promotions/promo-2.png','https://example.com',1,'2026-02-16 05:24:19','active');
INSERT INTO ads VALUES(6,'community_left','/public/assets/ads/ad_community_left_1771220204.png','',1,'2026-02-16 05:36:46','active');
INSERT INTO ads VALUES(7,'community_right','/public/assets/ads/ad_community_right_1771220255.png','',1,'2026-02-16 05:36:46','active');
CREATE TABLE post_views (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    post_id INTEGER NOT NULL,
    ip_address TEXT,
    visitor_token TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(post_id) REFERENCES blogs(id) ON DELETE CASCADE
);
INSERT INTO post_views VALUES(1,'blog_699403be1ac6f','::1','visitor_8e2ns42jm1771225353302','2026-02-17 06:43:11');
INSERT INTO post_views VALUES(2,'sample-blog-2','::1','visitor_8e2ns42jm1771225353302','2026-02-17 06:43:38');
INSERT INTO post_views VALUES(3,'blog_6993f89941de3','::1','visitor_8e2ns42jm1771225353302','2026-02-17 06:46:13');
INSERT INTO post_views VALUES(4,'sample-blog-6','::1','visitor_8e2ns42jm1771225353302','2026-02-17 08:30:58');
INSERT INTO post_views VALUES(5,'blog_audit_controls_001','::1','visitor_8e2ns42jm1771225353302','2026-02-17 10:25:06');
INSERT INTO post_views VALUES(6,'sample-blog-1','::1','visitor_8e2ns42jm1771225353302','2026-02-17 10:26:21');
INSERT INTO post_views VALUES(7,'blog_69930c5682f67','::1','visitor_sl0f4qdl41771395999709','2026-02-18 06:26:51');
INSERT INTO migration_sequence VALUES('users',1);
INSERT INTO migration_sequence VALUES('announcements',4);
INSERT INTO migration_sequence VALUES('contributors',9);
INSERT INTO migration_sequence VALUES('comments',19);
INSERT INTO migration_sequence VALUES('ads',7);
INSERT INTO migration_sequence VALUES('post_views',7);
COMMIT;
