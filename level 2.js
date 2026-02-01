/* ShelfLife AI - Level 2 (Simulation)
   Rule-based shelf-life estimates for demo purposes only.
*/

// --- Shelf-life definitions (base days at room storage) ---
const SHELF_LIFE_BASE = {
  milk: 7,
  eggs: 21,
  bread: 3,
  chicken: 2,
  'ground beef': 2,
  apples: 30,
  bananas: 5,
  lettuce: 7,
  cheese: 14,
  yogurt: 14,
  tofu: 7,
  rice: 180,
  pasta: 365
};

const STORAGE_FACTOR = {
  room: 1,
  refrigerated: 1.5,
  frozen: 4
};

// LocalStorage key
const STORAGE_KEY = 'shelflife_items_v1';

// Utility: parse date and compute difference in days
function daysBetween(dateA, dateB) {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((dateB - dateA) / msPerDay);
}

function todayWithOffset(offsetDays = 0) {
  const d = new Date();
  d.setHours(0,0,0,0);
  d.setDate(d.getDate() + offsetDays);
  return d;
}

function getBaseShelfLife(name) {
  const key = name.toLowerCase();
  for (const k of Object.keys(SHELF_LIFE_BASE)) {
    if (key.includes(k)) return SHELF_LIFE_BASE[k];
  }
  // fallback default
  return 5;
}

function compute(item, simOffset = 0) {
  const purchase = new Date(item.purchaseDate);
  purchase.setHours(0,0,0,0);
  const now = todayWithOffset(simOffset);
  const daysSince = daysBetween(purchase, now);

  const base = getBaseShelfLife(item.name);
  const factor = STORAGE_FACTOR[item.storage] || 1;
  const adjusted = Math.round(base * factor);
  const remaining = Math.round(adjusted - daysSince);

  let status = 'safe';
  if (remaining < 0) status = 'risk';
  else if (remaining < 3) status = 'warn';

  return { base, factor, adjusted, daysSince, remaining, status };
}

// Persistence
function loadItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to parse items', e);
    return [];
  }
}

