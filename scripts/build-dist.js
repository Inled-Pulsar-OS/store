/**
 * Build script for Cloudflare Pages deployment.
 * Bundles web UI, schema index, assets, and packages into a production 'dist' directory.
 */
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

console.log("🚀 Building Pulsar Store for Cloudflare Pages...");

// Clean / create dist
if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

// Copy frontend files
['index.html', 'style.css', 'app.js'].forEach(file => {
    const src = path.join(rootDir, 'web', file);
    if (fs.existsSync(src)) {
        fs.copyFileSync(src, path.join(distDir, file));
        console.log(`✓ Copied web/${file}`);
    }
});

// Copy schema, assets, packages directories (real files)
['schema', 'assets', 'packages'].forEach(dir => {
    const src = path.join(rootDir, dir);
    const dest = path.join(distDir, dir);
    if (fs.existsSync(src)) {
        fs.cpSync(src, dest, { recursive: true, dereference: true });
        console.log(`✓ Copied ${dir}/`);
    }
});

// Copy CATALOG.md
const catalogPath = path.join(rootDir, 'CATALOG.md');
if (fs.existsSync(catalogPath)) {
    fs.copyFileSync(catalogPath, path.join(distDir, 'CATALOG.md'));
    console.log("✓ Copied CATALOG.md");
}

console.log(`\n🎉 Build complete! Production artifacts ready in: ${distDir}\n`);
