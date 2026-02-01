// WasteLens LEVEL 1 Demo — deterministic rule-based classification

const fileInput = document.getElementById('fileInput');
const previewImg = document.getElementById('previewImg');
const scanBtn = document.getElementById('scanBtn');
const clearBtn = document.getElementById('clearBtn');
const simulateSelect = document.getElementById('simulateSelect');
const resultCard = document.getElementById('resultCard');
const categoryBadge = document.getElementById('categoryBadge');
const resultTitle = document.getElementById('resultTitle');
const guidanceText = document.getElementById('guidanceText');
const explainText = document.getElementById('explainText');

// New UI elements (scanning indicator, icon, confidence, environmental impact)
const scanningIndicator = document.getElementById('scanningIndicator');
const categoryIcon = document.getElementById('categoryIcon');
const confidenceBar = document.getElementById('confidenceBar');
const confidencePercent = document.getElementById('confidencePercent');
const envImpact = document.getElementById('envImpact');

let currentFileName = '';

// Initialize WasteLens data storage for dashboard integration
function initWasteLensData() {
  const data = JSON.parse(localStorage.getItem('wasteLens_data') || '{"itemsClassified": 0, "classifications": []}');
  if (!data.itemsClassified) data.itemsClassified = 0;
  if (!data.classifications) data.classifications = [];
  return data;
}

// Save classification to localStorage
function saveWasteLensClassification(category) {
  const data = initWasteLensData();
  data.itemsClassified = (data.itemsClassified || 0) + 1;
  data.classifications.push({
    category: category,
    timestamp: new Date().toISOString(),
    fileName: currentFileName
  });
  localStorage.setItem('wasteLens_data', JSON.stringify(data));
}

fileInput.addEventListener('change', (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  currentFileName = file.name || '';
  const url = URL.createObjectURL(file);
  previewImg.src = url;
});

// Allow clicking the preview area to open file selector
document.getElementById('previewWrap').addEventListener('click', () => fileInput.click());

clearBtn.addEventListener('click', () => {
  fileInput.value = '';
  currentFileName = '';
  previewImg.src = './assets/placeholder.svg';
  resultCard.classList.add('hidden');
});

scanBtn.addEventListener('click', () => {
  // Show scanning UI and disable controls briefly (simulate processing delay)
  scanningIndicator.classList.remove('hidden');
  resultCard.classList.add('hidden');
  scanBtn.disabled = true;
  clearBtn.disabled = true;
  scanBtn.textContent = 'Scanning…';

  setTimeout(() => {
    const sim = simulateSelect.value; // 'auto' or one of the simulate types
    const sourceInfo = { source: sim === 'auto' ? 'filename' : 'manual-sim', value: sim };

    const classification = classifyWaste({ filename: currentFileName, simulate: sim });
    displayResult(classification, sourceInfo);

    // Restore UI
    scanningIndicator.classList.add('hidden');
    scanBtn.disabled = false;
    clearBtn.disabled = false;
    scanBtn.textContent = 'Scan Waste';
  }, 1000); // 1 second scanning animation
});

function classifyWaste({ filename = '', simulate = 'auto' }) {
  const fname = (filename || '').toLowerCase();

  // Mapping of simulated label to category
  const simMap = {
    food: { category: 'Compostable', rule: "Selected 'Food / Organic'" },
    paper: { category: 'Recyclable', rule: "Selected 'Paper / Cardboard'" },
    plastic: { category: 'Recyclable', rule: "Selected 'Plastic'" },
    glass: { category: 'Recyclable', rule: "Selected 'Glass'" },
    metal: { category: 'Recyclable', rule: "Selected 'Metal / Can'" },
    cloth: { category: 'Reusable', rule: "Selected 'Clothing / Textile'" },
    reusable: { category: 'Reusable', rule: "Selected 'Reusable item'" },
    unknown: { category: 'Landfill', rule: "Selected 'Unknown / Ambiguous' (conservative default)" }
  };

  if (simulate !== 'auto' && simMap[simulate]) {
    return { category: simMap[simulate].category, reason: simMap[simulate].rule };
  }

  // Auto rules based on filename keywords (deterministic & explainable)
  const rules = [
    { keywords: ['banana', 'apple', 'food', 'peel', 'compost'], category: 'Compostable', reason: "Filename keyword matched (food/compost)" },

    { keywords: ['paper', 'newspaper', 'cardboard', 'box', 'carton'], category: 'Recyclable', reason: "Filename keyword matched (paper/cardboard)" },

    { keywords: ['plastic', 'bottle', 'container', 'cup', 'utensil', 'straw'], category: 'Recyclable', reason: "Filename keyword matched (plastic)" },

    { keywords: ['glass', 'jar', 'bottle-glass'], category: 'Recyclable', reason: "Filename keyword matched (glass)" },

    { keywords: ['metal', 'can', 'cola-can', 'tin'], category: 'Recyclable', reason: "Filename keyword matched (metal)" },

    { keywords: ['shirt', 'tshirt', 'cloth', 'jeans', 'fabric'], category: 'Reusable', reason: "Filename keyword matched (textile)" },

    { keywords: ['battery', 'diaper', 'hazard', 'broken'], category: 'Landfill', reason: "Filename keyword matched (hazard/broken)" }
  ];

  for (const r of rules) {
    for (const kw of r.keywords) {
      if (fname.includes(kw)) return { category: r.category, reason: `Filename contains "${kw}" -> ${r.reason}` };
    }
  }

  // Fallback: conservatively classify as landfill with guidance to check local rules
  return { category: 'Landfill', reason: 'No rule matched filename; using conservative default (Landfill). Use local disposal guidelines.' };
}

