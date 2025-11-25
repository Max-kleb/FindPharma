#!/bin/bash
# Script pour afficher clairement où trouver le code de vérification

cat << 'EOF'
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║     📧  OÙ TROUVER LE CODE DE VÉRIFICATION EMAIL ?               ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝

┌───────────────────────────────────────────────────────────────────┐
│  🎯 EN MODE DÉVELOPPEMENT (ACTUEL)                                │
└───────────────────────────────────────────────────────────────────┘

Le code de vérification s'affiche dans le TERMINAL DJANGO
(là où vous avez lancé "python manage.py runserver")

┌───────────────────────────────────────────────────────────────────┐
│  📝 ÉTAPE PAR ÉTAPE                                               │
└───────────────────────────────────────────────────────────────────┘

1️⃣  Sur le navigateur : http://localhost:3000/register
    → Remplir le formulaire d'inscription
    → Cliquer sur "📧 Vérifier mon email"

2️⃣  Aller dans le TERMINAL où tourne Django
    → Chercher le dernier bloc d'email affiché

3️⃣  Trouver le code dans ce format :

    ╔═══════════════════════════════════════════════╗
    ║  Content-Type: text/html; charset="utf-8"    ║
    ║  From: FindPharma <noreply@findpharma.cm>    ║
    ║  To: votre@email.com                         ║
    ║                                              ║
    ║  Votre code de vérification :                ║
    ║                                              ║
    ║       ┌─────────────┐                        ║
    ║       │   ABC123    │  ← VOICI LE CODE !     ║
    ║       └─────────────┘                        ║
    ║                                              ║
    ║  Ce code expire dans 15 minutes.             ║
    ╚═══════════════════════════════════════════════╝

4️⃣  Copier le code (ex: ABC123)

5️⃣  Retour au navigateur
    → Coller le code dans le modal
    → Appuyer sur Entrée ou attendre la validation auto

6️⃣  ✅ Email vérifié ! Inscription finalisée !

┌───────────────────────────────────────────────────────────────────┐
│  🔍 ASTUCES                                                       │
└───────────────────────────────────────────────────────────────────┘

• Le code fait toujours 6 caractères (lettres + chiffres)
• Il apparaît dans le terminal dans les 2 secondes
• Scroll vers le bas du terminal pour voir les derniers messages
• Le code est écrit en MAJUSCULES (ex: A3K7M9)

┌───────────────────────────────────────────────────────────────────┐
│  💡 POUR RECEVOIR DE VRAIS EMAILS (OPTIONNEL)                    │
└───────────────────────────────────────────────────────────────────┘

Si vous voulez recevoir les codes par email Gmail :

1. Créer un App Password Gmail :
   https://myaccount.google.com/apppasswords

2. Éditer le fichier .env :
   nano /home/mitou/FindPharma/backend/.env

3. Modifier ces lignes :
   EMAIL_HOST_USER=votre.vrai.email@gmail.com
   EMAIL_HOST_PASSWORD=votre_app_password_16_caracteres
   DEFAULT_FROM_EMAIL=FindPharma <votre.vrai.email@gmail.com>

4. Dans settings.py, changer :
   if True:  → if False:
   (ligne 265)

5. Redémarrer Django

┌───────────────────────────────────────────────────────────────────┐
│  🧪 TEST RAPIDE                                                   │
└───────────────────────────────────────────────────────────────────┘

Pour tester l'envoi d'un code maintenant :

cd /home/mitou/FindPharma/backend
python manage.py shell

>>> from users.email_service import send_verification_email
>>> send_verification_email('test@example.com', 'ABC123', 'TestUser')
>>> # Le code apparaît dans le terminal !

╔═══════════════════════════════════════════════════════════════════╗
║  ✅ CONFIGURATION ACTUELLE : MODE CONSOLE (DÉVELOPPEMENT)         ║
║  📧 Les codes s'affichent dans le terminal Django                 ║
╚═══════════════════════════════════════════════════════════════════╝

EOF
