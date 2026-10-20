'use strict';

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
const fa = (value) => Number(value).toLocaleString('fa');

const PAGE_SIZE = 12;
const CATALOG_TOTAL = 1450; // کل کاتالوگ نمایشی؛ فقط ۱۲ عنوان این صفحه در این نسخه داده دارند
const DEMO_MESSAGE = 'این نسخه نمایشی است؛ فقط ۱۲ عنوان نخست در دسترس است.';

const CATEGORY_LABELS = { fiction: 'ادبیات داستانی', psych: 'روان‌شناسی', philosophy: 'فلسفه', cognitive: 'علوم شناختی', history: 'تاریخ و جامعه‌شناسی', business: 'کسب‌وکار', poetry: 'شعر و ادبیات کلاسیک' };
const CATEGORY_CHIP_ORDER = ['philosophy', 'psych', 'cognitive', 'fiction', 'history', 'business', 'poetry'];
const FORMAT_LABELS = { epub: 'متن', audio: 'صوتی', bundle: 'بسته جامع', summary: 'خلاصه تحلیلی' };
const FEATURE_LABELS = { sample: 'نمونه رایگان', review: 'نقد تحریریه', ai: 'سازگار با دستیار', plus: 'بوکمارک‌پلاس' };
const LANG_LABELS = { en: 'انگلیسی', de: 'آلمانی', fr: 'فرانسه', ru: 'روسی', fa: 'تألیف فارسی' };

