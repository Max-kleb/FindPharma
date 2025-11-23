#!/bin/bash

echo "🧪 Test de l'authentification FindPharma - User Story 3"
echo "========================================================"
echo ""

# Attendre que le serveur soit prêt
echo "⏳ Attente du serveur..."
sleep 3

echo ""
echo "1️⃣ Test d'obtention de token pour pharma1"
echo "-------------------------------------------"
TOKEN_RESPONSE=$(curl -s -X POST http://127.0.0.1:8000/api/token-auth/ \
  -H "Content-Type: application/json" \
  -d '{"username": "pharma1", "password": "test123"}')

echo "Réponse: $TOKEN_RESPONSE"

if echo "$TOKEN_RESPONSE" | grep -q "token"; then
    TOKEN=$(echo "$TOKEN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    echo "✅ Token obtenu: $TOKEN"
    
    echo ""
    echo "2️⃣ Test du dashboard de la pharmacie"
    echo "--------------------------------------"
    curl -s -X GET http://127.0.0.1:8000/api/my-pharmacy/dashboard/ \
      -H "Authorization: Token $TOKEN" | python -m json.tool
    
    echo ""
    echo "3️⃣ Test du profil de la pharmacie"
    echo "-----------------------------------"
    curl -s -X GET http://127.0.0.1:8000/api/my-pharmacy/profile/ \
      -H "Authorization: Token $TOKEN" | python -m json.tool
    
    echo ""
    echo "4️⃣ Test des statistiques de stock"
    echo "-----------------------------------"
    curl -s -X GET http://127.0.0.1:8000/api/my-pharmacy/stock-stats/ \
      -H "Authorization: Token $TOKEN" | python -m json.tool
    
    echo ""
    echo "✅ Tests terminés avec succès!"
else
    echo "❌ Échec de l'authentification"
    echo "Réponse: $TOKEN_RESPONSE"
fi

echo ""
