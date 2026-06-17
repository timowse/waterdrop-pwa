const CATALOG = [
  { slug: 'cola', name: 'COLA', category: 'Hydration + Vitamins', price: 8.99, servings: 12, note: 'Official NL price' },
  { slug: 'citroen-limoen', name: 'CITROEN LIMOEN', category: 'Hydration + Vitamins', price: 8.99, servings: 12, note: 'Official NL price' },
  { slug: 'appel', name: 'APPEL', category: 'Hydration + Vitamins', price: 8.99, servings: 12, note: 'Official NL price' },
  { slug: 'mojito', name: 'MOJITO', category: 'Hydration + Vitamins', price: 9.99, servings: 12, note: 'Limited edition' },
  { slug: 'evergreen-fusion', name: 'EVERGREEN FUSION', category: 'Hydration + Vitamins', price: 9.99, servings: 12, note: 'Limited edition' },
  { slug: 'sinaasappel', name: 'SINAASAPPEL', category: 'Hydration + Vitamins', price: 8.99, servings: 12, note: 'Official NL price' },
  { slug: 'paradise-fusion', name: 'PARADISE FUSION', category: 'Hydration + Vitamins', price: 9.99, servings: 12, note: 'Limited edition' },
  { slug: 'wildberry-fusion', name: 'WILDBERRY FUSION', category: 'Hydration + Vitamins', price: 9.99, servings: 12, note: 'Limited edition' },
  { slug: 'pink-lemonade', name: 'PINK LEMONADE', category: 'Hydration + Vitamins', price: 8.99, servings: 12, note: 'Official site listing' },
  { slug: 'citroen', name: 'CITROEN', category: 'Hydration + Vitamins', price: 8.99, servings: 12, note: 'Official NL price' },
  { slug: 'grapefruit', name: 'GRAPEFRUIT', category: 'Hydration + Vitamins', price: 8.99, servings: 12, note: 'Official NL price' },
  { slug: 'ice-tea-perzik', name: 'ICE TEA PERZIK', category: 'Hydration + Vitamins', price: 8.99, servings: 12, note: 'Official NL price' },
  { slug: 'cherry-boost', name: 'CHERRY BOOST', category: 'Hydration + Energy', price: 9.99, servings: 12, note: 'Natural caffeine' },
  { slug: 'berry-boost', name: 'BERRY BOOST', category: 'Hydration + Energy', price: 9.99, servings: 12, note: 'Natural caffeine' },
  { slug: 'turbo-boost', name: 'TURBO BOOST', category: 'Hydration + Energy', price: 9.99, servings: 12, note: 'Natural caffeine' },
  { slug: 'mango-boost', name: 'MANGO BOOST', category: 'Hydration + Energy', price: 9.99, servings: 12, note: 'Natural caffeine' },
  { slug: 'orange-recharge', name: 'ORANGE RECHARGE', category: 'Hydration + Electrolytes', price: 10.99, servings: 12, note: 'Electrolytes' },
  { slug: 'strawberry-recharge', name: 'STRAWBERRY RECHARGE', category: 'Hydration + Electrolytes', price: 10.99, servings: 12, note: 'Electrolytes' },
  { slug: 'lemon-mint-recharge', name: 'LEMON-MINT RECHARGE', category: 'Hydration + Electrolytes', price: 10.99, servings: 12, note: 'Electrolytes' },
  { slug: 'grapefruit-recharge', name: 'GRAPEFRUIT RECHARGE', category: 'Hydration + Electrolytes', price: 10.99, servings: 12, note: 'Electrolytes' },
  { slug: 'berry-recharge', name: 'BERRY RECHARGE', category: 'Hydration + Electrolytes', price: 10.99, servings: 12, note: 'Electrolytes' },
];

const STORAGE_KEY = 'waterdrops-pwa-state-v1';
const money = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
const dateFmt = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

const els = {
  statLeft: document.getElementById('stat-left'),
  statSpent: document.getElementById('stat-spent'),
  statPerDrink: document.getElementById('stat-per-drink'),
  statStreak: document.getElementById('stat-streak'),
  sourceNote: document.getElementById('source-note'),
  inventory: document.getElementById('inventory'),
  search: document.getElementById('search'),
  packFlavour: document.getElementById('pack-flavour'),
  packPrice: document.getElementById('pack-price'),
  addPack: document.getElementById('add-pack'),
  exportBtn: document.getElementById('save-backup'),
  importFile: document.getElementById('import-file'),
  resetData: document.getElementById('reset-data'),
};

const defaultState = () => ({
  selectedFlavor: CATALOG[0].slug,
  history: [],
  inventory: Object.fromEntries(CATALOG.map((item) => [item.slug, { count: 0 }]))
});

let state = loadState();

function slugToItem(slug) {
  return CATALOG.find((item) => item.slug === slug);
}

function nowISO() {
  return new Date().toISOString();
}

