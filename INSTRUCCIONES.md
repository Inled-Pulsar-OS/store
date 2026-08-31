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

## 4. Flatpak Apps (`flatpak`)
Package format: `.flatpak` binary or `.flatpakref` AppStream manifest.