const cover = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&h=900&q=80`;

// داده نمایشی ۱۲ عنوان؛ عکس‌ها نمونه‌اند و باید با جلد واقعی هر کتاب عوض شوند
const BOOKS = [
  { id: 1, title: 'انسان در جستجوی معنی', author: 'ویکتور فرانکل', translator: 'مهین میلانی', cat: 'روان‌شناسی اگزیستانسیال', rating: 4.9, feature: 'متن EPUB با قابلیت یادداشت', icon: 'book-open', priceLabel: 'قیمت نسخه دیجیتال', price: 68000, badge: { text: 'پرفروش هفته', tone: 'dark' }, ribbon: true, img: cover('photo-1544947950-fa07a98d237f'), cats: ['psych', 'philosophy'], formats: ['epub'], lang: 'de', sample: true, review: true, ai: true, plus: false, rank: 1 },
  { id: 2, title: 'دنیای سوفی', author: 'یوستین گردر', translator: 'حسن کامشاد', cat: 'تاریخ فلسفه داستانی', rating: 4.8, feature: '۱۸ ساعت روایت با گویندگی استاد کامشاد', icon: 'clock', priceLabel: 'قیمت نسخه صوتی', price: 145000, badge: { text: 'صوتی استودیویی', tone: 'dark', icon: 'headphones' }, img: cover('photo-1543002588-bfa74002ed7e'), cats: ['fiction', 'philosophy'], formats: ['audio'], lang: 'en', sample: true, review: true, ai: true, plus: true, rank: 2, audio: true },
  { id: 3, title: 'تفکر، سریع و کند', author: 'دانیل کانمن', translator: 'فاطمه سادات', cat: 'علوم شناختی', rating: 4.7, feature: 'دارای خلاصه نموداری و نکات کلیدی', icon: 'chart', priceLabel: 'قیمت دیجیتال', price: 110000, img: cover('photo-1512820790803-83ca734da794'), cats: ['cognitive', 'psych'], formats: ['epub'], lang: 'en', sample: true, review: false, ai: true, plus: false, rank: 3 },
  { id: 4, title: 'کار عمیق', author: 'کال نیوپورت', translator: 'ناهید ملکی', cat: 'بهره‌وری فردی', rating: 4.8, feature: 'شامل برنامه ۴ مرحله‌ای تمرکز', icon: 'flag', priceLabel: 'قیمت دیجیتال', price: 72250, old: 85000, badge: { text: '۱۵٪ تخفیف', tone: 'red' }, img: cover('photo-1519682337058-a94d519337bc'), cats: ['business', 'psych'], formats: ['epub'], lang: 'en', sample: true, review: false, ai: true, plus: false, rank: 4 },
  { id: 5, title: 'وقتی نیچه گریست', author: 'اروین یالوم', translator: 'سپیده حبیب', cat: 'رمان اگزیستانسیال', rating: 4.9, feature: 'نسخه رسمی با تأیید نویسنده', icon: 'check-circle', priceLabel: 'قیمت نسخه دیجیتال', price: 77000, ribbon: true, img: cover('photo-1516979187457-637abb4f9353'), cats: ['fiction', 'psych', 'philosophy'], formats: ['epub'], lang: 'en', sample: true, review: true, ai: true, plus: true, rank: 5 },
  { id: 6, title: 'هنر شفاف اندیشیدن', author: 'رولف دوبلی', translator: 'عادل فردوسی‌پور', cat: 'خطاهای شناختی', rating: 4.8, feature: 'با مقدمه صوتی اختصاصی مترجم', icon: 'mic', priceLabel: 'قیمت دیجیتال', price: 85000, badge: { text: 'نمونه صوتی رایگان', tone: 'mint' }, img: cover('photo-1481627834876-b7833e8f5570'), cats: ['cognitive', 'psych'], formats: ['epub', 'audio'], lang: 'de', sample: true, review: false, ai: true, plus: false, rank: 6 },
  { id: 7, title: 'کیمیاگر', author: 'پائولو کوئیلو', translator: 'دل‌آرا قهرمان', cat: 'رمان تمثیلی', rating: 4.6, feature: 'همراه با نقد نمادشناسی', icon: 'notes', priceLabel: 'قیمت پکیج', price: 58000, badge: { text: 'متن + صوت', tone: 'gold' }, img: cover('photo-1495446815901-a7297e633e8d'), cats: ['fiction', 'philosophy'], formats: ['epub', 'audio', 'bundle'], lang: 'en', sample: true, review: true, ai: true, plus: false, rank: 7 },
  { id: 8, title: 'انسان خردمند', author: 'یووال نوح هراری', translator: 'نیک‌گرگین', cat: 'تاریخ و انسان‌شناسی', rating: 4.9, feature: 'ویرایش کامل با نمودارها و تصاویر', icon: 'layers', priceLabel: 'قیمت دیجیتال', price: 84000, img: cover('photo-1524995997946-a1c2e315a42f'), cats: ['history', 'philosophy'], formats: ['epub'], lang: 'en', sample: true, review: true, ai: true, plus: true, rank: 8 },
  { id: 9, title: 'عادت‌های اتمی', author: 'جیمز کلیر', translator: 'هادی بهنامی', cat: 'توسعه فردی', rating: 4.7, feature: 'شامل کاربرگ‌های تمرینی قابل تکمیل', icon: 'notes', priceLabel: 'قیمت دیجیتال', price: 66500, img: cover('photo-1532012197267-da84d127e765'), cats: ['business', 'psych'], formats: ['epub'], lang: 'en', sample: true, review: false, ai: true, plus: false, rank: 9 },
  { id: 10, title: 'جنایت و مکافات', author: 'فئودور داستایفسکی', translator: 'مهری آهی', cat: 'ادبیات کلاسیک روسیه', rating: 4.9, feature: 'دو جلدی کامل با واژه‌نامه اختصاصی', icon: 'flag', priceLabel: 'دوره دو جلدی', price: 105000, badge: { text: 'شاهکار کلاسیک', tone: 'dark' }, ribbon: true, img: cover('photo-1507842217343-583bb7270b66'), cats: ['fiction', 'poetry', 'philosophy'], formats: ['epub'], lang: 'ru', sample: true, review: true, ai: true, plus: true, rank: 10 },
  { id: 11, title: 'در باب حکمت زندگی', author: 'آرتور شوپنهاور', translator: 'محمد مبشری', cat: 'فلسفه اخلاق', rating: 4.7, feature: 'نسخه بازنویسی‌شده تحریریه بوکمارک', icon: 'book-open', priceLabel: 'قیمت دیجیتال', price: 54000, img: cover('photo-1497633762265-9d179a990aa6'), cats: ['philosophy'], formats: ['epub'], lang: 'de', sample: true, review: true, ai: true, plus: false, rank: 11 },
  { id: 12, title: 'خیره به خورشید نگریستن', author: 'اروین یالوم', translator: 'مهدی غبرایی', cat: 'روان‌درمانی اگزیستانسیال', rating: 4.8, feature: 'نسخه کامل با یادداشت‌های تکمیلی', icon: 'notes', priceLabel: 'قیمت دیجیتال', price: 62000, img: cover('photo-1476275466078-4007374efbbe'), cats: ['psych', 'philosophy'], formats: ['epub'], lang: 'en', sample: true, review: false, ai: true, plus: false, rank: 12 },
];

/* ---------- پیام کوتاه ---------- */
const toast = $('#toast');
let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

/* ---------- منو و دکمه‌های عمومی ---------- */
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

const filterToggle = $('#filterToggle');
const filterPanel = $('#filterPanel');
filterToggle.addEventListener('click', () => {
  const open = filterPanel.classList.toggle('is-open');
  filterToggle.setAttribute('aria-expanded', String(open));
});

/* ---------- خواندن وضعیت فیلترها از فرم ---------- */
const priceRange = $('#priceRange');
const searchInput = $('#searchInput');
const sortSelect = $('#sortSelect');
const grid = $('#bookGrid');
let band = null; // بازه سریع قیمت؛ وقتی اسلایدر حرکت کند پاک می‌شود

const normalize = (text) => String(text).replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/[\u200c]/g, ' ').replace(/\s+/g, ' ').trim().toLocaleLowerCase('fa');
const checkedValues = (name) => $$(`input[name="${name}"]:checked`).map((input) => input.value);

function readState() {
  const rating = $('input[name="rating"]:checked');
  const lang = $('#langChips .is-active')?.dataset.lang || 'all';
  const max = Number(priceRange.value);
  return {
    query: normalize(searchInput.value),
    cats: checkedValues('cat'),
    formats: checkedValues('format'),
    features: checkedValues('feature'),
    rating: rating ? Number(rating.value) : null,
    lang,
    price: band ? { min: band.min, max: band.max } : { min: 0, max },
    sort: sortSelect.value,
  };
}

function matches(book, state) {
  if (state.cats.length && !book.cats.some((c) => state.cats.includes(c))) return false;
  if (state.formats.length && !book.formats.some((f) => state.formats.includes(f))) return false;
  if (!state.features.every((f) => book[f])) return false;
  if (state.rating !== null && book.rating < state.rating) return false;
  if (state.lang !== 'all' && book.lang !== state.lang) return false;
  if (book.price < state.price.min || book.price > state.price.max) return false;
  if (state.query) {
    const haystack = normalize(`${book.title} ${book.author} ${book.translator} ${book.cat}`);
    if (!haystack.includes(state.query)) return false;
  }
  return true;
}

const sorters = {
  rank: (a, b) => a.rank - b.rank,
  rating: (a, b) => b.rating - a.rating || a.rank - b.rank,
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
};

/* ---------- ساخت کارت‌ها ---------- */
const icon = (name) => `<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;

