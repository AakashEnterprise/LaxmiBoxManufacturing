@echo off
REM Optional: run the app at http://localhost:8080 (needs Python). Double-clicking index.html also works.
cd /d "%~dp0"
start "" http://localhost:8080
python -m http.server 8080
