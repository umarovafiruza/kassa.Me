/**
 * ==========================================================================
 * OILAVIY XARAJATLAR TRACKER - APPLE HIG & WALLET JAVASCRIPT
 * Uslub: Apple Human Interface Guidelines, Vanilla JS, Toza arxitektura
 * ==========================================================================
 */

'use strict';

// 1. STATIK SOZLAMALAR VA KONSTANTALAR
const STORAGE_KEY = 'apple_family_expenses_tracker_v2';
const THEME_STORAGE_KEY = 'apple_family_theme_preference_v2';

// Kategoriyalar
const CATEGORIES = [
  'Oziq-ovqat',
  'Kommunal',
  'Transport',
  'Ta\'lim',
  'Sog‘liq',
  'Boshqa'
];

// Kategoriya rang/badge klasslari
const CATEGORY_BADGES = {
  'Oziq-ovqat': 'badge-ozik-ovkat',
  'Kommunal': 'badge-kommunal',
  'Transport': 'badge-transport',
  'Ta\'lim': 'badge-talim',
  'Sog‘liq': 'badge-soglik',
  'Boshqa': 'badge-boshqa'
};

// Oila a'zolari konfiguratsiyasi (Apple Family)
const FAMILY_MEMBERS = [
  { id: 'ota', name: 'Ota', initial: 'O', avatarClass: 'avatar-ota' },
  { id: 'ona', name: 'Ona', initial: 'O', avatarClass: 'avatar-ona' },
  { id: 'men', name: 'Men', initial: 'M', avatarClass: 'avatar-men' },
  { id: 'farzand', name: 'Farzandlar', initial: 'F', avatarClass: 'avatar-farzand' },
  { id: 'umumiy', name: 'Umumiy', initial: 'U', avatarClass: 'avatar-umumiy' }
];

// Namunaviy ma'lumotlar (Ilk tashrifda dastur qulay va to'liq ko'rinishi uchun)
const INITIAL_DEMO_DATA = [
  {
    id: 'exp-demo-1',
    name: 'Haftalik oziq-ovqat (Korzinka)',
    amount: 720000,
    category: 'Oziq-ovqat',
    member: 'Ona',
    timestamp: Date.now() - 1000 * 60 * 60 * 20 // Bugun
  },
  {
    id: 'exp-demo-2',
    name: 'Elektr va gaz to‘lovi',
    amount: 380000,
    category: 'Kommunal',
    member: 'Ota',
    timestamp: Date.now() - 1000 * 60 * 60 * 36 // Kecha
  },
  {
    id: 'exp-demo-3',
    name: 'Avtomobil yoqilg‘isi',
    amount: 250000,
    category: 'Transport',
    member: 'Men',
    timestamp: Date.now() - 1000 * 60 * 60 * 50
  },
  {
    id: 'exp-demo-4',
    name: 'Dasturlash kursi to‘lovi',
    amount: 600000,
    category: 'Ta\'lim',
    member: 'Farzandlar',
    timestamp: Date.now() - 1000 * 60 * 60 * 80
  },
  {
    id: 'exp-demo-5',
    name: 'Dorixona va vitaminlar',
    amount: 140000,
    category: 'Sog‘liq',
    member: 'Ona',
    timestamp: Date.now() - 1000 * 60 * 60 * 120
  }
];

// 2. TELEGRAM WEBAPP VA ILOVA HOLATI
const tg = window.Telegram?.WebApp;

// Haptic feedback (Taktil tebranishlar)
function tgHaptic(type = 'light') {
  try {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred(type);
    }
  } catch (e) {}
}

function tgNotification(type = 'success') {
  try {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.notificationOccurred(type);
    }
  } catch (e) {}
}

function tgSelection() {
  try {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.selectionChanged();
    }
  } catch (e) {}
}

const state = {
  expenses: [],
  selectedMemberForNewExpense: 'Ota',
  activePeriodFilter: 'all', // 'all', 'month', 'week'
  activeFilterType: 'all', // 'all', 'category', 'member'
  activeFilterValue: 'all',
  currentTheme: 'system', // 'system', 'light', 'dark'
  currentTab: 'viewHome'
};