function localDateKey(ts = Date.now()) {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function fmtMoney(value) {
  return money.format(Number(value || 0));
}

function fmtDate(ts) {
  return dateFmt.format(new Date(ts));
}

function loadState() {
  const fallback = defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    const merged = defaultState();
    if (parsed && typeof parsed === 'object') {
      merged.selectedFlavor = CATALOG.some((item) => item.slug === parsed.selectedFlavor)
        ? parsed.selectedFlavor
        : merged.selectedFlavor;
      if (Array.isArray(parsed.history)) merged.history = parsed.history.filter(Boolean);
      if (parsed.inventory && typeof parsed.inventory === 'object') {
        for (const item of CATALOG) {
          const existing = parsed.inventory[item.slug];
          merged.inventory[item.slug] = {
            count: Number.isFinite(existing?.count) ? Math.max(0, Math.trunc(existing.count)) : 0,
          };
        }
      }
    }
    return merged;
  } catch {
    return fallback;
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function record(type, slug, amount, extra = {}) {
  state.history.unshift({
    type,
    slug,
    amount,
    at: nowISO(),
    ...extra,
  });
}

function setCount(slug, nextCount, source = 'manual') {
  const item = slugToItem(slug);
  if (!item) return;
  const current = Number(state.inventory[slug]?.count || 0);
  const next = Math.max(0, Math.trunc(Number(nextCount) || 0));
  state.inventory[slug] = { count: next };
  const diff = next - current;
  if (source === 'manual' && diff !== 0) {
    record('adjust', slug, diff);
  }
  saveState();
  render();
}

function addPack(slug) {
  const item = slugToItem(slug);
  if (!item) return;
  state.inventory[slug] = { count: Number(state.inventory[slug]?.count || 0) + 12 };
  record('purchase', slug, 12, { price: item.price });
  saveState();
  render();
}

function drinkOne(slug) {
  const item = slugToItem(slug);
  if (!item) return;
  const current = Number(state.inventory[slug]?.count || 0);
  if (current <= 0) {
    flashSearch(`No ${item.name} left`);
    return;
  }
  state.inventory[slug] = { count: current - 1 };
  record('drink', slug, 1);
  saveState();
  render();
}

function computeStats() {
  const left = Object.values(state.inventory).reduce((sum, entry) => sum + Number(entry?.count || 0), 0);
  const spent = state.history
    .filter((entry) => entry.type === 'purchase')
    .reduce((sum, entry) => sum + Number(entry.price || 0), 0);
  const drinks = state.history
    .filter((entry) => entry.type === 'drink')
    .reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
  const averagePerDrink = drinks > 0 ? spent / drinks : 0;
  return { left, spent, drinks, averagePerDrink, streak: computeStreak() };
}

function computeStreak() {
  const days = new Set(state.history.filter((entry) => entry.type === 'drink').map((entry) => localDateKey(entry.at)));
  if (days.size === 0) return 0;
  const today = new Date();
  let streak = 0;
  for (let offset = 0; offset < 3660; offset += 1) {
    const probe = new Date(today);
    probe.setDate(today.getDate() - offset);
    const key = localDateKey(probe);
    if (days.has(key)) {
      streak += 1;
    } else if (offset === 0) {
      continue;
    } else {
      break;
    }
  }
  return streak;
}

function flashSearch(message) {
  alert(message);
}

function renderHeader() {
  els.sourceNote.innerHTML = [
    badge('Official waterdrop® flavours'),
    badge('Local storage only'),
    badge('Offline ready PWA'),
  ].join('');
}

function badge(text) {
  return `<span class="badge">${escapeHtml(text)}</span>`;
}

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function renderStats() {
  const { left, spent, drinks, averagePerDrink, streak } = computeStats();
  els.statLeft.textContent = String(left);
  els.statSpent.textContent = fmtMoney(spent);
  els.statPerDrink.textContent = drinks > 0 ? fmtMoney(averagePerDrink) : '—';
  els.statStreak.textContent = `${streak} day${streak === 1 ? '' : 's'}`;
}

function renderPackPicker() {
  const currentSlug = state.selectedFlavor;
  els.packFlavour.innerHTML = CATALOG.map((item) => `<option value="${item.slug}">${escapeHtml(item.name)} • ${fmtMoney(item.price)}</option>`).join('');
  els.packFlavour.value = currentSlug;
  syncPackPrice();
}

function syncPackPrice() {
  const selected = slugToItem(els.packFlavour.value) || slugToItem(state.selectedFlavor);
  els.packPrice.value = selected ? `${fmtMoney(selected.price)} for 12` : '';
}

function renderInventory() {
  const query = els.search.value.trim().toLowerCase();
  const items = CATALOG.filter((item) => {
    if (!query) return true;
    return [item.name, item.category, item.note, String(item.price)].some((field) => String(field).toLowerCase().includes(query));
  });

  if (!items.length) {
    els.inventory.innerHTML = '<div class="empty-state">No flavours match your search.</div>';
    return;
  }

  els.inventory.innerHTML = items.map((item) => {
    const entry = state.inventory[item.slug] || { count: 0 };
    const spent = state.history.filter((h) => h.type === 'purchase' && h.slug === item.slug).reduce((sum, h) => sum + Number(h.price || 0), 0);
    const drinks = state.history.filter((h) => h.type === 'drink' && h.slug === item.slug).reduce((sum, h) => sum + Number(h.amount || 0), 0);
    const avg = drinks > 0 ? spent / drinks : 0;
    return `
      <article class="flavour-card">
        <div class="flavour-top">
          <div>
            <h3 class="flavour-name">${escapeHtml(item.name)}</h3>
            <p class="flavour-meta">${escapeHtml(item.category)} · ${escapeHtml(item.note)}</p>
          </div>
          <span class="price-pill">${fmtMoney(item.price)}</span>
        </div>
        <div class="type-pill">12 drinks per pack</div>
        <div class="count-row">
          <div>
            <div class="count-big">${entry.count}</div>
            <div class="count-copy">${drinks} logged drink${drinks === 1 ? '' : 's'} · ${spent > 0 ? `${fmtMoney(spent)} spent` : 'no purchase yet'}</div>
          </div>
          <div class="count-copy">${drinks > 0 ? `Avg ${fmtMoney(avg)} / drink` : 'Buy a pack to see cost stats'}</div>
        </div>
        <div class="actions">
          <button class="tiny-btn minus" type="button" data-action="drink" data-slug="${item.slug}">-1</button>
          <button class="tiny-btn plus" type="button" data-action="purchase" data-slug="${item.slug}">+12</button>
          <button class="tiny-btn set" type="button" data-action="focus-set" data-slug="${item.slug}">Set</button>
        </div>
        <div class="manual-row">
          <input type="number" min="0" inputmode="numeric" value="${entry.count}" data-manual-input="${item.slug}" aria-label="Set count for ${escapeHtml(item.name)}" />
          <button class="ghost-btn" type="button" data-action="apply-set" data-slug="${item.slug}">Save</button>
        </div>
      </article>
    `;
  }).join('');

  els.inventory.querySelectorAll('[data-action="drink"]').forEach((btn) => {
    btn.addEventListener('click', () => drinkOne(btn.dataset.slug));
  });
  els.inventory.querySelectorAll('[data-action="purchase"]').forEach((btn) => {
    btn.addEventListener('click', () => addPack(btn.dataset.slug));
  });
  els.inventory.querySelectorAll('[data-action="focus-set"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = els.inventory.querySelector(`[data-manual-input="${btn.dataset.slug}"]`);
      input?.focus();
      input?.select();
    });
  });
  els.inventory.querySelectorAll('[data-action="apply-set"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = els.inventory.querySelector(`[data-manual-input="${btn.dataset.slug}"]`);
      setCount(btn.dataset.slug, input?.value || 0, 'manual');
    });
  });
}