function cardHtml(book, inCart, wished) {
  const badge = book.badge ? `<span class="cover-badge is-${book.badge.tone}">${book.badge.icon ? icon(book.badge.icon) : ''}${book.badge.text}</span>` : '';
  const ribbon = book.ribbon ? `<span class="cover-ribbon" aria-hidden="true">${icon('bookmark')}</span>` : '';
  const old = book.old ? `<del>${fa(book.old)}</del>` : '';
  const buyLabel = inCart ? 'در سبد شما' : book.audio ? 'شنیدن و خرید' : 'خرید آن';
  return `
    <article class="book-card" data-id="${book.id}">
      <a class="book-cover" href="#" data-open aria-label="مشاهده ${book.title}">
        <img src="${book.img}" alt="تصویر نمونه برای کتاب ${book.title}" loading="lazy">
        <span class="cover-fallback" aria-hidden="true">${book.title}</span>
        ${badge}${ribbon}
      </a>
      <div class="book-meta-top"><span class="book-cat">${book.cat}</span><span class="book-rating"><b aria-hidden="true">★</b>${book.rating.toLocaleString('fa', { minimumFractionDigits: 1 })}</span></div>
      <h3>${book.title}</h3>
      <p class="book-by">${book.author} · ترجمه ${book.translator}</p>
      <p class="book-feature">${icon(book.icon)}<span>${book.feature}</span></p>
      <div class="book-foot">
        <div class="book-actions">
          <button class="buy-button${inCart ? ' is-added' : ''}" type="button" data-buy>${icon(inCart ? 'check-circle' : 'cart')}${buyLabel}</button>
          <button class="wish-button" type="button" data-wish aria-pressed="${wished}" aria-label="افزودن ${book.title} به علاقه‌مندی‌ها">${icon('heart')}</button>
        </div>
        <div class="book-price"><small>${book.priceLabel}</small>${old}<strong>${fa(book.price)}</strong><span>تومان</span></div>
      </div>
    </article>`;
}

