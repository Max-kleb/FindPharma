@echo off
:: ==========================================
:: FindPharma - Script de démarrage Windows
:: Compatible Windows 10/11 avec Docker Desktop
:: ==========================================

echo.
echo ==========================================
echo   FindPharma - Demarrage de l'application
echo ==========================================
echo.

:: Vérifier si Docker est installé
docker version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERREUR] Docker n'est pas installe ou n'est pas en cours d'execution!
    echo    Installez Docker Desktop depuis: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)
echo [OK] Docker detecte

:: Vérifier docker compose
docker compose version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERREUR] Docker Compose n'est pas disponible!
    pause
    exit /b 1
)
echo [OK] Docker Compose detecte

:: Créer le fichier .env s'il n'existe pas
if not exist ".env" (
    echo [INFO] Fichier .env non trouve, creation depuis .env.example...
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
        echo [OK] Fichier .env cree. Modifiez-le si necessaire.
    ) else (
        echo [ERREUR] Fichier .env.example non trouve!
        pause
        exit /b 1
    )
) else (
    echo [OK] Fichier .env trouve
)

echo.
echo [INFO] Arret des anciens conteneurs...
docker compose down --remove-orphans 2>nul

echo [INFO] Construction et demarrage des conteneurs...
echo    (Cela peut prendre quelques minutes lors du premier lancement)
docker compose up -d --build

if %ERRORLEVEL% neq 0 (
    echo [ERREUR] Echec du demarrage des conteneurs!
    pause
    exit /b 1
)

echo.
echo [INFO] Attente du demarrage des services (environ 60 secondes)...
timeout /t 60 /nobreak

echo.
echo ==========================================
echo [OK] FindPharma est pret!
echo.
echo URLs d'acces:
echo    - Frontend:  http://localhost:3000
echo    - Backend:   http://localhost:8000
echo    - API Docs:  http://localhost:8000/api/docs/
echo    - Admin:     http://localhost:8000/admin/
echo.
echo Commandes utiles:
echo    - Arreter:    docker compose down
echo    - Logs:       docker compose logs -f
echo    - Redemarrer: docker compose restart
echo.
echo Compte admin par defaut:
echo    - Username: admin
echo    - Password: admin123
echo.

set /p openBrowser="Ouvrir l'application dans le navigateur? (O/n): "
if /i not "%openBrowser%"=="n" (
    start http://localhost:3000
)

pause
