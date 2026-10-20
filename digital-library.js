'use strict';

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

const DEMO_MESSAGE = 'این نسخه نمایشی است؛ برای باز شدن کتاب‌خوان واقعی باید سرویس مطالعه به صفحه متصل شود.';

// پیام کوتاه پایین صفحه (برای بازخورد کنش‌ها)
const toast = $('#toast');
let toastTimer;
function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}

// نشان دادن یک واکنش کوتاه روی بخشی که کاربر به آن رفته است
function flash(element) {
  if (!element) return;
  element.classList.remove('section-flash');
  void element.offsetWidth; // ری‌استارت انیمیشن
  element.classList.add('section-flash');
  setTimeout(() => element.classList.remove('section-flash'), 1600);
}

// یکسان‌سازی حروف عربی و فارسی برای جست‌وجو
function normalize(text) {
  return String(text)
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[\u200c\u200f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase('fa');
}

// منوی موبایل
const mobileMenu = $('#mobileMenu');
const mainNav = $('.main-nav');
mobileMenu?.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  mobileMenu.setAttribute('aria-expanded', String(isOpen));
  mobileMenu.setAttribute('aria-label', isOpen ? 'بستن منو' : 'باز کردن منو');
});

$$('.main-nav a').forEach((link) => {
  link.addEventListener('click', () => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#') && href.length > 1) flash(document.querySelector(href));
    mainNav.classList.remove('open');
    mobileMenu?.setAttribute('aria-expanded', 'false');
  });
});

// دکمه نمایشی حساب کاربری
$('#profileButton')?.addEventListener('click', () => {
  showToast('ورود و مدیریت حساب کاربری در نسخه نمایشی فعال نیست.');
});

// کتاب جاری: دکمه هدر به همین بخش می‌رود
const nowReading = $('#now-reading');
$('#headerContinue')?.addEventListener('click', () => {
  nowReading?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  flash(nowReading);
});
$('#continueReading')?.addEventListener('click', () => showToast(DEMO_MESSAGE));
$('#openNotes')?.addEventListener('click', () => showToast('هفت یادداشت شما در نسخه نمایشی نشان داده نمی‌شود.'));
$('#openContents')?.addEventListener('click', () => showToast('فهرست فصل‌ها در نسخه نمایشی فعال نیست.'));
$('#openStats')?.addEventListener('click', () => showToast('صفحه آمار مطالعه در نسخه نمایشی فعال نیست.'));

// وضعیت قفسه: دسته، عبارت جست‌وجو، ترتیب و نوع نمایش
const state = { group: 'reading', query: '', sort: 'recent' };
const grid = $('#libraryGrid');
const cards = $$('.library-card', grid);
const emptyMessage = $('#emptyLibrary');

const sorters = {
  recent: (a, b) => Number(b.dataset.recent) - Number(a.dataset.recent),
  progress: (a, b) => Number(b.dataset.progress) - Number(a.dataset.progress),
  title: (a, b) => a.dataset.title.localeCompare(b.dataset.title, 'fa'),
};

function applySort() {
  [...cards].sort(sorters[state.sort] || sorters.recent).forEach((card) => grid.appendChild(card));
}

function applyFilters() {
  const query = normalize(state.query);
  let visible = 0;
  cards.forEach((card) => {
    const inGroup = card.dataset.groups.split(' ').includes(state.group);
    const haystack = normalize(`${card.dataset.search || ''} ${card.dataset.title || ''} ${card.innerText}`);
    const match = inGroup && (!query || haystack.includes(query));
    card.classList.toggle('hidden', !match);
    if (match) visible += 1;
  });
  emptyMessage?.classList.toggle('hidden', visible !== 0);
}

