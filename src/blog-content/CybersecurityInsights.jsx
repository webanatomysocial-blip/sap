import React from "react";
import BlogLayout from "../components/BlogLayout";
import featuredImage from "../assets/blogs/cybersecurity-insights.jpg";

const CybersecurityInsights = () => {
  return (
    <BlogLayout
      category="Podcasts"
      title="SAP Cybersecurity Insights from the Authors of Cybersecurity for SAP book by SAP Press"
      date="January 17, 2026"
      author="Raghu Boddu"
      image={featuredImage}
      content={
        <>
          <p>
            Sharing Episode 2 of the Cyber Kriya Podcast, featuring Juan
            Perez-Etchegoyen (JP) and Gaurav Singh—authors of the SAP PRESS
            bestseller Cybersecurity for SAP.
          </p>
          <p>
            Book reference (SAP PRESS):{" "}
            <a
              href="https://www.sap-press.com/cybersecurity-for-sap_5887/?srsltid=AfmBOoqWqM1TU5yPoDrmLOfCfakTDbLxhQVUU39Pi8v8G2YVeN_-heuN"
              target="_blank"
              rel="noopener noreferrer"
            >
              Cybersecurity for SAP
            </a>
          </p>
          <p>
            This episode offers practical perspectives on SAP cybersecurity
            challenges, threat vectors, and control strategies, directly from
            the authors who have worked extensively with real-world SAP
            landscapes.
          </p>
          <p>
            A valuable listen for SAP Security, GRC, Audit, and Risk
            professionals looking to strengthen their security posture.
          </p>

          <div style={{ margin: "30px 0" }}>
            <iframe
              width="100%"
              height="400"
              src="https://www.youtube.com/embed/q_YclMMJogA"
              title="SAP Cybersecurity Insights"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            <p className="caption">
              Podcast Link:{" "}
              <a
                href="https://www.youtube.com/watch?v=q_YclMMJogA"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://www.youtube.com/watch?v=q_YclMMJogA
              </a>
            </p>
          </div>

          <p>
            <strong>Author’s LinkedIn profiles:</strong>
            <br />
            JP –{" "}
            <a
              href="https://www.linkedin.com/in/jppereze/"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://www.linkedin.com/in/jppereze/
            </a>
            <br />
            Gaurav –{" "}
            <a
              href="https://www.linkedin.com/in/gauravsingh14/"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://www.linkedin.com/in/gauravsingh14/
            </a>
          </p>
          <p>Enjoy the podcast!</p>
        </>
      }
    />
  );
};

export default CybersecurityInsights;
