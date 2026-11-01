#!/usr/bin/env bash
# Compila Regla de 3 para sistemas antiguos con Open Watcom (instalado en /opt/watcom). Desarrollada por Javiera Navarrete.
#  DOS (16 bits) · OS/2 Warp (32 bits, consola) · Windows 3.x (16 bits) · Windows NT 3.5/3.51/4.0, 9x/Me, 2000, XP, Vista, 7 y 8 (32 bits)
set -euo pipefail
source /opt/watcom/entorno.sh
cd "$(dirname "$(readlink -f "$0")")"
O=$(pwd)/../dist/antiguos; mkdir -p "$O" build; rm -f build/*
cp regla.c regla.h regla_con.c regla_win.c build/ && cd build
export INCLUDE=$WATCOM/h
wcl -q -bt=dos -ml -os -fe=REGLA3.EXE regla_con.c regla.c                                  && mv REGLA3.EXE "$O/REGLA3-DOS.EXE"
INCLUDE=$WATCOM/h/os2:$WATCOM/h wcl386 -q -bt=os2 -l=os2v2 -os -fe=regla-os2.exe regla_con.c regla.c && mv regla-os2.exe "$O/REGLA3-OS2.EXE"
INCLUDE=$WATCOM/h/win:$WATCOM/h wcl -q -bt=windows -ml -l=windows -os -fe=REGLA16.EXE regla_win.c regla.c && mv REGLA16.EXE "$O/REGLA3-WIN3X.EXE"
INCLUDE=$WATCOM/h/nt:$WATCOM/h wcc386 -q -bt=nt -os regla_win.c && INCLUDE=$WATCOM/h wcc386 -q -bt=nt -os regla.c \
  && wlink system nt_win option version=3.10,quiet name REGLA32.EXE file regla_win.o,regla.o && mv REGLA32.EXE "$O/REGLA3-WIN32.EXE"
INCLUDE=$WATCOM/h/nt:$WATCOM/h wcc386 -q -bt=nt -os regla_con.c && wlink system nt option version=3.10,quiet name REGLA32C.EXE file regla_con.o,regla.o && mv REGLA32C.EXE "$O/REGLA3-WIN32-CONSOLA.EXE"
(cd "$O" && sha256sum *.EXE > SHA256SUMS.txt; ls -la)
