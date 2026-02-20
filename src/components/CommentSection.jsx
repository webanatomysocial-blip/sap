// src/components/CommentSection.jsx
import React, { useState, useEffect } from "react";
import "../css/CommentSection.css";
import { submitComment } from "../services/api";
import { useToast } from "../context/ToastContext";

const CommentSection = ({ blogId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [email, setEmail] = useState("");
  /* eslint-disable no-unused-vars */
  const [honeypot, setHoneypot] = useState(""); // Spam trap
  /* eslint-enable no-unused-vars */
  const [mathAnswer, setMathAnswer] = useState("");
  const { addToast } = useToast();

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
  // Load comments from API
  useEffect(() => {
    if (!blogId) return;

    // Corrected API URL handling
    const API_URL = import.meta.env.VITE_API_URL || "/api";

    fetch(`${API_URL}/get_comments.php?blogId=${blogId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setComments(data);
          setTotalComments(data.length);
        }
      })
      .catch((err) => console.error("Failed to load comments", err));
  }, [blogId]);

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
      addToast(
        `Incorrect security answer. Please calculate: ${mathQuestion.q}`,
        "error",
      );
      return;
    }

    const payload = {
      blogId: blogId, // Backend expects blogId
      author: authorName,
      email: email,
      text: newComment,
    };

    try {
      const response = await submitComment(payload);

      if (response.status === 201) {
        addToast("Comment submitted for approval!", "success");
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
        addToast(
          "Something went wrong while posting your comment. Please try again.",
          "error",
        );
      }
    } catch (error) {
      console.error("Failed to save comment:", error);
      addToast(
        "Something went wrong while submitting your comment. Please try again.",
        "error",
      );
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
          <button className="comment-load-more-btn" onClick={handleLoadMore}>
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
          <label className="form-label">Name *</label>
          <input
            type="text"
            className="form-control"
            placeholder="Your Name *"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email *</label>
          <input
            type="email"
            className="form-control"
            placeholder="Your Email *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Comment</label>
          <textarea
            className="form-control"
            placeholder="Join the discussion... *"
            rows="4"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            required
          ></textarea>
        </div>

        <div className="form-group" style={{ maxWidth: "200px" }}>
          <label className="form-label">What is {mathQuestion.q}? *</label>
          <input
            type="text"
            className="form-control"
            placeholder="Answer"
            value={mathAnswer}
            onChange={(e) => setMathAnswer(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn-primary btn-submit-comment">
          Post Comment
        </button>
      </form>
    </div>
  );
};

export default CommentSection;
