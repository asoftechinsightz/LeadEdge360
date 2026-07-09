#!/usr/bin/env bash
# Build signed Android release (APK + AAB).
# Prerequisites: key.properties + upload keystore (see docs/ANDROID_RELEASE_RC3.md)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
MOBILE="${ROOT}/mobile"
cd "$MOBILE"

VERSION="$(grep '^version:' pubspec.yaml | awk '{print $2}')"
echo "Building Android release v${VERSION}"

flutter pub get
flutter analyze

if [ -f android/key.properties ]; then
  echo "Using release signing from android/key.properties"
else
  echo "WARN: android/key.properties missing — debug-signed build only"
fi

flutter build appbundle --release
flutter build apk --release

mkdir -p "${ROOT}/dist/android"
cp build/app/outputs/bundle/release/app-release.aab "${ROOT}/dist/android/asoftech-${VERSION}.aab"
cp build/app/outputs/flutter-apk/app-release.apk "${ROOT}/dist/android/asoftech-${VERSION}.apk"

echo "Artifacts:"
echo "  ${ROOT}/dist/android/asoftech-${VERSION}.aab"
echo "  ${ROOT}/dist/android/asoftech-${VERSION}.apk"
