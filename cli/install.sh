#!/bin/bash
set -e

echo "🌌 Installing Pulsar Store CLI Helper..."

TARGET_BIN="/usr/local/bin/pulsar-store"
if [ ! -w "/usr/local/bin" ]; then
    TARGET_BIN="$HOME/.local/bin/pulsar-store"
    mkdir -p "$HOME/.local/bin"
fi

curl -fsSL https://raw.githubusercontent.com/pulsar-os/store/main/cli/pulsar-store -o "$TARGET_BIN"
chmod +x "$TARGET_BIN"

# Register pulsar:// MIME scheme handler
DESKTOP_DIR="$HOME/.local/share/applications"
mkdir -p "$DESKTOP_DIR"
cat << DESKTOP_EOF > "$DESKTOP_DIR/pulsar-store-handler.desktop"
[Desktop Entry]
Name=Pulsar Store URL Handler
Comment=Handles pulsar:// installation URLs
Exec=$TARGET_BIN handle-url %u
Terminal=true
Type=Application
MimeType=x-scheme-handler/pulsar;
NoDisplay=true
Categories=System;PackageManager;
DESKTOP_EOF

update-desktop-database "$DESKTOP_DIR" 2>/dev/null || true
xdg-mime default pulsar-store-handler.desktop x-scheme-handler/pulsar 2>/dev/null || true

echo "✅ Pulsar Store CLI Helper installed successfully to $TARGET_BIN!"
echo "💡 Try running: pulsar-store check"
