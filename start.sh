#!/usr/bin/env bash
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "VIMLworks RESONANCE Conductor starting..."
cd "$SCRIPT_DIR"
if [ ! -x ".venv/bin/python" ]; then
  echo "venv not found, creating virtual environment..."
  python3 -m venv .venv
fi
source ".venv/bin/activate"
echo "Installing dependencies..."
python -m pip install -r requirements.txt
python main.py
