#!/usr/bin/env bash
# Regla de 3 para Android antiguo (1.6+) — sin Gradle: aapt2 -> javac -> d8 -> zipalign -> apksigner. Desarrollada por Javiera Navarrete.
set -euo pipefail
P="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"; SDK=${ANDROID_HOME:-$HOME/Android/Sdk}
BT=$(ls -d "$SDK"/build-tools/* | sort -V | tail -1); JAR=$(ls -d "$SDK"/platforms/android-*/android.jar | sort -V | tail -1)
JAVAC=${JAVAC:-$(command -v javac || find /var/lib/flatpak/app/com.google.AndroidStudio -name javac -path "*jbr*" | head -n1)}
cd "$P"; rm -rf build && mkdir -p build/classes build/dex build/gen build/res
"$BT/aapt2" compile --dir res -o build/res.zip
"$BT/aapt2" link -I "$JAR" --manifest AndroidManifest.xml --java build/gen -o build/unsigned.apk build/res.zip
"$JAVAC" -source 8 -target 8 -encoding UTF-8 -Xlint:-options -cp "$JAR" -d build/classes build/gen/io/github/navarretenoir/regla3/antiguo/R.java \
    src/io/github/navarretenoir/regla3/antiguo/*.java ../java/cl/regla3/*.java
"$BT/d8" --release --min-api 4 --lib "$JAR" --output build/dex $(find build/classes -name '*.class')
(cd build/dex && zip -q -u "$P/build/unsigned.apk" classes.dex)
"$BT/zipalign" -p -f 4 build/unsigned.apk build/aligned.apk
mkdir -p dist; "$BT/apksigner" sign --ks ~/.android/debug.keystore --ks-pass pass:android --out dist/ReglaDe3-antiguo-1.0.apk build/aligned.apk
rm -f dist/*.idsig; ls -la dist
