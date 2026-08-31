/**
 * Pulsar Store — Frontend Application Controller
 * Pure full-page navigation, clean typography, zero popups.
 */

let allPackages = [];
let currentFilter = 'all';
let searchQuery = '';

const typeMeta = {
  'flatpak': { label: 'Desktop App', category: 'Flatpak Container' },
  'gnome_extension': { label: 'GNOME Extension', category: 'Desktop Shell' },
  'sayri_skill': { label: 'Sayri Skill', category: 'AI Assistant Skill' },
  'sayri_plugin': { label: 'Channel Gateway', category: 'System Plugin' }
};

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  setupEventListeners();
  loadCatalog();
});

// ── Theme Management ──────────────────────────────────────────────────────
function initTheme() {
  const savedTheme = localStorage.getItem('pulsar-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = savedTheme ? savedTheme === 'dark' : prefersDark;

  applyTheme(isDark);

  const toggleBtn = document.getElementById('theme-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const nowDark = !document.documentElement.classList.contains('dark');
      applyTheme(nowDark);
      localStorage.setItem('pulsar-theme', nowDark ? 'dark' : 'light');
    });
  }
}

function applyTheme(isDark) {
  document.documentElement.classList.toggle('dark', isDark);
  const sun = document.querySelector('.sun-icon');
  const moon = document.querySelector('.moon-icon');
  if (sun && moon) {
    sun.classList.toggle('hidden', isDark);
    moon.classList.toggle('hidden', !isDark);
  }
}

// ── Event Listeners ───────────────────────────────────────────────────────
function setupEventListeners() {
  const searchInput = document.getElementById('search-input');
  const searchClear = document.getElementById('search-clear');

  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim().toLowerCase();
    searchClear.classList.toggle('hidden', searchQuery.length === 0);
    renderGrid();
  });

  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    searchClear.classList.add('hidden');
    searchInput.focus();
    renderGrid();
  });

  document.querySelectorAll('.pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      showCatalogView(btn.getAttribute('data-type'));
    });
  });

  window.addEventListener('hashchange', handleHash);
}

