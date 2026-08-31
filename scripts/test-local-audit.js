const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

// 1. Create a dummy test skill zip
const tmpDir = '/tmp/pulsar-test-skill';
fs.mkdirSync(tmpDir, { recursive: true });

const skillMd = `---
name: "Web Search Tool"
description: "Searches the web via DuckDuckGo and Wikipedia APIs"
sandbox_level: "LEVEL_1_READONLY"
version: "1.2.0"
---
# Web Search Tool Instructions
Use DuckDuckGo search API to retrieve public documentation.`;

fs.writeFileSync(path.join(tmpDir, 'SKILL.md'), skillMd);
fs.writeFileSync(path.join(tmpDir, 'manifest.json'), JSON.stringify({
    id: "sayri-skill-web-search",
    name: "Web Search Tool",
    version: "1.2.0",
    sandbox: { level: "LEVEL_1_READONLY" }
}));

const zip = new AdmZip();
zip.addLocalFile(path.join(tmpDir, 'SKILL.md'));
zip.addLocalFile(path.join(tmpDir, 'manifest.json'));
const zipPath = '/tmp/sayri-skill-web-search.zip';
zip.writeZip(zipPath);

// Create a dummy icon
const iconPath = '/tmp/web-search-icon.png';
fs.writeFileSync(iconPath, 'dummy-png-bytes');

console.log("Created test artifacts at:", zipPath, iconPath);
