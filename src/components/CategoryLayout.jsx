import React from "react";
import Blogs from "./Blog";
import { Helmet } from "react-helmet-async";

const CategoryLayout = ({ categorySlug, displayName }) => {
  return (
    <div className="category-page">
      <Helmet>
        <title>{displayName} | SAP Security Expert</title>
        <meta
          name="description"
          content={`Latest articles and insights about ${displayName}`}
        />
      </Helmet>

      <div className="container" style={{ padding: "120px 20px 60px" }}>
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: "700",
            marginBottom: "40px",
            color: "#1e293b",
            textAlign: "center",
          }}
        >
          {displayName}
        </h1>

        <Blogs
          category={categorySlug}
          limit="all"
          backgroundColor="transparent"
        />
      </div>
    </div>
  );
};

export default CategoryLayout;
