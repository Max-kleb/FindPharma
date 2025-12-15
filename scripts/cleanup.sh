#!/bin/bash

# Script de nettoyage FindPharma
# Supprime les fichiers temporaires et redondants

echo "🧹 Nettoyage du projet FindPharma..."

# Dossier du projet
PROJECT_DIR="/home/mitou/FindPharma"
cd "$PROJECT_DIR"

# Fichiers .md de documentation temporaire à supprimer
MD_FILES_TO_DELETE=(
    "AMELIORATION_HEADER_LOGO.md"
    "AMELIORATION_HOMEPAGE_ET_SECURITE_PANIER.md"
    "AMELIORATION_PANIER_UI.md"
    "CORRECTIONS_FINALES_THEME_TRADUCTIONS.md"
    "CORRECTIONS_THEME_ET_TRADUCTIONS.md"
    "CORRECTION_ERREUR_ELEMENT_TYPE_INVALID.md"
    "CORRECTION_FOOTER_MODE_SOMBRE.md"
    "CORRECTION_RESERVATIONS_TOKEN_401.md"
    "CRUD_MEDICAMENTS_GUIDE.md"
    "CRUD_MEDICAMENTS_RESUME.txt"
    "DASHBOARD_CLIENT_CREATION.md"
    "DASHBOARD_CLIENT_PRET.md"
    "DEBUG_ACCES_STOCKS.md"
    "DEBUG_VERIFICATION_EMAIL.md"
    "DEMARRAGE_RAPIDE.md"
    "DOCKERISATION_COMPLETE.md"
    "EXPLICATION_CONNEXION_PHARMACIES.md"
    "FIX_HARDCODED_DATA.md"
    "FIX_INSCRIPTION_ERREUR.md"
    "FIX_INSCRIPTION_PHARMACIES.md"
    "FIX_PRODUCTS_MAP_ERROR.md"
    "HEADER_TERMINE.md"
    "HERO_SECTION_IMPLEMENTATION.md"
    "NOUVEAUTES.md"
    "PLAN_AMELIORATION_DASHBOARD.md"
    "README_VERIFICATION_EMAIL.md"
    "RECAP_EMAIL_VERIFICATION.md"
    "RECAP_HEADER_AMELIORE.md"
    "RESULTAT_FINAL_TRADUCTIONS_ABOUT_FAQ.md"
    "RESUME_AMELIORATIONS_HOMEPAGE.md"
    "SETUP_RAPIDE.md"
    "SOLUTION_TRADUCTIONS_NE_FONCTIONNENT_PAS.md"
    "TEST_RAPIDE_HEADER.md"
    "TEST_RAPIDE_HOMEPAGE_PANIER.md"
    "THEME_ET_I18N_COMPLETE.md"
    "TRADUCTIONS_ABOUT_FAQ_LEGAL_ETAT.md"
    "US5_PANIER_IMPLEMENTATION.md"
)

# Créer un dossier d'archive pour les fichiers de doc
mkdir -p docs/archive

# Déplacer les fichiers vers l'archive au lieu de les supprimer
echo "📦 Archivage des fichiers de documentation temporaires..."
for file in "${MD_FILES_TO_DELETE[@]}"; do
    if [ -f "$file" ]; then
        mv "$file" docs/archive/
        echo "  ✓ Archivé: $file"
    fi
done

# Supprimer les fichiers de test temporaires
echo ""
echo "🗑️  Suppression des fichiers de test..."
rm -f test_api_response.html
rm -f test_distance_calculation.html
rm -f frontend/public/test_*.html
rm -f backend/test_api.html
rm -f backend/test_api_react.html

# Nettoyer les fichiers __pycache__
echo ""
echo "🐍 Nettoyage des fichiers Python cache..."
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null
find . -type f -name "*.pyc" -delete 2>/dev/null
find . -type f -name "*.pyo" -delete 2>/dev/null

# Nettoyer les fichiers .DS_Store (macOS)
echo ""
echo "🍎 Suppression des fichiers .DS_Store..."
find . -type f -name ".DS_Store" -delete 2>/dev/null

# Nettoyer les fichiers de log
echo ""
echo "📋 Nettoyage des logs..."
find . -type f -name "*.log" -delete 2>/dev/null

# Afficher le résumé
echo ""
echo "✅ Nettoyage terminé!"
echo ""
echo "📊 Structure finale:"
ls -la | head -20

echo ""
echo "📁 Documentation archivée dans: docs/archive/"
ls docs/archive/ 2>/dev/null | head -10
