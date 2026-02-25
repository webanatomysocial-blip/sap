// src/components/CommentSection.jsx
import React, { useState, useEffect } from "react";
import "../css/CommentSection.css";
import { submitComment } from "../services/api";
import { useToast } from "../context/ToastContext";

const CommentItem = ({ comment, depth = 0, replyMap, onReply }) => {
  const replies = replyMap[comment.id] || [];
  const [isExpanded, setIsExpanded] = useState(false);

  const showAll = isExpanded || replies.length <= 1;
  const visibleReplies = showAll ? replies : replies.slice(0, 1);
  const remainingCount = replies.length - 1;

  return (
    <div className={`comment-item ${depth > 0 ? "reply-item" : ""}`}>
      <div className="comment-content-wrapper">
        <div className="comment-header">
          <span className="comment-author">{comment.author}</span>
          <span className="comment-date">
            {new Date(comment.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </span>
        </div>
        <p className="comment-text">{comment.text}</p>

        <div className="comment-footer">
          <button className="btn-reply-link" onClick={() => onReply(comment)}>
            <i className="bi bi-reply"></i> Reply
          </button>
        </div>
      </div>

      {replies.length > 0 && (
        <div className="replies-section">
          <div className="replies-container">
            {visibleReplies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                depth={depth + 1}
                replyMap={replyMap}
                onReply={onReply}
              />
            ))}
          </div>

          {replies.length > 1 && !isExpanded && (
            <button
              className="btn-view-replies"
              onClick={() => setIsExpanded(true)}
            >
              <i className="bi bi-chevron-down"></i> View Replies (
              {remainingCount})
            </button>
          )}

          {replies.length > 1 && isExpanded && (
            <button
              className="btn-view-replies collapse"
              onClick={() => setIsExpanded(false)}
            >
              <i className="bi bi-chevron-up"></i> Hide Replies
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const CommentSection = ({ blogId, onCommentAdded }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [mathAnswer, setMathAnswer] = useState("");
  const [replyTo, setReplyTo] = useState(null); // The comment being replied to
  const { addToast } = useToast();

  const [mathQuestion, setMathQuestion] = useState(() => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    return { q: `${num1} + ${num2}`, a: (num1 + num2).toString() };
  });

  const [visibleCount, setVisibleCount] = useState(3);
  const [totalComments, setTotalComments] = useState(0);

  const fetchComments = () => {
    if (!blogId) return;
    const API_URL = import.meta.env.VITE_API_URL || "/api";
    fetch(`${API_URL}/get_comments.php?blogId=${blogId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setComments(data);
          // Only count top-level comments (exclude replies)
          const topLevelCount = data.filter((c) => !c.parent_id).length;
          setTotalComments(topLevelCount);
        }
      })
      .catch((err) => console.error("Failed to load comments", err));
  };

  useEffect(() => {
    fetchComments();
  }, [blogId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !authorName.trim() || !email.trim()) return;

    if (honeypot) return;

    if (mathAnswer !== mathQuestion.a) {
      addToast(`Incorrect security answer.`, "error");
      return;
    }

    const payload = {
      blogId: blogId,
      author: authorName,
      email: email,
      text: newComment,
      parent_id: replyTo ? replyTo.id : null,
    };

    try {
      const response = await submitComment(payload);

      if (response.status === 201) {
        addToast(
          "Thank you for your comment. It has been successfully submitted and is now awaiting moderation. Once reviewed, it will be published.",
          "success",
        );
        setNewComment("");
        setAuthorName("");
        setEmail("");
        setMathAnswer("");
        setReplyTo(null);

        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        setMathQuestion({
          q: `${num1} + ${num2}`,
          a: (num1 + num2).toString(),
        });

        // Refresh to show updated (if approved immediately, but usually it waits)
        fetchComments();

        // Notify parent to increment comment count if not a reply and assuming it could be auto-approved
        // Often we wait for moderation, but if the requirement is to sync the counter immediately
        // upon a successful post API response that adds it to the list, we trigger it here.
        // Let's only increment if it's a top-level comment
        if (!replyTo && onCommentAdded) {
          onCommentAdded();
        }
      } else {
        addToast("Something went wrong.", "error");
      }
    } catch (error) {
      addToast("Failed to submit comment.", "error");
    }
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 3);
  };

  // Grouping logic
  const topLevelComments = comments.filter((c) => !c.parent_id);
  const replyMap = {};
  comments.forEach((c) => {
    if (c.parent_id) {
      if (!replyMap[c.parent_id]) replyMap[c.parent_id] = [];
      replyMap[c.parent_id].push(c);
    }
  });

  const visibleTopLevel = topLevelComments.slice(0, visibleCount);

  return (
    <div className="comments-section" id="comments">
      <h3>Comments ({totalComments})</h3>

      <div className="comments-list">
        {comments.length === 0 && (
          <p className="no-comments">No comments yet. Be the first!</p>
        )}

        {visibleTopLevel.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            replyMap={replyMap}
            onReply={setReplyTo}
          />
        ))}

        {visibleCount < topLevelComments.length && (
          <button className="comment-load-more-btn" onClick={handleLoadMore}>
            Load More comments
          </button>
        )}
      </div>

      {/* Main Comment Form */}
      <form className="comment-form" onSubmit={handleSubmit}>
        <h4>{replyTo ? `Reply to ${replyTo.author}` : "Leave a Comment"}</h4>
        {replyTo && (
          <button
            type="button"
            className="btn-cancel-reply"
            onClick={() => setReplyTo(null)}
          >
            Cancel Reply
          </button>
        )}
        <p className="reply-note">
          <span className="required-field">*</span> Required fields are marked
        </p>

        <div style={{ display: "none" }}>
          <input
            type="text"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex="-1"
            autoComplete="off"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input
              type="text"
              className="form-control"
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Comment</label>
          <textarea
            className="form-control"
            rows="4"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            required
          ></textarea>
        </div>

        <div className="form-footer">
          <div className="form-group captcha-group">
            <label className="form-label">What is {mathQuestion.q}? *</label>
            <input
              type="text"
              className="form-control"
              value={mathAnswer}
              onChange={(e) => setMathAnswer(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary btn-submit-comment">
            {replyTo ? "Post Reply" : "Post Comment"}
          </button>
        </div>
      </form>

      {/* Reply Modal (Optional if inline is preferred, but user requested modal popup) */}
      {/* Decided to use inline for better UX, but adding a modal class if replyTo is set to mimic "popup" behavior if needed */}
      {replyTo && (
        <div className="comment-reply-overlay" onClick={() => setReplyTo(null)}>
          <div
            className="comment-reply-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Reply to {replyTo.author}</h3>
              <button className="close-btn" onClick={() => setReplyTo(null)}>
                &times;
              </button>
            </div>
            <form className="comment-form" onSubmit={handleSubmit}>
              <div style={{ display: "none" }}>
                <input
                  type="text"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex="-1"
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Name *"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Email *"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <textarea
                  className="form-control"
                  placeholder="Your Reply *"
                  rows="4"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  required
                ></textarea>
              </div>
              <div className="form-footer">
                <div className="captcha-box">
                  <span>{mathQuestion.q} = </span>
                  <input
                    type="text"
                    value={mathAnswer}
                    onChange={(e) => setMathAnswer(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn-primary">
                  Post Reply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
