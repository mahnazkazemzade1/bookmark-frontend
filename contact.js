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

// جست‌وجوی هدر: با Enter به صفحه پرسش‌های متداول می‌رود
$('#siteSearch')?.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter') return;
  const query = event.target.value.trim();
  window.location.href = query ? `faq.html?q=${encodeURIComponent(query)}` : 'faq.html';
});

// نمایش ارقام به‌صورت فارسی در شمارنده
const toFa = (n) => n.toLocaleString('fa');

// فرم تماس
const form = $('#contactForm');
const fields = {
  name: { input: $('#nameInput'), error: $('#nameError') },
  email: { input: $('#contactEmail'), error: $('#contactEmailError') },
  subject: { input: $('#subjectSelect'), error: $('#subjectError') },
  message: { input: $('#messageInput'), error: $('#messageError') }
};

function validateField(key) {
  const { input, error } = fields[key];
  const value = input.value.trim();
  let text = '';
  if (key === 'name' && value.length < 2) text = 'نام خود را وارد کنید.';
  if (key === 'email') {
    if (!value) text = 'ایمیل خود را وارد کنید.';
    else if (!input.checkValidity()) text = 'نشانی ایمیل معتبر نیست.';
  }
  if (key === 'subject' && !value) text = 'یکی از موضوع‌ها را انتخاب کنید.';
  if (key === 'message' && value.length < 10) text = 'پیام باید دست‌کم ۱۰ نویسه باشد.';
  error.textContent = text;
  input.closest('.field').classList.toggle('invalid', Boolean(text));
  input.setAttribute('aria-invalid', String(Boolean(text)));
  return !text;
}

Object.keys(fields).forEach((key) => {
  const { input } = fields[key];
  input.addEventListener('blur', () => validateField(key));
  input.addEventListener('input', () => {
    if (input.closest('.field').classList.contains('invalid')) validateField(key);
  });
  input.addEventListener('change', () => {
    if (key === 'subject') validateField(key);
  });
});

// شمارنده نویسه‌ها
const messageInput = $('#messageInput');
const charCount = $('#charCount');
function updateCount() {
  charCount.textContent = `${toFa(messageInput.value.length)} / ${toFa(messageInput.maxLength)}`;
}
messageInput?.addEventListener('input', updateCount);
updateCount();

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const results = Object.keys(fields).map(validateField);
  const formMessage = $('#formMessage');
  if (results.includes(false)) {
    formMessage.textContent = '';
    const firstInvalid = Object.values(fields).find(({ input }) => input.closest('.field').classList.contains('invalid'));
    firstInvalid?.input.focus();
    return;
  }
  // ارسال واقعی به سرویس ایمیل یا بک‌اند نیاز دارد.
  formMessage.textContent = 'در نسخه نمایشی، پیام شما فقط در همین صفحه بررسی شد و برای پشتیبانی ارسال نشد.';
  showToast('پیام شما ثبت شد (نسخه نمایشی).');
  form.reset();
  updateCount();
  Object.values(fields).forEach(({ input }) => input.closest('.field').classList.remove('invalid'));
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
