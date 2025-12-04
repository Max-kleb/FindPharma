# 🐳 FindPharma avec Podman

## ℹ️ Information

Votre système utilise **Podman** au lieu de Docker. Podman est compatible avec Docker et peut exécuter les mêmes conteneurs.

---

## 🚀 Démarrage avec Podman

### Option 1 : Utiliser docker-compose (via podman-compose)

```bash
# Installer podman-compose si nécessaire
sudo apt install podman-compose

# Utiliser comme docker-compose
podman-compose build
podman-compose up -d
```

### Option 2 : Construction manuelle des images

```bash
# Backend
cd /home/mitou/FindPharma
podman build -t findpharma-backend:latest -f backend/Dockerfile backend/

# Frontend
podman build -t findpharma-frontend:latest -f frontend/Dockerfile frontend/
```

### Option 3 : Utiliser docker-compose avec Podman

```bash
# Podman peut émuler Docker
docker-compose build
docker-compose up -d
```

---

## 🔄 Remplacer "docker" par "podman" dans les commandes

Toutes les commandes Docker fonctionnent avec Podman :

| Docker | Podman |
|--------|--------|
| `docker build` | `podman build` |
| `docker run` | `podman run` |
| `docker ps` | `podman ps` |
| `docker logs` | `podman logs` |
| `docker exec` | `podman exec` |
| `docker-compose` | `podman-compose` |

---

## 🛠️ Installation de podman-compose

```bash
sudo apt update
sudo apt install podman-compose
```

---

## 🚀 Démarrage Rapide FindPharma avec Podman

```bash
cd /home/mitou/FindPharma

# Construire les images
podman build -t findpharma-backend -f backend/Dockerfile backend/
podman build -t findpharma-frontend -f frontend/Dockerfile frontend/

# Démarrer avec podman-compose
podman-compose up -d
```

---

## ⚙️ Alternative : Créer un alias

Ajoutez dans votre `~/.zshrc` :

```bash
alias docker='podman'
alias docker-compose='podman-compose'
```

Puis rechargez :

```bash
source ~/.zshrc
```

Maintenant vous pouvez utiliser toutes les commandes `docker` comme avant !

---

## 📝 Note

Le message "Emulate Docker CLI using podman" est normal. Pour le désactiver, créez le fichier :

```bash
sudo touch /etc/containers/nodocker
```
