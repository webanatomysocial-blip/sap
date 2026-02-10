// src/components/CommentSection.jsx
import React, { useState, useEffect } from "react";
import "../css/CommentSection.css";
import { submitComment } from "../services/api";

const CommentSection = ({ blogId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [email, setEmail] = useState("");
  /* eslint-disable no-unused-vars */
  const [honeypot, setHoneypot] = useState(""); // Spam trap
  /* eslint-enable no-unused-vars */
  const [mathAnswer, setMathAnswer] = useState("");

  // Initialize random math question
  const [mathQuestion, setMathQuestion] = useState(() => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    return { q: `${num1} + ${num2}`, a: (num1 + num2).toString() };
  });

  const [visibleCount, setVisibleCount] = useState(3);
  const [totalComments, setTotalComments] = useState(0);

  // Load comments from API
  // Note: For now, we assume comments are passed via props or loaded with the blog.
  // If we need independent reloading, we should add a getComments API.
  // The PHP fetch code is removed.
  /*
  useEffect(() => {
     // ... legacy fetch logic ...
  }, [blogId]); 
  */

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !authorName.trim() || !email.trim()) return;

    // Spam Check 1: Honeypot
    if (honeypot) {
      console.warn("Spam detected (honeypot).");
      return;
    }

    // Spam Check 2: Math
    if (mathAnswer !== mathQuestion.a) {
      alert(`Incorrect security answer. Please calculate: ${mathQuestion.q}`);
      return;
    }

    const payload = {
      post_id: blogId, // Backend expects post_id
      author_name: authorName,
      author_email: email,
      content: newComment,
    };

    try {
      const response = await submitComment(payload);

      if (response.status === 201) {
        alert("Comment submitted for approval!");
        setNewComment("");
        setAuthorName("");
        setEmail(""); // Reset email
        setMathAnswer("");

        // Regenerate math question
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        setMathQuestion({
          q: `${num1} + ${num2}`,
          a: (num1 + num2).toString(),
        });
      } else {
        alert("Failed to post comment.");
      }
    } catch (error) {
      console.error("Failed to save comment:", error);
      alert("Error submitting comment. Please try again.");
    }
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 3);
  };

  const visibleComments = comments.slice(0, visibleCount);

  return (
    <div className="comments-section" id="comments">
      <h3>Comments ({totalComments})</h3>

      <div className="comments-list">
        {comments.length === 0 && (
          <p className="no-comments">No comments yet. Be the first!</p>
        )}
        {visibleComments.map((comment) => (
          <div key={comment.id} className="comment-item">
            <div className="comment-header">
              <span className="comment-author">{comment.author}</span>
              <span className="comment-date">
                {new Date(comment.date).toLocaleDateString()}
              </span>
            </div>
            <p className="comment-text">{comment.text}</p>
          </div>
        ))}

        {visibleCount < comments.length && (
          <button className="btn-load-more" onClick={handleLoadMore}>
            Load More comments
          </button>
        )}
      </div>

      <form className="comment-form" onSubmit={handleSubmit}>
        <h4>Leave a Reply</h4>
        <p className="reply-note">
          <span className="required-field">*</span> Required fields are marked
        </p>

        {/* Anti-Spam Fields */}
        <div style={{ display: "none" }}>
          <label>Website</label>
          <input
            type="text"
            name="website_url"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex="-1"
            autoComplete="off"
          />
        </div>

        <div className="form-group">
          <input
            type="text"
            placeholder="Your Name *"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <input
            type="email"
            placeholder="Your Email *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "10px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>

        <div className="form-group">
          <textarea
            placeholder="Join the discussion... *"
            rows="4"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            required
          ></textarea>
        </div>

        <div className="form-group" style={{ maxWidth: "200px" }}>
          <label
            style={{
              fontSize: "0.9rem",
              marginBottom: "5px",
              display: "block",
            }}
          >
            Security Question: What is {mathQuestion.q}? *
          </label>
          <input
            type="text"
            placeholder="Answer"
            value={mathAnswer}
            onChange={(e) => setMathAnswer(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn-submit-comment">
          Post Comment
        </button>
      </form>
    </div>
  );
};

export default CommentSection;
