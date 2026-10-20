'use strict';

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
const fa = (value) => Number(value).toLocaleString('fa', { useGrouping: false });
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const DEMO_MESSAGE = 'این نسخه نمایشی است؛ این بخش به سرویس واقعی کتاب‌خوان متصل نیست.';
const THEMES = ['cream', 'ivory', 'dusk', 'eink'];
const FONTS = {
  vazir: { family: "'Vazirmatn', Tahoma, sans-serif", weight: 400 },
  classic: { family: "'Noto Naskh Arabic', 'Vazirmatn', serif", weight: 400 },
  plex: { family: "'IBM Plex Sans Arabic', 'Vazirmatn', sans-serif", weight: 400 },
  light: { family: "'Vazirmatn', Tahoma, sans-serif", weight: 300 },
};
const DEFAULTS = { font: 'vazir', size: 18, leading: 2.1, theme: 'cream' };
const STORAGE_KEY = 'bookmark-reader-settings';

// پیام کوتاه پایین صفحه
const toast = $('#toast');
let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

// واکنش کوتاه روی بخشی که کاربر به آن رفته است
function flash(element) {
  if (!element) return;
  element.classList.remove('section-flash');
  void element.offsetWidth; // ری‌استارت انیمیشن
  element.classList.add('section-flash');
  setTimeout(() => element.classList.remove('section-flash'), 1600);
}

// دکمه‌های نمایشی با پیام اختصاصی
$$('[data-demo]').forEach((button) => {
  button.addEventListener('click', () => showToast(button.dataset.demo || DEMO_MESSAGE));
});

/* ---------- تنظیمات مطالعه (ذخیره در مرورگر) ---------- */
function loadSettings() {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') };
  } catch {
    return { ...DEFAULTS };
  }
}
function saveSettings() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    /* حالت خصوصی یا محدودیت مرورگر؛ تنظیمات فقط در همین نشست می‌ماند */
  }
}

const settings = loadSettings();
const root = document.documentElement;
const sizeInput = $('#fontSize');
const fontOptions = $$('.font-option');
const leadingOptions = $$('.leading-option');
const themeOptions = $$('.theme-option');

function setChecked(group, activeItem) {
  group.forEach((item) => {
    const active = item === activeItem;
    item.classList.toggle('is-active', active);
    item.setAttribute('aria-checked', String(active));
    item.tabIndex = active ? 0 : -1;
  });
}

function applySettings() {
  const font = FONTS[settings.font] || FONTS.vazir;
  root.style.setProperty('--reader-font', font.family);
  root.style.setProperty('--reader-weight', font.weight);
  root.style.setProperty('--reader-size', `${settings.size}px`);
  root.style.setProperty('--reader-leading', settings.leading);
  document.body.dataset.theme = settings.theme;

  setChecked(fontOptions, fontOptions.find((item) => item.dataset.font === settings.font));
  setChecked(themeOptions, themeOptions.find((item) => item.dataset.themeValue === settings.theme));
  const leadingActive = leadingOptions.find((item) => Number(item.dataset.leading) === Number(settings.leading)) || leadingOptions[2];
  setChecked(leadingOptions, leadingActive);

  sizeInput.value = settings.size;
  sizeInput.style.setProperty('--fill', `${((settings.size - sizeInput.min) / (sizeInput.max - sizeInput.min)) * 100}%`);
  $('#fontSizeValue').textContent = `${fa(settings.size)} پیکسل`;
  $('#leadingValue').textContent = `${leadingActive.dataset.name} (${Number(settings.leading).toLocaleString('fa')})`;
  updateSelectionToolbar();
}

fontOptions.forEach((option) => option.addEventListener('click', () => {
  settings.font = option.dataset.font;
  applySettings();
  saveSettings();
}));
leadingOptions.forEach((option) => option.addEventListener('click', () => {
  settings.leading = Number(option.dataset.leading);
  applySettings();
  saveSettings();
}));
themeOptions.forEach((option) => option.addEventListener('click', () => {
  settings.theme = option.dataset.themeValue;
  applySettings();
  saveSettings();
}));
sizeInput.addEventListener('input', () => {
  settings.size = Number(sizeInput.value);
  applySettings();
  saveSettings();
});
$('#resetSettings').addEventListener('click', () => {
  Object.assign(settings, DEFAULTS);
  applySettings();
  saveSettings();
  showToast('تنظیمات خوانش به حالت پیش‌فرض برگشت.');
});

