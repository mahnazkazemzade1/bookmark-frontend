'use strict';

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
const fa = (value) => Number(value).toLocaleString('fa');

const PLUS_DISCOUNT = 15000; // تخفیف عضویت بوکمارک‌پلاس
const PROMO_CODES = { SPRING1403: 20000, BOOKMARK10: 10000 }; // کدهای نمایشی
const DEMO_MESSAGE = 'این نسخه نمایشی است؛ برای پرداخت واقعی باید درگاه پرداخت و سامانه سفارش متصل شود.';

const list = $('#cartList');
const state = { promo: null };

/* ---------- پیام کوتاه (با امکان بازگرداندن) ---------- */
const toast = $('#toast');
const toastText = $('#toastText');
const toastAction = $('#toastAction');
let toastTimer;
let toastHandler = null;

function showToast(message, action) {
  toastText.textContent = message;
  toastHandler = action?.handler || null;
  toastAction.classList.toggle('hidden', !action);
  if (action) toastAction.textContent = action.label;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), action ? 6000 : 3200);
}
toastAction.addEventListener('click', () => {
  toastHandler?.();
  toastHandler = null;
  toast.classList.remove('show');
});

/* ---------- منوی موبایل و دکمه‌های نمایشی ---------- */
const mobileMenu = $('#mobileMenu');
const mainNav = $('.main-nav');
mobileMenu?.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  mobileMenu.setAttribute('aria-expanded', String(isOpen));
  mobileMenu.setAttribute('aria-label', isOpen ? 'بستن منو' : 'باز کردن منو');
});
$$('.main-nav a').forEach((link) => link.addEventListener('click', () => {
  mainNav.classList.remove('open');
  mobileMenu?.setAttribute('aria-expanded', 'false');
}));
$('#profileButton')?.addEventListener('click', () => showToast('ورود و مدیریت حساب کاربری در نسخه نمایشی فعال نیست.'));

/* ---------- قیمت و محاسبه ---------- */
const items = () => $$('.cart-item:not(.is-leaving)', list);
const priceOf = (el) => Number(el.dataset.price);
const oldOf = (el) => Number(el.dataset.old || el.dataset.price);

function paintItem(el) {
  const price = priceOf(el);
  const old = oldOf(el);
  const hasDiscount = old > price;
  $('[data-role="price"]', el).textContent = fa(price);
  const oldEl = $('[data-role="old"]', el);
  const percentEl = $('[data-role="percent"]', el);
  oldEl.textContent = fa(old);
  percentEl.textContent = `−${fa(Math.round(((old - price) / old) * 100))}٪`;
  oldEl.classList.toggle('hidden', !hasDiscount);
  percentEl.classList.toggle('hidden', !hasDiscount);
}

function recalc() {
  const els = items();
  const count = els.length;
  const original = els.reduce((sum, el) => sum + oldOf(el), 0);
  const payable = els.reduce((sum, el) => sum + priceOf(el), 0);
  const publisher = original - payable;
  const plus = count ? PLUS_DISCOUNT : 0;
  const promoAmount = count && state.promo ? state.promo.amount : 0;
  const total = Math.max(0, payable - plus - promoAmount);

  $('#billCount').textContent = fa(count);
  $('#billOriginal').textContent = fa(original);
  $('#billPublisher').textContent = fa(publisher);
  $('#billPlus').textContent = fa(plus);
  $('#plusRow').classList.toggle('hidden', !count);
  $('#promoRow').classList.toggle('hidden', !(count && state.promo));
  if (state.promo) {
    $('#promoName').textContent = state.promo.code;
    $('#billPromo').textContent = fa(promoAmount);
  }
  $('#billFinal').textContent = fa(total);

  $('#headerCount').textContent = fa(count);
  $('#cartSubtitle').textContent = count ? `(${fa(count)} عنوان اثر برگزیده)` : '(بدون عنوان)';
  $('#cartEmpty').classList.toggle('hidden', count !== 0);
  $('#clearCart').classList.toggle('hidden', count === 0);
  $('#checkoutButton').disabled = count === 0;
  $('.upsell').classList.toggle('hidden', count === 0);
  $('.upsell-text').textContent = `بر اساس تحلیل علایق فکری خوانندگان این ${fa(count)} اثر، کتاب زیر با بالاترین میزان تطابق پیشنهاد می‌شود.`;

  const upsellButton = $('#addUpsell');
  const inCart = els.some((el) => el.dataset.id === $('#upsellCard').dataset.id);
  upsellButton.disabled = inCart;
  upsellButton.lastChild.textContent = inCart ? 'در سبد شما است' : 'افزودن به سبد';
}

/* ---------- حذف، انتقال به نشانک‌ها و بازگرداندن ---------- */
function restore(entries) {
  [...entries].sort((a, b) => a.index - b.index).forEach(({ node, index }) => {
    node.classList.remove('is-leaving');
    if (!node.isConnected) list.insertBefore(node, list.children[index] || null);
  });
  recalc();
}