// تب‌ها (با پشتیبانی از کلیدهای جهت‌دار)
const tabs = $$('.shelf-tab');
function selectTab(tab, moveFocus = false) {
  tabs.forEach((item) => {
    const active = item === tab;
    item.classList.toggle('is-active', active);
    item.setAttribute('aria-selected', String(active));
    item.tabIndex = active ? 0 : -1;
  });
  grid.setAttribute('aria-labelledby', tab.id);
  state.group = tab.dataset.group;
  applyFilters();
  if (moveFocus) tab.focus();
}

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', (event) => {
    // در صفحه راست‌به‌چپ، فلش چپ یعنی تب بعدی
    const step = { ArrowLeft: 1, ArrowRight: -1 }[event.key];
    if (step) {
      event.preventDefault();
      selectTab(tabs[(index + step + tabs.length) % tabs.length], true);
    } else if (event.key === 'Home') {
      event.preventDefault();
      selectTab(tabs[0], true);
    } else if (event.key === 'End') {
      event.preventDefault();
      selectTab(tabs[tabs.length - 1], true);
    }
  });
});

// جست‌وجو و مرتب‌سازی
$('#librarySearch')?.addEventListener('input', (event) => {
  state.query = event.target.value;
  applyFilters();
});

$('#sortSelect')?.addEventListener('change', (event) => {
  state.sort = event.target.value;
  applySort();
});

// نمای شبکه‌ای یا فهرستی
$$('.view-button').forEach((button) => {
  button.addEventListener('click', () => {
    const isList = button.dataset.view === 'list';
    grid.classList.toggle('is-list', isList);
    $$('.view-button').forEach((item) => {
      const active = item === button;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
  });
});

// منوی سه‌نقطه روی هر کارت
function closeMenus(except) {
  $$('.menu-pop', grid).forEach((menu) => {
    if (menu === except) return;
    menu.classList.add('hidden');
    menu.parentElement.querySelector('.card-menu')?.setAttribute('aria-expanded', 'false');
  });
}

const menuMessages = {
  note: (title) => `یادداشت تازه برای «${title}» در نسخه نمایشی ذخیره نمی‌شود.`,
  share: (title) => `پیوند اشتراک‌گذاری «${title}» در نسخه نمایشی ساخته نمی‌شود.`,
  remove: (title) => `«${title}» در نسخه نمایشی از میز مطالعه حذف نمی‌شود.`,
  open: (title) => `«${title}» در کتاب‌خوان باز می‌شود. ${DEMO_MESSAGE}`,
  reread: (title) => `بازخوانی «${title}» از صفحه اول شروع می‌شود. ${DEMO_MESSAGE}`,
};

grid.addEventListener('click', (event) => {
  const menuButton = event.target.closest('.card-menu');
  if (menuButton) {
    const menu = menuButton.parentElement.querySelector('.menu-pop');
    const willOpen = menu.classList.contains('hidden');
    closeMenus(menu);
    menu.classList.toggle('hidden', !willOpen);
    menuButton.setAttribute('aria-expanded', String(willOpen));
    return;
  }

  const actionButton = event.target.closest('[data-action]');
  if (actionButton) {
    const card = actionButton.closest('.library-card');
    const title = card?.dataset.title || 'کتاب';
    showToast((menuMessages[actionButton.dataset.action] || (() => DEMO_MESSAGE))(title));
    closeMenus();
  }
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('.card-head')) closeMenus();
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  const openButton = $('.card-menu[aria-expanded="true"]');
  closeMenus();
  openButton?.focus();
});

// اعتبارسنجی ساده فرم خبرنامه
$('#newsletterForm')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const emailInput = $('#emailInput');
  const email = emailInput.value.trim();
  if (!emailInput.checkValidity()) {
    emailInput.reportValidity();
    return;
  }
  $('#newsletterMessage').textContent = `در نسخه نمایشی، نشانی ${email} به‌صورت محلی ثبت شد؛ برای ارسال واقعی باید سرویس خبرنامه متصل شود.`;
  event.currentTarget.reset();
});

applySort();
applyFilters();
