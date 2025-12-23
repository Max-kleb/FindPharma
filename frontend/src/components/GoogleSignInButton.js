// src/components/GoogleSignInButton.js
import React, { useEffect, useCallback } from 'react';
import './GoogleSignInButton.css';

const GOOGLE_CLIENT_ID = '595512029208-gu72ruff29q4kt5m361sek6rs2p2u30s.apps.googleusercontent.com';
const API_URL = process.env.REACT_APP_API_URL || 'https://findpharma.app';

function GoogleSignInButton({ onSuccess, onError, buttonText = 'Continuer avec Google' }) {
  
  const handleGoogleResponse = useCallback(async (response) => {
    console.log('🔐 Google response received');
    
    try {
      // Envoyer le credential au backend
      const res = await fetch(`${API_URL}/api/auth/google/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: response.credential
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        console.log('✅ Google auth success:', data);
        
        // Stocker les tokens
        if (data.tokens) {
          localStorage.setItem('access_token', data.tokens.access);
          localStorage.setItem('refresh_token', data.tokens.refresh);
        }
        
        // Stocker les infos utilisateur
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        
        if (onSuccess) {
          onSuccess(data);
        }
      } else {
        console.error('❌ Google auth error:', data);
        if (onError) {
          onError(data.error || 'Erreur d\'authentification Google');
        }
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      if (onError) {
        onError('Erreur de connexion au serveur');
      }
    }
  }, [onSuccess, onError]);

  useEffect(() => {
    // Charger le script Google Identity Services
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      // Initialiser Google Identity Services
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        
        // Afficher le bouton One Tap (optionnel)
        // window.google.accounts.id.prompt();
      }
    };
    
    document.head.appendChild(script);
    
    return () => {
      // Cleanup
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [handleGoogleResponse]);

  const handleClick = () => {
    if (window.google) {
      // Afficher le popup Google Sign-In
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Si One Tap ne s'affiche pas, utiliser le bouton standard
          // Créer un bouton Google invisible et le cliquer
          const buttonDiv = document.createElement('div');
          buttonDiv.id = 'google-signin-button-hidden';
          buttonDiv.style.display = 'none';
          document.body.appendChild(buttonDiv);
          
          window.google.accounts.id.renderButton(buttonDiv, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
          });
          
          // Simuler un clic après le rendu
          setTimeout(() => {
            const googleButton = buttonDiv.querySelector('div[role="button"]');
            if (googleButton) {
              googleButton.click();
            }
            buttonDiv.remove();
          }, 100);
        }
      });
    }
  };

  return (
    <button 
      type="button" 
      className="google-signin-button"
      onClick={handleClick}
    >
      <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      <span>{buttonText}</span>
    </button>
  );
}

export default GoogleSignInButton;
