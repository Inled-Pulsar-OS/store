# 🌌 Pulsar Store

Official unified store and ecosystem manager for **Pulsar OS**, covering **Flatpak Applications**, **GNOME Shell Extensions**, and **Sayri AI Skills & Plugins**.

---

## 🌟 Ecosystem Overview

1. **📦 Flatpak Apps**: Verified desktop applications.
2. **🧩 GNOME Extensions**: Shell customizations audited against modern GJS guidelines.
3. **🤖 Sayri Skills**: AI capabilities and system prompts (OpenClaw / ClawHub compatible format).
4. **🔌 Sayri Plugins**: Out-of-process sandboxed gateways (Discord, Telegram, MCP).

---

## 🛡️ Security Shield (OpenCode + VirusTotal)

All package submissions undergo automated double-layer security auditing:
- **VirusTotal API**: Strict 0-tolerance malware and payload detection.
- **OpenCode AI Reviewer (Groq Llama 3.3 70B)**: Static and semantic source code inspection checking for prompt injection, credential access, unauthorized network exfiltration, and sandbox compliance.

---

## ⚡ CLI Helper Installation

Install the single-command CLI helper for Pulsar OS / Linux:

```bash
curl -fsSL https://raw.githubusercontent.com/Inled-Pulsar-OS/store/main/cli/install.sh | bash
```

### Usage:

```bash
# Check for updates across all 4 ecosystems
pulsar-store check

# Apply all updates
pulsar-store update

# Install a package directly
pulsar-store install <package-id>
```

---

## 🚀 Submitting a Package

To publish a new package, open an Issue using the appropriate form template:
- [Submit Flatpak App](https://github.com/Inled-Pulsar-OS/store/issues/new?template=submit-app.yml)
- [Submit GNOME Extension](https://github.com/Inled-Pulsar-OS/store/issues/new?template=submit-extension.yml)
- [Submit Sayri Skill](https://github.com/Inled-Pulsar-OS/store/issues/new?template=submit-skill.yml)
- [Submit Sayri Plugin](https://github.com/Inled-Pulsar-OS/store/issues/new?template=submit-plugin.yml)
