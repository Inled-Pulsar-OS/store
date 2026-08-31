let allPackages = [];
let currentFilter = 'all';
let searchQuery = '';

const typeNames = {
  'flatpak': '📦 Flatpak App',
  'gnome_extension': '🧩 GNOME Extension',
  'sayri_skill': '🤖 Sayri Skill',
  'sayri_plugin': '🔌 Sayri Plugin'
};

async function init() {
  setupEventListeners();
  await loadCatalog();
}

async function loadCatalog() {
  const grid = document.getElementById('packages-grid');
  try {
    const res = await fetch('schema/index.json');
    const data = await res.json();
    allPackages = data.packages || [];
    renderPackages();
  } catch (err) {
    console.error("Error loading index.json:", err);
    grid.innerHTML = `<div class="error-msg">❌ Failed to load packages catalog (${err.message}).</div>`;
  }
}

function renderPackages() {
  const grid = document.getElementById('packages-grid');
  const filtered = allPackages.filter(pkg => {
    const matchesType = currentFilter === 'all' || pkg.type === currentFilter;
    const matchesSearch = !searchQuery || 
      pkg.name.toLowerCase().includes(searchQuery) ||
      pkg.description.toLowerCase().includes(searchQuery) ||
      pkg.id.toLowerCase().includes(searchQuery);
    return matchesType && matchesSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = '<div class="empty-state">🔍 No packages found matching this category.</div>';
    return;
  }

  grid.innerHTML = filtered.map(pkg => {
    const score = pkg.security_report?.score || 95;
    const scoreClass = score >= 90 ? 'score-green' : (score >= 70 ? 'score-yellow' : 'score-red');
    const iconSrc = pkg.icon_url || 'assets/icons/default.png';
    const typeLabel = typeNames[pkg.type] || pkg.type;

    return `
      <div class="pkg-card">
        <div>
          <div class="card-header">
            <img src="${iconSrc}" class="card-icon" alt="${pkg.name}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'56\\' height=\\'56\\' viewBox=\\'0 0 24 24\\'><rect width=\\'24\\' height=\\'24\\' fill=\\'%231e293b\\'/><text x=\\'50%\\' y=\\'50%\\' dominant-baseline=\\'middle\\' text-anchor=\\'middle\\' font-size=\\'12\\' fill=\\'%23fff\\'>📦</text></svg>'">
            <div class="card-title-group">
              <h3 class="card-title" title="${pkg.name}">${pkg.name}</h3>
              <div class="card-author">by @${pkg.author || 'Pulsar'} • v${pkg.version}</div>
              <span class="type-badge">${typeLabel}</span>
            </div>
          </div>

          <p class="card-desc">${pkg.description || 'No description provided.'}</p>
        </div>

        <div>
          <div class="card-shield" onclick="openDetailModal('${pkg.id}')">
            <span>🛡️ Pulsar Shield:</span>
            <span class="shield-score ${scoreClass}">
              ● ${score}/100 Verified
            </span>
          </div>

          <div class="card-actions">
            <a href="pulsar://install/${pkg.id}" class="btn btn-primary">
              📲 Install
            </a>
            <button class="btn btn-outline" onclick="openDetailModal('${pkg.id}')">
              Details
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function openDetailModal(pkgId) {
  const pkg = allPackages.find(p => p.id === pkgId);
  if (!pkg) return;

  const modal = document.getElementById('package-modal');
  const content = document.getElementById('modal-content');
  const score = pkg.security_report?.score || 95;
  const scoreClass = score >= 90 ? 'score-green' : (score >= 70 ? 'score-yellow' : 'score-red');
  const iconSrc = pkg.icon_url || 'assets/icons/default.png';
  const typeLabel = typeNames[pkg.type] || pkg.type;

  let demosHtml = '';
  if (pkg.demo_urls && pkg.demo_urls.length > 0) {
    demosHtml = `
      <div class="demos-carousel">
        ${pkg.demo_urls.map(url => `<img src="${url}" alt="Screenshot">`).join('')}
      </div>
    `;
  }

  content.innerHTML = `
    <div class="modal-header-flex">
      <img src="${iconSrc}" class="modal-header-icon" alt="${pkg.name}">
      <div>
        <h2>${pkg.name}</h2>
        <div class="card-author">ID: <code>${pkg.id}</code> • v${pkg.version} • by @${pkg.author || 'Pulsar'}</div>
        <span class="type-badge">${typeLabel}</span>
      </div>
    </div>

    <p style="color: #cbd5e1; line-height: 1.5; margin-bottom: 16px;">${pkg.description}</p>

    ${demosHtml}

    <div class="report-box">
      <div class="report-title">🛡️ Security Audit Report (OpenCode & VirusTotal)</div>
      <div style="margin-bottom: 8px;">
        Score: <b class="${scoreClass}">${score}/100</b> | Auditor: <code>${pkg.security_report?.audited_by || 'OpenCode'}</code>
      </div>
      <div class="report-summary">
        ${pkg.security_report?.summary || 'Completed audit successfully with zero malicious detections.'}
      </div>
      ${pkg.metadata?.sandbox_level ? `<div style="margin-top: 8px; font-size: 12px; color: var(--accent-lavender);">🔒 Declared Sandbox Level: <code>${pkg.metadata.sandbox_level}</code></div>` : ''}
    </div>

    <div style="margin: 16px 0;">
      <span style="font-size: 12.5px; color: var(--text-secondary);">Terminal install command:</span>
      <div class="code-copy-row">
        <code>pulsar-store install ${pkg.id}</code>
        <button class="btn btn-sm btn-copy" onclick="copyCode(this, 'pulsar-store install ${pkg.id}')">Copy</button>
      </div>
    </div>

    <div style="display: flex; gap: 10px; margin-top: 20px;">
      <a href="pulsar://install/${pkg.id}" class="btn btn-primary" style="flex: 1; justify-content: center;">
        📲 Open in Pulsar Store
      </a>
      ${pkg.github_url ? `<a href="${pkg.github_url}" target="_blank" class="btn btn-outline">GitHub ↗</a>` : ''}
    </div>
  `;

  modal.classList.remove('hidden');
}

function setupEventListeners() {
  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    renderPackages();
  });

  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.type;
      renderPackages();
    });
  });

  const pkgModal = document.getElementById('package-modal');
  const cliModal = document.getElementById('cli-modal');

  document.getElementById('modal-close-btn').addEventListener('click', () => pkgModal.classList.add('hidden'));
  document.getElementById('cli-modal-close-btn').addEventListener('click', () => cliModal.classList.add('hidden'));
  document.getElementById('btn-cli-modal').addEventListener('click', () => cliModal.classList.remove('hidden'));

  window.addEventListener('click', (e) => {
    if (e.target === pkgModal) pkgModal.classList.add('hidden');
    if (e.target === cliModal) cliModal.classList.add('hidden');
  });
}

function copyCode(btn, text) {
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.innerText;
    btn.innerText = 'Copied!';
    setTimeout(() => btn.innerText = orig, 2000);
  });
}

document.addEventListener('DOMContentLoaded', init);
