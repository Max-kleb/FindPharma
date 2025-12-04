#!/bin/bash

# Script de diagnostic des traductions About/FAQ

echo "🔍 DIAGNOSTIC DES TRADUCTIONS"
echo "=============================="
echo ""

# 1. Vérifier les fichiers JSON
echo "1️⃣ Vérification des fichiers JSON..."
echo ""

for file in fr.json en.json es.json; do
    if [ -f "/home/mitou/FindPharma/frontend/src/i18n/locales/$file" ]; then
        echo "✅ $file existe"
        
        # Vérifier la validité JSON
        if python3 -m json.tool "/home/mitou/FindPharma/frontend/src/i18n/locales/$file" > /dev/null 2>&1; then
            echo "   ✅ JSON valide"
        else
            echo "   ❌ JSON invalide !"
        fi
        
        # Compter les clés about/faq/legal
        about_count=$(grep -c '"about\.' "/home/mitou/FindPharma/frontend/src/i18n/locales/$file" 2>/dev/null || echo "0")
        faq_count=$(grep -c '"faq\.' "/home/mitou/FindPharma/frontend/src/i18n/locales/$file" 2>/dev/null || echo "0")
        legal_count=$(grep -c '"legal\.' "/home/mitou/FindPharma/frontend/src/i18n/locales/$file" 2>/dev/null || echo "0")
        
        echo "   📊 Clés about.*: $about_count"
        echo "   📊 Clés faq.*: $faq_count"
        echo "   📊 Clés legal.*: $legal_count"
    else
        echo "❌ $file n'existe pas !"
    fi
    echo ""
done

# 2. Vérifier AboutPage.js
echo "2️⃣ Vérification de AboutPage.js..."
echo ""

about_file="/home/mitou/FindPharma/frontend/src/pages/AboutPage.js"
if [ -f "$about_file" ]; then
    echo "✅ AboutPage.js existe"
    
    # Chercher les textes hardcodés restants
    hardcoded=$(grep -c "\"FindPharma\|\"Pharmacienne\|\"Expert en développement" "$about_file" 2>/dev/null || echo "0")
    
    if [ "$hardcoded" -eq "0" ]; then
        echo "   ✅ Aucun texte hardcodé trouvé"
    else
        echo "   ⚠️  $hardcoded textes hardcodés trouvés"
    fi
    
    # Compter les appels à t()
    t_calls=$(grep -c "t('about\." "$about_file" 2>/dev/null || echo "0")
    echo "   📊 Appels à t('about.*'): $t_calls"
else
    echo "❌ AboutPage.js n'existe pas !"
fi
echo ""

# 3. Vérifier FaqPage.js
echo "3️⃣ Vérification de FaqPage.js..."
echo ""

faq_file="/home/mitou/FindPharma/frontend/src/pages/FaqPage.js"
if [ -f "$faq_file" ]; then
    echo "✅ FaqPage.js existe"
    
    # Chercher les textes hardcodés restants
    hardcoded=$(grep -c "\"Comment rechercher\|\"FindPharma est une plateforme" "$faq_file" 2>/dev/null || echo "0")
    
    if [ "$hardcoded" -eq "0" ]; then
        echo "   ✅ Aucun texte hardcodé trouvé"
    else
        echo "   ⚠️  $hardcoded textes hardcodés trouvés"
    fi
    
    # Compter les appels à t()
    t_calls=$(grep -c "t(\`faq\." "$faq_file" 2>/dev/null || echo "0")
    echo "   📊 Appels à t(\`faq.*\`): $t_calls"
else
    echo "❌ FaqPage.js n'existe pas !"
fi
echo ""

# 4. Instructions de redémarrage
echo "🔧 ACTIONS NÉCESSAIRES"
echo "======================"
echo ""
echo "Si tout est ✅ ci-dessus, le problème vient probablement du cache."
echo ""
echo "**Étapes à suivre :**"
echo ""
echo "1. 🛑 Arrêter le serveur de développement (Ctrl+C dans le terminal)"
echo ""
echo "2. 🗑️  Supprimer le cache de build :"
echo "   cd /home/mitou/FindPharma/frontend"
echo "   rm -rf node_modules/.cache"
echo ""
echo "3. 🚀 Redémarrer le serveur :"
echo "   npm start"
echo ""
echo "4. 🌐 Dans le navigateur, vider le cache :"
echo "   - Chrome/Edge : Ctrl+Shift+R (Windows/Linux) ou Cmd+Shift+R (Mac)"
echo "   - Firefox : Ctrl+F5 (Windows/Linux) ou Cmd+Shift+R (Mac)"
echo ""
echo "5. 📍 Aller sur http://localhost:3000/about"
echo ""
echo "6. 🔄 Changer la langue dans le sélecteur du header"
echo ""
echo "✅ Les traductions devraient maintenant fonctionner !"
echo ""

# 5. Vérifier si le serveur tourne
echo "🔍 Vérification du serveur..."
if lsof -i :3000 > /dev/null 2>&1; then
    echo "✅ Le serveur tourne sur le port 3000"
    echo "   ⚠️  Pensez à le redémarrer pour prendre en compte les changements !"
else
    echo "⚠️  Aucun serveur ne tourne sur le port 3000"
    echo "   💡 Démarrez-le avec : cd frontend && npm start"
fi
echo ""

echo "=============================="
echo "🏁 DIAGNOSTIC TERMINÉ"
echo "=============================="
