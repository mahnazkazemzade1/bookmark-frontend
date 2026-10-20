'use strict';

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

const categories = ['order', 'shipping', 'payment', 'returns', 'account'];
const state = { filter: 'all', query: '' };

// پیام کوتاه پایین صفحه
let toastTimer;
function showToast(message) {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}

// واکنش کوتاه روی بخشی که کاربر به آن رفته است
function flash(element) {
  if (!element) return;
  element.classList.remove('section-flash');
  void element.offsetWidth;
  element.classList.add('section-flash');
  setTimeout(() => element.classList.remove('section-flash'), 1600);
}

// یکسان‌سازی حروف فارسی و عربی و نیم‌فاصله برای جست‌وجو
function normalize(text) {
  return text
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/\u200c/g, ' ')
    .toLocaleLowerCase('fa')
    .trim();
}

// منوی موبایل
const mobileMenu = $('#mobileMenu');
const mainNav = $('.main-nav');
mobileMenu?.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  mobileMenu.setAttribute('aria-expanded', String(isOpen));
  mobileMenu.setAttribute('aria-label', isOpen ? 'بستن منو' : 'باز کردن منو');
});
mainNav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    mobileMenu?.setAttribute('aria-expanded', 'false');
    const href = link.getAttribute('href');
    if (href.startsWith('#')) flash($(href));
  });
});

// دکمه‌های هدر
$('#headerBuy')?.addEventListener('click', () => {
  window.location.href = 'index.html#top';
});
$('#profileButton')?.addEventListener('click', () => {
  showToast('ورود و مدیریت حساب کاربری در نسخه نمایشی فعال نیست.');
});
$('#contactSupport')?.addEventListener('click', () => {
  showToast('در نسخه نمایشی، ارسال پیام به پشتیبانی فعال نیست.');
});

// آکاردئون پرسش‌ها
function setOpen(item, open) {
  const button = $('.faq-q', item);
  const panel = $('.faq-a', item);
  button.setAttribute('aria-expanded', String(open));
  panel.hidden = !open;
  item.classList.toggle('open', open);
}

$$('.faq-item').forEach((item) => {
  $('.faq-q', item).addEventListener('click', () => {
    const isOpen = $('.faq-q', item).getAttribute('aria-expanded') === 'true';
    setOpen(item, !isOpen);
  });
});

// فیلتر دسته‌بندی و جست‌وجو
const faqSearch = $('#faqSearch');
const siteSearch = $('#siteSearch');

function applyFilters() {
  const query = normalize(state.query);
  let visible = 0;
  $$('.faq-item').forEach((item) => {
    const inCategory = state.filter === 'all' || item.dataset.cat === state.filter;
    const text = normalize(item.textContent);
    const match = inCategory && (!query || text.includes(query));
    item.classList.toggle('hidden', !match);
    if (match) visible += 1;
  });
  $('#faqEmpty')?.classList.toggle('hidden', visible !== 0);
  const count = $('#faqCount');
  if (count) count.textContent = visible ? `${visible.toLocaleString('fa')} پرسش` : '';
}

function setFilter(filter) {
  state.filter = filter;
  $$('.chip').forEach((chip) => chip.setAttribute('aria-pressed', String(chip.dataset.filter === filter)));
  applyFilters();
}

$$('.chip').forEach((chip) => chip.addEventListener('click', () => setFilter(chip.dataset.filter)));

function onSearch(source, other) {
  return (event) => {
    state.query = event.target.value;
    if (other) other.value = event.target.value;
    applyFilters();
    if (state.query && source === siteSearch) {
      $('#faqList')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
}
faqSearch?.addEventListener('input', onSearch(faqSearch, siteSearch));
siteSearch?.addEventListener('input', onSearch(siteSearch, faqSearch));

// لینک‌های دسترسی سریع و هش‌های دسته‌بندی (مثل faq.html#order)
function applyHash() {
  const key = window.location.hash.replace('#', '');
  if (categories.includes(key)) {
    setFilter(key);
    $('#faqList')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    flash($('#faqList'));
  }
}
$$('[data-quick]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    setFilter(link.dataset.quick);
    $('#faqList')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    flash($('#faqList'));
  });
});
window.addEventListener('hashchange', applyHash);

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

applyFilters();
applyHash();
// اولین پرسش به‌صورت پیش‌فرض باز باشد
const firstItem = $('.faq-item');
if (firstItem && !firstItem.classList.contains('hidden')) setOpen(firstItem, true);
