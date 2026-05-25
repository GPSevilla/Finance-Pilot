@echo off
setlocal

set "ROOT_DIR=%~dp0.."
set "NODE_EXE=%ROOT_DIR%\.tools\node-v24.14.0-win-x64\node.exe"
if not exist "%NODE_EXE%" (
  echo Node runtime not found at:
  echo %NODE_EXE%
  echo.
  pause
  exit /b 1
)

cd /d "%~dp0"
"%NODE_EXE%" ".\serve-dist.mjs"
if errorlevel 1 (
  echo.
  echo Finance Pilot exited with an error.
  pause
)
