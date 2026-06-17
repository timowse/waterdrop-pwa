const CATALOG = [
  { slug: 'cola',               name: 'Cola',               emoji: '🥤', category: 'vitamins',      catLabel: 'Hydration + Vitamins',      price: 8.99,  servings: 12 },
  { slug: 'citroen-limoen',     name: 'Citroen Limoen',     emoji: '🍋', category: 'vitamins',      catLabel: 'Hydration + Vitamins',      price: 8.99,  servings: 12 },
  { slug: 'appel',              name: 'Appel',               emoji: '🍎', category: 'vitamins',      catLabel: 'Hydration + Vitamins',      price: 8.99,  servings: 12 },
  { slug: 'sinaasappel',        name: 'Sinaasappel',        emoji: '🍊', category: 'vitamins',      catLabel: 'Hydration + Vitamins',      price: 8.99,  servings: 12 },
  { slug: 'citroen',            name: 'Citroen',            emoji: '🍋', category: 'vitamins',      catLabel: 'Hydration + Vitamins',      price: 8.99,  servings: 12 },
  { slug: 'grapefruit',         name: 'Grapefruit',         emoji: '🍈', category: 'vitamins',      catLabel: 'Hydration + Vitamins',      price: 8.99,  servings: 12 },
  { slug: 'ice-tea-perzik',     name: 'Ice Tea Perzik',     emoji: '🍑', category: 'vitamins',      catLabel: 'Hydration + Vitamins',      price: 8.99,  servings: 12 },
  { slug: 'pink-lemonade',      name: 'Pink Lemonade',      emoji: '🌸', category: 'vitamins',      catLabel: 'Hydration + Vitamins',      price: 8.99,  servings: 12 },
  { slug: 'mojito',             name: 'Mojito',             emoji: '🍸', category: 'limited',       catLabel: 'Limited Edition',           price: 9.99,  servings: 12 },
  { slug: 'evergreen-fusion',   name: 'Evergreen Fusion',   emoji: '🌿', category: 'limited',       catLabel: 'Limited Edition',           price: 9.99,  servings: 12 },
  { slug: 'paradise-fusion',    name: 'Paradise Fusion',    emoji: '🌴', category: 'limited',       catLabel: 'Limited Edition',           price: 9.99,  servings: 12 },
  { slug: 'wildberry-fusion',   name: 'Wildberry Fusion',   emoji: '🫐', category: 'limited',       catLabel: 'Limited Edition',           price: 9.99,  servings: 12 },
  { slug: 'cherry-boost',       name: 'Cherry Boost',       emoji: '🍒', category: 'energy',        catLabel: 'Hydration + Energy',        price: 9.99,  servings: 12 },
  { slug: 'berry-boost',        name: 'Berry Boost',        emoji: '🫐', category: 'energy',        catLabel: 'Hydration + Energy',        price: 9.99,  servings: 12 },
  { slug: 'turbo-boost',        name: 'Turbo Boost',        emoji: '⚡', category: 'energy',        catLabel: 'Hydration + Energy',        price: 9.99,  servings: 12 },
  { slug: 'mango-boost',        name: 'Mango Boost',        emoji: '🥭', category: 'energy',        catLabel: 'Hydration + Energy',        price: 9.99,  servings: 12 },
  { slug: 'orange-recharge',    name: 'Orange Recharge',    emoji: '🍊', category: 'electrolytes',  catLabel: 'Hydration + Electrolytes',  price: 10.99, servings: 12 },
  { slug: 'strawberry-recharge',name: 'Strawberry Recharge',emoji: '🍓', category: 'electrolytes',  catLabel: 'Hydration + Electrolytes',  price: 10.99, servings: 12 },
  { slug: 'lemon-mint-recharge',name: 'Lemon-Mint Recharge',emoji: '🍃', category: 'electrolytes',  catLabel: 'Hydration + Electrolytes',  price: 10.99, servings: 12 },
  { slug: 'grapefruit-recharge',name: 'Grapefruit Recharge',emoji: '🍈', category: 'electrolytes',  catLabel: 'Hydration + Electrolytes',  price: 10.99, servings: 12 },
  { slug: 'berry-recharge',     name: 'Berry Recharge',     emoji: '🫐', category: 'electrolytes',  catLabel: 'Hydration + Electrolytes',  price: 10.99, servings: 12 },
];

const STORAGE_KEY = 'waterdrops-v2';
const OLD_KEY     = 'waterdrops-pwa-state-v1';

const currFmt = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
const fmtMoney = (v) => currFmt.format(Number(v) || 0);
const fmtMoneyCompact = (v) => {
  const s = fmtMoney(v);
  return s.endsWith(',00') ? s.slice(0, -3) : s;
};