function saveItems(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

// DOM helpers
const $ = id => document.getElementById(id);

function formatDate(d) {
  const dt = new Date(d);
  return dt.toLocaleDateString();
}

function createBadge(status, text) {
  const span = document.createElement('span');
  span.className = 'badge';
  if (status === 'safe') span.classList.add('bg-emerald-100','text-emerald-800');
  else if (status === 'warn') span.classList.add('bg-amber-100','text-amber-800');
  else span.classList.add('bg-rose-100','text-rose-800');
  span.textContent = text;
  return span;
}

function renderItems(simOffset = 0) {
  const items = loadItems();
  const container = $('items');
  container.innerHTML = '';

  if (items.length === 0) {
    $('empty').style.display = 'block';
    return;
  }
  $('empty').style.display = 'none';

  // sort by urgency (risk first, then warn, then safe), then remaining days ascending
  items.sort((a,b) => {
    const aC = compute(a, simOffset);
    const bC = compute(b, simOffset);
    const order = {'risk': 0, 'warn':1, 'safe':2};
    if (order[aC.status] !== order[bC.status]) return order[aC.status] - order[bC.status];
    return aC.remaining - bC.remaining;
  });

  for (const item of items) {
    const c = compute(item, simOffset);
    // persist latest computed status to item for transparency
    item.lastStatus = c.status;
    item.lastRemaining = c.remaining;
    item.lastCheckedAt = new Date().toISOString();

    const card = document.createElement('div');
    card.className = 'bg-white p-4 rounded-lg shadow flex flex-col md:flex-row md:items-center md:justify-between gap-3 fade-in-up card-bg';

    const left = document.createElement('div');
    left.className = 'flex-1';
    left.innerHTML = `<div class="flex items-baseline gap-3">
      <h3 class="font-semibold text-lg">${escapeHtml(item.name)}</h3>
      <small class="text-slate-500">${formatDate(item.purchaseDate)} • ${item.storage}</small>
    </div>`;

    const mid = document.createElement('div');
    mid.className = 'mt-2 md:mt-0 text-sm text-slate-600';
    mid.innerHTML = `<div>Base: <strong>${c.base}d</strong> • Adjusted: <strong>${c.adjusted}d</strong></div>
                     <div>Days since purchase: <strong>${c.daysSince}d</strong></div>`;

    const right = document.createElement('div');
    right.className = 'flex items-center gap-3';

    const badgeText = c.remaining < 0 ? `${Math.abs(c.remaining)} day(s) past` : `${c.remaining} day(s) left`;
    const badge = createBadge(c.status, badgeText);
    badge.classList.add('countdown');

    const suggestion = document.createElement('div');
    suggestion.className = 'text-sm text-slate-700';
    if (c.status === 'safe') suggestion.innerHTML = `<div class="text-emerald-700">Safe: consume within ${c.remaining} day(s).</div>`;
    else if (c.status === 'warn') suggestion.innerHTML = `<div class="text-amber-700">Consume soon: ${c.remaining} day(s) left.</div>`;
    else suggestion.innerHTML = `<div class="text-rose-700">High spoilage risk: ${Math.abs(c.remaining)} day(s) past — consider using immediately and check quality.</div>`;

    const actions = document.createElement('div');
    actions.className = 'flex gap-2';

    const useBtn = document.createElement('button');
    useBtn.className = 'px-3 py-1 text-sm rounded bg-sky-600 text-white hover:bg-sky-700';
    useBtn.textContent = 'Mark Consumed';
    useBtn.onclick = () => {
      markConsumed(item.id);
    };

    const delBtn = document.createElement('button');
    delBtn.className = 'px-3 py-1 text-sm rounded border text-slate-700 hover:bg-slate-100';
    delBtn.textContent = 'Remove';
    delBtn.onclick = () => {
      removeItem(item.id);
    };

    actions.appendChild(useBtn);
    actions.appendChild(delBtn);

    right.appendChild(badge);
    right.appendChild(suggestion);
    right.appendChild(actions);

    const content = document.createElement('div');
    content.className = 'flex-1 md:flex md:items-center md:justify-between gap-4';
    content.appendChild(left);
    const meta = document.createElement('div');
    meta.className = 'md:flex md:items-center gap-6';
    meta.appendChild(mid);
    meta.appendChild(right);
    content.appendChild(meta);

    card.appendChild(content);
    container.appendChild(card);
  }
  // persist last computed statuses so saved data includes latest prediction snapshot
  saveItems(items);
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

// Actions
function addItem(name, purchaseDate, storage) {
  const items = loadItems();
  const item = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2,6),
    name: name.trim(),
    purchaseDate,
    storage
  };
  items.push(item);
  saveItems(items);
  renderItems(parseInt($('sim-days').value, 10));
}

function removeItem(id) {
  const items = loadItems().filter(i => i.id !== id);
  saveItems(items);
  renderItems(parseInt($('sim-days').value, 10));
}

function markConsumed(id) {
  // For prevention focus we simply remove item and show quick toast
  removeItem(id);
  // simple ephemeral UI - alert
  showToast('Marked as consumed — good job preventing waste!');
}

function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-2 rounded shadow';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// Helpers for storage toggles and preview
function getSelectedStorage() {
  const active = document.querySelector('.storage-btn.storage-active');
  return active ? active.getAttribute('data-storage') : 'refrigerated';
}

function setSelectedStorage(key) {
  const buttons = Array.from(document.querySelectorAll('.storage-btn'));
  buttons.forEach(b => {
    if (b.getAttribute('data-storage') === key) {
      b.classList.add('storage-active');
      b.setAttribute('aria-pressed','true');
    } else {
      b.classList.remove('storage-active');
      b.setAttribute('aria-pressed','false');
    }
  });
}

function setupStorageToggles() {
  const buttons = Array.from(document.querySelectorAll('.storage-btn'));
  buttons.forEach(b => {
    b.addEventListener('click', () => {
      setSelectedStorage(b.getAttribute('data-storage'));
      localStorage.setItem('shelflife_last_storage', getSelectedStorage());
      updatePreview();
    });
    b.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); b.click(); }
    });
  });
}

