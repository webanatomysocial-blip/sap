<?php
// Function to ensure absolute URL
function getAbsoluteUrl($path, $baseUrl) {
    if (strpos($path, 'http') === 0) return $path;
    return rtrim($baseUrl, '/') . '/' . ltrim($path, '/');
}

// SIMPLIFIED: Return raw URL to fix "Open Graph not coming". 
// The optimization service might be failing or caching old data.
function getOptimizedOgImage($url) {
    return $url;
    // Old optimization logic commented out for stability:
    // $encodedUrl = urlencode($url);
    // return "https://images.weserv.nl/?url=" . $encodedUrl . "&w=1200&h=630&fit=contain&output=jpg&q=80&bg=ffffff";
}

$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);

// Determine protocol and host dynamically
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
$host = $_SERVER['HTTP_HOST'];
$baseUrl = $protocol . $host;

// Default Meta Tags
$defaultTitle = "SAP Security Expert";
$defaultDesc = "The leading community for SAP Security, GRC, and BTP professionals. Get the latest insights, tutorials, and best practices.";
$defaultKeywords = "SAP Security, SAP GRC, SAP BTP, SAP Licensing, SAP Cybersecurity, SAP IAG, SAP Public Cloud";

// Use /assets/ path. 
// For the Default OG Image, we use the raw URL to avoid potential issues with the optimizer service for the main site image.
// Or we can just point to a known reliable image.
$defaultAbsImage = getAbsoluteUrl("/assets/sapsecurityexpert-black.png", $baseUrl); // Using white logo for dark mode preview or standard
$defaultImage = $defaultAbsImage; // BYPASS OPTIMIZER for default to ensure it works.
$defaultUrl = $baseUrl . "/";

$title = $defaultTitle;
$description = $defaultDesc;
$keywords = $defaultKeywords;
$image = $defaultImage;
$url = $defaultUrl;
$type = "website";

