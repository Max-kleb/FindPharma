# 🎯 FindPharma - Migration vers Docker

## 📊 Statut Actuel

Votre système utilise actuellement **Podman** qui émule Docker. Vous avez demandé à utiliser le **vrai Docker**.

---

## 🚀 Solution : 3 Options

### ✅ Option 1 : Utiliser le script automatique (RECOMMANDÉ)

```bash
cd /home/mitou/FindPharma
./setup-docker.sh
```

Ce script va :
1. ✅ Installer Docker Engine
2. ✅ Installer Docker Compose
3. ✅ Configurer votre utilisateur pour Docker
4. ✅ Désactiver l'émulation Podman
5. ✅ Tester l'installation

**Ensuite, déconnectez-vous et reconnectez-vous !**

Puis :
```bash
cd /home/mitou/FindPharma
./start-docker.sh
```

---

### 🔧 Option 2 : Installation manuelle

```bash
# 1. Installer Docker
curl -fsSL https://get.docker.com | sudo sh

# 2. Ajouter votre utilisateur au groupe docker
sudo usermod -aG docker $USER

# 3. Installer Docker Compose
sudo apt update
sudo apt install -y docker-compose-plugin

# 4. Désactiver l'émulation Podman
sudo touch /etc/containers/nodocker

# 5. Démarrer Docker
sudo systemctl enable docker
sudo systemctl start docker

# 6. SE DÉCONNECTER ET SE RECONNECTER

# 7. Démarrer FindPharma
cd /home/mitou/FindPharma
./start-docker.sh
```

---

### ⚡ Option 3 : Continuer avec Podman (plus rapide)

Podman est compatible à 100% avec Docker. Vous pouvez continuer avec :

```bash
cd /home/mitou/FindPharma
./start-with-podman.sh
```

---

## 📝 Fichiers créés pour Docker

| Fichier | Description |
|---------|-------------|
| `setup-docker.sh` | Script d'installation automatique de Docker |
| `start-docker.sh` | Script de démarrage avec Docker Compose |
| `DOCKER_START.md` | Guide simplifié pour Docker |
| `.env` | Variables d'environnement (créé depuis .env.example) |

---

## 🎯 Prochaines étapes

### Si vous choisissez Docker (Options 1 ou 2) :

1. **Exécuter le script d'installation** :
   ```bash
   ./setup-docker.sh
   ```

2. **SE DÉCONNECTER et SE RECONNECTER** (obligatoire !)

3. **Vérifier Docker** :
   ```bash
   docker --version
   docker compose version
   ```

4. **Démarrer FindPharma** :
   ```bash
   ./start-docker.sh
   ```

5. **Créer un superuser** :
   ```bash
   docker-compose exec backend python manage.py createsuperuser
   ```

6. **Accéder à l'application** :
   - Frontend : http://localhost
   - API : http://localhost:8000/api
   - Admin : http://localhost:8000/admin

---

### Si vous choisissez Podman (Option 3) :

1. **Démarrer directement** :
   ```bash
   ./start-with-podman.sh
   ```

2. **Créer un superuser** :
   ```bash
   podman exec -it findpharma-backend python manage.py createsuperuser
   ```

3. **Accéder à l'application** :
   - Frontend : http://localhost
   - API : http://localhost:8000/api
   - Admin : http://localhost:8000/admin

---

## 🔍 Différences Docker vs Podman

| Caractéristique | Docker | Podman |
|----------------|--------|--------|
| Daemon | Oui (dockerd) | Non (rootless) |
| Sécurité | Root required | Peut tourner sans root |
| Compatibilité | Standard | Compatible Docker |
| Performance | Excellente | Excellente |
| Communauté | Très large | Croissante |

**Conclusion** : Les deux fonctionnent parfaitement pour FindPharma. Docker est plus standard, Podman est plus sécurisé.

---

## 🆘 Besoin d'aide ?

Consultez :
- `DOCKER_START.md` - Guide Docker simplifié
- `DOCKER_GUIDE.md` - Guide Docker complet
- `PODMAN_GUIDE.md` - Guide Podman
- `QUICK_START_PODMAN.md` - Démarrage rapide avec Podman

---

## 👥 Équipe FindPharma

- **NGOM Françoise Lorraine** - Développeuse Frontend
- **NKOT Jean Franky** - Chef d'Équipe & Développeur Backend
- **KENMOE MEUGANG Oriane Stevye** - Développeuse Frontend
- **SONKE KAMGHA Maxime Klebert** - Développeur Backend
- **DONGMO TCHOUTEZO Evenis** - Développeur Frontend

---

**Quelle option choisissez-vous ?**

🐳 Option 1 : `./setup-docker.sh` (Installation automatique Docker)  
🔧 Option 2 : Installation manuelle Docker  
⚡ Option 3 : `./start-with-podman.sh` (Continuer avec Podman)
