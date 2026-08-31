# 🤖 AI Agent Submission Guide — Pulsar Store

> **Purpose**: This document teaches AI coding agents how to autonomously submit, update, and manage packages on the Pulsar Store (https://store-os.inled.es) via the GitHub Issue-based automated pipeline.

---

## 📖 Table of Contents

1. [How the Store Works](#how-the-store-works)
2. [Package Types & Structures](#package-types--structures)
3. [How to Submit a New Package](#how-to-submit-a-new-package)
4. [How to Update an Existing Package](#how-to-update-an-existing-package)
5. [How to Delete a Package](#how-to-delete-a-package)
6. [Security Audit Pipeline](#security-audit-pipeline)
7. [Automation Scripts](#automation-scripts)
8. [Examples for AI Agents](#examples-for-ai-agents)

---

## How the Store Works

The Pulsar Store is a **GitHub Issue-driven** package registry. There is no REST API — all operations happen through GitHub Issues with specific YAML form templates. A GitHub Actions workflow (`validate-and-publish.yml`) triggers automatically on new/edited issues and:

1. Parses the issue form fields
2. Downloads the ZIP archive and icon
3. Runs **VirusTotal** malware scanning (zero-tolerance)
4. Runs **OpenCode AI** semantic code audit (Groq Llama 3.3 70B)
5. Publishes the package to GitHub Releases
6. Updates `schema/index.json` (the catalog database)
7. Rebuilds `CATALOG.md` and web dist
8. Closes the issue as "completed"

**Repository**: `https://github.com/Inled-Pulsar-OS/store`

---

## Package Types & Structures

### 1. Sayri Skill (`sayri_skill`)
AI capabilities and system prompts for Sayri subagents.

**ZIP Structure**:
```
sayri-skill-my-skill.zip
├── SKILL.md                    # Required: Frontmatter YAML + prompt instructions
├── scripts/                    # Optional: Executable helper scripts
├── tools/                      # Optional: Tool definitions
└── requirements.txt            # Optional: Python dependencies
```

**SKILL.md Format**:
```yaml
---
name: sayri-skill-my-skill
title: My Custom Skill
description: What this skill does for Sayri.
version: 1.0.0
author: your-github-username
sandbox_level: LEVEL_1_READONLY
allowed_tools:
  - tool_name_1
  - tool_name_2
required_secrets:
  - SECRET_NAME
---

# Role & Capabilities
You are a [description of the AI persona].

## Guidelines
1. [Instruction 1]
2. [Instruction 2]

## Tools
- `tool_name_1`: Description of what this tool does.
- `tool_name_2`: Description of what this tool does.
```

**Issue Template**: `submit-skill.yml`
- **Title format**: `[Skill]: My Skill Name`
- **Labels**: `skill`, `sayri`, `submission`

---

### 2. Sayri Plugin / Gateway (`sayri_plugin`)
Out-of-process sandboxed gateways (Discord, Telegram, MCP, Matrix, etc.)

**ZIP Structure**:
```
sayri-gateway-myplatform.zip
├── manifest.json               # Required: Plugin manifest
├── gateway.py                  # Required: Main entrypoint daemon
├── requirements.txt            # Optional: Python dependencies
└── README.md                   # Optional: Documentation
```

**manifest.json Format**:
```json
{
  "id": "sayri-gateway-myplatform",
  "name": "My Platform Gateway",
  "version": "1.0.0",
  "author": "your-github-username",
  "description": "What this gateway does.",
  "entrypoint": "gateway.py",
  "sandbox_level": "LEVEL_1_READONLY",
  "required_secrets": [
    "MY_PLATFORM_TOKEN"
  ],
  "authorization": {
    "mode": "pairing_otp",
    "allowed_users": [],
    "pairing_pin_required": true,
    "pin_expiration_seconds": 300,
    "rate_limit": {
      "max_requests_per_minute": 15,
      "burst": 3
    }
  },
  "capabilities": [
    "receive_messages",
    "send_replies"
  ],
  "allowed_domains": [
    "api.myplatform.com"
  ]
}
```

**Important Notes**:
- `allowed_users` should be an **empty array** `[]` — users authorize themselves via OTP pairing on first message
- Never hardcode usernames like `["@admin"]` — each user pairs via PIN
- The `gateway.py` daemon uses IPC UNIX socket to communicate with Sayri Core
- Must implement `AuthorizationManager` class for OTP pairing

**Issue Template**: `submit-plugin.yml`
- **Title format**: `[Plugin]: My Gateway Name`
- **Labels**: `plugin`, `gateway`, `submission`

---

### 3. GNOME Extension (`gnome_extension`)
Shell extensions for GNOME 45+.

**ZIP Structure**:
```
my-extension.zip
├── metadata.json               # Required: uuid, name, shell-version
├── extension.js                # Required: ESM module code
├── stylesheet.css              # Optional: CSS styling
└── prefs.js                    # Optional: Settings UI
```

**Issue Template**: `submit-extension.yml`
- **Title format**: `[Extension]: My Extension Name`
- **Labels**: `extension`, `gnome`, `submission`

---

### 4. Flatpak App (`flatpak`)
Desktop applications via Flathub or direct manifests.

**ZIP Structure**: `.flatpak` binary or `.flatpakref` link

**Issue Template**: `submit-app.yml`
- **Title format**: `[App]: My App Name`
- **Labels**: `app`, `flatpak`, `submission`

---

## How to Submit a New Package

### Step 1: Prepare the ZIP Archive

Create a properly structured ZIP file for your package type. Ensure:
- All required files are present
- No `node_modules/`, `vendor/`, or `__pycache__/` directories
- No hardcoded credentials, API keys, or tokens
- Code is clean and follows security best practices

### Step 2: Host the ZIP Archive

Upload the ZIP to a publicly accessible URL. Options:
- **GitHub Release** (recommended): Upload to your repo's releases
- **Direct URL**: Any HTTPS-accessible file hosting

### Step 3: Create the GitHub Issue

Open an issue on `https://github.com/Inled-Pulsar-OS/store` using the appropriate template:

| Package Type | Issue Template URL |
|---|---|
| Sayri Skill | `https://github.com/Inled-Pulsar-OS/store/issues/new?template=submit-skill.yml` |
| Sayri Plugin | `https://github.com/Inled-Pulsar-OS/store/issues/new?template=submit-plugin.yml` |
| GNOME Extension | `https://github.com/Inled-Pulsar-OS/store/issues/new?template=submit-extension.yml` |
| Flatpak App | `https://github.com/Inled-Pulsar-OS/store/issues/new?template=submit-app.yml` |

### Step 4: Fill the Form Fields

**Required fields for all types**:
- **ID**: Unique identifier (e.g., `sayri-gateway-telegram`)
- **Name**: Human-readable name
- **Description**: What the package does
- **ZIP Archive URL**: Direct link to the .zip file
- **Icon URL**: Link to a square PNG or SVG icon (128x128+)

**Optional fields**:
- **Source Repository**: GitHub URL of the source code
- **Demo Screenshots**: Links to preview images
- **AI Audit Provider**: Custom LLM for security audit (default: Groq Llama 3.3 70B)

### Step 5: Automated Pipeline Runs

Once the issue is created, the workflow `validate-and-publish.yml` triggers automatically. You'll see real-time progress comments on the issue:

1. ⏳ Form Preparation & Validation
2. 🔄 Asset & Package Download
3. 🔄 Manifest & Sandbox Validation
4. 🔄 Malware Scan (VirusTotal)
5. 🔄 OpenCode AI Semantic Code Audit
6. 🔄 Catalog Publication (Pulsar Store)

If all steps pass, the issue is closed as "completed" and the package appears in the store.

---

## How to Update an Existing Package

Use the **Update Package** template:

**Issue Template**: `update-package.yml`
- **Title format**: `update: package-id`
- **Labels**: `update`, `version-bump`

**Required fields**:
- **Package ID**: The existing package identifier
- **New Version Number**: Semantic version (e.g., `1.1.0`)
- **New Release ZIP Archive**: Updated .zip file URL

**Optional fields**:
- **Changelog / Release Notes**: Summary of changes

---

## How to Delete a Package

Use the **Delete Package** template:

**Issue Template**: `04_delete_package.yml`
- **Title format**: `delete: package-id`
- **Labels**: `delete`, `package-removal`

**Required fields**:
- **Package ID**: The package to remove

**Note**: Only the administrator (`@jaimegh-es`) or the original package author can delete a package.

---

## Security Audit Pipeline

Every submission goes through a **double-layer security audit**:

### Layer 1: VirusTotal Malware Scan
- Strict **zero-tolerance** policy
- SHA256 hash is checked first; if unknown, the file is uploaded
- If **any** engine detects malware → **REJECTED**
- Results include permalink to VirusTotal report

### Layer 2: OpenCode AI Semantic Audit
- Powered by **Groq Llama 3.3 70B** (or user-specified provider)
- Checks for:
  - Malware, backdoors, credential exfiltration
  - Prompt injection attacks
  - Unauthorized network requests
  - Sandbox policy violations
  - Destructive shell commands
- Score threshold: **≥ 70/100** to pass
- Score **< 70** → **REJECTED** with detailed risk report

### Sandbox Levels
| Level | Description |
|---|---|
| `LEVEL_0_NO_EXEC` | Isolated / No host execution |
| `LEVEL_1_READ_ONLY` | Read-only filesystem sandbox |
| `LEVEL_2_STRICT_BWRAP` | Bubblewrap container |
| `LEVEL_3_FULL_HOST` | Full host access (requires user confirmation) |

---

## Automation Scripts

### For AI Agents: Programmatic Issue Creation

Use the GitHub API to create issues programmatically:

```bash
# Create a new skill submission issue
curl -X POST \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/Inled-Pulsar-OS/store/issues \
  -d '{
    "title": "[Skill]: My New Skill",
    "body": "### Skill ID\nsayri-skill-my-skill\n\n### Skill Name\nMy New Skill\n\n### Skill Description\nDoes amazing things for Sayri.\n\n### Declared Sandbox Isolation Level\nLEVEL_1_READONLY\n\n### Skill ZIP Archive\nhttps://github.com/myorg/myrepo/releases/download/v1.0.0/sayri-skill-my-skill.zip\n\n### Skill Icon (PNG or SVG)\nhttps://github.com/myorg/myrepo/releases/download/v1.0.0/icon.png\n\n### Source Repository (Optional)\nhttps://github.com/myorg/myrepo",
    "labels": ["skill", "sayri", "submission"]
  }'
```

### For AI Agents: Programmatic Update

```bash
# Update an existing package
curl -X POST \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/Inled-Pulsar-OS/store/issues \
  -d '{
    "title": "update: sayri-skill-my-skill",
    "body": "### Package ID\nsayri-skill-my-skill\n\n### New Version Number\n1.1.0\n\n### New Release ZIP Archive\nhttps://github.com/myorg/myrepo/releases/download/v1.1.0/sayri-skill-my-skill.zip\n\n### Changelog / Release Notes\nFixed bug X, added feature Y.",
    "labels": ["update", "version-bump"]
  }'
```

### ZIP Packaging (Bash)

```bash
# Package a skill
cd my-skill/
zip -r ../sayri-skill-my-skill.zip . \
  -x "*.pyc" "__pycache__/*" "node_modules/*" ".git/*"

# Package a gateway plugin
cd my-gateway/
zip -r ../sayri-gateway-myplatform.zip . \
  -x "*.pyc" "__pycache__/*" "node_modules/*" ".git/*"
```

---

## Examples for AI Agents

### Example: Submitting a Telegram Gateway Plugin

1. **Create the files**:
   - `manifest.json` with proper authorization config (empty `allowed_users`)
   - `gateway.py` with OTP pairing implementation
   - `README.md` with setup instructions

2. **Package as ZIP**:
   ```bash
   cd packages/plugins/sayri-gateway-telegram/
   zip -r /tmp/sayri-gateway-telegram.zip . -x "*.pyc" "__pycache__/*"
   ```

3. **Upload ZIP** to GitHub Releases:
   ```bash
   gh release upload packages /tmp/sayri-gateway-telegram.zip --clobber
   ```

4. **Create issue** via GitHub API or web UI with the template form

5. **Wait for audit** — the pipeline will:
   - Validate the ZIP structure
   - Extract and analyze `manifest.json` and `gateway.py`
   - Run VirusTotal scan
   - Run OpenCode AI audit
   - Publish to catalog

### Example: Updating a Package Version

1. **Update version** in `manifest.json` (e.g., `1.0.0` → `1.1.0`)
2. **Re-package** as ZIP
3. **Upload** new ZIP to GitHub Releases
4. **Create update issue** with new version number and changelog

---

## 📋 Quick Reference

| Action | Issue Title Format | Template |
|---|---|---|
| Submit Skill | `[Skill]: Name` | `submit-skill.yml` |
| Submit Plugin | `[Plugin]: Name` | `submit-plugin.yml` |
| Submit Extension | `[Extension]: Name` | `submit-extension.yml` |
| Submit App | `[App]: Name` | `submit-app.yml` |
| Update Version | `update: package-id` | `update-package.yml` |
| Delete Package | `delete: package-id` | `04_delete_package.yml` |

| Field | Required | Description |
|---|---|---|
| ID | ✅ | Unique package identifier |
| Name | ✅ | Human-readable name |
| Description | ✅ | What the package does |
| ZIP Archive URL | ✅ | Direct HTTPS link to .zip |
| Icon URL | ✅ | Square PNG or SVG (128x128+) |
| Source Repository | ❌ | GitHub URL |
| Sandbox Level | ✅ | Security isolation level |
| AI Provider | ❌ | Custom LLM for audit |

---

*Generated for AI Agent autonomous submission to Pulsar Store.*
*Repository: https://github.com/Inled-Pulsar-OS/store*
