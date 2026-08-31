/**
 * Admin CLI script to unpublish and purge a package from Pulsar Store.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const pkgId = process.argv[2];
if (!pkgId) {
    console.error("Usage: node scripts/delete-package.js <package-id>");
    process.exit(1);
}

const dbPath = path.resolve(__dirname, '../schema/index.json');
if (!fs.existsSync(dbPath)) {
    console.error("schema/index.json not found.");
    process.exit(1);
}

const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const target = db.packages.find(p => p.id === pkgId);

if (!target) {
    console.error(`❌ Package with ID '${pkgId}' not found in catalog.`);
    process.exit(1);
}

// 1. Remove from database
db.packages = db.packages.filter(p => p.id !== pkgId);
db.updated_at = Math.floor(Date.now() / 1000);
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log(`✓ Removed '${target.name}' (${pkgId}) from schema/index.json`);

// 2. Remove icon if exists
const iconPath = path.resolve(__dirname, `../assets/icons/${pkgId}.png`);
if (fs.existsSync(iconPath)) {
    fs.unlinkSync(iconPath);
    console.log(`✓ Deleted asset ${iconPath}`);
}

// 3. Remove demos if exists
const demosDir = path.resolve(__dirname, `../assets/demos/${pkgId}`);
if (fs.existsSync(demosDir)) {
    fs.rmSync(demosDir, { recursive: true, force: true });
    console.log(`✓ Deleted demos directory ${demosDir}`);
}

// 4. Rebuild CATALOG.md and dist/
execSync('node scripts/build-catalog.js', { stdio: 'inherit', cwd: path.resolve(__dirname, '..') });
execSync('node scripts/build-dist.js', { stdio: 'inherit', cwd: path.resolve(__dirname, '..') });

console.log(`\n🎉 Package '${pkgId}' successfully unpublished from Pulsar Store!`);
