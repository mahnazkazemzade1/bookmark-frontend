'use strict';

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

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

// منوی فعال: با کلیک و همچنین با اسکرول، گزینه مربوط به بخش فعلی مشخص می‌شود
const navLinks = $$('.main-nav a');
const spySections = ['categories', 'bestsellers', 'join'];
let navLockUntil = 0;

function setActiveNav(href) {
  navLinks.forEach((link) => {
    const isActive = link.getAttribute('href') === href && href !== '#top' && !link.classList.contains('nav-highlight');
    link.classList.toggle('active', isActive);
    if (isActive) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });
}

function updateNavOnScroll() {
  if (Date.now() < navLockUntil) return;
  let current = '#top';
  if (window.scrollY > 120) {
    spySections.forEach((id) => {
      const section = document.getElementById(id);
      if (section && section.getBoundingClientRect().top <= 160) current = `#${id}`;
    });
  }
  setActiveNav(current);
}

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    const href = link.getAttribute('href');
    navLockUntil = Date.now() + 1000;
    setActiveNav(href);
    if (href !== '#top') flash($(href));
    mainNav.classList.remove('open');
    mobileMenu?.setAttribute('aria-expanded', 'false');
  });
});
window.addEventListener('scroll', updateNavOnScroll, { passive: true });
updateNavOnScroll();

// دکمه‌هایی که فقط پیام نمایشی نشان می‌دهند
$$('[data-toast]').forEach((element) => {
  element.addEventListener('click', (event) => {
    event.preventDefault();
    showToast(element.dataset.toast);
  });
});

// دکمه‌های هدر
$('#headerBuy')?.addEventListener('click', () => {
  window.location.href = 'checkout.html';
});
$('#profileButton')?.addEventListener('click', () => {
  showToast('ورود و مدیریت حساب کاربری در نسخه نمایشی فعال نیست.');
});

// جست‌وجو و فیلتر نوع اثر (متنی / صوتی)
const state = { type: 'all', query: '' };
const mainSearch = $('#mainSearch');
const siteSearch = $('#siteSearch');

function applyFilters() {
  const query = normalize(state.query);
  let visible = 0;
  $$('.bk-card').forEach((card) => {
    const type = card.dataset.type;
    const typeMatch =
      state.type === 'all' ||
      type === 'both' ||
      type === state.type;
    const text = normalize(`${card.textContent} ${card.dataset.tags || ''}`);
    const match = typeMatch && (!query || text.includes(query));
    card.classList.toggle('hidden', !match);
    if (match) visible += 1;
  });
  $('#bookEmpty')?.classList.toggle('hidden', visible !== 0);
}

function setQuery(value, { scroll = false } = {}) {
  state.query = value;
  if (mainSearch) mainSearch.value = value;
  if (siteSearch) siteSearch.value = value;
  applyFilters();
  if (scroll && value) {
    const target = $('#bestsellers');
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

mainSearch?.addEventListener('input', (event) => setQuery(event.target.value));
siteSearch?.addEventListener('input', (event) => setQuery(event.target.value, { scroll: true }));

$$('[data-keyword]').forEach((element) => {
  element.addEventListener('click', () => {
    setQuery(element.dataset.keyword, { scroll: true });
    flash($('#bestsellers'));
  });
});

// میان‌بر ⌘K یا Ctrl+K برای رفتن به کادر جست‌وجو
document.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    mainSearch?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    mainSearch?.focus();
  }
});

$$('.seg button').forEach((button) => {
  button.addEventListener('click', () => {
    state.type = button.dataset.type;
    $$('.seg button').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    applyFilters();
  });
});

// نشانک و سبد خرید نمایشی روی کارت کتاب‌ها
$$('.bk-save').forEach((button) => {
  button.addEventListener('click', () => {
    const saved = button.getAttribute('aria-pressed') === 'true';
    button.setAttribute('aria-pressed', String(!saved));
    showToast(!saved ? 'کتاب به نشانک‌های همین نشست اضافه شد.' : 'کتاب از نشانک‌ها برداشته شد.');
  });
});

const cartIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.2 10.1a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L21 8H6"/><circle cx="10" cy="20" r="1.3"/><circle cx="18" cy="20" r="1.3"/></svg>';
const checkIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>';
$$('.bk-cart').forEach((button) => {
  button.addEventListener('click', () => {
    const title = $('h3', button.closest('.bk-card'))?.textContent.trim() || 'کتاب';
    const added = button.classList.toggle('is-added');
    button.innerHTML = added ? checkIcon : cartIcon;
    button.setAttribute('aria-label', added ? `حذف ${title} از سبد نمایشی` : `افزودن ${title} به سبد`);
    showToast(added ? `«${title}» به سبد نمایشی اضافه شد.` : `«${title}» از سبد نمایشی برداشته شد.`);
  });
});

// نقل‌قول‌ها
const quotes = [
  {
    text: '«کتاب خواندن به این معناست که در کوتاه‌ترین زمان، عمیق‌ترین تجربیات بهترین ذهن‌های بشریت را به زندگی خود بیفزاییم.»',
    source: 'خورخه لوئیس بورخس • درباره جادوی کتاب و جاودانگی اندیشه'
  },
  {
    text: '«وقتی دیگر قادر به تغییر موقعیتی نیستیم، با چالشی روبه‌رو می‌شویم که خودمان را تغییر دهیم.»',
    source: 'ویکتور فرانکل • از کتاب انسان در جستجوی معنی'
  }
];
let quoteIndex = 0;
function showQuote(step) {
  const body = $('#quoteBody');
  if (!body) return;
  quoteIndex = (quoteIndex + step + quotes.length) % quotes.length;
  body.classList.add('is-changing');
  setTimeout(() => {
    $('#quoteText').textContent = quotes[quoteIndex].text;
    $('#quoteSrc').textContent = quotes[quoteIndex].source;
    body.classList.remove('is-changing');
  }, 200);
}
$('#quotePrev')?.addEventListener('click', () => showQuote(-1));
$('#quoteNext')?.addEventListener('click', () => showQuote(1));

// گفت‌وگوی نمایشی دستیار
$('#chatForm')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const field = $('#chatField');
  if (!field.value.trim()) {
    field.focus();
    return;
  }
  showToast('در نسخه نمایشی، دستیار هوشمند به پرسش‌ها پاسخ نمی‌دهد.');
  field.value = '';
});

// فرم‌های خبرنامه (کارت عضویت و فوتر)
function bindEmailForm(formSelector, inputSelector, messageSelector) {
  $(formSelector)?.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = $(inputSelector);
    const email = input.value.trim();
    if (!input.checkValidity()) {
      input.reportValidity();
      return;
    }
    $(messageSelector).textContent = `در نسخه نمایشی، نشانی ${email} به‌صورت محلی ثبت شد؛ برای ارسال واقعی باید سرویس خبرنامه متصل شود.`;
    event.currentTarget.reset();
  });
}
bindEmailForm('#joinForm', '#joinEmail', '#joinMessage');
bindEmailForm('#newsletterForm', '#emailInput', '#newsletterMessage');

// جست‌وجوی ارسال‌شده از صفحه‌های دیگر (main.html?q=...)
const initialQuery = new URLSearchParams(window.location.search).get('q');
if (initialQuery) setQuery(initialQuery);

applyFilters();