// 1. Blog Metadata (Manual Sync from metadata.js)
// Updated to include 'tags' mapped to 'keywords'
$blogMetadata = [
    [
        "id" => "GrcComplianceManagement",
        "title" => "GRC Compliance Management in SAP: Powering Enterprise-Wide Governance, Risk, and Compliance",
        "slug" => "grc-compliance-management-in-sap-powering-enterprise-wide-governance-risk-and-compliance",
        "metaDescription" => "Powering Enterprise-Wide Governance, Risk, and Compliance.",
        "image" => "/assets/grc-compliance-management-751wa0J1.jpg",
        "keywords" => "grc for sap, grc management, GRC SAP module, SAP critical access, SAP governance, SAP governance risk and compliance, SAP GRC, sap grc module, sox compliance in sap"
    ],
    [
        "id" => "MasteringGrcRuleset",
        "title" => "Mastering SAP GRC Ruleset Manager: A Complete Overview",
        "slug" => "mastering-sap-grc-ruleset-manager-a-complete-overview",
        "metaDescription" => "A complete overview of the Ruleset Manager in SAP GRC Access Control 12.0 SP25.",
        "image" => "/assets/mastering-grc-ruleset-CJLQa-D1.jpg",
        "keywords" => "Access Risk Analysis, Audit and Compliance, Ruleset Manager, SAP GRC, SAP Authorization, SoD Analysis"
    ],
    [
        "id" => "RegainedSapSecurityExpert",
        "title" => "Regained SAP Security Expert!",
        "slug" => "regained-sap-security-expert",
        "metaDescription" => "SAP Security Expert is back home. After a long and unexpected hiatus, SAP Security Expert is finally back home.",
        "image" => "/assets/regained-sap-security-expert-C8GhCufN.jpg",
        "keywords" => "SAP GRC, SAP Security, SAP Community"
    ],
    [
        "id" => "IntegratingOkta",
        "title" => "Integrating Okta with SAP IAS/IPS by Raghu Boddu — Step-by-Step IAM Best Practices",
        "slug" => "integrating-okta-with-sap-ias-ips-by-raghu-boddu-step-by-step-iam-best-practices",
        "metaDescription" => "Step-by-Step IAM Best Practices for integrating Okta with SAP IAS/IPS and Scalable Identity Management.",
        "image" => "/assets/integrating-okta-BAqVk1T-.jpg",
        "keywords" => "IAM Solutions, SAP BTP, SAP CIS, SAP IAG, SAP IAM, SAP IPS, Okta Integration"
    ],
    [
        "id" => "PublicCloudAuthUpgrade",
        "title" => "SAP Public Cloud Authorisation Upgrade- Comprehensive IAM Release Strategy & Execution Guide",
        "slug" => "sap-public-cloud-authorisation-upgrade-comprehensive-iam-release-strategy-execution-guide",
        "metaDescription" => "Comprehensive IAM Release Strategy & Execution Guide for SAP Public Cloud. Upgrading custom business roles efficiently.",
        "image" => "/assets/public-cloud-auth-upgrade-BibbKIom.jpg",
        "keywords" => "Authorization upgrade in public cloud, Best Practices, SAP Public Cloud, Upgrading SAP Public Cloud"
    ],
    [
        "id" => "AuditControlsFail",
        "title" => "Why Traditional SAP Audit Controls Fail in Public Cloud",
        "slug" => "why-traditional-sap-audit-controls-fail-in-public-cloud",
        "metaDescription" => "Why Traditional SAP Audit Controls Fail in Public Cloud. Understanding the shift from on-premise to cloud audits.",
        "image" => "/assets/audit-controls-fail-DlnVkJDt.jpg",
        "keywords" => "SAP Public Cloud, Security Audit, Cloud Controls, SAP Audit"
    ],
    [
        "id" => "ConfigurationWithoutSpro",
        "title" => "Configuration Without SPRO: The New Audit Reality of SAP Public Cloud",
        "slug" => "configuration-without-spro-the-new-audit-reality-of-sap-public-cloud",
        "metaDescription" => "The New Audit Reality of SAP Public Cloud: Configuration Without SPRO. How to audit and configure via CPC.",
        "image" => "/assets/configuration-without-spro-DDSwcb_t.jpg",
        "keywords" => "Auditing SAP Public Cloud, CPC, FAQs on Public Cloud, SAP Security in SAP Public Cloud, SPRO"
    ],
    [
        "id" => "CpcVsSpro",
        "title" => "CPC vs. SPRO: A Security – Centric View of SAP Configuration",
        "slug" => "cpc-vs-spro-a-security-centric-view-of-sap-configuration",
        "metaDescription" => "A Security – Centric View of SAP Configuration: CPC vs. SPRO. Comparing legacy vs modern configuration methods.",
        "image" => "/assets/cpc-vs-spro-CDW41pVQ.jpg",
        "keywords" => "Centralized Parameter Configuration, CPC, CPC in SAP S/4HANA Public Cloud, SAP Public Cloud, SPRO, SPRO_ADMIN"
    ],
    [
        "id" => "PublicVsPrivateCloud",
        "title" => "S/4HANA Public Cloud vs. Private Cloud: A Security-Centric Perspective",
        "slug" => "s-4hana-public-cloud-vs-private-cloud-a-security-centric-perspective",
        "metaDescription" => "A Security-Centric Perspective on S/4HANA Public vs Private Cloud. Choosing the right deployment for security.",
        "image" => "/assets/public-vs-private-cloud-CJsj_a-7.jpg",
        "keywords" => "S/4HANA Public Cloud, Private Cloud, SAP Security, Cloud Strategy, RISE with SAP"
    ],
    [
        "id" => "CybersecurityInsights",
        "title" => "SAP Cybersecurity Insights from the Authors of Cybersecurity for SAP book by SAP Press",
        "slug" => "sap-cybersecurity-insights-from-the-authors-of-cybersecurity-for-sap-book-by-sap-press",
        "metaDescription" => "SAP Cybersecurity Insights from the Authors of Cybersecurity for SAP book. Featuring Juan Perez-Etchegoyen.",
        "image" => "/assets/cybersecurity-insights-qjMmKqrJ.jpg",
        "keywords" => "CyberKriya, CyberKriyaPodcast, CybersecurityForSAP, InfoSec, S4HANA, SAPAudit, SAPGRC, SAPSecurity"
    ],
    [
        "id" => "TheMagicianAndMachine",
        "title" => "The Magician, the Machine, and SAP Cybersecurity",
        "slug" => "the-magician-the-machine-and-sap-cybersecurity",
        "metaDescription" => "The Magician, the Machine, and SAP Cybersecurity. Jay Thoden van Velzen on AI and SAP Security.",
        "image" => "/assets/magician-and-machine-D4BANfTw.jpg",
        "keywords" => "Agentic AI, AI Security, Cyber Risk Management, SAP AI, SAP Cybersecurity, SAP Security, Threat Modeling"
    ],
    [
        "id" => "LicensingOptimization",
        "title" => "SAP Licensing Optimization: Why “License Saver” Tools Often Create False Savings",
        "slug" => "sap-licensing-optimization-why-license-saver-tools-often-create-false-savings",
        "metaDescription" => "Why “License Saver” Tools Often Create False Savings in SAP Licensing. The truth about specialized optimization tools.",
        "image" => "/assets/licensing-optimization-Bo2uI2pZ.jpg",
        "keywords" => "License Saver, Licensing Audit, SAM4U, SAP License Optimization, SAP License Saver, SLAW, STAR, USMM"
    ],
    [
        "id" => "WhatActuallyOptimizes",
        "title" => "What Actually Optimizes SAP Licenses: STAR, USMM, LAW/SLAW Explained",
        "slug" => "what-actually-optimizes-sap-licenses-star-usmm-law-slaw-explained",
        "metaDescription" => "STAR, USMM, LAW/SLAW Explained for SAP Licensing Optimization. Understanding the layers of SAP measurement.",
        "image" => "/assets/what-actually-optimizes-Bo2uI2pZ.jpg",
        "keywords" => "LAW, SAP Audit Readiness, SAP License Compliance, SAP License Optimization, SAP STAR Analysis, SLAW, USMM"
    ],
    [
        "id" => "ThreatSenseReview",
        "title" => "ThreatSense AI Data Security (TADS) Review - Redefining XDR for SAP and Beyond",
        "slug" => "threatsense-ai-data-security-tads-review-redefining-xdr-for-sap-and-beyond",
        "metaDescription" => "Independent review of ThreatSense AI Data Security (TADS) for SAP data leak prevention and endpoint XDR. Learn how it stops insider threats, downloads, and screen sharing.",
        "image" => "/assets/threatsense-review.jpg",
        "keywords" => "SAP data leak prevention, SAP data security, SAP endpoint security, SAP XDR solution, AI-powered SAP security, SAP insider threat protection, SAP data loss prevention, SAP DLP"
    ]
];