// 3. DOM ELEMENTLARI
const elements = {
  // Theme & Meta
  themeToggleBtn: document.getElementById('themeToggleBtn'),
  metaThemeColor: document.getElementById('metaThemeColor'),
  currentDateText: document.getElementById('currentDateText'),
  tgUserGreeting: document.getElementById('tgUserGreeting'),

  // Dropdown menu & Export
  dataMenuBtn: document.getElementById('dataMenuBtn'),
  dataDropdownMenu: document.getElementById('dataDropdownMenu'),
  exportCsvBtn: document.getElementById('exportCsvBtn'),
  exportJsonBtn: document.getElementById('exportJsonBtn'),
  importJsonInput: document.getElementById('importJsonInput'),
  clearAllBtn: document.getElementById('clearAllBtn'),

  // Wallet Hero Card
  totalAmount: document.getElementById('totalAmount'),
  totalCountBadge: document.getElementById('totalCountBadge'),
  averageAmount: document.getElementById('averageAmount'),
  topCategoryName: document.getElementById('topCategoryName'),
  activeMembersAvatars: document.getElementById('activeMembersAvatars'),

  // Quick Action
  openAddSheetBtn: document.getElementById('openAddSheetBtn'),

  // Sheet Modal & Form
  sheetBackdrop: document.getElementById('sheetBackdrop'),
  closeSheetBtn: document.getElementById('closeSheetBtn'),
  expenseForm: document.getElementById('expenseForm'),
  expenseAmountInput: document.getElementById('expenseAmount'),
  expenseNameInput: document.getElementById('expenseName'),
  expenseCategorySelect: document.getElementById('expenseCategory'),
  expenseDateInput: document.getElementById('expenseDate'),
  memberPicker: document.getElementById('memberPicker'),
  amountError: document.getElementById('amountError'),
  nameErrorRow: document.getElementById('nameErrorRow'),

  // Analytics & Tabs
  tabCategories: document.getElementById('tabCategories'),
  tabMembers: document.getElementById('tabMembers'),
  categoriesStatsView: document.getElementById('categoriesStatsView'),
  membersStatsView: document.getElementById('membersStatsView'),
  categoryStatsList: document.getElementById('categoryStatsList'),
  memberStatsList: document.getElementById('memberStatsList'),

  // History & Filters
  historyCounterText: document.getElementById('historyCounterText'),
  pillsBar: document.getElementById('pillsBar'),
  expenseList: document.getElementById('expenseList'),
  emptyState: document.getElementById('emptyState'),
  loadDemoBtn: document.getElementById('loadDemoBtn'),

  // Mobile Bottom Tab Bar & Home Widgets
  bottomNavBar: document.getElementById('bottomNavBar'),
  barAddActionBtn: document.getElementById('barAddActionBtn'),
  homeRecentList: document.getElementById('homeRecentList'),
  homeRecentSubtitle: document.getElementById('homeRecentSubtitle'),
  homeMiniStats: document.getElementById('homeMiniStats'),
  goToHistoryLink: document.getElementById('goToHistoryLink')
};

// 4. FORMATLASH VA YORDAMCHI FUNKSIYALAR

/**
 * Valyutani o'zbek so'mida formatlash (masalan: 1 250 000 so‘m)
 */