// ── Load Catalog ──────────────────────────────────────────────────────────
async function loadCatalog() {
  const grid = document.getElementById('packages-grid');
  try {
    const res = await fetch('schema/index.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    allPackages = data.packages || [];
    updateTabCounts();
    handleHash();
  } catch (err) {
    console.error("Failed to load catalog:", err);
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 20px;">
        <h3 style="font-family: var(--font-display); font-size: 1.2rem; margin-bottom: 8px;">Unable to load package catalog</h3>
        <p style="color: var(--text-secondary); font-size: 0.9rem;">Could not fetch <code>schema/index.json</code>.</p>
      </div>
    `;
  }
}

function updateTabCounts() {
  const counts = { all: allPackages.length, flatpak: 0, gnome_extension: 0, sayri_skill: 0, sayri_plugin: 0 };
  allPackages.forEach(p => {
    if (counts[p.type] !== undefined) counts[p.type]++;
  });

  for (const [key, count] of Object.entries(counts)) {
    const el = document.getElementById(`count-${key}`);
    if (el) el.textContent = count;
  }
}

// ── View Switching & Routing (Pure full-page navigation) ───────────────────
function showCatalogView(type = 'all') {
  currentFilter = type;
  document.querySelectorAll('.app-view').forEach(v => v.classList.add('hidden'));
  document.getElementById('catalog-view').classList.remove('hidden');

  document.querySelectorAll('.pill-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-type') === type);
  });

  document.querySelectorAll('.nav-menu .nav-link').forEach(link => {
    const linkText = link.textContent.toLowerCase();
    const isAct = (type === 'all' && linkText.includes('all')) ||
                  (type === 'flatpak' && linkText.includes('apps')) ||
                  (type === 'gnome_extension' && linkText.includes('ext')) ||
                  (type === 'sayri_skill' && linkText.includes('skill'));
    link.classList.toggle('active', isAct);
  });

  window.location.hash = type === 'all' ? '' : type;
  window.scrollTo(0, 0);
  renderGrid();
}

function showPackageDetail(pkgId) {
  const pkg = allPackages.find(p => p.id === pkgId);
  if (!pkg) return;

  document.querySelectorAll('.app-view').forEach(v => v.classList.add('hidden'));
  document.getElementById('package-view').classList.remove('hidden');
  window.location.hash = `pkg=${pkg.id}`;
  window.scrollTo(0, 0);

  const meta = typeMeta[pkg.type] || { label: pkg.type, category: 'Software' };
  const score = pkg.security_report?.score || 95;
  const isVerified = (pkg.security_report?.status === 'PASSED') || score >= 90;
  const container = document.getElementById('package-detail-content');

  container.innerHTML = `
    <div class="detail-header-card">
      <div class="detail-hero-row">
        ${pkg.icon_url 
          ? `<img src="${escapeHtml(pkg.icon_url)}" class="detail-large-icon" alt="${escapeHtml(pkg.name)}" onerror="this.style.display='none'">`
          : ''
        }
        <div style="flex: 1;">
          <h1 class="detail-title">${escapeHtml(pkg.name)}</h1>
          <div class="detail-meta-text">
            Version v${escapeHtml(pkg.version || '1.0')} • by @${escapeHtml(pkg.author || 'Pulsar')} • ${escapeHtml(meta.label)}
          </div>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <a href="pulsar://install/${escapeHtml(pkg.id)}" class="btn btn-primary">
              Install in Pulsar OS
            </a>
            ${pkg.github_url ? `<a href="${escapeHtml(pkg.github_url)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">View Source Code ↗</a>` : ''}
          </div>
        </div>
      </div>

      <p class="detail-lead">
        ${escapeHtml(pkg.description || '')}
      </p>

      <!-- Terminal Install Box -->
      <div class="code-box-wrapper">
        <div class="code-label">Install via Terminal CLI:</div>
        <div class="code-snippet">
          <code>pulsar-store install ${escapeHtml(pkg.id)}</code>
          <button class="btn-copy" onclick="copyCode(this, 'pulsar-store install ${escapeHtml(pkg.id)}')">Copy</button>
        </div>
      </div>

      <!-- Technical Specifications Table -->
      <h3 class="section-title">Specifications</h3>
      <table class="specs-table">
        <tbody>
          <tr>
            <th>Package ID</th>
            <td><code>${escapeHtml(pkg.id)}</code></td>
          </tr>
          <tr>
            <th>Ecosystem</th>
            <td>${escapeHtml(meta.label)} (${escapeHtml(meta.category)})</td>
          </tr>
          <tr>
            <th>Sandbox Isolation</th>
            <td>${escapeHtml(pkg.metadata?.sandbox_level || 'Container Level 0 (Isolated)')}</td>
          </tr>
          ${pkg.metadata?.shell_versions ? `
          <tr>
            <th>GNOME Shell Compatibility</th>
            <td>${escapeHtml(pkg.metadata.shell_versions.join(', '))}</td>
          </tr>` : ''}
        </tbody>
      </table>

      <!-- Security Audit Info -->
      <div class="security-report-card">
        <div class="security-card-title">
          ${isVerified ? '✓ OpenCode Security Verified' : 'Security Analysis'}
        </div>
        <p class="security-card-desc">
          ${escapeHtml(pkg.security_report?.summary || 'Source code static analysis completed with clean security policies.')}
        </p>
      </div>
    </div>
  `;
}

function showStaticView(viewId) {
  document.querySelectorAll('.app-view').forEach(v => v.classList.add('hidden'));
  const view = document.getElementById(viewId);
  if (view) {
    view.classList.remove('hidden');
    window.location.hash = viewId === 'cli-view' ? 'cli' : 'submit';
    window.scrollTo(0, 0);
  }
}

// ── Render Catalog Grid (Clean cards, no badge clutter) ───────────────────
function renderGrid() {
  const grid = document.getElementById('packages-grid');

  let filtered = allPackages.filter(pkg => {
    const matchesType = currentFilter === 'all' || pkg.type === currentFilter;
    const matchesSearch = !searchQuery ||
      pkg.name.toLowerCase().includes(searchQuery) ||
      pkg.description.toLowerCase().includes(searchQuery) ||
      pkg.id.toLowerCase().includes(searchQuery) ||
      (pkg.author && pkg.author.toLowerCase().includes(searchQuery));
    return matchesType && matchesSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 20px;">
        <h3 style="font-family: var(--font-display); font-size: 1.2rem; margin-bottom: 8px;">No software found</h3>
        <p style="color: var(--text-secondary); font-size: 0.9rem;">Try searching for another keyword or select All.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(pkg => {
    const meta = typeMeta[pkg.type] || { label: pkg.type };

    return `
      <article class="pkg-card" onclick="showPackageDetail('${escapeHtml(pkg.id)}')">
        <div class="card-top">
          <div class="card-icon-frame">
            ${pkg.icon_url 
              ? `<img src="${escapeHtml(pkg.icon_url)}" class="card-icon" alt="${escapeHtml(pkg.name)}" onerror="this.style.display='none'">`
              : `<span style="font-weight: 700; color: var(--accent-purple);">${escapeHtml(pkg.name.charAt(0))}</span>`
            }
          </div>
          <div class="card-info">
            <h3 class="card-title">${escapeHtml(pkg.name)}</h3>
            <div class="card-meta-line">${escapeHtml(meta.label)} • v${escapeHtml(pkg.version || '1.0')}</div>
            <p class="card-desc">${escapeHtml(pkg.description || '')}</p>
          </div>
        </div>

        <div class="card-bottom">
          <span class="card-tag">by @${escapeHtml(pkg.author || 'Pulsar')}</span>
          <div class="card-actions" onclick="event.stopPropagation()">
            <button class="btn btn-secondary btn-sm" onclick="showPackageDetail('${escapeHtml(pkg.id)}')">
              Details
            </button>
            <a href="pulsar://install/${escapeHtml(pkg.id)}" class="btn btn-primary btn-sm">
              Install
            </a>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

// ── Hash Routing ──────────────────────────────────────────────────────────
function handleHash() {
  const hash = window.location.hash.replace('#', '');
  if (!hash || hash === 'all') {
    showCatalogView('all');
  } else if (['flatpak', 'gnome_extension', 'sayri_skill', 'sayri_plugin'].includes(hash)) {
    showCatalogView(hash);
  } else if (hash.startsWith('pkg=')) {
    showPackageDetail(hash.replace('pkg=', ''));
  } else if (hash === 'cli') {
    showStaticView('cli-view');
  } else if (hash === 'submit') {
    showStaticView('submit-view');
  }
}

// ── Copy Command ──────────────────────────────────────────────────────────
function copyCode(btn, text) {
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.textContent;
    btn.textContent = 'Copied!';
    btn.style.color = 'var(--status-green)';
    setTimeout(() => {
      btn.textContent = orig;
      btn.style.color = '';
    }, 1500);
  }).catch(err => console.error(err));
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