// 2. Static Pages
$staticPages = [
    '/' => [
        'title' => 'SAP Security Expert | Home',
        'description' => 'The leading community for SAP Security, GRC, and BTP professionals.',
        'keywords' => 'SAP Security, SAP GRC, SAP BTP, SAP Licensing, SAP Cybersecurity, SAP Community',
        "image" => "/assets/sapsecurityexpert-black.png",
    ],
    '/blogs' => [
        'title' => 'Blogs | SAP Security Expert',
        'description' => 'Read our latest blogs on SAP Security, GRC, and BTP.',
        'keywords' => 'SAP Blogs, SAP Security Tutorials, SAP GRC Articles, SAP BTP Guides',
        "image" => "/assets/sapsecurityexpert-black.png",
    ],
    '/contact' => [
        'title' => 'Contact Us | SAP Security Expert',
        'description' => 'Get in touch with SAP Security Expert. We are here to help.',
        'keywords' => 'Contact SAP Security Expert, SAP Security Support, SAP Consulting',
        "image" => "/assets/sapsecurityexpert-black.png",
    ],
    '/podcasts' => [
        'title' => 'Podcasts | SAP Security Expert',
        'description' => 'Listen to the latest insights from industry leaders in SAP Security.',
        'keywords' => 'SAP Security Podcast, CyberKriya, SAP Cybersecurity Audio',
        "image" => "/assets/sapsecurityexpert-black.png",
    ],
    '/product-reviews' => [
        'title' => 'Product Reviews | SAP Security Expert',
        'description' => 'Unbiased reviews of the latest SAP Security and GRC tools.',
        'keywords' => 'SAP Tool Reviews, GRC Software Reviews, SAP Security Products',
        "image" => "/assets/sapsecurityexpert-black.png",
    ],
    '/product-reviews' => [
        'title' => 'Product Reviews | SAP Security Expert',
        'description' => 'Unbiased reviews of the latest SAP Security and GRC tools.',
        'keywords' => 'SAP Tool Reviews, GRC Software Reviews, SAP Security Products',
        "image" => "/assets/sapsecurityexpert-black.png",
    ],
    '/other-tools' => [
        'title' => 'Other Tools | SAP Security Expert',
        'description' => 'Explore other essential tools for SAP Security professionals.',
        'keywords' => 'SAP Utilities, SAP Security Scripts, Admin Tools',
        "image" => "/assets/sapsecurityexpert-black.png",
    ]
];