const bannerHtml = `
  <section class="promo-banner" id="smartEditor" aria-labelledby="smartEditorTitle">
    <div class="promo-copy">
      <span class="promo-badge">${icon('sparkle')}سردبیر هوشمند بوکمارک</span>
      <h2 id="smartEditorTitle">در میان هزاران کتاب، مسیر اختصاصی خود را پیدا کنید</h2>
      <p>نمی‌دانید از چه اثری شروع کنید؟ کافیست کتاب‌های مورد علاقه گذشته و زمان روزانه‌تان را بگویید تا دستیار هوش مصنوعی بوکمارک یک نقشه راه ۳۰ روزه مطالعه تدوین کند.</p>
    </div>
    <div class="promo-actions">
      <button class="btn-peach" type="button" data-banner="ai">${icon('sparkle')}تدوین مسیر با هوش مصنوعی</button>
      <button class="btn-ghost" type="button" data-banner="more">بیشتر بدانید</button>
    </div>
  </section>`;

const cartIds = new Set();
const wishIds = new Set();
let cartCount = 3; // سه عنوانی که از قبل در صفحه سبد خرید است

/* ---------- نمایش نتایج، چیپ‌ها و صفحه‌بندی ---------- */
function formatChip(state) {
  if (!state.formats.length) return null;
  const set = new Set(state.formats);
  const text = set.size === 2 && set.has('epub') && set.has('audio') ? 'متن و صوتی' : state.formats.map((f) => FORMAT_LABELS[f]).join(' و ');
  return { key: 'format', text: `فرمت: ${text}`, tone: 'peach' };
}

function appliedChips(state) {
  const chips = [];
  const format = formatChip(state);
  if (format) chips.push(format);
  if (state.cats.length) {
    const ordered = [...state.cats].sort((a, b) => CATEGORY_CHIP_ORDER.indexOf(a) - CATEGORY_CHIP_ORDER.indexOf(b));
    chips.push({ key: 'cat', text: `دسته: ${ordered.map((c) => CATEGORY_LABELS[c]).join(' و ')}`, tone: 'mint' });
  }
  if (state.rating !== null) chips.push({ key: 'rating', text: `★ امتیاز: بالاتر از ${state.rating.toLocaleString('fa')}`, tone: 'peach' });
  if (state.price.min !== 0 || state.price.max !== 250000) {
    const { min, max } = state.price;
    const text = max === 0 ? 'رایگان و هدیه' : min <= 1 ? `تا ${fa(max)} تومان` : max >= 250000 ? `بیش از ${fa(min)} تومان` : `${fa(min)} تا ${fa(max)} تومان`;
    chips.push({ key: 'price', text: `قیمت: ${text}`, tone: 'peach' });
  }
  if (state.features.length) chips.push({ key: 'feature', text: `امکانات: ${state.features.map((f) => FEATURE_LABELS[f]).join('، ')}`, tone: 'peach' });
  if (state.lang !== 'all') chips.push({ key: 'lang', text: `زبان: ${LANG_LABELS[state.lang]}`, tone: 'mint' });
  if (state.query) chips.push({ key: 'query', text: `جست‌وجو: «${searchInput.value.trim()}»`, tone: 'peach' });
  return chips;
}

