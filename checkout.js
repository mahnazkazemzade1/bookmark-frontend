'use strict';

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

const formatter = new Intl.NumberFormat('fa-IR');
const fmt = (value) => formatter.format(value);

const WALLET_BALANCE = 120000;
const SNAPP_MIN_TOTAL = 300000; // اسنپ‌پی برای سبدهای بالای ۳۰۰ هزار تومان
const DEMO_PROMO = { code: 'BOOKMARK10', rate: 0.1 };

const state = {
  method: 'gateway',
  promo: null,
  paid: false
};

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
  $('#payButton')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  flash($('.summary-card'));
});
$('#profileButton')?.addEventListener('click', () => {
  showToast('ورود و مدیریت حساب کاربری در نسخه نمایشی فعال نیست.');
});
$('#helpChat')?.addEventListener('click', () => {
  showToast('گفتگوی آنلاین با کارشناسان در نسخه نمایشی فعال نیست.');
});

// جست‌وجوی هدر: با Enter به فروشگاه می‌رود
$('#siteSearch')?.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter') return;
  const query = event.target.value.trim();
  window.location.href = query ? `main.html?q=${encodeURIComponent(query)}#bestsellers` : 'main.html#bestsellers';
});

// ===== محاسبه مبلغ‌ها =====
const items = $$('.order-item').map((element) => ({
  title: element.dataset.title,
  list: Number(element.dataset.list),
  price: Number(element.dataset.price)
}));

function totals() {
  const list = items.reduce((sum, item) => sum + item.list, 0);
  const price = items.reduce((sum, item) => sum + item.price, 0);
  const subscriberDiscount = list - price;
  const promoDiscount = state.promo ? Math.round(price * state.promo.rate) : 0;
  return { list, subscriberDiscount, promoDiscount, total: price - promoDiscount };
}

const minus = (value) => `<bdi dir="ltr">-${fmt(value)}</bdi> تومان`;

function selectMethod(method) {
  state.method = method;
  $$('.pay-option').forEach((option) => {
    const selected = option.dataset.method === method;
    option.classList.toggle('is-selected', selected);
    $('input', option).checked = selected;
  });
}

function render() {
  const { list, subscriberDiscount, promoDiscount, total } = totals();

  $('#subtotalValue').textContent = `${fmt(list)} تومان`;
  $('#discountValue').innerHTML = minus(subscriberDiscount);
  $('#promoRow').classList.toggle('hidden', !state.promo);
  if (state.promo) {
    $('#promoCodeLabel').textContent = state.promo.code;
    $('#promoValue').innerHTML = minus(promoDiscount);
  }
  $('#grandValue').textContent = fmt(total);
  $('#grandNote').textContent = `شامل تمامی ${fmt(items.length)} اثر از منتخب`;
  if (!state.paid) {
    $('#payLabel').textContent = `پرداخت امن ${fmt(total)} تومان و افزودن به کتابخانه`;
  }

  // کیف پول
  const walletPart = Math.min(WALLET_BALANCE, total);
  $('#walletDesc').textContent =
    total <= WALLET_BALANCE
      ? `تمام مبلغ (${fmt(total)} تومان) از اعتبار کیف پول شما کسر می‌شود.`
      : `مبلغ ${fmt(walletPart)} تومان از اعتبار شما کسر و مابقی (${fmt(total - walletPart)} تومان) از طریق درگاه پرداخت خواهد شد.`;

  // اسنپ‌پی
  const snappOption = $('#snappOption');
  const snappInput = $('input', snappOption);
  const eligible = total > SNAPP_MIN_TOTAL;
  snappOption.classList.toggle('is-disabled', !eligible);
  snappInput.disabled = !eligible;
  $('#snappInstallment').textContent = eligible ? `۴ قسط ${fmt(Math.round(total / 4))} تومانی` : '';
  $('#snappDesc').textContent = eligible
    ? 'قسط اول امروز و مابقی در سه ماه آینده بدون نیاز به چک و سفته برای سبدهای بالای ۳۰۰ هزار تومان.'
    : 'پرداخت اقساطی فقط برای سبدهای بالای ۳۰۰ هزار تومان فعال است.';
  if (!eligible && state.method === 'snapp') selectMethod('gateway');
}

// انتخاب روش پرداخت
$$('.pay-option input').forEach((input) => {
  input.addEventListener('change', () => selectMethod(input.value));
});

