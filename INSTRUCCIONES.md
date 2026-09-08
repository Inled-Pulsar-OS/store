# 📖 Developer Submission & Packaging Guidelines

## 🤖 For AI Agents
See **[AI_AGENTS_SUBMISSION_GUIDE.md](AI_AGENTS_SUBMISSION_GUIDE.md)** for comprehensive documentation on how AI coding agents can autonomously submit, update, and manage packages via the GitHub Issue-based pipeline.

## 1. Sayri Skills (`sayri_skill`)
Package format: `.zip` containing:
- `SKILL.md`: Frontmatter YAML metadata + prompt instructions.
- `scripts/`: Executable helper scripts.
- `requirements.txt`: Python dependencies.

## 2. Sayri Plugins (`sayri_plugin`)
Package format: `.zip` containing:
- `manifest.json`: Plugin manifest declaring capabilities, sandbox level, required secrets, and authorization config.
- `gateway.py`: Source code daemon executed out-of-process in a `bwrap` sandbox.

## 3. GNOME Extensions (`gnome_extension`)
Package format: `.zip` containing:
- `metadata.json`: Declaring `uuid`, `name`, and `shell-version`.
- `extension.js`: Standard ESM code compatible with GNOME 45+.

## 4. Desktop Applications (`app` / `flatpak`)
Supports **one** of two distribution schemes:
- **Option A (1 Asset)**: **Flatpak** (`.flatpakref` URL, `.flatpak` binary bundle, or Flathub ID).
- **Option B (2 Required Assets)**: **Debian Edition** (`.deb`) **AND** **Arch Linux Edition** (`.pkg.tar.zst` / `.pkg.tar.xz` / `.pacman`). *Both native formats must be provided to ensure full compatibility across all Pulsar OS bases.*

⚠️ *Generic .zip archives containing uncompiled source code or loose unpacked binaries are strictly forbidden.*