function removeEntries(entries, message) {
  entries.forEach(({ node }) => node.classList.add('is-leaving'));
  recalc();
  setTimeout(() => {
    entries.forEach(({ node }) => {
      if (node.classList.contains('is-leaving')) node.remove();
    });
  }, 260);
  showToast(message, { label: 'بازگرداندن', handler: () => restore(entries) });
}

list.addEventListener('click', (event) => {
  const button = event.target.closest('[data-act]');
  if (!button) return;
  const node = button.closest('.cart-item');
  const entry = { node, index: [...list.children].indexOf(node) };
  const title = node.dataset.title;
  if (button.dataset.act === 'save') {
    removeEntries([entry], `«${title}» به نشانک‌ها منتقل شد.`);
  } else {
    removeEntries([entry], `«${title}» از سبد حذف شد.`);
  }
});

$('#clearCart').addEventListener('click', () => {
  const entries = items().map((node) => ({ node, index: [...list.children].indexOf(node) }));
  if (!entries.length) return;
  removeEntries(entries, 'همه عنوان‌ها از سبد برداشته شد.');
});

/* ---------- پیشنهاد هوشمند: افزودن به سبد ---------- */
function buildItem(source) {
  const el = document.createElement('article');
  el.className = 'cart-item is-new';
  el.dataset.id = source.dataset.id;
  el.dataset.price = source.dataset.price;
  el.dataset.old = source.dataset.old;
  el.dataset.title = source.dataset.title;
  const cover = $('.upsell-cover', source);
  el.innerHTML = `
    <figure class="item-cover tone-green">
      <img alt="" loading="lazy">
      <figcaption class="cover-badge"><svg aria-hidden="true"><use href="#i-book-open"/></svg>نسخه دیجیتال</figcaption>
    </figure>
    <div class="item-body">
      <div class="item-tags"><span class="tag">بهره‌وری و تمرکز</span><span class="tag is-offer">تخفیف همراه ۱۵٪</span></div>
      <h2></h2>
      <p class="item-meta">نویسنده: <strong>کال نیوپورت</strong> <i>|</i> ترجمه: <strong>ناهید ملکی</strong></p>
      <p class="item-meta"><svg aria-hidden="true"><use href="#i-cloud"/></svg>قابلیت: <strong>همگام‌سازی ابری و حالت تمرکز کامل</strong></p>
      <div class="item-foot">
        <div class="item-actions"><button type="button" data-act="save"><svg aria-hidden="true"><use href="#i-save"/></svg>انتقال به نشانک‌ها</button><button type="button" data-act="remove"><svg aria-hidden="true"><use href="#i-trash"/></svg>حذف</button></div>
        <div class="item-price"><strong data-role="price"></strong><span>تومان</span><del data-role="old"></del><em data-role="percent"></em></div>
      </div>
    </div>`;
  const img = $('img', el);
  img.src = cover.src;
  img.alt = `جلد کتاب ${source.dataset.title}`;
  $('h2', el).textContent = source.dataset.title;
  return el;
}

$('#addUpsell').addEventListener('click', () => {
  const source = $('#upsellCard');
  if (items().some((el) => el.dataset.id === source.dataset.id)) return;
  const el = buildItem(source);
  list.appendChild(el);
  paintItem(el);
  recalc();
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  showToast(`«${source.dataset.title}» به سبد اضافه شد.`);
});

/* ---------- کد تخفیف ---------- */
const promoInput = $('#promoInput');
const promoMessage = $('#promoMessage');
const toLatinDigits = (text) => text.replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));

function setPromoMessage(text, isError = false) {
  promoMessage.textContent = text;
  promoMessage.classList.toggle('is-error', isError);
}

$('#promoForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const code = toLatinDigits(promoInput.value).trim().toUpperCase();
  if (!code) {
    setPromoMessage('ابتدا کد تخفیف را وارد کنید.', true);
    promoInput.focus();
    return;
  }
  if (!items().length) {
    setPromoMessage('سبد خرید خالی است.', true);
    return;
  }
  if (PROMO_CODES[code]) {
    state.promo = { code, amount: PROMO_CODES[code] };
    setPromoMessage(`کد ${code} اعمال شد؛ ${fa(PROMO_CODES[code])} تومان از مبلغ نهایی کم شد.`);
    promoInput.value = '';
    recalc();
  } else {
    setPromoMessage('این کد معتبر نیست یا منقضی شده است.', true);
  }
});

$('#promoRemove').addEventListener('click', () => {
  state.promo = null;
  setPromoMessage('کد تخفیف برداشته شد.');
  recalc();
});

/* ---------- ادامه فرایند ---------- */
$('#checkoutButton').addEventListener('click', () => showToast(DEMO_MESSAGE));

/* ---------- خبرنامه ---------- */
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

/* ---------- شروع ---------- */
$$('.cart-item', list).forEach(paintItem);
recalc();
