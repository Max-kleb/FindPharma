// src/AuthModal.js
import React, { useState } from 'react';
// 💡 Import de la fonction API pour l'authentification (à créer dans services/api.js)
// import { login, register } from './services/api'; 

function AuthModal({ mode, onClose, onAuthSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const isRegisterMode = mode === 'register';

  const title = isRegisterMode ? "Créer un Compte" : "Se Connecter";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Simulation de l'appel API
    try {
        if (isRegisterMode) {
            // await register(email, password);
            console.log(`[AUTH] Inscription simulée pour: ${email}`);
        } else {
            // await login(email, password);
            console.log(`[AUTH] Connexion simulée pour: ${email}`);
        }
        
        // Simuler le jeton (Token) et le rôle (Admin pour les tests)
        const token = "mock_jwt_token_12345";
        const userRole = email.includes('admin') ? 'admin' : 'user';

        alert(`✅ Authentification réussie ! Bienvenue ${email}.`);
        onAuthSuccess(token, userRole);
        onClose();

    } catch (err) {
        // L'erreur réelle viendrait de l'API (e.g., email déjà utilisé)
        alert(`❌ Échec de l'authentification: Vérifiez vos identifiants.`);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content auth-modal">
        <h3>{title}</h3>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            required
          />
          {isRegisterMode && (
            <p className="password-hint">Le mot de passe doit contenir au moins 8 caractères.</p>
          )}

          <div className="modal-actions">
            <button type="submit" disabled={loading} className="submit-auth-button">
              {loading ? 'Chargement...' : (isRegisterMode ? "S'inscrire" : "Se Connecter")}
            </button>
            <button type="button" onClick={onClose} className="cancel-button">
              Annuler
            </button>
          </div>
        </form>
        
        <p className="toggle-mode" onClick={() => onClose(isRegisterMode ? 'login' : 'register')}>
            {isRegisterMode 
                ? "Déjà un compte ? Connectez-vous" 
                : "Pas encore de compte ? Créez-en un"}
        </p>
      </div>
    </div>
  );
}

export default AuthModal;