// ── STATE ──────────────────────────────────────────────────
function defaultState() {
  return {
    history: [],
    inventory: Object.fromEntries(CATALOG.map(i => [i.slug, { count: 0 }])),
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(OLD_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    const s = defaultState();
    if (Array.isArray(parsed.history)) s.history = parsed.history.filter(Boolean);
    const inv = parsed.inventory ?? parsed.state?.inventory;
    if (inv && typeof inv === 'object') {
      for (const item of CATALOG) {
        const e = inv[item.slug];
        if (e != null) s.inventory[item.slug] = { count: Math.max(0, Math.trunc(Number(e.count) || 0)) };
      }
    }
    return s;
  } catch {
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = loadState();

// ── HELPERS ────────────────────────────────────────────────
const slugToItem = (slug) => CATALOG.find(i => i.slug === slug);
const nowISO = () => new Date().toISOString();
const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function localDateKey(ts = Date.now()) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function getCount(slug) {
  return Number(state.inventory[slug]?.count || 0);
}

// ── TOAST ──────────────────────────────────────────────────
let _toastTimer;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
}

function haptic(pattern = [12]) {
  try { navigator.vibrate?.(pattern); } catch {}
}

// ── STATS ──────────────────────────────────────────────────
function computeStats() {
  const left   = Object.values(state.inventory).reduce((s, e) => s + Number(e?.count || 0), 0);
  const spent  = state.history.filter(e => e.type === 'purchase').reduce((s, e) => s + Number(e.price || 0), 0);
  const drinks = state.history.filter(e => e.type === 'drink').reduce((s, e) => s + Number(e.amount || 0), 0);
  return { left, spent, drinks, perDrop: drinks > 0 ? spent / drinks : 0, streak: computeStreak() };
}

function computeStreak() {
  const days = new Set(state.history.filter(e => e.type === 'drink').map(e => localDateKey(e.at)));
  if (!days.size) return 0;
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 3660; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (days.has(localDateKey(d))) streak++;
    else if (i > 0) break;
  }
  return streak;
}

// ── ACTIONS ────────────────────────────────────────────────
function record(type, slug, amount, extra = {}) {
  state.history.unshift({ type, slug, amount, at: nowISO(), ...extra });
}

function drinkOne(slug) {
  const item = slugToItem(slug);
  if (!item) return;
  const count = getCount(slug);
  if (count <= 0) {
    showToast(`Keine ${item.name} mehr – pack kaufen!`);
    return;
  }
  state.inventory[slug] = { count: count - 1 };
  record('drink', slug, 1);
  saveState();
  haptic([15]);
  showToast(`${item.emoji} ${item.name} getrunken`);
  renderHome();
  renderDrink(slug);
}

function addPack(slug) {
  const item = slugToItem(slug);
  if (!item) return;
  state.inventory[slug] = { count: getCount(slug) + 12 };
  record('purchase', slug, 12, { price: item.price });
  saveState();
  haptic([15, 60, 15]);
  showToast(`✅ 12× ${item.name} hinzugefügt`);
  renderHome();
  renderAdd();
  renderDrink();
}

// ── TAB SWITCHING ──────────────────────────────────────────
let activeTab = 'home';

function switchTab(name) {
  if (activeTab === name) {
    document.getElementById('view-' + name)?.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  activeTab = name;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => {
    const on = b.dataset.view === name;
    b.classList.toggle('active', on);
    b.setAttribute('aria-selected', on ? 'true' : 'false');
  });
  document.getElementById('view-' + name)?.classList.add('active');
}

// ── RENDER HOME ────────────────────────────────────────────
function renderHome() {
  const { left, spent, drinks, perDrop, streak } = computeStats();

  document.getElementById('hero-left').textContent = String(left);
  document.getElementById('s-streak').textContent = String(streak);
  document.getElementById('s-drinks').textContent = String(drinks);
  document.getElementById('s-spent').textContent = fmtMoneyCompact(spent);
  document.getElementById('s-perdrop').textContent = drinks > 0 ? fmtMoneyCompact(perDrop) : '—';

  const stockEl = document.getElementById('home-stock');
  const stocked = CATALOG
    .filter(item => getCount(item.slug) > 0)
    .sort((a, b) => getCount(b.slug) - getCount(a.slug));

  if (!stocked.length) {
    stockEl.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">🛒</span>
        <p class="empty-text">Noch keine Drops da. Kauf dein erstes Pack!</p>
        <button class="cta-btn" id="home-buy-btn">Pack kaufen</button>
      </div>`;
    document.getElementById('home-buy-btn').addEventListener('click', () => switchTab('add'));
    return;
  }

  stockEl.innerHTML = `<div class="stock-list">${stocked.map(item => `
    <div class="stock-row">
      <span class="stock-emoji">${item.emoji}</span>
      <div class="stock-info">
        <div class="stock-name">${esc(item.name)}</div>
        <div class="stock-cat">${esc(item.catLabel)}</div>
      </div>
      <span class="stock-count">${getCount(item.slug)}</span>
    </div>`).join('')}
  </div>`;
}

// ── RENDER DRINK ───────────────────────────────────────────
function renderDrink(animSlug) {
  const stocked = CATALOG.filter(item => getCount(item.slug) > 0);
  const total   = stocked.reduce((s, i) => s + getCount(i.slug), 0);
  const grid    = document.getElementById('drink-grid');
  const sub     = document.getElementById('drink-sub');

  sub.textContent = total > 0 ? `${total} Drops verfügbar` : 'Kein Vorrat';

  if (!stocked.length) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <span class="empty-icon">💧</span>
        <p class="empty-text">Kein Vorrat mehr.<br>Zeit fürs Einkaufen!</p>
        <button class="cta-btn" id="drink-buy-btn">Pack kaufen</button>
      </div>`;
    document.getElementById('drink-buy-btn').addEventListener('click', () => switchTab('add'));
    return;
  }

  grid.innerHTML = stocked.map(item => {
    const count = getCount(item.slug);
    const anim  = item.slug === animSlug ? ' count-pop' : '';
    return `
      <button class="drink-card cat-${esc(item.category)}${anim}" data-slug="${esc(item.slug)}"
              aria-label="${esc(item.name)} trinken (${count} übrig)">
        <span class="drink-card-badge">${count}</span>
        <span class="drink-card-emoji">${item.emoji}</span>
        <span class="drink-card-name">${esc(item.name)}</span>
      </button>`;
  }).join('');

  grid.querySelectorAll('.drink-card').forEach(card => {
    card.addEventListener('click', () => drinkOne(card.dataset.slug));
  });
}

// ── RENDER ADD ─────────────────────────────────────────────
let activeCat = 'all';

const CATS = [
  { key: 'all',          label: 'Alle' },
  { key: 'vitamins',     label: 'Vitamins' },
  { key: 'energy',       label: 'Energy ⚡' },
  { key: 'electrolytes', label: 'Electrolytes' },
  { key: 'limited',      label: 'Limited ✨' },
];

function renderAdd() {
  const pills = document.getElementById('cat-pills');
  pills.innerHTML = CATS.map(c => `
    <button class="cat-pill${activeCat === c.key ? ' active' : ''}" data-cat="${c.key}">${c.label}</button>
  `).join('');
  pills.querySelectorAll('.cat-pill').forEach(p => {
    p.addEventListener('click', () => { activeCat = p.dataset.cat; renderAdd(); });
  });

  const filtered = activeCat === 'all' ? CATALOG : CATALOG.filter(i => i.category === activeCat);
  const list     = document.getElementById('add-list');

  list.innerHTML = filtered.map(item => {
    const count = getCount(item.slug);
    return `
      <div class="add-row">
        <span class="add-emoji">${item.emoji}</span>
        <div class="add-info">
          <div class="add-name">${esc(item.name)}</div>
          <div class="add-meta">
            <span class="add-stock-badge">${count} übrig</span>
            <span class="add-cat">${esc(item.catLabel)}</span>
          </div>
        </div>
        <div class="add-right">
          <span class="add-price">${fmtMoney(item.price)}</span>
          <button class="add-btn" data-slug="${esc(item.slug)}" aria-label="${esc(item.name)} Pack kaufen">+12</button>
        </div>
      </div>`;
  }).join('');

  list.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', () => addPack(btn.dataset.slug));
  });
}

