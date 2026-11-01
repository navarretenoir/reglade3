#!/usr/bin/env bash
# Pruebas del motor matemático (Node.js >= 16). Desarrollada por Javiera Navarrete.
set -euo pipefail
cd "$(dirname "$0")/.."
node tests/motor.test.js