function render() {
  renderHeader();
  renderStats();
  renderPackPicker();
  renderInventory();
}

function exportBackup() {
  const blob = new Blob([JSON.stringify({ exportedAt: nowISO(), catalog: CATALOG, state }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `waterdrops-backup-${localDateKey()}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function importBackup(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result || '{}'));
      if (!parsed || typeof parsed !== 'object' || !parsed.state) throw new Error('Invalid backup');
      const incoming = parsed.state;
      const next = defaultState();
      next.selectedFlavor = CATALOG.some((item) => item.slug === incoming.selectedFlavor) ? incoming.selectedFlavor : next.selectedFlavor;
      if (Array.isArray(incoming.history)) next.history = incoming.history.filter(Boolean);
      if (incoming.inventory && typeof incoming.inventory === 'object') {
        for (const item of CATALOG) {
          const existing = incoming.inventory[item.slug];
          next.inventory[item.slug] = { count: Number.isFinite(existing?.count) ? Math.max(0, Math.trunc(existing.count)) : 0 };
        }
      }
      state = next;
      saveState();
      render();
    } catch (error) {
      alert(`Could not import backup: ${error.message}`);
    }
  };
  reader.readAsText(file);
}

els.packFlavour.addEventListener('change', () => {
  state.selectedFlavor = els.packFlavour.value;
  saveState();
  syncPackPrice();
});

els.addPack.addEventListener('click', () => addPack(els.packFlavour.value));
els.search.addEventListener('input', () => renderInventory());
els.exportBtn.addEventListener('click', exportBackup);
els.importFile.addEventListener('change', (event) => {
  const file = event.target.files?.[0];
  if (file) importBackup(file);
  event.target.value = '';
});
els.resetData.addEventListener('click', () => {
  const ok = confirm('Reset all local waterdrop data? This cannot be undone.');
  if (!ok) return;
  state = defaultState();
  saveState();
  render();
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

render();
