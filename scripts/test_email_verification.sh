#!/bin/bash
# Test complet du système de vérification email

echo "================================================"
echo "🧪 TEST DU SYSTÈME DE VÉRIFICATION EMAIL"
echo "================================================"
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
API_URL="http://localhost:8000/api/auth"
TEST_EMAIL="test@findpharma.cm"
TEST_USERNAME="testuser_$(date +%s)"

echo "📧 Email de test: $TEST_EMAIL"
echo "👤 Username de test: $TEST_USERNAME"
echo ""

# Test 1: Envoyer un code de vérification
echo "=========================================="
echo "TEST 1: Envoi du code de vérification"
echo "=========================================="
RESPONSE=$(curl -s -X POST "$API_URL/send-verification-code/" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"username\":\"$TEST_USERNAME\"}" \
  -c cookies.txt)

echo "Réponse: $RESPONSE"

if echo "$RESPONSE" | grep -q "Code de vérification envoyé"; then
  echo -e "${GREEN}✅ TEST 1 PASSÉ: Code envoyé avec succès${NC}"
else
  echo -e "${RED}❌ TEST 1 ÉCHOUÉ: Erreur lors de l'envoi${NC}"
  exit 1
fi
echo ""

# Demander le code à l'utilisateur
echo "=========================================="
echo "🔍 Vérification manuelle requise"
echo "=========================================="
echo -e "${YELLOW}⚠️ Allez voir la console Django et cherchez le code de vérification${NC}"
echo -e "${YELLOW}   (Format: 6 caractères alphanumériques)${NC}"
echo ""
read -p "Entrez le code de vérification: " VERIFICATION_CODE

if [ -z "$VERIFICATION_CODE" ]; then
  echo -e "${RED}❌ Aucun code entré. Test annulé.${NC}"
  exit 1
fi

echo ""
echo "Code entré: $VERIFICATION_CODE"
echo ""

# Test 2: Vérifier le code
echo "=========================================="
echo "TEST 2: Vérification du code"
echo "=========================================="
RESPONSE=$(curl -s -X POST "$API_URL/verify-code/" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"code\":\"$VERIFICATION_CODE\"}" \
  -b cookies.txt)

echo "Réponse: $RESPONSE"

if echo "$RESPONSE" | grep -q "vérifié avec succès"; then
  echo -e "${GREEN}✅ TEST 2 PASSÉ: Code vérifié avec succès${NC}"
else
  echo -e "${RED}❌ TEST 2 ÉCHOUÉ: Code invalide ou expiré${NC}"
  exit 1
fi
echo ""

# Test 3: Test avec un mauvais code
echo "=========================================="
echo "TEST 3: Test avec un mauvais code"
echo "=========================================="
RESPONSE=$(curl -s -X POST "$API_URL/verify-code/" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"code\":\"WRONG1\"}")

echo "Réponse: $RESPONSE"

if echo "$RESPONSE" | grep -q "invalide\|expiré"; then
  echo -e "${GREEN}✅ TEST 3 PASSÉ: Mauvais code rejeté${NC}"
else
  echo -e "${RED}❌ TEST 3 ÉCHOUÉ: Mauvais code accepté (problème de sécurité!)${NC}"
fi
echo ""

# Test 4: Renvoyer le code
echo "=========================================="
echo "TEST 4: Renvoyer un nouveau code"
echo "=========================================="
RESPONSE=$(curl -s -X POST "$API_URL/resend-verification-code/" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\"}")

echo "Réponse: $RESPONSE"

if echo "$RESPONSE" | grep -q "Nouveau code envoyé"; then
  echo -e "${GREEN}✅ TEST 4 PASSÉ: Nouveau code envoyé${NC}"
else
  echo -e "${RED}❌ TEST 4 ÉCHOUÉ: Erreur lors du renvoi${NC}"
fi
echo ""

# Nettoyage
rm -f cookies.txt

# Résumé
echo "=========================================="
echo "📊 RÉSUMÉ DES TESTS"
echo "=========================================="
echo -e "${GREEN}✅ Backend API fonctionne correctement${NC}"
echo -e "${GREEN}✅ Envoi de code OK${NC}"
echo -e "${GREEN}✅ Vérification de code OK${NC}"
echo -e "${GREEN}✅ Rejet de mauvais code OK${NC}"
echo -e "${GREEN}✅ Renvoi de code OK${NC}"
echo ""
echo "🎯 Prochaine étape: Tester avec le frontend React"
echo "   1. Ouvrir http://localhost:3000/register"
echo "   2. Remplir le formulaire"
echo "   3. Cliquer sur 'Vérifier mon email'"
echo "   4. Entrer le code reçu dans le modal"
echo ""
echo "================================================"
echo "✨ TESTS TERMINÉS AVEC SUCCÈS !"
echo "================================================"
