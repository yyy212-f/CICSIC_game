@echo off
setlocal
cd /d "%~dp0"

echo [1/2] Building project...
call npm.cmd run build
if errorlevel 1 (
  echo.
  echo Build failed. The development server was not started.
  pause
  exit /b 1
)

echo.
echo [2/2] Starting development server...
echo Open http://127.0.0.1:5173/ in your browser.
call npm.cmd run dev -- --host 127.0.0.1 --port 5173

endlocal
