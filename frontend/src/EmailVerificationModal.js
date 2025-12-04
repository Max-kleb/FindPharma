// src/EmailVerificationModal.js
import React, { useState, useEffect } from 'react';
import { verifyEmailCode, resendVerificationCode } from './services/api';
import './EmailVerificationModal.css';

function EmailVerificationModal({ email, username, devCode, onVerified, onClose }) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes en secondes
  const [canResend, setCanResend] = useState(false);

  // Timer de compte à rebours
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Focus automatique sur le premier input
  useEffect(() => {
    document.getElementById('code-input-0')?.focus();
  }, []);

  // Formater le temps restant (mm:ss)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Gérer la saisie du code
  const handleCodeChange = (index, value) => {
    // Ne garder que les chiffres et lettres
    const sanitized = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (sanitized.length > 1) return;

    const newCode = [...code];
    newCode[index] = sanitized;
    setCode(newCode);
    setError('');

    // Auto-focus sur le champ suivant
    if (sanitized && index < 5) {
      document.getElementById(`code-input-${index + 1}`)?.focus();
    }

    // Soumettre automatiquement si tous les champs sont remplis
    if (newCode.every(c => c !== '') && newCode.length === 6) {
      handleVerify(newCode.join(''));
    }
  };

  // Gérer le retour arrière
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      document.getElementById(`code-input-${index - 1}`)?.focus();
    }
  };

  // Gérer le copier-coller
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    if (pastedData.length === 6) {
      const newCode = pastedData.split('');
      setCode(newCode);
      handleVerify(pastedData);
    }
  };

  // Vérifier le code
  const handleVerify = async (codeToVerify = code.join('')) => {
    if (codeToVerify.length !== 6) {
      setError('Veuillez entrer les 6 caractères du code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await verifyEmailCode(email, codeToVerify);
      setSuccess(true);
      
      // Attendre un peu pour montrer le succès
      setTimeout(() => {
        onVerified();
      }, 1500);
    } catch (err) {
      setError(err.message);
      // Réinitialiser le code en cas d'erreur
      setCode(['', '', '', '', '', '']);
      document.getElementById('code-input-0')?.focus();
    } finally {
      setLoading(false);
    }
  };

  // Renvoyer le code
  const handleResend = async () => {
    setLoading(true);
    setError('');

    try {
      await resendVerificationCode(email);
      setTimeLeft(180); // Reset le timer à 3 minutes
      setCanResend(false);
      setCode(['', '', '', '', '', '']);
      document.getElementById('code-input-0')?.focus();
      // Pas de pop-up, l'utilisateur voit le timer se réinitialiser
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verification-modal-overlay">
      <div className="verification-modal">
        <button className="close-button" onClick={onClose} disabled={loading}>
          <i className="fas fa-times"></i>
        </button>

        <div className="verification-header">
          <div className="verification-icon">
            {success ? (
              <i className="fas fa-check-circle success-icon"></i>
            ) : (
              <i className="fas fa-envelope-open-text"></i>
            )}
          </div>
          <h2>{success ? 'Email vérifié !' : 'Vérification de l\'email'}</h2>
          <p>
            {success
              ? 'Votre email a été vérifié avec succès !'
              : `Un code de vérification a été envoyé à :`}
          </p>
          {!success && <p className="email-display">{email}</p>}
        </div>

        {!success && (
          <>
            {/* 🔧 Affichage du code en mode développement */}
            {devCode && (
              <div className="dev-code-banner">
                <i className="fas fa-code"></i>
                <div>
                  <strong>🔧 MODE DÉVELOPPEMENT</strong>
                  <p>Code de vérification : <span className="dev-code-text">{devCode}</span></p>
                  <small>Ce code n'est visible qu'en développement</small>
                </div>
              </div>
            )}
            
            <div className="verification-body">
              <p className="instruction">Entrez le code à 6 caractères :</p>
              
              <div className="code-inputs">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    id={`code-input-${index}`}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    disabled={loading}
                    className={error ? 'error' : ''}
                  />
                ))}
              </div>

              {error && (
                <div className="error-message">
                  <i className="fas fa-exclamation-circle"></i>
                  {error}
                </div>
              )}

              <div className="timer-section">
                <i className="fas fa-clock"></i>
                <span className={timeLeft <= 60 ? 'time-warning' : ''}>
                  Le code expire dans {formatTime(timeLeft)}
                </span>
              </div>
            </div>

            <div className="verification-footer">
              <button
                className="resend-button"
                onClick={handleResend}
                disabled={!canResend || loading}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Envoi...
                  </>
                ) : (
                  <>
                    <i className="fas fa-redo"></i> Renvoyer le code
                  </>
                )}
              </button>

              <p className="help-text">
                Vous n'avez pas reçu le code ? Vérifiez vos spams ou cliquez sur "Renvoyer"
              </p>
            </div>
          </>
        )}

        {success && (
          <div className="success-message">
            <i className="fas fa-check-circle"></i>
            <p>Redirection en cours...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default EmailVerificationModal;
