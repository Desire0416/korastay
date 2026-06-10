@echo off
REM ============================================================
REM  KoraStay - Envoi du code vers GitHub
REM  Double-cliquez sur ce fichier.
REM  Une fenetre de connexion GitHub peut s'ouvrir : connectez-vous
REM  avec votre compte Desire0416 et autorisez.
REM ============================================================
cd /d "%~dp0"
set "PATH=%PATH%;C:\Program Files\nodejs;C:\Program Files\Git\cmd"

echo.
echo ============================================
echo   Envoi vers https://github.com/Desire0416/korastay
echo ============================================
echo.

git push -u origin main

echo.
echo Si "Everything up-to-date" ou "main -> main" : c'est reussi.
echo Vous pouvez maintenant deployer sur Vercel (voir DEPLOY.md).
echo.
echo Appuyez sur une touche pour fermer.
pause >nul
