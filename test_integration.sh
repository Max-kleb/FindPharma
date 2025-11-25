#!/bin/bash

# Script de test d'intégration pour FindPharma
# Teste les US 3, 4, et 5

echo "=========================================="
echo "🧪 TEST D'INTÉGRATION FINDPHARMA"
echo "=========================================="
echo ""

API_URL="http://127.0.0.1:8000"

# Couleurs pour l'affichage
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables globales pour stocker les tokens
CLIENT_TOKEN=""
PHARMACY_TOKEN=""

echo "📌 Vérification que le serveur est démarré..."
if ! curl -s "$API_URL" > /dev/null 2>&1; then
    echo -e "${RED}❌ Le serveur Django n'est pas démarré!${NC}"
    echo "Démarrez-le avec: cd backend && python manage.py runserver"
    exit 1
fi
echo -e "${GREEN}✅ Serveur accessible${NC}"
echo ""

# ======================
# TEST US 4 - AUTHENTIFICATION
# ======================
echo "=========================================="
echo "🔐 TEST US 4 - AUTHENTIFICATION JWT"
echo "=========================================="
echo ""

echo "1️⃣  Test d'inscription d'un client..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/register/" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "client_test_'$(date +%s)'",
    "email": "client'$(date +%s)'@test.cm",
    "password": "TestPass123!",
    "password2": "TestPass123!",
    "user_type": "customer",
    "phone": "+237600000001"
  }')

if echo "$REGISTER_RESPONSE" | grep -q "token"; then
    echo -e "${GREEN}✅ Inscription réussie${NC}"
    CLIENT_TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"access":"[^"]*' | cut -d'"' -f4)
    echo "Token client: ${CLIENT_TOKEN:0:50}..."
else
    echo -e "${RED}❌ Échec de l'inscription${NC}"
    echo "Réponse: $REGISTER_RESPONSE"
fi
echo ""

echo "2️⃣  Test de récupération du profil utilisateur..."
if [ -n "$CLIENT_TOKEN" ]; then
    PROFILE_RESPONSE=$(curl -s -X GET "$API_URL/api/auth/profile/" \
      -H "Authorization: Bearer $CLIENT_TOKEN")
    
    if echo "$PROFILE_RESPONSE" | grep -q "email"; then
        echo -e "${GREEN}✅ Profil récupéré avec succès${NC}"
        echo "Profil: $PROFILE_RESPONSE" | head -c 200
        echo "..."
    else
        echo -e "${RED}❌ Échec de récupération du profil${NC}"
        echo "Réponse: $PROFILE_RESPONSE"
    fi
else
    echo -e "${YELLOW}⚠️  Pas de token, test ignoré${NC}"
fi
echo ""

# ======================
# TEST US 3 - STOCKS
# ======================
echo "=========================================="
echo "📦 TEST US 3 - GESTION DES STOCKS"
echo "=========================================="
echo ""

echo "1️⃣  Test de lecture des stocks (public)..."
STOCKS_RESPONSE=$(curl -s -X GET "$API_URL/api/pharmacies/1/stocks/")

if echo "$STOCKS_RESPONSE" | grep -q '\['; then
    echo -e "${GREEN}✅ Liste des stocks récupérée${NC}"
    STOCKS_COUNT=$(echo "$STOCKS_RESPONSE" | grep -o '"id"' | wc -l)
    echo "Nombre de stocks trouvés: $STOCKS_COUNT"
else
    echo -e "${YELLOW}⚠️  Aucun stock ou pharmacie ID=1 n'existe${NC}"
    echo "Réponse: $STOCKS_RESPONSE"
fi
echo ""

echo "2️⃣  Test d'ajout de stock (nécessite compte pharmacie)..."
echo -e "${YELLOW}ℹ️  Pour tester complètement, créez un compte pharmacie avec pharmacy_id valide${NC}"
echo ""

# ======================
# TEST US 5 - PANIER
# ======================
echo "=========================================="
echo "🛒 TEST US 5 - PANIER ET RÉSERVATIONS"
echo "=========================================="
echo ""

echo "1️⃣  Test de récupération du panier actif..."
if [ -n "$CLIENT_TOKEN" ]; then
    CART_RESPONSE=$(curl -s -X GET "$API_URL/api/cart/carts/active/" \
      -H "Authorization: Bearer $CLIENT_TOKEN")
    
    if echo "$CART_RESPONSE" | grep -q "id"; then
        echo -e "${GREEN}✅ Panier actif récupéré${NC}"
        echo "Panier: $CART_RESPONSE" | head -c 200
        echo "..."
    else
        echo -e "${RED}❌ Échec de récupération du panier${NC}"
        echo "Réponse: $CART_RESPONSE"
    fi
else
    echo -e "${YELLOW}⚠️  Pas de token client, test ignoré${NC}"
fi
echo ""

echo "2️⃣  Test du résumé du panier..."
if [ -n "$CLIENT_TOKEN" ]; then
    SUMMARY_RESPONSE=$(curl -s -X GET "$API_URL/api/cart/carts/summary/" \
      -H "Authorization: Bearer $CLIENT_TOKEN")
    
    if echo "$SUMMARY_RESPONSE" | grep -q "total"; then
        echo -e "${GREEN}✅ Résumé du panier récupéré${NC}"
        echo "Résumé: $SUMMARY_RESPONSE"
    else
        echo -e "${RED}❌ Échec de récupération du résumé${NC}"
        echo "Réponse: $SUMMARY_RESPONSE"
    fi
else
    echo -e "${YELLOW}⚠️  Pas de token client, test ignoré${NC}"
fi
echo ""

# ======================
# TEST DOCUMENTATION API
# ======================
echo "=========================================="
echo "📚 TEST DOCUMENTATION API"
echo "=========================================="
echo ""

echo "Vérification de la disponibilité de Swagger..."
SWAGGER_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/docs/")

if [ "$SWAGGER_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Documentation Swagger disponible${NC}"
    echo "URL: $API_URL/api/docs/"
else
    echo -e "${YELLOW}⚠️  Documentation Swagger non accessible (code: $SWAGGER_RESPONSE)${NC}"
fi
echo ""

# ======================
# RÉSUMÉ
# ======================
echo "=========================================="
echo "📊 RÉSUMÉ DES TESTS"
echo "=========================================="
echo ""
echo "✅ Tests complétés"
echo ""
echo "Pour tester complètement le système:"
echo "1. Assurez-vous qu'il y a des pharmacies dans la base de données"
echo "2. Assurez-vous qu'il y a des médicaments dans la base de données"
echo "3. Créez un compte pharmacie avec un pharmacy_id valide"
echo "4. Testez l'ajout de stocks en tant que pharmacie"
echo "5. Testez l'ajout d'articles au panier en tant que client"
echo ""
echo "Documentation API interactive:"
echo "🔗 Swagger: $API_URL/api/docs/"
echo "🔗 ReDoc: $API_URL/api/redoc/"
echo ""
echo "Pour peupler la base de données:"
echo "cd backend && python populate_database.py"
echo ""
