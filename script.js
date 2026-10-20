'use strict';

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

// نشان دادن یک واکنش کوتاه روی بخشی که کاربر به آن رفته است
function flash(element) {
  if (!element) return;
  element.classList.remove('section-flash');
  void element.offsetWidth; // ری‌استارت انیمیشن
  element.classList.add('section-flash');
  setTimeout(() => element.classList.remove('section-flash'), 1600);
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
const spySections = ['details', 'suggestions', 'newsletter'];
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
  if (Date.now() < navLockUntil) return; // وسط اسکرول ناشی از کلیک، تداخل ایجاد نشود
  let current = '#top';
  if (window.scrollY > 120) {
    spySections.forEach((id) => {
      const section = document.getElementById(id);
      if (section && section.getBoundingClientRect().top <= 160) current = `#${id}`;
    });
  }
  const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
  if (atBottom && window.scrollY > 120) current = '#newsletter';
  setActiveNav(current);
}

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    const href = link.getAttribute('href');
    navLockUntil = Date.now() + 1000;
    setActiveNav(href);
    if (href !== '#top') flash(document.querySelector(href));
    mainNav.classList.remove('open');
    mobileMenu?.setAttribute('aria-expanded', 'false');
  });
});

window.addEventListener('scroll', updateNavOnScroll, { passive: true });
updateNavOnScroll();

// دکمه نمایشی حساب کاربری
$('#profileButton')?.addEventListener('click', () => {
  $('#actionMessage').textContent = 'ورود و مدیریت حساب کاربری در نسخه نمایشی فعال نیست.';
  $('#actionMessage').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

// ثبت خرید (دکمه کارت خرید و دکمه هدر): رفتن به صفحه تسویه‌حساب
['#buyButton', '#headerBuy'].forEach((selector) => {
  $(selector)?.addEventListener('click', () => {
    window.location.href = 'checkout.html';
  });
});

// افزودن یا حذف از نشانک‌های همین نشست
$('#favoriteButton')?.addEventListener('click', (event) => {
  const button = event.currentTarget;
  const saved = button.dataset.saved === 'true';
  button.dataset.saved = String(!saved);
  button.setAttribute('aria-pressed', String(!saved));
  button.classList.toggle('is-saved', !saved);
  button.innerHTML = !saved
    ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4.8A1.8 1.8 0 0 1 7.8 3h8.4A1.8 1.8 0 0 1 18 4.8V21l-6-3.8L6 21V4.8Z"/></svg> به نشانک‌ها اضافه شد'
    : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4.8A1.8 1.8 0 0 1 7.8 3h8.4A1.8 1.8 0 0 1 18 4.8V21l-6-3.8L6 21V4.8Z"/></svg> افزودن به نشانک‌ها';
  $('#actionMessage').textContent = !saved ? 'کتاب به نشانک‌های همین نشست اضافه شد.' : 'کتاب از نشانک‌های همین نشست برداشته شد.';
});

// تب‌های معرفی، درباره نویسنده و دیدگاه‌ها
$$('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    const targetId = tab.dataset.tab;
    $$('.tab').forEach((item) => {
      const active = item === tab;
      item.classList.toggle('active', active);
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
    });
    $$('.tab-content').forEach((panel) => {
      const active = panel.id === targetId;
      panel.classList.toggle('hidden', !active);
      panel.setAttribute('aria-hidden', String(!active));
    });
  });
});

// جست‌وجوی زنده در کارت‌های پیشنهادی
const searchInput = $('#siteSearch');
searchInput?.addEventListener('input', (event) => {
  const query = event.target.value.trim().toLocaleLowerCase('fa');
  let visible = 0;
  $$('.suggestion-card').forEach((card) => {
    const searchable = `${card.dataset.search || ''} ${card.innerText}`.toLocaleLowerCase('fa');
    const match = !query || searchable.includes(query);
    card.classList.toggle('hidden', !match);
    if (match) visible += 1;
  });
  $('#emptySearch')?.classList.toggle('hidden', visible !== 0);
  if (query && $('#suggestions')) {
    $('#suggestions').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});

// افزودن کارت پیشنهادی به سبد نمایشی
$$('.add-cart').forEach((button) => {
  button.addEventListener('click', () => {
    const card = button.closest('.suggestion-card');
    const title = $('h3', card)?.textContent.trim() || 'کتاب';
    const added = button.dataset.added === 'true';
    button.dataset.added = String(!added);
    button.classList.toggle('is-added', !added);
    button.innerHTML = !added
      ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>'
      : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.2 10.1a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L21 8H6"/><circle cx="10" cy="20" r="1.3"/><circle cx="18" cy="20" r="1.3"/></svg>';
    button.setAttribute('aria-label', !added ? `${title} به سبد نمایشی اضافه شد` : `حذف ${title} از سبد نمایشی`);
    button.title = !added ? `${title} اضافه شد` : 'افزودن به سبد';
    $('#cartMessage').textContent = !added ? `«${title}» به سبد نمایشی اضافه شد.` : `«${title}» از سبد نمایشی برداشته شد.`;
  });
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