function displayResult({ category, reason }, sourceInfo) {
  // Category styles for badge and card
  const colors = {
    Compostable: { badgeBg: 'bg-emerald-100', badgeText: 'text-emerald-800', cardBg: 'bg-emerald-50', cardBorder: 'border-emerald-100', bar: 'bg-emerald-500' },
    Recyclable: { badgeBg: 'bg-sky-100', badgeText: 'text-sky-800', cardBg: 'bg-sky-50', cardBorder: 'border-sky-100', bar: 'bg-sky-500' },
    Reusable: { badgeBg: 'bg-yellow-100', badgeText: 'text-yellow-800', cardBg: 'bg-yellow-50', cardBorder: 'border-yellow-100', bar: 'bg-yellow-400' },
    Landfill: { badgeBg: 'bg-rose-100', badgeText: 'text-rose-800', cardBg: 'bg-rose-50', cardBorder: 'border-rose-100', bar: 'bg-rose-500' }
  };

  const guidance = {
    Compostable: 'Put food scraps and accepted organics in your local compost/organics bin. Avoid plastics and coated items. Check local program for accepted materials.',
    Recyclable: 'Place clean, dry recyclables in the recycling bin. Rinse containers when possible and flatten cardboard. Check local sorting rules to avoid contamination.',
    Reusable: 'Consider reusing, donating, or repairing this item. Clean and pass on to local reuse centers or textile donation services.',
    Landfill: 'Dispose in your regular waste bin. If the item may be hazardous (batteries, electronics), consult local hazardous waste instructions.'
  };

  // Icon mapping and environmental impact messages
  const icons = { Compostable: '🌱', Recyclable: '♻️', Reusable: '🔁', Landfill: '🗑️' };
  const envMsgs = {
    Compostable: 'Composting reduces methane emissions and returns nutrients to soil.',
    Recyclable: 'Recycling saves energy and reduces landfill usage.',
    Reusable: 'Reusing items reduces resource extraction and waste generation.',
    Landfill: 'Landfilling increases greenhouse gases and uses valuable space; consider alternatives when possible.'
  };

  const c = colors[category] || { badgeBg: 'bg-gray-100', badgeText: 'text-gray-800', cardBg: 'bg-white', cardBorder: 'border-gray-100', bar: 'bg-gray-500' };

  // Set badge styling and text
  categoryBadge.className = `inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${c.badgeBg} ${c.badgeText}`;
  categoryBadge.textContent = category;

  // Set icon
  categoryIcon.textContent = icons[category] || '';

  // Set title and guidance
  resultTitle.textContent = `${category}`;
  guidanceText.textContent = guidance[category] || 'Follow local disposal instructions.';

  // Set environmental impact message
  envImpact.textContent = envMsgs[category] || '';

  // Simulate a deterministic 'rule-based' confidence between 70 and 90%
  const confidence = Math.floor(Math.random() * 21) + 70; // 70..90
  confidencePercent.textContent = `${confidence}%`;
  confidenceBar.style.width = `${confidence}%`;
  confidenceBar.className = `h-2 rounded ${c.bar}`;

  // Color the result card background and border according to category
  resultCard.className = `p-4 rounded-md border ${c.cardBorder} ${c.cardBg}`;

  // Explainability info
  explainText.innerHTML = `${reason}. <span class="font-medium">Input source:</span> ${sourceInfo.source === 'filename' ? `filename (${currentFileName || '—'})` : sourceInfo.value}`;

  resultCard.classList.remove('hidden');

  // Focus the result for screen readers
  resultCard.setAttribute('tabindex', '-1');
  resultCard.focus();
  
  // Save classification to localStorage for dashboard integration
  saveWasteLensClassification(category);
}

// Optional: allow Enter/Space to trigger scan
scanBtn.addEventListener('keyup', (e) => { if (e.key === ' ' || e.key === 'Enter') scanBtn.click(); });

// Small safety: if no file and simulate is auto, prompt user to choose or simulate
document.getElementById('previewWrap').addEventListener('click', () => {
  // no-op; just help click target
});

// ------------------------------
// Dark mode toggle (simple & persistent)
// ------------------------------
const darkToggle = document.getElementById('darkToggle');

// Apply or remove the .dark class on <body>, update the toggle icon, and store preference
function setDarkMode(isDark) {
  document.body.classList.toggle('dark', isDark);
  // Update icon for clarity
  darkToggle.textContent = isDark ? '☀️' : '🌙';
  // Persist choice (optional): '1' for dark, '0' for light
  localStorage.setItem('wl-dark', isDark ? '1' : '0');
}

// Initialize theme from stored preference or system setting
const stored = localStorage.getItem('wl-dark');
const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
const initDark = stored === '1' ? true : (stored === '0' ? false : prefersDark);
setDarkMode(initDark);

// Toggle when the button is clicked
darkToggle.addEventListener('click', () => setDarkMode(!document.body.classList.contains('dark')));

// Accessibility: allow Enter/Space to toggle via keyboard
darkToggle.addEventListener('keyup', (e) => { if (e.key === 'Enter' || e.key === ' ') darkToggle.click(); });

