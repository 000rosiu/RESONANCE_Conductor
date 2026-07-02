@echo off
setlocal
cd /d "%~dp0"

echo Instalacja pyinstaller (jesli brak)...
python -m pip install --upgrade pyinstaller

echo Budowanie Conductor.exe...
pyinstaller ^
  --onefile ^
  --name Conductor ^
  --icon "icon.ico" ^
  --version-file "version_info.txt" ^
  --add-data "static;static" ^
  main.py

echo.
echo Gotowe. Plik wynikowy: dist\Conductor.exe
pause
