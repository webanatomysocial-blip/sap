// src/components/CommentSection.jsx
import React, { useState, useEffect } from "react";
import "../css/CommentSection.css";

const CommentSection = ({ blogId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [honeypot, setHoneypot] = useState(""); // Spam trap
  const [mathAnswer, setMathAnswer] = useState(""); // Simple math challenge
  const [visibleCount, setVisibleCount] = useState(3);
  const [totalComments, setTotalComments] = useState(0);

  // Load comments from API
  useEffect(() => {
    if (!blogId) return;

    // Fetch all comments initially (or implement pagination logic if list is huge)
    // For now we fetch all and handle display limiting on frontend or fetch limited
    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/comments.php?post_id=${blogId}`);
        if (response.ok) {
          const data = await response.json();
          const loadedComments = Array.isArray(data.comments)
            ? data.comments
            : [];
          setComments(loadedComments);
          setTotalComments(data.total || loadedComments.length);
        }
      } catch (error) {
        console.error("Failed to fetch comments:", error);
      }
    };

    fetchComments();
  }, [blogId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !authorName.trim()) return;

    // Spam Check 1: Honeypot
    if (honeypot) {
      console.warn("Spam detected (honeypot).");
      return;
    }

    // Spam Check 2: Math
    if (mathAnswer !== "4") {
      alert(
        "Please answer the math question correctly to prove you are human.",
      );
      return;
    }

    const payload = {
      post_id: blogId,
      author: authorName,
      text: newComment,
      website_url: honeypot,
    };

    try {
      const response = await fetch("/api/comments.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.status === "success") {
        // Optimistically update UI
        const newEntry = {
          id: result.id || Date.now(),
          author: authorName,
          text: newComment,
          date: new Date().toISOString(),
        };
        setComments([newEntry, ...comments]);
        setTotalComments((prev) => prev + 1);

        setNewComment("");
        setAuthorName("");
        setMathAnswer("");
      } else {
        alert(result.message || "Failed to post comment.");
      }
    } catch (error) {
      console.error("Failed to save comment:", error);
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
            Security Question: What is 2 + 2? *
          </label>
          <input
            type="text"
            pattern="4"
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
