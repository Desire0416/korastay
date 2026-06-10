@echo off
REM ============================================================
REM  KoraStay - Demarrage du serveur de developpement
REM  Double-cliquez sur ce fichier pour lancer l'application.
REM  Laissez cette fenetre OUVERTE pendant que vous testez.
REM  Ouvrez ensuite http://localhost:3000 dans votre navigateur.
REM ============================================================
cd /d "%~dp0"

REM Ajoute Node.js au PATH si besoin
set "PATH=%PATH%;C:\Program Files\nodejs"

REM Plus de memoire pour le serveur de dev (evite les arrets sur machines modestes)
set "NODE_OPTIONS=--max-old-space-size=4096"

echo.
echo ============================================
echo   KoraStay demarre sur http://localhost:3000
echo   (laissez cette fenetre ouverte)
echo ============================================
echo.

call npm run dev

REM Si le serveur s'arrete, la fenetre reste ouverte pour voir l'erreur
echo.
echo Le serveur s'est arrete. Appuyez sur une touche pour fermer.
pause >nul