// Theme handling: toggle and persist dark/light mode
function applyTheme(theme) {
  // apply an explicit `dark` or `light` class to <body>
  if (theme === 'dark') {
    document.body.classList.add('dark');
    document.body.classList.remove('light');
  } else {
    document.body.classList.add('light');
    document.body.classList.remove('dark');
  }

  localStorage.setItem('shelflife_theme', theme);
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  // update accessible attributes and visible label/icon
  btn.setAttribute('aria-checked', theme === 'dark' ? 'true' : 'false');
  btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
  const icon = btn.querySelector('#theme-icon');
  const label = btn.querySelector('#theme-label');
  if (icon) icon.textContent = theme === 'dark' ? '🌙' : '☀️';
  if (label) label.textContent = theme === 'dark' ? 'Dark Mode' : 'Light Mode';

  // announce theme change to assistive tech (non-intrusive)
  const live = document.getElementById('theme-live');
  if (live) live.textContent = theme === 'dark' ? 'Dark mode enabled' : 'Light mode enabled';
}

function setupThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  const saved = localStorage.getItem('shelflife_theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  applyTheme(saved);
  btn.addEventListener('click', () => {
    const next = document.body.classList.contains('dark') ? 'light' : 'dark';
    applyTheme(next);
  });
}

function updatePreview() {
  const name = $('food-name').value || 'Example item';
  const dateVal = $('purchase-date').value;
  const storage = getSelectedStorage();
  const simOffset = parseInt($('sim-days').value, 10) || 0;
  const preview = $('preview');
  preview.innerHTML = '';

  if (!dateVal) return;
  const tempItem = { name, purchaseDate: dateVal, storage };
  const c = compute(tempItem, simOffset);

  const card = document.createElement('div');
  card.className = 'p-3 rounded-md border text-sm fade-in-up preview-card';
  card.innerHTML = `<div class="flex items-start justify-between gap-3">
    <div>
      <div class="preview-title">Preview — ${escapeHtml(name)}</div>
      <div class="preview-meta">Purchased: ${formatDate(dateVal)} — Storage: ${storage}</div>
    </div>
    <div id="preview-meta" class="text-right"></div>
  </div>`;

  const meta = card.querySelector('#preview-meta');
  const badgeText = c.remaining < 0 ? `${Math.abs(c.remaining)} day(s) past` : `${c.remaining} day(s) left`;
  const badge = createBadge(c.status, badgeText);
  meta.appendChild(badge);
  const suggestion = document.createElement('div');
  suggestion.className = 'mt-2 text-xs';
  if (c.status === 'safe') suggestion.innerHTML = `<span class="text-emerald-700">Safe: consume within ${c.remaining} day(s).</span>`;
  else if (c.status === 'warn') suggestion.innerHTML = `<span class="text-amber-700">Consume soon: ${c.remaining} day(s) left.</span>`;
  else suggestion.innerHTML = `<span class="text-rose-700">High spoilage risk: ${Math.abs(c.remaining)} day(s) past — consider using immediately.</span>`;
  card.appendChild(suggestion);

  const actions = document.createElement('div');
  actions.className = 'mt-3 flex gap-2';
  const quickAdd = document.createElement('button');
  quickAdd.className = 'btn-primary px-3 py-1 rounded text-sm';
  quickAdd.textContent = 'Add this item';
  quickAdd.onclick = () => {
    addItem(name, dateVal, storage);
    showTempSuccess();
  };
  actions.appendChild(quickAdd);
  card.appendChild(actions);

  preview.appendChild(card);
}

function showTempSuccess() {
  const addBtn = $('add-btn');
  const spinner = $('add-spinner');
  const success = $('add-success');
  addBtn.disabled = true;
  spinner.classList.remove('hidden');
  setTimeout(() => {
    spinner.classList.add('hidden');
    success.classList.remove('hidden');
    setTimeout(() => {
      success.classList.add('hidden');
      addBtn.disabled = false;
      updatePreview();
    }, 900);
  }, 700);
}