// کلیدهای جهت‌دار برای گروه‌های انتخابی (radiogroup)
[fontOptions, leadingOptions, themeOptions].forEach((group) => {
  group.forEach((item, index) => item.addEventListener('keydown', (event) => {
    const step = { ArrowLeft: 1, ArrowDown: 1, ArrowRight: -1, ArrowUp: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const next = group[(index + step + group.length) % group.length];
    next.focus();
    next.click();
  }));
});

/* ---------- ابزارهای نوار بالا ---------- */
function changeSize(delta) {
  settings.size = clamp(settings.size + delta, Number(sizeInput.min), Number(sizeInput.max));
  applySettings();
  saveSettings();
}
$('#sizeUp').addEventListener('click', () => changeSize(1));
$('#sizeDown').addEventListener('click', () => changeSize(-1));

$('#toolTheme').addEventListener('click', () => {
  settings.theme = THEMES[(THEMES.indexOf(settings.theme) + 1) % THEMES.length];
  applySettings();
  saveSettings();
});

$('#toolFont').addEventListener('click', () => {
  const group = $('#fontGroup');
  group.scrollIntoView({ behavior: 'smooth', block: 'center' });
  flash(group);
});

$('#toolBookmark').addEventListener('click', (event) => {
  const button = event.currentTarget;
  const saved = !button.classList.contains('is-saved');
  button.classList.toggle('is-saved', saved);
  button.setAttribute('aria-pressed', String(saved));
  $('#pageRibbon').classList.toggle('is-saved', saved);
  showToast(saved ? 'این صفحه نشانک شد.' : 'نشانک این صفحه برداشته شد.');
});

$('#toolFullscreen').addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch {
    showToast('مرورگر اجازه نمایش تمام‌صفحه را نداد.');
  }
});

$('#toolAccount').addEventListener('click', () => showToast('مدیریت حساب کاربری در نسخه نمایشی فعال نیست.'));

/* ---------- حالت Zen ---------- */
const zenButton = $('#zenButton');
function setZen(on) {
  document.body.classList.toggle('is-zen', on);
  zenButton.setAttribute('aria-pressed', String(on));
  if (on) window.scrollTo({ top: 0 });
  hideSelectionToolbar();
}
zenButton.addEventListener('click', () => setZen(!document.body.classList.contains('is-zen')));
$('#zenExit').addEventListener('click', () => setZen(false));

/* ---------- تب‌های ستون کناری ---------- */
const sideTabs = $$('.side-tab');
function selectSideTab(tab, moveFocus = false) {
  sideTabs.forEach((item) => {
    const active = item === tab;
    item.classList.toggle('is-active', active);
    item.setAttribute('aria-selected', String(active));
    item.tabIndex = active ? 0 : -1;
    $(`#${item.dataset.panel}`).classList.toggle('hidden', !active);
  });
  if (moveFocus) tab.focus();
}
sideTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectSideTab(tab));
  tab.addEventListener('keydown', (event) => {
    const step = { ArrowLeft: 1, ArrowRight: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    selectSideTab(sideTabs[(index + step + sideTabs.length) % sideTabs.length], true);
  });
});

// فهرست: فقط فصل جاری در نسخه نمایشی باز می‌شود
$$('.toc-item').forEach((item) => item.addEventListener('click', () => {
  if (item.classList.contains('is-current')) {
    $('#readerArticle').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    showToast('در نسخه نمایشی فقط متن همین فصل در دسترس است.');
  }
}));

/* ---------- نوار وضعیت پایین ---------- */
const statusViews = $$('.status-view');
statusViews.forEach((button) => button.addEventListener('click', () => {
  statusViews.forEach((item) => {
    const active = item === button;
    item.classList.toggle('is-active', active);
    item.setAttribute('aria-pressed', String(active));
  });
  const view = button.dataset.view;
  if (view === 'text') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  selectSideTab(view === 'toc' ? $('#sideTabToc') : $('#sideTabNotes'));
  const card = $('.toc-card');
  card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  flash(card);
}));

/* ---------- پیشرفت با اسکرول ---------- */
const BASE_PAGE = 164;
const TOTAL_PAGES = 240;
const live = {
  page: $$('[data-live="page"]'),
  percent: $$('[data-live="percent"]'),
  chapterMin: $$('[data-live="chapterMin"]'),
  sectionMin: $$('[data-live="sectionMin"]'),
  meter: $('[data-live="meter"]'),
};
const strip = $('.goal-strip');

function updateProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const fraction = scrollable > 0 ? clamp(window.scrollY / scrollable, 0, 1) : 0;
  const page = BASE_PAGE + Math.round(fraction * 2);
  const percent = Math.round((page / TOTAL_PAGES) * 100);
  live.page.forEach((el) => { el.textContent = fa(page); });
  live.percent.forEach((el) => { el.textContent = `${fa(percent)}٪`; });
  live.chapterMin.forEach((el) => { el.textContent = fa(Math.max(1, Math.round(18 * (1 - fraction)))); });
  live.sectionMin.forEach((el) => { el.textContent = fa(Math.max(1, Math.round(28 * (1 - fraction)))); });
  live.meter?.style.setProperty('--value', `${percent}%`);
  strip.firstElementChild.style.setProperty('--value', `${percent}%`);
  strip.setAttribute('aria-valuenow', String(percent));
}
window.addEventListener('scroll', updateProgress, { passive: true });
window.addEventListener('resize', updateProgress);

