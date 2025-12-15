# ==========================================
# FindPharma - Script de démarrage Windows
# Compatible Windows 10/11 avec Docker Desktop
# ==========================================

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  FindPharma - Demarrage de l'application" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si Docker est installé
try {
    $dockerVersion = docker version --format '{{.Server.Version}}' 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Docker non disponible"
    }
    Write-Host "[OK] Docker detecte: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERREUR] Docker n'est pas installe ou n'est pas en cours d'execution!" -ForegroundColor Red
    Write-Host "   Installez Docker Desktop depuis: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Vérifier docker compose
try {
    $composeVersion = docker compose version 2>&1
    Write-Host "[OK] Docker Compose detecte" -ForegroundColor Green
} catch {
    Write-Host "[ERREUR] Docker Compose n'est pas disponible!" -ForegroundColor Red
    exit 1
}

# Créer le fichier .env s'il n'existe pas
if (!(Test-Path ".env")) {
    Write-Host "[INFO] Fichier .env non trouve, creation depuis .env.example..." -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "[OK] Fichier .env cree. Modifiez-le si necessaire." -ForegroundColor Green
    } else {
        Write-Host "[ERREUR] Fichier .env.example non trouve!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "[OK] Fichier .env trouve" -ForegroundColor Green
}

# Arrêter les anciens conteneurs
Write-Host ""
Write-Host "[INFO] Arret des anciens conteneurs..." -ForegroundColor Cyan
docker compose down --remove-orphans 2>$null

# Construire et démarrer les conteneurs
Write-Host "[INFO] Construction et demarrage des conteneurs..." -ForegroundColor Cyan
Write-Host "   (Cela peut prendre quelques minutes lors du premier lancement)" -ForegroundColor Gray
docker compose up -d --build

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERREUR] Echec du demarrage des conteneurs!" -ForegroundColor Red
    exit 1
}

# Attendre que les services soient prêts
Write-Host ""
Write-Host "[INFO] Attente du demarrage des services..." -ForegroundColor Cyan
Write-Host ""

# Attendre le backend
Write-Host "   Backend Django: " -NoNewline
for ($i = 0; $i -lt 60; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/api/" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
        Write-Host "OK" -ForegroundColor Green
        break
    } catch {
        Write-Host "." -NoNewline
        Start-Sleep -Seconds 2
    }
}

# Attendre le frontend
Write-Host "   Frontend React: " -NoNewline
for ($i = 0; $i -lt 30; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
        Write-Host "OK" -ForegroundColor Green
        break
    } catch {
        Write-Host "." -NoNewline
        Start-Sleep -Seconds 2
    }
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "[OK] FindPharma est pret!" -ForegroundColor Green
Write-Host ""
Write-Host "URLs d'acces:" -ForegroundColor White
Write-Host "   - Frontend:  http://localhost:3000" -ForegroundColor White
Write-Host "   - Backend:   http://localhost:8000" -ForegroundColor White
Write-Host "   - API Docs:  http://localhost:8000/api/docs/" -ForegroundColor White
Write-Host "   - Admin:     http://localhost:8000/admin/" -ForegroundColor White
Write-Host ""
Write-Host "Commandes utiles:" -ForegroundColor White
Write-Host "   - Arreter:    docker compose down" -ForegroundColor Gray
Write-Host "   - Logs:       docker compose logs -f" -ForegroundColor Gray
Write-Host "   - Redemarrer: docker compose restart" -ForegroundColor Gray
Write-Host ""
Write-Host "Compte admin par defaut:" -ForegroundColor White
Write-Host "   - Username: admin" -ForegroundColor Gray
Write-Host "   - Password: admin123" -ForegroundColor Gray
Write-Host ""

# Ouvrir le navigateur automatiquement
$openBrowser = Read-Host "Ouvrir l'application dans le navigateur? (O/n)"
if ($openBrowser -ne "n" -and $openBrowser -ne "N") {
    Start-Process "http://localhost:3000"
}