// 3. Categories (Manual Map)
$categories = [
    'sap-btp-security' => [
        'title' => 'SAP BTP Security | SAP Security Expert',
        'description' => 'Expert insights on SAP Business Technology Platform (BTP) security, IAS, and IPS.', 
        'keywords' => 'SAP BTP, SAP BTP Security, IAS, IPS, Cloud Security',
        "image" => "/assets/sapsecurityexpert-black.png",
    ],
    'sap-grc' => [
        'title' => 'SAP GRC | SAP Security Expert',
        'description' => 'Comprehensive guides and tutorials for SAP Governance, Risk, and Compliance.',
        'keywords' => 'SAP GRC, Access Control, Process Control, GRC 12.0',
        "image" => "/assets/sapsecurityexpert-black.png",
    ],
    'sap-public-cloud' => [
        'title' => 'SAP Public Cloud | SAP Security Expert',
        'description' => 'Navigating security and compliance in SAP S/4HANA Public Cloud.',
        'keywords' => 'SAP Public Cloud, S/4HANA Cloud, Cloud Identity',
        "image" => "/assets/sapsecurityexpert-black.png",
    ],
    'sap-cybersecurity' => [
        'title' => 'SAP Cybersecurity | SAP Security Expert',
        'description' => 'Latest threats, vulnerabilities, and protection strategies for SAP landscapes.',
        'keywords' => 'SAP Cybersecurity, Threat Detection, Enterprise Security',
        "image" => "/assets/sapsecurityexpert-black.png",
    ],
    'sap-licensing' => [
        'title' => 'SAP Licensing | SAP Security Expert',
        'description' => 'Optimize your SAP licensing costs and ensure compliance.',
        'keywords' => 'SAP Licensing, USMM, SLAW, License Optimization',
        "image" => "/assets/sapsecurityexpert-black.png",
    ]
];


// ROUTING LOGIC
$cleanPath = trim($path, '/');
if ($cleanPath === "") $cleanPath = "/"; // Handle root
else $cleanPath = "/" . $cleanPath; // normalize

$found = false;

// Check Static Pages First (Exact Match)
if (array_key_exists($cleanPath, $staticPages)) {
    $title = $staticPages[$cleanPath]['title'];
    $description = $staticPages[$cleanPath]['description'];
    if (isset($staticPages[$cleanPath]['keywords'])) {
        $keywords = $staticPages[$cleanPath]['keywords'];
    }
    $found = true;
} 
// Check Category Pages (Exact Match on slug)
else if (array_key_exists(ltrim($cleanPath, '/'), $categories)) {
     $catKey = ltrim($cleanPath, '/');
     $title = $categories[$catKey]['title'];
     $description = $categories[$catKey]['description'];
     $keywords = $categories[$catKey]['keywords'];
     $found = true;
}
else {
    // Check Blog Posts (Contains Match)
    foreach ($blogMetadata as $item) {
        if (strpos($cleanPath, $item['slug']) !== false) { 
            $title = $item['title'] . " | SAP Security Expert";
            $description = $item['metaDescription'];
            if (isset($item['keywords'])) {
                $keywords = $item['keywords'];
            }
            // Use the image path defined in metadata
            $absImage = getAbsoluteUrl($item['image'], $baseUrl);
            $image = getOptimizedOgImage($absImage);
            
            $url = $baseUrl . "/blogs/" . $item['slug']; // Canonical URL
            $type = "article";
            $found = true;
            break;
        }
    }
}