/* ---------- ورق زدن ---------- */
function turnPage(direction) {
  window.scrollBy({ top: direction * window.innerHeight * 0.85, behavior: 'smooth' });
}
$('#nextPage').addEventListener('click', () => turnPage(1));
$('#prevPage').addEventListener('click', () => turnPage(-1));

/* ---------- انتخاب متن، هایلایت و ابزار شناور ---------- */
const article = $('#articleBody');
const toolbar = $('#selectionToolbar');

function getArticleSelection() {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return null;
  const range = selection.getRangeAt(0);
  if (!article.contains(range.commonAncestorContainer)) return null;
  if (!selection.toString().trim()) return null;
  return { selection, range };
}

function hideSelectionToolbar() {
  toolbar.classList.add('hidden');
}

function updateSelectionToolbar() {
  const data = getArticleSelection();
  if (!data) {
    hideSelectionToolbar();
    return;
  }
  const rect = data.range.getBoundingClientRect();
  toolbar.classList.remove('hidden');
  const width = toolbar.offsetWidth;
  const left = clamp(rect.left + rect.width / 2 - width / 2, 8, window.innerWidth - width - 8);
  const top = rect.top - toolbar.offsetHeight - 10;
  toolbar.style.left = `${left}px`;
  toolbar.style.top = `${top < 72 ? rect.bottom + 10 : top}px`;
}

function highlightSelection() {
  const data = getArticleSelection();
  if (!data) {
    showToast('ابتدا بخشی از متن را انتخاب کنید.');
    return;
  }
  const { selection, range } = data;
  const blockOf = (node) => (node.nodeType === 1 ? node : node.parentElement).closest('p');
  if (!blockOf(range.startContainer) || blockOf(range.startContainer) !== blockOf(range.endContainer)) {
    showToast('هر بار فقط متن داخل یک بند را می‌شود هایلایت کرد.');
    return;
  }
  const mark = document.createElement('mark');
  mark.className = 'user-mark';
  try {
    range.surroundContents(mark);
  } catch {
    mark.appendChild(range.extractContents());
    range.insertNode(mark);
  }
  selection.removeAllRanges();
  hideSelectionToolbar();
  showToast('متن با رنگ طلایی هایلایت شد.');
}

toolbar.addEventListener('mousedown', (event) => event.preventDefault()); // انتخاب متن از بین نرود
toolbar.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-selection]');
  if (!button) return;
  const action = button.dataset.selection;
  if (action === 'highlight') {
    highlightSelection();
  } else if (action === 'note') {
    showToast('یادداشت‌نویسی در نسخه نمایشی ذخیره نمی‌شود.');
    hideSelectionToolbar();
  } else if (action === 'ai') {
    showToast('تحلیل هوشمند در نسخه نمایشی متصل نیست.');
    hideSelectionToolbar();
  } else if (action === 'share') {
    const text = getArticleSelection()?.selection.toString().trim() || '';
    try {
      await navigator.clipboard.writeText(text);
      showToast('متن انتخاب‌شده کپی شد.');
    } catch {
      showToast('مرورگر اجازه کپی متن را نداد.');
    }
    hideSelectionToolbar();
  }
});

document.addEventListener('selectionchange', () => {
  clearTimeout(updateSelectionToolbar.timer);
  updateSelectionToolbar.timer = setTimeout(updateSelectionToolbar, 120);
});
window.addEventListener('scroll', hideSelectionToolbar, { passive: true });

/* ---------- میانبرهای صفحه‌کلید ---------- */
document.addEventListener('keydown', (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  const inControl = event.target.closest('input, select, textarea, [role="tab"], [role="radio"], [contenteditable]');
  if (event.key === 'Escape' && document.body.classList.contains('is-zen')) {
    setZen(false);
    return;
  }
  if (inControl) return;
  const key = event.key.toLowerCase();
  if (key === 'f') {
    setZen(!document.body.classList.contains('is-zen'));
  } else if (key === 'h') {
    highlightSelection();
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault();
    turnPage(1); // در صفحه راست‌به‌چپ، فلش چپ یعنی صفحه بعد
  } else if (event.key === 'ArrowRight') {
    event.preventDefault();
    turnPage(-1);
  }
});

applySettings();
updateProgress();
