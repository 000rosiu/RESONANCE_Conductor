@echo off
setlocal
cd /d "%~dp0"
echo VIMLworks RESONANCE Conductor starting...
if not exist ".venv\Scripts\python.exe" (
  echo venv not found, creating virtual environment...
  py -3 -m venv .venv
)
call ".venv\Scripts\activate.bat"
echo Installing dependencies...
python -m pip install -r requirements.txt
python main.py