function formatCurrency(amount) {
  const formatted = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formatted} so‘m`;
}

/**
 * Sanani o'qilishi oson Apple uslubida ko'rsatish
 */
function formatDate(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const timeStr = date.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });

  if (isToday) {
    return `Bugun, ${timeStr}`;
  } else if (isYesterday) {
    return `Kecha, ${timeStr}`;
  } else {
    const monthsUz = [
      'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
      'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'
    ];
    return `${date.getDate()}-${monthsUz[date.getMonth()]}, ${timeStr}`;
  }
}

/**
 * XSS xavfini bartaraf etish
 */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * A'zo nomiga qarab uning konfiguratsiyasini olish
 */
function getMemberConfig(name) {
  return FAMILY_MEMBERS.find(m => m.name.toLowerCase() === (name || '').toLowerCase()) || {
    id: 'umumiy',
    name: name || 'Umumiy',
    initial: (name && name[0]) || 'U',
    avatarClass: 'avatar-umumiy'
  };
}

// 5. MAVZU VA TUNGI REJIM (DARK / LIGHT THEME)

function initTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'system';
  setTheme(savedTheme, false);
}

function setTheme(theme, save = true) {
  state.currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  if (save) {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }

  // Meta theme-color yangilash
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  if (elements.metaThemeColor) {
    elements.metaThemeColor.setAttribute('content', isDark ? '#000000' : '#f2f2f7');
  }
}

function toggleTheme() {
  const activeIsDark = document.documentElement.getAttribute('data-theme') === 'dark' ||
    (document.documentElement.getAttribute('data-theme') === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const nextTheme = activeIsDark ? 'light' : 'dark';
  setTheme(nextTheme, true);
}

// 6. LOCALSTORAGE & TELEGRAM CLOUDSTORAGE BOSHQARUVI

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      state.expenses = [...INITIAL_DEMO_DATA];
      saveData();
    } else {
      state.expenses = JSON.parse(raw) || [];
    }
  } catch (e) {
    console.error('Ma’lumotlarni o‘qishda xatolik:', e);
    state.expenses = [];
  }

  // Telegram CloudStorage tekshirish (agar mavjud bo'lsa)
  if (tg?.CloudStorage) {
    try {
      tg.CloudStorage.getItem(STORAGE_KEY, (err, cloudVal) => {
        if (!err && cloudVal) {
          try {
            const cloudExpenses = JSON.parse(cloudVal);
            if (Array.isArray(cloudExpenses) && cloudExpenses.length > 0) {
              state.expenses = cloudExpenses;
              localStorage.setItem(STORAGE_KEY, cloudVal);
              updateUI();
            }
          } catch (pe) {}
        }
      });
    } catch (ce) {}
  }
}

function saveData() {
  try {
    const serialized = JSON.stringify(state.expenses);
    localStorage.setItem(STORAGE_KEY, serialized);

    // Telegram CloudStorage ga zaxira qilish
    if (tg?.CloudStorage) {
      tg.CloudStorage.setItem(STORAGE_KEY, serialized, (err) => {
        if (err) console.warn('Telegram CloudStorage xatolik:', err);
      });
    }
  } catch (e) {
    console.error('Ma’lumotlarni saqlashda xatolik:', e);
  }
}

// 7. ASOSIY INTERFEYSNI RENDER QILISH

function updateUI() {
  renderDateHeader();
  renderWalletCard();
  renderHomePreview();
  renderAnalytics();
  renderHistoryList();
}

/**
 * Asosiy sahifa (Home Tab) uchun so'nggi amallar va mini vidjetlarni render qilish
 */
function renderHomePreview() {
  if (!elements.homeRecentList) return;

  const recent = [...state.expenses].sort((a, b) => b.timestamp - a.timestamp).slice(0, 3);
  elements.homeRecentList.innerHTML = '';

  if (recent.length === 0) {
    elements.homeRecentList.innerHTML = `
      <li class="ios-list-item" style="justify-content: center; color: var(--ios-text-secondary); font-size: 0.8125rem; padding: 14px 0;">
        Hozircha xarajatlar mavjud emas
      </li>
    `;
  } else {
    recent.forEach(expense => {
      const memberCfg = getMemberConfig(expense.member);
      const badgeClass = CATEGORY_BADGES[expense.category] || 'badge-boshqa';

      const li = document.createElement('li');
      li.className = 'ios-list-item';
      li.innerHTML = `
        <div class="item-left">
          <div class="member-avatar ${memberCfg.avatarClass}" title="${escapeHtml(memberCfg.name)}">
            ${memberCfg.initial}
          </div>
          <div class="item-texts">
            <div class="item-title-row">
              <span class="item-title">${escapeHtml(expense.name)}</span>
              <span class="ios-badge ${badgeClass}">${escapeHtml(expense.category)}</span>
            </div>
            <span class="item-meta">${escapeHtml(memberCfg.name)} &bull; ${formatDate(expense.timestamp)}</span>
          </div>
        </div>
        <div class="item-right">
          <span class="item-amount">- ${formatCurrency(expense.amount)}</span>
        </div>
      `;
      elements.homeRecentList.appendChild(li);
    });
  }

  // Home mini vidjet: eng ko'p xarajat qilingan kategoriyalar
  if (elements.homeMiniStats) {
    const catTotals = {};
    state.expenses.forEach(e => {
      catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;
    });

    const sortedCats = Object.entries(catTotals)
      .filter(([_, amt]) => amt > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    elements.homeMiniStats.innerHTML = '';

    if (sortedCats.length === 0) {
      elements.homeMiniStats.innerHTML = '<span style="font-size:0.8rem;color:var(--ios-text-secondary);padding:6px 0;">Hozircha ma’lumotlar yo‘q</span>';
    } else {
      sortedCats.forEach(([cat, amount]) => {
        const div = document.createElement('div');
        div.className = 'widget-stat-card';
        div.innerHTML = `
          <span class="widget-stat-label">${escapeHtml(cat)}</span>
          <span class="widget-stat-amount">${formatCurrency(amount)}</span>
        `;
        elements.homeMiniStats.appendChild(div);
      });
    }
  }
}

function renderDateHeader() {
  const now = new Date();
  const monthsUz = [
    'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
    'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'
  ];
  const daysUz = [
    'Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'
  ];
  elements.currentDateText.textContent = `${now.getDate()}-${monthsUz[now.getMonth()]}, ${now.getFullYear()} (${daysUz[now.getDay()]})`;
}

/**
 * Apple Wallet Hero Card render qilish
 */
function renderWalletCard() {
  const totalAmount = state.expenses.reduce((sum, item) => sum + item.amount, 0);
  const totalCount = state.expenses.length;

  elements.totalAmount.textContent = formatCurrency(totalAmount);
  elements.totalCountBadge.textContent = `${totalCount} ta xarajat`;

  // O'rtacha xarajat
  const avg = totalCount > 0 ? totalAmount / totalCount : 0;
  elements.averageAmount.textContent = formatCurrency(avg);

  // Eng katta kategoriya
  if (totalCount === 0) {
    elements.topCategoryName.textContent = '—';
  } else {
    const catMap = {};
    state.expenses.forEach(e => {
      catMap[e.category] = (catMap[e.category] || 0) + e.amount;
    });
    let maxCat = '—';
    let maxVal = 0;
    for (const [k, v] of Object.entries(catMap)) {
      if (v > maxVal) {
        maxVal = v;
        maxCat = k;
      }
    }
    elements.topCategoryName.textContent = maxCat;
  }

  // Faol a'zolar avatarlari
  elements.activeMembersAvatars.innerHTML = '';
  const activeMemberNames = [...new Set(state.expenses.map(e => e.member || 'Ota'))];

  if (activeMemberNames.length === 0) {
    elements.activeMembersAvatars.innerHTML = '<span style="font-size:0.75rem;opacity:0.7;">Yo‘q</span>';
  } else {
    activeMemberNames.slice(0, 4).forEach(name => {
      const cfg = getMemberConfig(name);
      const span = document.createElement('span');
      span.className = `mini-avatar-badge ${cfg.avatarClass}`;
      span.textContent = cfg.initial;
      span.title = cfg.name;
      elements.activeMembersAvatars.appendChild(span);
    });
  }
}

/**
 * Xarajatlar tahlili: Kategoriyalar va Oila a'zolari progress barlari
 */
function renderAnalytics() {
  const totalAmount = state.expenses.reduce((sum, item) => sum + item.amount, 0);

  // 1. KATEGORIYALAR
  const catTotals = {};
  CATEGORIES.forEach(c => catTotals[c] = 0);
  state.expenses.forEach(e => {
    if (catTotals[e.category] !== undefined) {
      catTotals[e.category] += e.amount;
    } else {
      catTotals['Boshqa'] += e.amount;
    }
  });

  elements.categoryStatsList.innerHTML = '';
  CATEGORIES.forEach(cat => {
    const amount = catTotals[cat];
    const pct = totalAmount > 0 ? ((amount / totalAmount) * 100).toFixed(1) : 0;
    const badgeClass = CATEGORY_BADGES[cat] || 'badge-boshqa';

    const row = document.createElement('div');
    row.className = 'stat-row-item';
    row.innerHTML = `
      <div class="stat-row-header">
        <div class="stat-row-title">
          <span class="ios-badge ${badgeClass}">${escapeHtml(cat)}</span>
          <span class="stat-amount-label">${formatCurrency(amount)}</span>
        </div>
        <span class="stat-percent-badge">${pct}%</span>
      </div>
      <div class="stat-bar-track">
        <div class="stat-bar-fill" style="width: ${pct}%"></div>
      </div>
    `;
    elements.categoryStatsList.appendChild(row);
  });

  // 2. OILA A'ZOLARI
  const memberTotals = {};
  FAMILY_MEMBERS.forEach(m => memberTotals[m.name] = 0);
  state.expenses.forEach(e => {
    const mName = e.member || 'Ota';
    memberTotals[mName] = (memberTotals[mName] || 0) + e.amount;
  });

  elements.memberStatsList.innerHTML = '';
  FAMILY_MEMBERS.forEach(m => {
    const amount = memberTotals[m.name];
    const pct = totalAmount > 0 ? ((amount / totalAmount) * 100).toFixed(1) : 0;

    const row = document.createElement('div');
    row.className = 'stat-row-item';
    row.innerHTML = `
      <div class="stat-row-header">
        <div class="stat-row-title">
          <span class="mini-avatar-badge ${m.avatarClass}" style="width:20px;height:20px;font-size:0.6rem;margin-left:0;">${m.initial}</span>
          <span class="stat-name-label">${escapeHtml(m.name)}</span>
          <span class="stat-amount-label">(${formatCurrency(amount)})</span>
        </div>
        <span class="stat-percent-badge">${pct}%</span>
      </div>
      <div class="stat-bar-track">
        <div class="stat-bar-fill" style="width: ${pct}%"></div>
      </div>
    `;
    elements.memberStatsList.appendChild(row);
  });
}

/**
 * Xarajatlar tarixi (Filter, Period & Inset Grouped List)
 */
function renderHistoryList() {
  const now = new Date();
  
  // 1. Vaqt oralig'i filtri (Period)
  let periodFiltered = state.expenses.filter(e => {
    if (state.activePeriodFilter === 'all') return true;
    const expDate = new Date(e.timestamp);
    if (state.activePeriodFilter === 'month') {
      return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
    }
    if (state.activePeriodFilter === 'week') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return expDate >= oneWeekAgo;
    }
    return true;
  });

  // 2. Kategoriya yoki A'zo filtri (Pill)
  let finalFiltered = periodFiltered.filter(e => {
    if (state.activeFilterType === 'all') return true;
    if (state.activeFilterType === 'category') {
      return e.category === state.activeFilterValue;
    }
    if (state.activeFilterType === 'member') {
      return (e.member || 'Ota') === state.activeFilterValue;
    }
    return true;
  });

  // Eng yangi yuqorida
  finalFiltered.sort((a, b) => b.timestamp - a.timestamp);

  elements.historyCounterText.textContent = `${finalFiltered.length} ta qayd`;
  elements.expenseList.innerHTML = '';

  if (finalFiltered.length === 0) {
    elements.emptyState.classList.add('visible');
    elements.expenseList.style.display = 'none';
  } else {
    elements.emptyState.classList.remove('visible');
    elements.expenseList.style.display = 'flex';

    finalFiltered.forEach(expense => {
      const memberCfg = getMemberConfig(expense.member);
      const badgeClass = CATEGORY_BADGES[expense.category] || 'badge-boshqa';

      const li = document.createElement('li');
      li.className = 'ios-list-item';
      li.innerHTML = `
        <div class="item-left">
          <div class="member-avatar ${memberCfg.avatarClass}" title="${escapeHtml(memberCfg.name)}">
            ${memberCfg.initial}
          </div>
          <div class="item-texts">
            <div class="item-title-row">
              <span class="item-title">${escapeHtml(expense.name)}</span>
              <span class="ios-badge ${badgeClass}">${escapeHtml(expense.category)}</span>
            </div>
            <span class="item-meta">${escapeHtml(memberCfg.name)} &bull; ${formatDate(expense.timestamp)}</span>
          </div>
        </div>
        <div class="item-right">
          <span class="item-amount">- ${formatCurrency(expense.amount)}</span>
          <button type="button" class="btn-ios-delete" data-id="${expense.id}" title="O‘chirish" aria-label="O‘chirish">
            &times;
          </button>
        </div>
      `;
      elements.expenseList.appendChild(li);
    });
  }
}

/**
 * Gorizontal Pills (Filterlar panelini chizish)
 */
function renderFilterPills() {
  elements.pillsBar.innerHTML = `
    <button type="button" class="pill-btn ${state.activeFilterType === 'all' ? 'active' : ''}" data-filter-type="all" data-filter-value="all">
      Barchasi
    </button>
    <div class="pills-separator"></div>
  `;

  // Kategoriyalar
  CATEGORIES.forEach(cat => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `pill-btn ${state.activeFilterType === 'category' && state.activeFilterValue === cat ? 'active' : ''}`;
    btn.setAttribute('data-filter-type', 'category');
    btn.setAttribute('data-filter-value', cat);
    btn.textContent = cat;
    elements.pillsBar.appendChild(btn);
  });

  const sep = document.createElement('div');
  sep.className = 'pills-separator';
  elements.pillsBar.appendChild(sep);

  // A'zolar
  FAMILY_MEMBERS.forEach(m => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `pill-btn ${state.activeFilterType === 'member' && state.activeFilterValue === m.name ? 'active' : ''}`;
    btn.setAttribute('data-filter-type', 'member');
    btn.setAttribute('data-filter-value', m.name);
    btn.textContent = m.name;
    elements.pillsBar.appendChild(btn);
  });
}

/**
 * Sheet modalidagi a'zo tanlash tugmalarini chizish
 */
function renderMemberPicker() {
  elements.memberPicker.innerHTML = '';
  FAMILY_MEMBERS.forEach(m => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `member-pick-btn ${state.selectedMemberForNewExpense === m.name ? 'active' : ''}`;
    btn.setAttribute('data-member', m.name);
    btn.textContent = m.name;
    elements.memberPicker.appendChild(btn);
  });
}

// 8. SHEET MODAL BOSHQARUVI & FORM SUBMISSION

function openSheet() {
  tgHaptic('medium');
  elements.sheetBackdrop.classList.add('open');
  elements.sheetBackdrop.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  // Telegram Native BackButton va MainButton ni faollashtirish
  if (tg?.BackButton) {
    tg.BackButton.show();
  }
  if (tg?.MainButton) {
    tg.MainButton.setText('XARAJATNI SAQLASH');
    tg.MainButton.show();
  }

  // Bugungi sanani standart qilib qo'yish
  const todayStr = new Date().toISOString().split('T')[0];
  elements.expenseDateInput.value = todayStr;

  setTimeout(() => {
    elements.expenseAmountInput.focus();
  }, 100);
}

function closeSheet() {
  tgHaptic('light');
  elements.sheetBackdrop.classList.remove('open');
  elements.sheetBackdrop.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  elements.expenseForm.reset();
  elements.amountError.classList.remove('visible');
  elements.nameErrorRow.classList.remove('visible');

  // Telegram MainButton va BackButton holatini qayta tiklash
  if (tg?.MainButton) {
    tg.MainButton.hide();
  }
  if (tg?.BackButton) {
    if (state.currentTab !== 'viewHome') {
      tg.BackButton.show();
    } else {
      tg.BackButton.hide();
    }
  }
}

function handleFormSubmit(e) {
  e.preventDefault();

  const amountVal = parseFloat(elements.expenseAmountInput.value);
  const nameVal = elements.expenseNameInput.value.trim();
  const catVal = elements.expenseCategorySelect.value;
  const dateVal = elements.expenseDateInput.value;

  let isValid = true;

  if (isNaN(amountVal) || amountVal <= 0) {
    elements.amountError.classList.add('visible');
    isValid = false;
  } else {
    elements.amountError.classList.remove('visible');
  }

  if (!nameVal) {
    elements.nameErrorRow.classList.add('visible');
    isValid = false;
  } else {
    elements.nameErrorRow.classList.remove('visible');
  }

  if (!isValid) {
    tgNotification('error');
    return;
  }

  // Sana belgilash
  let timestamp = Date.now();
  if (dateVal) {
    const chosen = new Date(dateVal + 'T12:00:00');
    if (!isNaN(chosen.getTime())) {
      timestamp = chosen.getTime();
    }
  }

  const newExpense = {
    id: 'exp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    name: nameVal,
    amount: amountVal,
    category: catVal,
    member: state.selectedMemberForNewExpense || 'Ota',
    timestamp: timestamp
  };

  state.expenses.unshift(newExpense);
  saveData();
  tgNotification('success');
  closeSheet();
  updateUI();
}

function handleDeleteExpense(id) {
  const item = state.expenses.find(x => x.id === id);
  if (!item) return;

  tgHaptic('medium');
  const conf = window.confirm(`"${item.name}" xarajatini o‘chirishni tasdiqlaysizmi?`);
  if (!conf) return;

  state.expenses = state.expenses.filter(x => x.id !== id);
  saveData();
  tgNotification('warning');
  updateUI();
}

// 9. EKSPORT VA ZAXIRA BOSHQARUVI (CSV & JSON)

/**
 * Xarajatlarni Excel/CSV formatida yuklab olish (UTF-8 BOM bilan)
 */
function exportToCsv() {
  if (state.expenses.length === 0) {
    alert('Eksport qilish uchun xarajatlar mavjud emas.');
    return;
  }

  let csvContent = '\uFEFF'; // Excel o'zbek harflarini to'g'ri ko'rsatishi uchun UTF-8 BOM
  csvContent += 'Nomi,Summasi (so‘m),Kategoriya,Oila a’zosi,Sana\n';

  state.expenses.forEach(e => {
    const d = new Date(e.timestamp);
    const dateFormatted = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d.toLocaleTimeString('uz-UZ')}`;
    const safeName = `"${e.name.replace(/"/g, '""')}"`;
    const safeCat = `"${e.category}"`;
    const safeMember = `"${e.member || 'Ota'}"`;

    csvContent += `${safeName},${e.amount},${safeCat},${safeMember},"${dateFormatted}"\n`;
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Oilaviy_Xarajatlar_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  elements.dataDropdownMenu.classList.remove('show');
}

