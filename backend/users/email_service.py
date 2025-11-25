# backend/users/email_service.py
"""
Service d'envoi d'emails pour la vérification des comptes
"""
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
import random
import string

def generate_verification_code(length=6):
    """
    Génère un code de vérification aléatoire
    @param length: Longueur du code (par défaut 6)
    @return: Code alphanumérique
    """
    characters = string.ascii_uppercase + string.digits
    # Exclure les caractères ambigus (0, O, I, 1, etc.)
    characters = characters.replace('0', '').replace('O', '').replace('I', '').replace('1', '').replace('l', '')
    return ''.join(random.choice(characters) for _ in range(length))

def send_verification_email(user_email, verification_code, username):
    """
    Envoie un email de vérification à l'utilisateur
    @param user_email: Email du destinataire
    @param verification_code: Code de vérification à 6 chiffres
    @param username: Nom d'utilisateur
    @return: True si envoyé avec succès, False sinon
    """
    # Récupérer le temps d'expiration depuis settings
    expiry_minutes = getattr(settings, 'EMAIL_VERIFICATION_CODE_EXPIRY', 15)
    
    subject = '🔐 FindPharma - Code de vérification'
    
    # Message HTML
    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .header {{
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                border-radius: 10px 10px 0 0;
                text-align: center;
            }}
            .content {{
                background: #f9f9f9;
                padding: 30px;
                border-radius: 0 0 10px 10px;
            }}
            .code-box {{
                background: white;
                border: 3px dashed #667eea;
                border-radius: 10px;
                padding: 20px;
                text-align: center;
                margin: 20px 0;
            }}
            .code {{
                font-size: 36px;
                font-weight: bold;
                color: #667eea;
                letter-spacing: 8px;
                font-family: 'Courier New', monospace;
            }}
            .warning {{
                background: #fff3cd;
                border-left: 4px solid #ffc107;
                padding: 15px;
                margin: 20px 0;
                border-radius: 5px;
            }}
            .footer {{
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 2px solid #e0e0e0;
                color: #666;
                font-size: 12px;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>💊 FindPharma</h1>
            <p>Bienvenue sur FindPharma !</p>
        </div>
        <div class="content">
            <h2>Bonjour {username} 👋</h2>
            <p>Merci de vous être inscrit sur <strong>FindPharma</strong>, votre plateforme de recherche de médicaments au Cameroun.</p>
            
            <p>Pour finaliser votre inscription et activer votre compte, veuillez entrer le code de vérification ci-dessous :</p>
            
            <div class="code-box">
                <p style="margin: 0; font-size: 14px; color: #666;">Votre code de vérification :</p>
                <div class="code">{verification_code}</div>
            </div>
            
            <div class="warning">
                ⚠️ <strong>Important :</strong>
                <ul style="margin: 10px 0;">
                    <li>Ce code expire dans <strong>{expiry_minutes} minute(s)</strong></li>
                    <li>Ne partagez jamais ce code avec quelqu'un d'autre</li>
                    <li>Si vous n'avez pas demandé ce code, ignorez cet email</li>
                </ul>
            </div>
            
            <p>Si le code ne fonctionne pas, vous pouvez demander un nouveau code depuis la page d'inscription.</p>
            
            <p style="margin-top: 30px;">À bientôt sur FindPharma ! 🚀</p>
        </div>
        <div class="footer">
            <p>© 2025 FindPharma - Votre santé, notre priorité</p>
            <p>Yaoundé, Cameroun | contact@findpharma.cm</p>
        </div>
    </body>
    </html>
    """
    
    # Version texte simple (fallback)
    plain_message = f"""
    Bonjour {username},
    
    Merci de vous être inscrit sur FindPharma !
    
    Votre code de vérification est : {verification_code}
    
    Ce code expire dans {expiry_minutes} minute(s).
    Ne partagez jamais ce code avec quelqu'un d'autre.
    
    À bientôt sur FindPharma !
    
    © 2025 FindPharma
    contact@findpharma.cm
    """
    
    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user_email],
            html_message=html_message,
            fail_silently=False,
        )
        print(f"✅ Email de vérification envoyé à {user_email}")
        return True
    except Exception as e:
        print(f"❌ Erreur envoi email à {user_email}: {str(e)}")
        return False

def send_welcome_email(user_email, username):
    """
    Envoie un email de bienvenue après vérification réussie
    """
    subject = '🎉 Bienvenue sur FindPharma !'
    
    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .header {{
                background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%);
                color: white;
                padding: 40px;
                border-radius: 10px;
                text-align: center;
            }}
            .content {{
                padding: 30px 0;
            }}
            .feature {{
                background: #f5f5f5;
                padding: 15px;
                margin: 10px 0;
                border-radius: 8px;
                border-left: 4px solid #4CAF50;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🎉 Bienvenue sur FindPharma !</h1>
            <p>Votre compte est maintenant actif</p>
        </div>
        <div class="content">
            <h2>Félicitations {username} ! 👏</h2>
            <p>Votre compte a été vérifié avec succès. Vous pouvez maintenant profiter de toutes les fonctionnalités de FindPharma :</p>
            
            <div class="feature">
                🔍 <strong>Recherche de médicaments</strong> - Trouvez rapidement vos médicaments dans les pharmacies proches
            </div>
            
            <div class="feature">
                📍 <strong>Géolocalisation</strong> - Localisez les pharmacies les plus proches de vous
            </div>
            
            <div class="feature">
                🛒 <strong>Réservation en ligne</strong> - Réservez vos médicaments avant de vous déplacer
            </div>
            
            <div class="feature">
                💰 <strong>Comparaison de prix</strong> - Comparez les prix entre différentes pharmacies
            </div>
            
            <p style="margin-top: 30px;">Connectez-vous dès maintenant pour commencer : <a href="http://localhost:3000/login">Se connecter</a></p>
            
            <p>L'équipe FindPharma 💊</p>
        </div>
    </body>
    </html>
    """
    
    plain_message = f"""
    Félicitations {username} !
    
    Votre compte FindPharma a été vérifié avec succès.
    
    Vous pouvez maintenant :
    - Rechercher vos médicaments
    - Localiser les pharmacies proches
    - Réserver en ligne
    - Comparer les prix
    
    Connectez-vous dès maintenant !
    
    L'équipe FindPharma
    """
    
    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user_email],
            html_message=html_message,
            fail_silently=False,
        )
        print(f"✅ Email de bienvenue envoyé à {user_email}")
        return True
    except Exception as e:
        print(f"❌ Erreur envoi email de bienvenue: {str(e)}")
        return False
