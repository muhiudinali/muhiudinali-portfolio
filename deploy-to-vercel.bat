@echo off
cd /d "%~dp0"
echo ========================================================
echo Deploying Muhiudin Ali Portfolio to Vercel...
echo ========================================================
call npx -y vercel
echo.
pause