// ===== کد تخفیف =====
$('#promoForm')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const message = $('#promoMessage');
  const code = $('#promoInput').value.trim().toUpperCase();
  message.classList.remove('is-ok', 'is-error');
  if (!code) {
    message.textContent = 'ابتدا کد تخفیف را وارد کنید.';
    message.classList.add('is-error');
    return;
  }
  if (state.promo && state.promo.code === code) {
    message.textContent = 'این کد پیش‌تر اعمال شده است.';
    message.classList.add('is-error');
    return;
  }
  if (code !== DEMO_PROMO.code) {
    message.textContent = 'این کد معتبر نیست. دوباره بررسی کنید.';
    message.classList.add('is-error');
    return;
  }
  state.promo = DEMO_PROMO;
  message.textContent = `کد ${code} اعمال شد؛ ۱۰٪ تخفیف اضافه روی سفارش شما ثبت شد.`;
  message.classList.add('is-ok');
  render();
});

// ===== هدیه =====
const giftSwitch = $('#giftSwitch');
const giftFields = $('#giftFields');
giftSwitch?.addEventListener('click', () => {
  const on = giftSwitch.getAttribute('aria-checked') !== 'true';
  giftSwitch.setAttribute('aria-checked', String(on));
  giftFields.classList.toggle('hidden', !on);
  if (on) $('#giftEmail').focus();
});

function validateGift() {
  if (giftSwitch.getAttribute('aria-checked') !== 'true') return true;
  const input = $('#giftEmail');
  const error = $('#giftEmailError');
  const value = input.value.trim();
  let text = '';
  if (!value) text = 'ایمیل دریافت‌کننده‌ی هدیه را وارد کنید.';
  else if (!input.checkValidity()) text = 'نشانی ایمیل معتبر نیست.';
  error.textContent = text;
  input.closest('.field').classList.toggle('invalid', Boolean(text));
  input.setAttribute('aria-invalid', String(Boolean(text)));
  if (text) input.focus();
  return !text;
}
$('#giftEmail')?.addEventListener('input', () => {
  if ($('#giftEmail').closest('.field').classList.contains('invalid')) validateGift();
});

// ===== پرداخت و فاکتور شبیه‌ساز =====
const methodNames = {
  gateway: 'درگاه پرداخت اینترنتی شاپرک',
  wallet: 'کیف پول بوکمارک',
  snapp: 'پرداخت اقساطی اسنپ‌پی'
};
const dialog = $('#invoiceDialog');

function markStepsPaid() {
  const stepper = $('#stepper');
  const step2 = $('#step2');
  const step3 = $('#step3');
  stepper.style.setProperty('--progress', '1');
  step2.classList.remove('is-current');
  step2.classList.add('is-done');
  step2.removeAttribute('aria-current');
  $('.step-dot', step2).innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>';
  $('small', step2).textContent = 'تکمیل شد';
  step3.classList.add('is-current');
  step3.setAttribute('aria-current', 'step');
  $('small', step3).textContent = 'مرحله جاری';
}

$('#payButton')?.addEventListener('click', () => {
  if (state.paid) return;
  if (!validateGift()) return;

  const { total } = totals();
  $('#invoiceNumber').textContent = `BM-${fmt(Math.floor(100000 + Math.random() * 900000)).replace(/٬/g, '')}`;
  $('#invoiceMethod').textContent = methodNames[state.method];
  $('#invoiceTotal').textContent = `${fmt(total)} تومان`;
  $('#invoiceItems').innerHTML = items
    .map((item) => `<li><span>${item.title}</span><span>${fmt(item.price)} تومان</span></li>`)
    .join('');

  const giftOn = giftSwitch.getAttribute('aria-checked') === 'true';
  $('#invoiceGiftRow').classList.toggle('hidden', !giftOn);
  if (giftOn) $('#invoiceGift').textContent = $('#giftEmail').value.trim();

  state.paid = true;
  $('#payButton').disabled = true;
  $('#payLabel').textContent = 'پرداخت (نمایشی) ثبت شد';
  markStepsPaid();

  if (typeof dialog.showModal === 'function') dialog.showModal();
  else dialog.setAttribute('open', '');
});

$('#closeInvoice')?.addEventListener('click', () => dialog.close());
$('#goLibrary')?.addEventListener('click', () => {
  dialog.close();
  showToast('صفحه‌ی «کتابخانه من» در نسخه نمایشی فعال نیست.');
});
dialog?.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});

// ===== خبرنامه فوتر =====
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

render();
