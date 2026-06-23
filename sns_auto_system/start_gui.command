#!/bin/zsh
cd "$(dirname "$0")/.."
python3 -m streamlit run sns_auto_system/app.py
