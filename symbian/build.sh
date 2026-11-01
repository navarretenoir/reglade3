#!/usr/bin/env bash
# Regla de 3 para Symbian (Java ME). Requiere el kit herramientas/j2me (ecj + ProGuard + CLDC/MIDP).
exec "$(cd "$(dirname "$0")/.." && pwd)/herramientas/j2me/construir-midlet.sh" "$(dirname "$(readlink -f "$0")")" "Regla de 3" cl.regla3.ReglaMidlet 1.0.0 ninguno
