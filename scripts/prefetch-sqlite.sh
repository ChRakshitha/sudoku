#!/usr/bin/env bash
# Pre-downloads the SQLite source that expo-sqlite's Gradle build needs.
# Gradle's own download tries once and intermittently fails on EAS with
# "Network is unreachable"; curl with retries is far more reliable. When the
# file already exists, the Gradle downloadSQLite task skips the download.
# On EAS, eas.json sets REACT_NATIVE_DOWNLOADS_DIR so the script and Gradle
# agree on one absolute location.
set -euo pipefail

# Only Android builds compile SQLite through Gradle.
[ "${EAS_BUILD_PLATFORM:-android}" = "android" ] || exit 0

gradle_file="node_modules/expo-sqlite/android/build.gradle"
[ -f "$gradle_file" ] || exit 0

version=$(sed -n "s/^def SQLITE_VERSION = '\([0-9]*\)'.*/\1/p" "$gradle_file")
url=$(sed -n 's/.*src("\(https:\/\/www\.sqlite\.org\/[^"]*\)").*/\1/p' "$gradle_file" | sed "s/\${SQLITE_VERSION}/$version/")
dest_dir="${REACT_NATIVE_DOWNLOADS_DIR:-node_modules/expo-sqlite/android/build/downloads}"
dest="$dest_dir/sqlite-amalgamation-$version.zip"

[ -s "$dest" ] && { echo "SQLite already downloaded: $dest"; exit 0; }
mkdir -p "$dest_dir"
echo "Downloading $url"
curl -fsSL --retry 8 --retry-delay 5 --retry-all-errors --connect-timeout 20 -o "$dest.tmp" "$url"
if command -v unzip >/dev/null; then unzip -tq "$dest.tmp" >/dev/null; fi
mv "$dest.tmp" "$dest"
echo "Saved $dest ($(wc -c < "$dest") bytes)"
