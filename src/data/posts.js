export const posts = [
  {
    id: 1,
    title: "Integrating Okta with SAP IAS & IPS – Step-by-Step IAM Best Practices",
    slug: "integrating-okta-with-sap-ias-ips-by-raghu-boddu-step-by-step-iam-best-practices",
    category: "sap-security",
    subcategory: "sap-btp-security",
    author: "Raghu Boddu",
    date: "October 15, 2023",
    readTime: "8 min read",
    excerpt: "Learn how to seamlessly integrate Okta with SAP IAS and IPS for a robust Identity and Access Management strategy.",
    image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    content: `
      <h2>Introduction</h2>
      <p>Identity and Access Management (IAM) is critical for modern enterprises. In this guide, we explore how to integrate Okta with SAP Identity Authentication Service (IAS) and Identity Provisioning Service (IPS).</p>
      <h3>Why Integration Matters</h3>
      <p>Seamless user experience and centralized control are the key benefits. By connecting Okta, you ensure that your SAP landscape is secure and accessible only to authorized personnel.</p>
      <h3>Step 1: Configuration in Okta</h3>
      <p>Navigate to your Okta admin dashboard and create a new OIDC application. Note down the Client ID and Secret.</p>
      <h3>Step 2: SAP IAS Setup</h3>
      <p>In SAP IAS, add Okta as an Identity Provider. Exchange metadata to establish trust.</p>
      <blockquote>Security is not an afterthought; it's a foundation.</blockquote>
      <p>Follow these steps to ensure a successful deployment.</p>
    `,
  },
  {
    id: 2,
    title: "The Magician, The Machine, and SAP Cybersecurity",
    slug: "the-magician-the-machine-and-sap-cybersecurity",
    category: "sap-cybersecurity",
    subcategory: null,
    author: "Jane Doe",
    date: "September 28, 2023",
    readTime: "5 min read",
    excerpt: "Exploring the intersection of human expertise and automated defenses in the realm of SAP security.",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    content: `
      <p>Cybersecurity is often seen as a battle between hackers and systems. But the human element remains the most unpredictable variable.</p>
      <h2>The Human Element</h2>
      <p>Social engineering remains a top threat. No amount of firewalls can stop a well-crafted phishing email if users aren't trained.</p>
      <h2>Automated Defenses</h2>
      <p>AI and Machine Learning are revolutionizing how we detect threats in SAP environments. Anomalies that would take humans weeks to find are flagged in seconds.</p>
    `,
  },
  {
    id: 3,
    title: "Understanding SAP Licensing Models in 2024",
    slug: "understanding-sap-licensing-models-in-2024",
    category: "sap-licensing",
    subcategory: null,
    author: "John Smith",
    date: "November 2, 2023",
    readTime: "6 min read",
    excerpt: "A comprehensive guide to navigating the complex world of SAP licensing and compliance.",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    content: `
      <p>SAP licensing can be complex. From FUE (Full Usage Equivalent) to digital access, understanding what you pay for is crucial.</p>
      <h3>Digital Access</h3>
      <p>With the rise of bots and IoT, SAP introduced the Digital Access model. This document explains how it impacts your bottom line.</p>
    `,
  },
  {
    id: 4,
    title: "Best Practices for SAP GRC Implementation",
    slug: "best-practices-for-sap-grc-implementation",
    category: "sap-grc",
    subcategory: null,
    author: "Emily White",
    date: "August 10, 2023",
    readTime: "10 min read",
    excerpt: "Ensure your GRC implementation is smooth and effective with these expert tips.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    content: `
      <p>Governance, Risk, and Compliance (GRC) is essential for regulatory adherence.</p>
      <ul>
        <li>Define clear roles and responsibilities.</li>
        <li>Automate where possible.</li>
        <li>Regularly audit your access controls.</li>
      </ul>
    `,
  },
  {
    id: 5,
    title: "SAP IAG: The Future of Identity Access Governance",
    slug: "sap-iag-future-of-identity-access-governance",
    category: "sap-iag",
    subcategory: null,
    author: "Michael Brown",
    date: "December 5, 2023",
    readTime: "7 min read",
    excerpt: "Cloud-based identity access governance is here. Discover how SAP IAG is changing the game.",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    content: `
      <p>SAP Identity Access Governance (IAG) offers a cloud-first approach to managing access risks.</p>
    `,
  },
  {
    id: 6,
    title: "Top 5 Tools for SAP Security Audits",
    slug: "top-5-tools-for-sap-security-audits",
    category: "other-tools",
    subcategory: null,
    author: "Sarah Connor",
    date: "January 12, 2024",
    readTime: "4 min read",
    excerpt: "Reviewing the best tools in the market to keep your SAP landscape secure.",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    content: `
      <p>From code scanning to vulnerability assessment, these tools are must-haves for any SAP security professional.</p>
    `,
  },
   {
    id: 7,
    title: "Podcast: The Future of SAP Security",
    slug: "podcast-future-of-sap-security",
    category: "podcasts",
    subcategory: null,
    author: "Tech Talk Team",
    date: "February 1, 2024",
    readTime: "45 min listen",
    excerpt: "Listen to industry experts discuss the evolving landscape of SAP security.",
    image: "https://images.unsplash.com/photo-1478737270239-2f52b7154e7d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    content: `
      <p>In this episode, we cover AI in security, cloud migration challenges, and the new threat landscape.</p>
    `,
  },
  {
    id: 8,
    title: "Product Review: Security Weaver",
    slug: "product-review-security-weaver",
    category: "product-reviews",
    subcategory: null,
    author: "Review Team",
    date: "October 30, 2023",
    readTime: "6 min read",
    excerpt: "An in-depth look at Security Weaver's capabilities and how it compares to standard SAP GRC.",
    image: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    content: `
      <p>Security Weaver provides a modular approach to GRC. We tested its SOD capabilities and user provisioning process.</p>
    `,
  },
    {
    id: 9,
    title: "Securing SAP Cloud Public Edition",
    slug: "securing-sap-cloud-public-edition",
    category: "sap-security",
    subcategory: "sap-cloud-public",
    author: "Cloud Expert",
    date: "November 15, 2023",
    readTime: "9 min read",
    excerpt: "Best practices for maintaining security posture in the public cloud edition of SAP.",
    image: "https://images.unsplash.com/photo-1483478550801-ceba5fe50e8e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    content: `
      <p>Public cloud brings shared responsibility models. Understand what you own and what SAP owns.</p>
    `,
  }
];
