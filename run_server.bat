@echo off
title PackFlow ERP - Shree Pack Industries
echo ======================================================================
echo   PackFlow ERP - Manufacturing Platform (Shree Pack Industries)
echo   100%% Pure HTML5, CSS3, & Vanilla JavaScript (Zero Node.js Required)
echo ======================================================================
echo.
echo Launching browser at http://localhost:8000 ...
start "" "http://localhost:8000"
echo Starting local Python HTTP server on port 8000...
echo (Press Ctrl+C to stop the server at any time)
echo.
python -m http.server 8000
