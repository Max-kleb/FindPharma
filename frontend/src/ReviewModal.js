// src/ReviewModal.js
import React, { useState } from 'react';
import './ReviewModal.css';

function ReviewModal({ pharmacy, onSubmit, onClose }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      // Pas de pop-up, empêche simplement la soumission
      return;
    }
    
    setLoading(true);
    try {
      await onSubmit(pharmacy.id, rating, comment);
      // Pas de pop-up, fermeture directe
      onClose();
    } catch (error) {
      // Erreur silencieuse
      console.error('Erreur avis:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`star ${i <= (hoverRating || rating) ? 'filled' : ''}`}
          onClick={() => setRating(i)}
          onMouseEnter={() => setHoverRating(i)}
          onMouseLeave={() => setHoverRating(0)}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  const getRatingText = () => {
    const texts = {
      1: 'Très insatisfait 😞',
      2: 'Insatisfait 😕',
      3: 'Correct 😐',
      4: 'Satisfait 🙂',
      5: 'Très satisfait 😊'
    };
    return texts[hoverRating || rating] || 'Cliquez sur une étoile';
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content review-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>
        
        <h3>⭐ Noter {pharmacy.name}</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="rating-section">
            <label>Votre note :</label>
            <div className="stars-container">
              {renderStars()}
            </div>
            <p className="rating-text">{getRatingText()}</p>
          </div>
          
          <div className="comment-section">
            <label htmlFor="review-comment">Votre commentaire (optionnel) :</label>
            <textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Partagez votre expérience avec cette pharmacie..."
              rows={4}
              maxLength={500}
            />
            <span className="char-count">{comment.length}/500</span>
          </div>
          
          <div className="modal-actions">
            <button
              type="submit"
              disabled={loading || rating === 0}
              className="submit-btn"
            >
              {loading ? 'Envoi...' : '✓ Envoyer mon avis'}
            </button>
            <button type="button" onClick={onClose} className="cancel-btn">
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReviewModal;