// Enhance createBadge with animation hooks
function createBadge(status, text) {
  const span = document.createElement('span');
  span.className = 'badge fade-in-up';
  if (status === 'safe') span.classList.add('badge-safe');
  else if (status === 'warn') span.classList.add('badge-warn');
  else { span.classList.add('badge-risk'); span.classList.add('risk-pulse'); }
  span.textContent = text;
  return span;
}

// Init - enhanced with toggles, instant preview, persisted sim offset and storage
function init() {
  setupStorageToggles();

  const lastStorage = localStorage.getItem('shelflife_last_storage') || 'refrigerated';
  setSelectedStorage(lastStorage);

  const form = $('food-form');
  const addBtn = $('add-btn');
  const spinner = $('add-spinner');
  const success = $('add-success');

  form.onsubmit = e => {
    e.preventDefault();
    const name = $('food-name').value;
    const date = $('purchase-date').value;
    const storage = getSelectedStorage();
    if (!name || !date) return showToast('Please fill name and purchase date.');

    // feedback
    addBtn.disabled = true;
    spinner.classList.remove('hidden');

    setTimeout(() => {
      addItem(name, date, storage);
      spinner.classList.add('hidden');
      success.classList.remove('hidden');
      setTimeout(() => {
        success.classList.add('hidden');
        addBtn.disabled = false;
        form.reset();
        // keep storage selection
        setSelectedStorage(storage);
        // reset purchase date to today
        const today = new Date();
        $('purchase-date').value = today.toISOString().slice(0,10);
        updatePreview();
      }, 900);
    }, 700);
  };

  // simulate offset persistence
  const savedOffset = parseInt(localStorage.getItem('shelflife_sim_offset') || '0', 10);
  $('sim-days').value = isNaN(savedOffset) ? 0 : savedOffset;
  $('sim-days').oninput = e => {
    const v = parseInt(e.target.value, 10);
    $('sim-label').textContent = `${v} day(s)`;
    const d = todayWithOffset(v);
    $('sim-date').textContent = d.toLocaleDateString();
    localStorage.setItem('shelflife_sim_offset', String(v));
    renderItems(v);
    updatePreview();
  };

  $('reset-sim').onclick = () => {
    $('sim-days').value = 0;
    $('sim-label').textContent = '0 day(s)';
    $('sim-date').textContent = 'Today';
    localStorage.setItem('shelflife_sim_offset', '0');
    renderItems(0);
    updatePreview();
  };

  // inputs update preview instantly
  $('food-name').addEventListener('input', updatePreview);
  $('purchase-date').addEventListener('input', updatePreview);

  // set default dates: set purchase date to today
  const today = new Date();
  $('purchase-date').value = today.toISOString().slice(0,10);

  // initial UI
  const initOffset = parseInt($('sim-days').value, 10) || 0;
  $('sim-label').textContent = `${initOffset} day(s)`;
  $('sim-date').textContent = todayWithOffset(initOffset).toLocaleDateString();

  renderItems(initOffset);
  updatePreview();

  // theme toggle initialization
  setupThemeToggle();
}


// Premium Sync Integration
async function premiumSyncToN8N() {
  const statusDiv = document.getElementById('premium-sync-status');
  statusDiv.textContent = 'Syncing...';
  const items = loadItems();
  try {
    const resp = await fetch('https://harinikishore.app.n8n.cloud/webhook-test/720d2a22-d186-4efa-a6d9-bb6bc9394716', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, timestamp: new Date().toISOString() })
    });
    if (resp.ok) {
      statusDiv.textContent = '✅ Synced to cloud successfully!';
    } else {
      statusDiv.textContent = '❌ Sync failed. Please try again.';
    }
  } catch (e) {
    statusDiv.textContent = '❌ Sync error. Check your connection.';
  }
}

// Start
document.addEventListener('DOMContentLoaded', () => {
  init();
  const btn = document.getElementById('premium-sync');
  if (btn) btn.onclick = premiumSyncToN8N;
});
