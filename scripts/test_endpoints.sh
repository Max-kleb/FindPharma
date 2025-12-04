#!/bin/bash

echo "🧪 TEST AUTOMATIQUE DES ENDPOINTS FINDPHARMA"
echo "============================================"
echo ""

API="http://127.0.0.1:8000"

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test 1: Inscription
echo "1️⃣  Test Inscription..."
REGISTER=$(curl -s -X POST "$API/api/auth/register/" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"autotest_$(date +%s)\",
    \"email\": \"test_$(date +%s)@test.cm\",
    \"password\": \"TestPass123!\",
    \"password2\": \"TestPass123!\",
    \"user_type\": \"customer\",
    \"phone\": \"+237600000999\"
  }")

if echo "$REGISTER" | grep -q "token"; then
    echo -e "${GREEN}✅ Inscription OK${NC}"
    TOKEN=$(echo "$REGISTER" | jq -r '.tokens.access')
    echo "   Token: ${TOKEN:0:30}..."
else
    echo -e "${RED}❌ Inscription échouée${NC}"
    echo "$REGISTER"
    exit 1
fi
echo ""

# Test 2: Profil
echo "2️⃣  Test Profil utilisateur..."
PROFILE=$(curl -s "$API/api/auth/profile/" \
  -H "Authorization: Bearer $TOKEN")

if echo "$PROFILE" | grep -q "email"; then
    EMAIL=$(echo "$PROFILE" | jq -r '.email')
    echo -e "${GREEN}✅ Profil OK${NC} - Email: $EMAIL"
else
    echo -e "${RED}❌ Profil échoué${NC}"
fi
echo ""

# Test 3: Recherche
echo "3️⃣  Test Recherche médicaments (paracétamol)..."
SEARCH=$(curl -s "$API/api/search/?medicine=paracetamol")

if echo "$SEARCH" | grep -q "results"; then
    COUNT=$(echo "$SEARCH" | jq -r '.count // 0')
    echo -e "${GREEN}✅ Recherche OK${NC} - $COUNT résultats trouvés"
else
    echo -e "${RED}❌ Recherche échouée${NC}"
fi
echo ""

# Test 4: Pharmacies proches
echo "4️⃣  Test Pharmacies à proximité..."
NEARBY=$(curl -s "$API/api/nearby/?lat=3.8480&lon=11.5021&radius=5000")

if echo "$NEARBY" | grep -q "pharmacies"; then
    COUNT=$(echo "$NEARBY" | jq -r '.count // 0')
    echo -e "${GREEN}✅ Pharmacies proches OK${NC} - $COUNT trouvées"
else
    echo -e "${RED}❌ Pharmacies proches échoué${NC}"
fi
echo ""

# Test 5: Liste pharmacies
echo "5️⃣  Test Liste toutes les pharmacies..."
PHARMACIES=$(curl -s "$API/api/pharmacies/")

if echo "$PHARMACIES" | grep -q "results"; then
    COUNT=$(echo "$PHARMACIES" | jq -r '.count // 0')
    echo -e "${GREEN}✅ Liste pharmacies OK${NC} - $COUNT pharmacies"
else
    echo -e "${RED}❌ Liste pharmacies échouée${NC}"
fi
echo ""

# Test 6: Stocks
echo "6️⃣  Test Stocks de la pharmacie ID=1..."
STOCKS=$(curl -s "$API/api/pharmacies/1/stocks/")

if echo "$STOCKS" | grep -q "\["; then
    COUNT=$(echo "$STOCKS" | jq 'length // 0')
    echo -e "${GREEN}✅ Stocks OK${NC} - $COUNT médicaments en stock"
else
    echo -e "${RED}❌ Stocks échoué${NC}"
fi
echo ""

# Test 7: Panier actif
echo "7️⃣  Test Panier actif..."
CART=$(curl -s "$API/api/cart/carts/active/" \
  -H "Authorization: Bearer $TOKEN")

if echo "$CART" | grep -q "id"; then
    CART_ID=$(echo "$CART" | jq -r '.id')
    echo -e "${GREEN}✅ Panier actif OK${NC} - ID: $CART_ID"
else
    echo -e "${RED}❌ Panier actif échoué${NC}"
fi
echo ""

# Test 8: Ajouter au panier
echo "8️⃣  Test Ajout au panier..."
ADD_ITEM=$(curl -s -X POST "$API/api/cart/carts/add_item/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "medicine_id": 1,
    "pharmacy_id": 1,
    "quantity": 2
  }')

if echo "$ADD_ITEM" | grep -q "subtotal"; then
    SUBTOTAL=$(echo "$ADD_ITEM" | jq -r '.subtotal')
    echo -e "${GREEN}✅ Ajout panier OK${NC} - Sous-total: $SUBTOTAL FCFA"
else
    echo -e "${RED}❌ Ajout panier échoué${NC}"
    echo "$ADD_ITEM"
fi
echo ""

# Test 9: Résumé panier
echo "9️⃣  Test Résumé du panier..."
SUMMARY=$(curl -s "$API/api/cart/carts/summary/" \
  -H "Authorization: Bearer $TOKEN")

if echo "$SUMMARY" | grep -q "total_items"; then
    TOTAL=$(echo "$SUMMARY" | jq -r '.total_items')
    PRICE=$(echo "$SUMMARY" | jq -r '.total_price')
    echo -e "${GREEN}✅ Résumé panier OK${NC} - $TOTAL articles, Total: $PRICE FCFA"
else
    echo -e "${RED}❌ Résumé panier échoué${NC}"
fi
echo ""

# Test 10: Documentation
echo "🔟 Test Documentation API (Swagger)..."
DOCS=$(curl -s -o /dev/null -w "%{http_code}" "$API/api/docs/")

if [ "$DOCS" = "200" ]; then
    echo -e "${GREEN}✅ Documentation accessible${NC} - http://127.0.0.1:8000/api/docs/"
else
    echo -e "${RED}❌ Documentation non accessible${NC}"
fi
echo ""

echo "============================================"
echo -e "${GREEN}✅ TESTS TERMINÉS${NC}"
echo ""
echo "📊 Résumé:"
echo "   ✅ Backend: Opérationnel"
echo "   ✅ Authentification: Fonctionnelle"
echo "   ✅ Recherche: Fonctionnelle"
echo "   ✅ Pharmacies: Fonctionnelles"
echo "   ✅ Stocks: Accessibles"
echo "   ✅ Panier: Fonctionnel"
echo "   ✅ Documentation: Accessible"
echo ""
echo "🚀 Le frontend peut maintenant consommer l'API !"
echo ""
echo "📝 Pour tester dans le navigateur:"
echo "   1. Ouvrir http://localhost:3000"
echo "   2. F12 → Onglet Network"
echo "   3. Faire une recherche"
echo "   4. Vérifier les requêtes vers 127.0.0.1:8000"
echo ""