function renderChips(state) {
  const chips = appliedChips(state);
  $('#appliedList').innerHTML = chips.length
    ? chips.map((chip) => `<li><button class="applied-chip${chip.tone === 'mint' ? ' is-mint' : ''}" type="button" data-remove="${chip.key}" aria-label="برداشتن فیلتر ${chip.text}">${chip.text}${icon('x')}</button></li>`).join('')
    : '<li class="applied-empty">فیلتری اعمال نشده است.</li>';
  $('#clearFilters').classList.toggle('hidden', chips.length === 0);
}

function renderPagination(total, shown) {
  const pages = Math.ceil(total / PAGE_SIZE);
  $('#pageInfo').textContent = shown
    ? `نمایش ۱ تا ${fa(shown)} از مجموع ${fa(total)} کتاب در ${fa(pages)} صفحه`
    : 'نتیجه‌ای برای نمایش وجود ندارد';
  const buttons = $('#pageButtons');
  if (pages <= 1) {
    buttons.innerHTML = '';
    return;
  }
  buttons.innerHTML = `
    <button class="page-button" type="button" disabled>${icon('chevron-right')}قبلی</button>
    <button class="page-button is-active" type="button" aria-current="page">${fa(1)}</button>
    <button class="page-button" type="button" data-page="2">${fa(2)}</button>
    <button class="page-button" type="button" data-page="3">${fa(3)}</button>
    <span class="page-gap" aria-hidden="true">…</span>
    <button class="page-button" type="button" data-page="${pages}">${fa(pages)}</button>
    <button class="page-button" type="button" data-page="next">بعدی${icon('chevron-left')}</button>`;
}

function render() {
  const state = readState();
  const result = BOOKS.filter((book) => matches(book, state)).sort(sorters[state.sort]);
  const total = result.length === BOOKS.length ? CATALOG_TOTAL : result.length;

  let html = '';
  result.forEach((book, index) => {
    if (index === 6) html += bannerHtml;
    html += cardHtml(book, cartIds.has(book.id), wishIds.has(book.id));
  });
  grid.innerHTML = html;
  $('#emptyStore').classList.toggle('hidden', result.length !== 0);

  $('#resultCount').textContent = result.length ? `نمایش ۱ تا ${fa(result.length)} از ${fa(total)} کتاب برگزیده` : 'کتابی پیدا نشد';
  $('#statTotal').textContent = fa(total);
  renderChips(state);
  renderPagination(total, result.length);
  watchCovers();
}

// اگر عکس جلد بالا نیامد، عنوان کتاب به‌جای آن نشان داده می‌شود
function watchCovers() {
  $$('.book-cover img', grid).forEach((img) => {
    const markBroken = () => img.closest('.book-cover').classList.add('is-broken');
    if (img.complete && img.naturalWidth === 0 && img.currentSrc !== '') markBroken();
    img.addEventListener('error', markBroken, { once: true });
  });
}

/* ---------- رویدادهای فیلتر ---------- */
$$('input[name="cat"], input[name="format"], input[name="feature"], input[name="rating"]').forEach((input) => input.addEventListener('change', render));
searchInput.addEventListener('input', render);
sortSelect.addEventListener('change', render);

function syncRange() {
  const max = Number(priceRange.max);
  priceRange.style.setProperty('--fill', `${(Number(priceRange.value) / max) * 100}%`);
  const value = band ? band.max : Number(priceRange.value);
  $('#priceLabel').textContent = value === 0 ? 'رایگان' : `تا ${fa(value)} تومان`;
  $('#priceMid').textContent = `${fa(Math.round(max * 0.64))} تومان`;
  $$('#bandChips button').forEach((chip) => {
    chip.classList.toggle('is-active', !!band && Number(chip.dataset.min) === band.min && Number(chip.dataset.max) === band.max);
  });
}

priceRange.addEventListener('input', () => {
  band = null;
  syncRange();
  render();
});