// ── BACKUP ─────────────────────────────────────────────────
function exportBackup() {
  const blob = new Blob(
    [JSON.stringify({ exportedAt: nowISO(), version: 2, state }, null, 2)],
    { type: 'application/json' }
  );
  const url = URL.createObjectURL(blob);
  const a   = Object.assign(document.createElement('a'), { href: url, download: `waterdrops-${localDateKey()}.json` });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast('📤 Backup exportiert');
}

function importBackup(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result || '{}'));
      const src    = parsed.state || parsed;
      if (!src || typeof src !== 'object') throw new Error('Ungültiges Backup');
      const next   = defaultState();
      const history = Array.isArray(src.history) ? src.history : [];
      next.history  = history.filter(Boolean);
      const inv     = src.inventory;
      if (inv && typeof inv === 'object') {
        for (const item of CATALOG) {
          const e = inv[item.slug];
          if (e != null) next.inventory[item.slug] = { count: Math.max(0, Math.trunc(Number(e.count) || 0)) };
        }
      }
      state = next;
      saveState();
      renderHome();
      renderDrink();
      renderAdd();
      showToast('📥 Backup importiert');
    } catch (err) {
      showToast(`Fehler: ${err.message}`);
    }
  };
  reader.readAsText(file);
}

// ── WIRE UP EVENTS ─────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.view));
});

document.getElementById('btn-export').addEventListener('click', exportBackup);

document.getElementById('import-file').addEventListener('change', (e) => {
  const file = e.target.files?.[0];
  if (file) importBackup(file);
  e.target.value = '';
});

document.getElementById('btn-reset').addEventListener('click', () => {
  if (!confirm('Alle Daten löschen? Das kann nicht rückgängig gemacht werden.')) return;
  state = defaultState();
  saveState();
  renderHome();
  renderDrink();
  renderAdd();
  showToast('Alle Daten gelöscht');
});

// ── SERVICE WORKER ──────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}

// ── INIT ───────────────────────────────────────────────────
renderHome();
renderDrink();
renderAdd();
