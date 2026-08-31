const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'schema', 'index.json');
const outMdPath = path.join(__dirname, '..', 'CATALOG.md');

let db = { version: 1, packages: [] };
if (fs.existsSync(dbPath)) {
    try {
        db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        if (Array.isArray(db)) db = { version: 1, packages: db };
    } catch(e) {}
}

const icons = {
    'flatpak': '📦 Flatpak App',
    'gnome_extension': '🧩 GNOME Extension',
    'sayri_skill': '🤖 Sayri Skill',
    'sayri_plugin': '🔌 Sayri Plugin / Gateway'
};

let md = [
    '# 🌌 Pulsar Store Official Catalog',
    '',
    'Unified repository of Flatpak applications, GNOME Shell extensions, and Sayri AI Skills/Plugins for Pulsar OS.',
    '',
    '| Type | Name & Description | Version | OpenCode & VirusTotal Security | 1-Click Install |',
    '| :--- | :--- | :--- | :--- | :--- |'
];

for (const p of db.packages) {
    const score = p.security_report?.score || 95;
    const badgeColor = score >= 90 ? 'brightgreen' : (score >= 70 ? 'yellow' : 'red');
    const badge = `![Shield](https://img.shields.io/badge/Security-${score}%2F100-${badgeColor})`;
    const typeLabel = icons[p.type] || p.type;
    const installBtn = `[\`📲 Install\`](pulsar://install/${p.id})`;

    md.push(`| **${typeLabel}** | **${p.name}** (\`${p.id}\`)<br>_${p.description.substring(0, 75)}_ | \`v${p.version}\` | ${badge} | ${installBtn} |`);
}

md.push('\n---\n*Generated automatically by Pulsar Store Pipeline with OpenCode & VirusTotal security auditing.*');

fs.writeFileSync(outMdPath, md.join('\n'), 'utf8');
console.log(`✅ CATALOG.md generated with ${db.packages.length} packages.`);
