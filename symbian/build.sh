#!/usr/bin/env bash
# Regla de 3 para Symbian (Java ME). Requiere el kit herramientas/j2me (ecj + ProGuard + CLDC/MIDP).
exec ~/.local/share/kotone-herramientas/j2me/construir-midlet.sh "$(dirname "$(readlink -f "$0")")" "Regla de 3" cl.regla3.ReglaMidlet 2.0.0 ninguno ~/Proyectos/SYMBIAN_KIT/src