/**
 * Xarajatlarni JSON zaxira fayli sifatida yuklab olish
 */
function exportToJson() {
  const jsonStr = JSON.stringify(state.expenses, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `oilaviy_xarajatlar_backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  elements.dataDropdownMenu.classList.remove('show');
}

/**
 * JSON zaxira faylidan tiklash (Import)
 */
function handleImportJson(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const parsed = JSON.parse(event.target.result);
      if (Array.isArray(parsed)) {
        const conf = window.confirm(`Faylda ${parsed.length} ta xarajat topildi. Mavjud ma’lumotlarni almashtirishni xohlaysizmi?`);
        if (conf) {
          state.expenses = parsed;
          saveData();
          updateUI();
          alert('Ma’lumotlar muvaffaqiyatli tiklandi!');
        }
      } else {
        alert('Fayl formati noto‘g‘ri!');
      }
    } catch (err) {
      alert('Faylni o‘qishda xatolik yuz berdi.');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
  elements.dataDropdownMenu.classList.remove('show');
}

function handleClearAll() {
  if (state.expenses.length === 0) {
    alert('Hozircha xarajatlar yo‘q.');
    return;
  }
  const conf = window.confirm('Barcha ma’lumotlarni tozalashni xohlaysizmi? Bu amalni qaytarib bo‘lmaydi!');
  if (conf) {
    state.expenses = [];
    saveData();
    updateUI();
    elements.dataDropdownMenu.classList.remove('show');
  }
}

// 10. HODISALARNI BIRIKTIRISH (EVENT LISTENERS)

function setupEventListeners() {
  // Theme toggle
  elements.themeToggleBtn.addEventListener('click', toggleTheme);

  // Dropdown menyu ochish/yopish
  elements.dataMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    elements.dataDropdownMenu.classList.toggle('show');
  });

  document.addEventListener('click', () => {
    elements.dataDropdownMenu.classList.remove('show');
  });

  elements.dataDropdownMenu.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // Export / Import
  elements.exportCsvBtn.addEventListener('click', exportToCsv);
  elements.exportJsonBtn.addEventListener('click', exportToJson);
  elements.importJsonInput.addEventListener('change', handleImportJson);
  elements.clearAllBtn.addEventListener('click', handleClearAll);

  // Sheet Modal ochish / yopish
  elements.openAddSheetBtn.addEventListener('click', openSheet);
  elements.closeSheetBtn.addEventListener('click', closeSheet);

  elements.sheetBackdrop.addEventListener('click', (e) => {
    if (e.target === elements.sheetBackdrop) {
      closeSheet();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && elements.sheetBackdrop.classList.contains('open')) {
      closeSheet();
    }
  });

  // Preset chiplari (+50k, +100k, etc.)
  document.querySelectorAll('.preset-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      tgHaptic('light');
      const addVal = parseFloat(chip.getAttribute('data-add')) || 0;
      const current = parseFloat(elements.expenseAmountInput.value) || 0;
      elements.expenseAmountInput.value = current + addVal;
      elements.amountError.classList.remove('visible');
    });
  });

  // A'zo tanlagichi (Segmented member picker)
  elements.memberPicker.addEventListener('click', (e) => {
    const btn = e.target.closest('.member-pick-btn');
    if (!btn) return;
    tgSelection();
    elements.memberPicker.querySelectorAll('.member-pick-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.selectedMemberForNewExpense = btn.getAttribute('data-member');
  });

  // Form submit
  elements.expenseForm.addEventListener('submit', handleFormSubmit);

  // Input listenerlar
  elements.expenseAmountInput.addEventListener('input', () => {
    if (parseFloat(elements.expenseAmountInput.value) > 0) {
      elements.amountError.classList.remove('visible');
    }
  });

  elements.expenseNameInput.addEventListener('input', () => {
    if (elements.expenseNameInput.value.trim()) {
      elements.nameErrorRow.classList.remove('visible');
    }
  });

  // Segmented Control: Kategoriyalar vs Oila a'zolari
  elements.tabCategories.addEventListener('click', () => {
    tgSelection();
    elements.tabCategories.classList.add('active');
    elements.tabMembers.classList.remove('active');
    elements.categoriesStatsView.classList.add('active');
    elements.membersStatsView.classList.remove('active');
  });

  elements.tabMembers.addEventListener('click', () => {
    tgSelection();
    elements.tabMembers.classList.add('active');
    elements.tabCategories.classList.remove('active');
    elements.membersStatsView.classList.add('active');
    elements.categoriesStatsView.classList.remove('active');
  });

  // Period Segmented Control (Barchasi, Bu oy, Hafta)
  document.querySelectorAll('.filter-segmented .segment-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      tgSelection();
      document.querySelectorAll('.filter-segmented .segment-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activePeriodFilter = btn.getAttribute('data-period');
      renderHistoryList();
    });
  });

  // Gorizontal Pills Filter bosilganda
  elements.pillsBar.addEventListener('click', (e) => {
    const pill = e.target.closest('.pill-btn');
    if (!pill) return;
    tgSelection();
    elements.pillsBar.querySelectorAll('.pill-btn').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');

    state.activeFilterType = pill.getAttribute('data-filter-type');
    state.activeFilterValue = pill.getAttribute('data-filter-value');
    renderHistoryList();
  });

  // O'chirish tugmasi (Event Delegation)
  elements.expenseList.addEventListener('click', (e) => {
    const delBtn = e.target.closest('.btn-ios-delete');
    if (delBtn) {
      const id = delBtn.getAttribute('data-id');
      handleDeleteExpense(id);
    }
  });

  // Demo ma'lumotlarni yuklash
  elements.loadDemoBtn.addEventListener('click', () => {
    tgNotification('success');
    state.expenses = [...INITIAL_DEMO_DATA];
    saveData();
    updateUI();
  });

  // Mobil Bottom Nav Bar orqali sahifalarni almashtirish
  if (elements.bottomNavBar) {
    elements.bottomNavBar.addEventListener('click', (e) => {
      const tabBtn = e.target.closest('.bar-tab-btn');
      if (tabBtn) {
        const targetViewId = tabBtn.getAttribute('data-tab-target');
        switchTab(targetViewId);
      }
    });
  }

  // Markazdagi ko'tarilgan "+" tugmasi bosilganda
  if (elements.barAddActionBtn) {
    elements.barAddActionBtn.addEventListener('click', openSheet);
  }

  // Asosiy sahifadagi "Barchasi ->" linki bosilganda Tarix tabiga o'tkazish
  if (elements.goToHistoryLink) {
    elements.goToHistoryLink.addEventListener('click', () => {
      switchTab('viewHistory');
    });
  }
}

/**
 * Sahifalarni (Tab Views) almashtirish funksiyasi
 * @param {string} viewId 
 */
function switchTab(viewId) {
  tgSelection();
  state.currentTab = viewId;

  // Barcha tab viewlarni yashirib, faqat tanlanganini ko'rsatish
  document.querySelectorAll('.tab-view').forEach(view => {
    view.classList.remove('active');
  });

  const targetView = document.getElementById(viewId);
  if (targetView) {
    targetView.classList.add('active');
  }

  // Bottom Navigation Bar dagi tugmalarni yangilash
  if (elements.bottomNavBar) {
    elements.bottomNavBar.querySelectorAll('.bar-tab-btn').forEach(btn => {
      if (btn.getAttribute('data-tab-target') === viewId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // Telegram BackButton boshqaruvi
  if (tg?.BackButton) {
    if (viewId !== 'viewHome') {
      tg.BackButton.show();
    } else if (!elements.sheetBackdrop.classList.contains('open')) {
      tg.BackButton.hide();
    }
  }

  // Sahifani eng tepasiga silliq siljitish
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * 11. TELEGRAM WEBAPP SDK INITSIALIZATSIYASI
 */
function initTelegramWebApp() {
  if (!tg) return;

  try {
    // 1. Telegram WebApp tayyor ekanini bildirish
    tg.ready();

    // 2. Ekranni to'liq ochish (expand)
    tg.expand();

    // 3. Tasodifiy yopilib ketishdan himoya qilish
    if (typeof tg.enableClosingConfirmation === 'function') {
      tg.enableClosingConfirmation();
    }

    // 4. Vertikal swipe bilan yopilishni to'xtatish (agar qo'llab-quvvatlansa)
    if (typeof tg.isVerticalSwipesEnabled !== 'undefined') {
      tg.isVerticalSwipesEnabled = false;
    }

    // 5. Telegram Header rangini Apple zumrad yashil rangiga moslash
    if (typeof tg.setHeaderColor === 'function') {
      tg.setHeaderColor('#0f766e');
    }

    // 6. Telegram foydalanuvchisini aniqlash
    const user = tg.initDataUnsafe?.user;
    if (user) {
      const name = user.first_name || user.username || 'Foydalanuvchi';
      if (elements.tgUserGreeting) {
        elements.tgUserGreeting.textContent = `👋 ${name}`;
        elements.tgUserGreeting.classList.add('visible');
      }

      // Agar a'zolar ro'yxatida bo'lmasa yoki yangi xarajat kiritishda sukut bo'yicha tanlash
      state.selectedMemberForNewExpense = name;

      // Oila a'zolari pickeriga Telegram foydalanuvchisini qo'shish
      const exists = FAMILY_MEMBERS.some(m => m.name.toLowerCase() === name.toLowerCase());
      if (!exists) {
        FAMILY_MEMBERS.unshift({
          id: 'tg_' + (user.id || 'me'),
          name: name,
          initial: name[0].toUpperCase(),
          avatarClass: 'avatar-men'
        });
        renderMemberPicker();
        renderFilterPills();
      }
    }

    // 7. Telegram Native BackButton hodisasini biriktirish
    if (tg.BackButton) {
      tg.BackButton.onClick(() => {
        tgSelection();
        if (elements.sheetBackdrop.classList.contains('open')) {
          closeSheet();
        } else if (state.currentTab !== 'viewHome') {
          switchTab('viewHome');
        }
      });
    }

    // 8. Telegram Native MainButton hodisasini biriktirish
    if (tg.MainButton) {
      tg.MainButton.onClick(() => {
        const submitEvent = new Event('submit', { cancelable: true, bubbles: true });
        elements.expenseForm.dispatchEvent(submitEvent);
      });
    }

  } catch (err) {
    console.warn('Telegram WebApp SDK initsializatsiyasida ogohlantirish:', err);
  }
}

// 12. ILOVANI ISHGA TUSHIRISH (INIT)
function initApp() {
  initTelegramWebApp();
  initTheme();
  loadData();
  renderMemberPicker();
  renderFilterPills();
  setupEventListeners();
  updateUI();
}

document.addEventListener('DOMContentLoaded', initApp);
