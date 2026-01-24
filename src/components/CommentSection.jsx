import React, { useState, useEffect } from "react";
import "../css/CommentSection.css";

const CommentSection = ({ blogId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [authorName, setAuthorName] = useState("");

  // Load comments from local storage on mount or blogId change
  useEffect(() => {
    if (!blogId) return;
    const storedComments = localStorage.getItem(`comments_${blogId}`);
    const parsed = storedComments ? JSON.parse(storedComments) : [];
    requestAnimationFrame(() => setComments(parsed));
  }, [blogId]);

  // Save comments to local storage whenever they change
  useEffect(() => {
    if (!blogId) return;
    localStorage.setItem(`comments_${blogId}`, JSON.stringify(comments));
  }, [comments, blogId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim() || !authorName.trim()) return;

    const comment = {
      id: Date.now(), // Unique ID
      author: authorName,
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      text: newComment,
    };

    setComments([...comments, comment]);
    setNewComment("");
    setAuthorName("");
  };

  return (
    <div className="comments-section" id="comments">
      <h3>Comments ({comments.length})</h3>

      <div className="comments-list">
        {comments.length === 0 && (
          <p className="no-comments">No comments yet. Be the first!</p>
        )}
        {comments.map((comment) => (
          <div key={comment.id} className="comment-item">
            <div className="comment-header">
              <span className="comment-author">{comment.author}</span>
              <span className="comment-date">{comment.date}</span>
            </div>
            <p className="comment-text">{comment.text}</p>
          </div>
        ))}
      </div>

      <form className="comment-form" onSubmit={handleSubmit}>
        <h4>Leave a Reply</h4>
        <p className="reply-note">
          <span className="required-field">*</span> Required fields are marked
        </p>
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
        <button type="submit" className="btn-submit-comment">
          Post Comment
        </button>
      </form>
    </div>
  );
};

export default CommentSection;
