@echo off
cd /d %~dp0
npm.cmd run build
if exist tempdeploy rmdir /s /q tempdeploy
mkdir tempdeploy
robocopy docs tempdeploy /e >nul
cd /d tempdeploy
if exist .git rmdir /s /q .git
git init
git remote add origin https://github.com/vikkyyyt1-hash/track-s-main.git
git checkout -b gh-pages
git add .
git commit -m "Deploy gh-pages"
git push -f origin gh-pages
