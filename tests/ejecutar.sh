#!/usr/bin/env bash
# Pruebas de Regla de 3: motor JS (exacto) y paridad con el núcleo en C89. Desarrollada por Javiera Navarrete.
set -euo pipefail
cd "$(dirname "$0")"
node motor.test.js
gcc -std=c89 -pedantic -Wall -Wextra -O1 -Wno-misleading-indentation paridad.c ../nucleo/regla.c -lm -o paridad
./paridad > /tmp/regla-c.txt; node paridad.js > /tmp/regla-js.txt
if diff -u /tmp/regla-c.txt /tmp/regla-js.txt; then echo "paridad C <-> JS: $(wc -l < /tmp/regla-c.txt) casos iguales"; else echo "PARIDAD ROTA"; rm -f paridad; exit 1; fi
rm -f paridad
