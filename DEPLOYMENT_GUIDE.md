# 🚀 Guide de Déploiement FindPharma - Oracle Cloud Free Tier

Ce guide vous accompagne étape par étape pour déployer FindPharma sur Oracle Cloud Free Tier avec le domaine `findpharma.app`.

## 📋 Prérequis

- Compte Oracle Cloud (Free Tier)
- Domaine `findpharma.app` (name.com)
- Accès SSH configuré

---

## 🌐 Étape 1: Créer une Instance Oracle Cloud

### 1.1 Se connecter à Oracle Cloud

1. Allez sur [cloud.oracle.com](https://cloud.oracle.com)
2. Connectez-vous à votre compte

### 1.2 Créer une Instance Compute

1. Menu **☰ → Compute → Instances**
2. Cliquez **Create Instance**
3. Configurez :

   | Paramètre | Valeur |
   |-----------|--------|
   | **Name** | `findpharma-server` |
   | **Placement** | Laissez par défaut |
   | **Image** | Ubuntu 22.04 (Canonical) |
   | **Shape** | VM.Standard.E2.1.Micro (Free Tier) |
   
4. **Networking** :
   - Créez un nouveau VCN ou utilisez un existant
   - Assignez une IP publique automatiquement

5. **Add SSH keys** :
   - Générez une nouvelle paire de clés OU
   - Uploadez votre clé publique existante (`~/.ssh/id_rsa.pub`)

6. Cliquez **Create**

### 1.3 Ouvrir les Ports (Firewall)

1. Allez dans votre Instance → **Attached VNICs** → Cliquez sur le VNIC
2. Cliquez sur **Subnet** → **Security Lists** → **Default Security List**
3. Ajoutez des **Ingress Rules** :

   | Source CIDR | Protocol | Destination Port | Description |
   |-------------|----------|------------------|-------------|
   | `0.0.0.0/0` | TCP | 80 | HTTP |
   | `0.0.0.0/0` | TCP | 443 | HTTPS |

---

## 🔧 Étape 2: Configuration du Serveur

### 2.1 Se connecter en SSH

```bash
# Remplacez <IP> par l'IP publique de votre instance
ssh -i ~/.ssh/id_rsa ubuntu@<IP_PUBLIQUE>
```

### 2.2 Mettre à jour le système

```bash
sudo apt update && sudo apt upgrade -y
```

### 2.3 Installer Docker

```bash
# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Ajouter l'utilisateur au groupe docker
sudo usermod -aG docker $USER

# Installer Docker Compose
sudo apt install docker-compose-plugin -y

# Se reconnecter pour appliquer les permissions
exit
```

Reconnectez-vous :
```bash
ssh -i ~/.ssh/id_rsa ubuntu@<IP_PUBLIQUE>
```

### 2.4 Configurer le Firewall Ubuntu

```bash
sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save
```

---

## 🌍 Étape 3: Configuration DNS (name.com)

### 3.1 Se connecter à name.com

1. Allez sur [name.com](https://www.name.com)
2. Connectez-vous et allez dans **My Domains** → `findpharma.app`
3. Cliquez sur **DNS Records**

### 3.2 Ajouter les enregistrements DNS

Supprimez les enregistrements existants et ajoutez :

| Type | Host | Value | TTL |
|------|------|-------|-----|
| **A** | `@` | `<IP_ORACLE>` | 300 |
| **A** | `www` | `<IP_ORACLE>` | 300 |

> ⚠️ Remplacez `<IP_ORACLE>` par l'IP publique de votre instance Oracle

### 3.3 Vérifier la propagation DNS

Attendez quelques minutes puis vérifiez :
```bash
nslookup findpharma.app
nslookup www.findpharma.app
```

Vous devriez voir l'IP de votre serveur Oracle.

---

## 📦 Étape 4: Déployer l'Application

### 4.1 Cloner le projet

```bash
cd ~
git clone https://github.com/VOTRE_USERNAME/FindPharma.git
cd FindPharma
```

### 4.2 Configurer les variables d'environnement

```bash
# Copier et éditer le fichier de configuration
cp backend/.env.production.example backend/.env.production
nano backend/.env.production
```

**Modifiez les valeurs importantes :**

```dotenv
# Sécurité - IMPORTANT: Changez cette clé!
SECRET_KEY=votre_clé_secrète_très_longue_et_complexe_ici

# Base de données
DATABASE_PASSWORD=un_mot_de_passe_fort_pour_postgresql

# Domaine
ALLOWED_HOSTS=findpharma.app,www.findpharma.app
CORS_ALLOWED_ORIGINS=https://findpharma.app,https://www.findpharma.app

# Email (Gmail avec App Password)
EMAIL_HOST_USER=jeanfrankynkot@gmail.com
EMAIL_HOST_PASSWORD=votre_app_password_gmail

# Admin Django (optionnel)
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_PASSWORD=votre_mot_de_passe_admin
```

### 4.3 Générer une SECRET_KEY sécurisée

```bash
# Générer une clé secrète
python3 -c "import secrets; print(secrets.token_urlsafe(50))"
```

Copiez le résultat dans `SECRET_KEY`.

### 4.4 Rendre le script de déploiement exécutable

```bash
chmod +x deploy.sh
```

---

## 🔐 Étape 5: Obtenir le Certificat SSL

### 5.1 Initialiser le projet

```bash
./deploy.sh init
```

### 5.2 Obtenir le certificat Let's Encrypt

```bash
./deploy.sh ssl
```

Suivez les instructions. Le certificat sera automatiquement obtenu pour :
- `findpharma.app`
- `www.findpharma.app`

---

## 🚀 Étape 6: Démarrer l'Application

```bash
./deploy.sh start
```

### 6.1 Vérifier le statut

```bash
./deploy.sh status
```

Vous devriez voir tous les services "Up".

### 6.2 Voir les logs

```bash
# Tous les logs
./deploy.sh logs

# Logs d'un service spécifique
./deploy.sh logs backend
./deploy.sh logs nginx
```

---

## ✅ Étape 7: Vérification Finale

### 7.1 Tester l'accès

1. Ouvrez https://findpharma.app dans votre navigateur
2. Vérifiez que le certificat SSL est valide (🔒)
3. Testez la connexion
4. Testez l'inscription pharmacie

### 7.2 Accéder à l'admin Django

1. Allez sur https://findpharma.app/admin
2. Connectez-vous avec les identifiants configurés

---

## 📱 Commandes Utiles

| Commande | Description |
|----------|-------------|
| `./deploy.sh start` | Démarrer l'application |
| `./deploy.sh stop` | Arrêter l'application |
| `./deploy.sh status` | Voir le statut |
| `./deploy.sh logs` | Voir les logs |
| `./deploy.sh backup` | Créer un backup BDD |
| `./deploy.sh update` | Mettre à jour l'application |
| `./deploy.sh renew_ssl` | Renouveler le certificat SSL |

---

## 🔄 Maintenance

### Renouvellement automatique SSL

Le certificat Let's Encrypt expire tous les 90 jours. Le service Certbot dans Docker renouvelle automatiquement. Vous pouvez forcer le renouvellement :

```bash
./deploy.sh renew_ssl
```

### Mises à jour

```bash
cd ~/FindPharma
git pull origin main
./deploy.sh update
```

### Sauvegardes

```bash
# Créer un backup
./deploy.sh backup

# Les backups sont dans le dossier ./backups/
ls -la backups/
```

---

## 🐛 Dépannage

### Le site n'est pas accessible

1. Vérifiez le DNS :
   ```bash
   nslookup findpharma.app
   ```

2. Vérifiez les ports Oracle :
   - Security List → Ingress Rules (80, 443)

3. Vérifiez le firewall Ubuntu :
   ```bash
   sudo iptables -L -n | grep -E "80|443"
   ```

### Erreur SSL

1. Vérifiez que les ports 80 et 443 sont ouverts
2. Vérifiez que le DNS pointe vers le bon IP
3. Réessayez :
   ```bash
   ./deploy.sh stop
   ./deploy.sh ssl
   ./deploy.sh start
   ```

### Erreur 502 Bad Gateway

```bash
# Voir les logs du backend
./deploy.sh logs backend

# Redémarrer les services
./deploy.sh stop
./deploy.sh start
```

### Base de données corrompue

```bash
# Restaurer depuis un backup
./deploy.sh restore backups/findpharma_YYYYMMDD_HHMMSS.sql
```

---

## 📊 Architecture de Production

```
                    ┌─────────────────┐
                    │   Internet      │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  Let's Encrypt  │
                    │   (Certbot)     │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │      Nginx      │
                    │ (Reverse Proxy) │
                    │   :80 / :443    │
                    └────────┬────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
   ┌────────▼───────┐ ┌──────▼───────┐ ┌─────▼──────┐
   │    Frontend    │ │   Backend    │ │  Static    │
   │     React      │ │   Django     │ │   Files    │
   │     :80        │ │   :8000      │ │            │
   └────────────────┘ └──────┬───────┘ └────────────┘
                             │
                    ┌────────▼────────┐
                    │   PostgreSQL    │
                    │    + PostGIS    │
                    │     :5432       │
                    └─────────────────┘
```

---

## 📞 Support

En cas de problème :
1. Consultez les logs : `./deploy.sh logs`
2. Vérifiez le statut : `./deploy.sh status`
3. Email : contact.findpharma@gmail.com

---

**🎉 Félicitations ! FindPharma est maintenant en production sur https://findpharma.app**
