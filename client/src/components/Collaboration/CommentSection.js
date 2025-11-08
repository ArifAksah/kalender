import React, { useState, useEffect } from 'react';
import { getComments, addComment } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './CommentSection.css';

function CommentSection({ progressId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadComments();
  }, [progressId]);

  const loadComments = async () => {
    try {
      const data = await getComments(progressId);
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const comment = await addComment(progressId, newComment);
      setComments([...comments, comment]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="comment-section">
      <h4>Comments ({comments.length})</h4>
      
      <div className="comments-list">
        {comments.map((comment) => (
          <div key={comment.id} className="comment-item">
            <div className="comment-author">{comment.users?.username || 'Unknown'}</div>
            <div className="comment-content">{comment.content}</div>
            <div className="comment-date">
              {new Date(comment.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="comment-form">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          rows={3}
          className="comment-input"
          disabled={loading}
        />
        <button type="submit" className="comment-submit" disabled={loading || !newComment.trim()}>
          {loading ? 'Posting...' : 'Post Comment'}
        </button>
      </form>
    </div>
  );
}

export default CommentSection;