$('#bandChips').addEventListener('click', (event) => {
  const chip = event.target.closest('button');
  if (!chip) return;
  const next = { min: Number(chip.dataset.min), max: Number(chip.dataset.max) };
  const same = band && band.min === next.min && band.max === next.max;
  band = same ? null : next;
  priceRange.value = band ? band.max : priceRange.max;
  syncRange();
  render();
});

$('#langChips').addEventListener('click', (event) => {
  const chip = event.target.closest('button');
  if (!chip) return;
  $$('#langChips button').forEach((item) => item.classList.toggle('is-active', item === chip));
  render();
});

function resetFilter(key) {
  const uncheck = (selector) => $$(selector).forEach((input) => { input.checked = false; });
  if (key === 'format') uncheck('input[name="format"]');
  if (key === 'cat') uncheck('input[name="cat"]');
  if (key === 'feature') uncheck('input[name="feature"]');
  if (key === 'rating') uncheck('input[name="rating"]');
  if (key === 'price') {
    band = null;
    priceRange.value = priceRange.max;
  }
  if (key === 'lang') $$('#langChips button').forEach((item) => item.classList.toggle('is-active', item.dataset.lang === 'all'));
  if (key === 'query') searchInput.value = '';
}

$('#appliedList').addEventListener('click', (event) => {
  const chip = event.target.closest('[data-remove]');
  if (!chip) return;
  resetFilter(chip.dataset.remove);
  syncRange();
  render();
});

$('#clearFilters').addEventListener('click', () => {
  ['format', 'cat', 'feature', 'rating', 'price', 'lang', 'query'].forEach(resetFilter);
  syncRange();
  render();
  showToast('همه فیلترها پاک شد.');
});

/* ---------- نمای شبکه‌ای / فهرستی ---------- */
$$('.view-button').forEach((button) => button.addEventListener('click', () => {
  grid.classList.toggle('is-list', button.dataset.view === 'list');
  $$('.view-button').forEach((item) => {
    const active = item === button;
    item.classList.toggle('is-active', active);
    item.setAttribute('aria-pressed', String(active));
  });
}));

/* ---------- کنش‌های کارت‌ها ---------- */
grid.addEventListener('click', (event) => {
  const card = event.target.closest('.book-card');
  const bannerButton = event.target.closest('[data-banner]');
  if (bannerButton) {
    showToast(bannerButton.dataset.banner === 'ai' ? 'دستیار هوش مصنوعی در نسخه نمایشی متصل نیست.' : 'صفحه معرفی سردبیر هوشمند در نسخه نمایشی فعال نیست.');
    return;
  }
  if (!card) return;
  const book = BOOKS.find((item) => item.id === Number(card.dataset.id));

  if (event.target.closest('[data-open]')) {
    event.preventDefault();
    showToast(`صفحه «${book.title}» در نسخه نمایشی فعال نیست.`);
    return;
  }

  const buy = event.target.closest('[data-buy]');
  if (buy) {
    const adding = !cartIds.has(book.id);
    if (adding) cartIds.add(book.id); else cartIds.delete(book.id);
    cartCount += adding ? 1 : -1;
    $('#headerCount').textContent = fa(cartCount);
    buy.classList.toggle('is-added', adding);
    buy.innerHTML = `${icon(adding ? 'check-circle' : 'cart')}${adding ? 'در سبد شما' : book.audio ? 'شنیدن و خرید' : 'خرید آن'}`;
    showToast(adding ? `«${book.title}» به سبد اضافه شد.` : `«${book.title}» از سبد برداشته شد.`);
    return;
  }

  const wish = event.target.closest('[data-wish]');
  if (wish) {
    const adding = !wishIds.has(book.id);
    if (adding) wishIds.add(book.id); else wishIds.delete(book.id);
    wish.setAttribute('aria-pressed', String(adding));
    showToast(adding ? `«${book.title}» به علاقه‌مندی‌ها اضافه شد.` : `«${book.title}» از علاقه‌مندی‌ها برداشته شد.`);
  }
});

$('#pageButtons').addEventListener('click', (event) => {
  if (event.target.closest('[data-page]')) showToast(DEMO_MESSAGE);
});

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

syncRange();
render();