// Read index.html
if (file_exists('index.html')) {
    $html = file_get_contents('index.html');
} else {
    // Fallback creates a basic HTML shell if index.html is missing
    $html = "<!DOCTYPE html><html><head></head><body><h1>Maintenance Mode</h1></body></html>";
}

// FIX: Ensure Base Tag for Relative Assets
// If the design is broken on sub-pages, it's usually because assets like "./index.css" 
// are being loaded from "/sap-btp-security/index.css" instead of "/index.css".
if (strpos($html, '<base') === false) {
    $html = str_replace('<head>', '<head><base href="/">', $html);
}

// CLEANUP existing tags to prevent duplicates (Robust Regex for Multi-line)
$html = preg_replace('/<title>.*?<\/title>/is', '', $html);
$html = preg_replace('/<meta\s+[^>]*property=["\']og:[^"\']+["\'][^>]*\/?>/is', '', $html);
$html = preg_replace('/<meta\s+[^>]*name=["\']og:[^"\']+["\'][^>]*\/?>/is', '', $html);
$html = preg_replace('/<meta\s+[^>]*name=["\']description["\'][^>]*\/?>/is', '', $html);
$html = preg_replace('/<meta\s+[^>]*name=["\']twitter:[^"\']+["\'][^>]*\/?>/is', '', $html);
$html = preg_replace('/<meta\s+[^>]*name=["\']keywords["\'][^>]*\/?>/is', '', $html);
$html = preg_replace('/<meta\s+[^>]*name=["\']author["\'][^>]*\/?>/is', '', $html);
$html = preg_replace('/<meta\s+[^>]*name=["\']robots["\'][^>]*\/?>/is', '', $html);

// Prepare New Tags
$headEnd = '</head>';
$ogTags = "
    <!-- Dynamic SEO Tags via index.php (v3) -->
    <title>" . htmlspecialchars($title) . "</title>
    <meta name=\"description\" content=\"" . htmlspecialchars($description) . "\">
    <meta name=\"keywords\" content=\"" . htmlspecialchars($keywords) . "\">
    <meta name=\"author\" content=\"SAP Security Expert\">
    <meta name=\"robots\" content=\"index, follow\">

    <meta property=\"og:title\" content=\"" . htmlspecialchars($title) . "\">
    <meta property=\"og:description\" content=\"" . htmlspecialchars($description) . "\">
    <meta property=\"og:image\" content=\"" . htmlspecialchars($image) . "\">
    <meta property=\"og:url\" content=\"" . htmlspecialchars($url) . "\">
    <meta property=\"og:type\" content=\"" . htmlspecialchars($type) . "\">
    <meta property=\"og:site_name\" content=\"SAP Security Expert\">

    <!-- Additional Image Properties -->
    <meta property=\"og:image:type\" content=\"image/jpeg\">
    <meta property=\"og:image:width\" content=\"1200\">
    <meta property=\"og:image:height\" content=\"630\">
    <meta property=\"og:image:alt\" content=\"" . htmlspecialchars($title) . "\">

    <meta name=\"twitter:card\" content=\"summary_large_image\">
    <meta name=\"twitter:title\" content=\"" . htmlspecialchars($title) . "\">
    <meta name=\"twitter:description\" content=\"" . htmlspecialchars($description) . "\">
    <meta name=\"twitter:image\" content=\"" . htmlspecialchars($image) . "\">
";

// Inject before </head>
$debugInfo = "<!-- SEO Debug: URL=" . htmlspecialchars($url) . " | Found=" . ($found ? "YES" : "NO") . " | Cat=" . (isset($catKey) ? $catKey : "N/A") . " -->";
$html = str_replace($headEnd, $ogTags . "\n" . $debugInfo . "\n" . $headEnd, $html);

echo $html;
?>
