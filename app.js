/* ==========================================================================
   VEYLO — site behaviour
   - Arabic-first, with an English switch (remembered per visitor)
   - Collection: each category opens with its banner, then a grid of every
     piece in it. Edit CATEGORIES and PRODUCTS below to change the catalogue.
   - Each piece's image is its original collection board from
     img/collection/, shown whole and never cropped.
   - Quick view (colour, size, add to bag), bag drawer (remembered per
     visitor). Checkout is not connected yet.
   - Light effects: the hero light follows the pointer, and the embroidered
     tagline brightens where the pointer is
   ========================================================================== */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable: keep going */ } },
  };
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------------
     Copy
     ------------------------------------------------------------------------ */
  const I18N = {
    ar: {
      'nav.collection': 'المجموعة',
      'nav.hoodies': 'البلوفرات',
      'nav.sweaters': 'السويترات',
      'nav.pay': 'الدفع',
      'hero.title': 'أهلاً بك في فيلو — Welcome to VEYLO',
      'hero.alt': 'شعار فيلو وعبارة «أهلاً بك في فيلو» في غرفة حجرية معتمة، وصندوق فيلو الأسود على رف حجري يلامسه شعاع ضوء',
      'hero.cta': 'اكتشف المجموعة',
      'slide.welcome': 'الترحيب',
      'slide.pay': 'طرق الدفع',
      'collection.title': 'المجموعة',
      'card.photoSoon': 'الصورة قريباً',
      'cat.all': 'الكل',
      'cat.filter': 'تصفية حسب الموديل',
      'cat.crumbs': 'مسار الصفحة',
      'cat.other': 'تسوّق {name}',
      'card.view': 'عرض القطعة',
      'piece.details': 'التفاصيل',
      'piece.color': 'اللون',
      'piece.size': 'المقاس',
      'piece.add': 'أضف إلى الحقيبة',
      'piece.pickSize': 'اختر المقاس أولاً.',
      'piece.added': 'أُضيفت إلى حقيبتك.',
      'stage.alt': 'شعار فيلو وعبارة Made in Saudi Arabia على جدار داكن بين صخرتين ونباتات، تعبره ظلال ضوء مائلة',
      'pay.title': 'طرق دفع آمنة وسهلة',
      'pay.sub': 'اختر طريقة الدفع اللي تناسبك',
      'pay.alt': 'يد تُخرج بطاقة فيلو السوداء من محفظة جلدية، بجانب عبارة «طرق دفع آمنة وسهلة» وشعارات مدى وتابي وApple Pay وتمارا',
      'foot.made': 'صُنع في السعودية',
      'bag.open': 'افتح الحقيبة',
      'bag.title': 'الحقيبة',
      'bag.close': 'إغلاق',
      'bag.empty': 'الحقيبة فارغة. القطع تنتظرك في العتمة.',
      'bag.subtotal': 'المجموع',
      'bag.checkout': 'إتمام الطلب',
      'bag.view': 'عرض الحقيبة',
      'bag.remove': 'إزالة',
      'bag.inc': 'زيادة الكمية',
      'bag.dec': 'إنقاص الكمية',
      'bag.preview': 'هذه نسخة تجريبية — الدفع غير مفعّل بعد.',
      'toast.added': 'أُضيفت إلى الحقيبة',
      'lang.switch': 'Switch to English',
    },
    en: {
      'nav.collection': 'Collection',
      'nav.hoodies': 'Pullovers',
      'nav.sweaters': 'Sweaters',
      'nav.pay': 'Payment',
      'hero.title': 'Welcome to VEYLO',
      'hero.alt': 'The VEYLO wordmark and “Welcome to VEYLO” in a dim stone room; a black VEYLO box rests on a stone ledge in a shaft of light',
      'hero.cta': 'Discover the collection',
      'slide.welcome': 'Welcome',
      'slide.pay': 'Payment methods',
      'collection.title': 'Pullovers & sweaters',
      'card.photoSoon': 'Photo coming',
      'cat.all': 'All',
      'cat.filter': 'Filter by style',
      'cat.crumbs': 'Breadcrumb',
      'cat.other': 'Shop {name}',
      'card.view': 'View piece',
      'piece.details': 'Details',
      'piece.color': 'Colour',
      'piece.size': 'Size',
      'piece.add': 'Add to bag',
      'piece.pickSize': 'Choose a size first.',
      'piece.added': 'Added to your bag.',
      'stage.alt': 'The VEYLO wordmark and “Made in Saudi Arabia” on a dark wall between stones and plants, crossed by slanted light',
      'pay.title': 'Safe, easy ways to pay',
      'pay.sub': 'Choose the way that suits you',
      'pay.alt': 'A hand slides a black VEYLO card from a leather wallet, beside the payment options mada, tabby, Apple Pay and tamara',
      'foot.made': 'Made in Saudi Arabia',
      'bag.open': 'Open bag',
      'bag.title': 'Bag',
      'bag.close': 'Close',
      'bag.empty': 'Your bag is empty. The pieces are waiting in the dark.',
      'bag.subtotal': 'Subtotal',
      'bag.checkout': 'Checkout',
      'bag.view': 'View bag',
      'bag.remove': 'Remove',
      'bag.inc': 'Increase quantity',
      'bag.dec': 'Decrease quantity',
      'bag.preview': 'This is a preview — checkout isn’t connected yet.',
      'toast.added': 'Added to bag',
      'lang.switch': 'التبديل إلى العربية',
    },
  };

  /* ------------------------------------------------------------------------
     Catalogue
     CATEGORIES: each opens with its banner (original image, uncropped). More
     than one banner cross-fades slowly. The banner's text — title, line and
     link — is live page text laid over the empty side of the photo
     (`side`, as a fraction of the banner width). On phones each banner shows
     as a square slice centred on `mfocus`, with the text over its lower part.
     ------------------------------------------------------------------------ */
  const CATEGORIES = [
    {
      id: 'pullovers',
      eyebrow: 'Pullovers',
      title: { ar: 'البلوفرات', en: 'Pullovers' },
      lede: { ar: 'تفاصيل تكمل أسلوبك', en: 'Details that complete your style' },
      cta: { ar: 'اكتشف البلوفرات', en: 'Discover the pullovers' },
      side: 'left', inset: 5.3, top: 50, width: 21,
      banners: [
        {
          img: 'img/hoodie-black.jpg', w: 1600, h: 533, mfocus: '78% 50%',
          alt: {
            ar: 'ظهر بلوفر أسود مغسول مطرّز عليه Where Mystery Meets Style في ممر حجري معتم',
            en: 'The back of a washed-black pullover embroidered “Where Mystery Meets Style”, in a dark stone passage',
          },
        },
        {
          img: 'img/hoodie-sand.jpg', w: 1600, h: 533, mfocus: '88% 50%',
          alt: {
            ar: 'ظهر بلوفر رملي مطرّز عليه Where Mystery Meets Style في ممر حجري معتم',
            en: 'The back of a sand pullover embroidered “Where Mystery Meets Style”, in a dark stone passage',
          },
        },
      ],
    },
    {
      id: 'sweaters',
      eyebrow: 'Sweaters',
      title: { ar: 'السويترات', en: 'Sweaters' },
      lede: { ar: 'راحة تدوم .. في كل خطوة', en: 'Comfort that lasts, every step' },
      cta: { ar: 'اكتشف السويترات', en: 'Discover the sweaters' },
      side: 'right', inset: 2.5, top: 50, width: 20,
      // shown in the same 1600 × 533 frame as the pullover banners; `focus`
      // picks which band of the taller photo shows (the file itself is untouched)
      frame: { w: 1600, h: 533, focus: '50% 34%' },
      banners: [
        {
          img: 'img/sweater.jpg', w: 1600, h: 800, mfocus: '10% 50%',
          alt: {
            ar: 'سويتر بني مغسول بشعار فيلو مطرّز على الصدر',
            en: 'A washed-brown sweater with the VEYLO wordmark embroidered on the chest',
          },
        },
      ],
    },
  ];

  /* PRODUCTS: one entry per style; every colour is its own piece and card.
     6 pullovers (Cipher, Orbit, Dusk × 2 colours) and 2 sweaters (Ember × 2).
     Names are VEYLO's own. Each photo is the original image, shown whole.
     PRICES ARE PLACEHOLDERS — replace with real ones. */
  const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
  const photo = (src, w, h) => ({ src: `img/collection/${src}`, w, h });

  const PRODUCTS = [
    {
      id: 'cipher', category: 'pullovers',
      name: { ar: 'شيفرة', en: 'Cipher' },
      kind: { ar: 'هودي بقبعة مزدوجة', en: 'Double hood hoodie' },
      tagline: 'Not everything needs to be understood.',
      details: {
        ar: ['قطن ثقيل فاخر', 'قصّة واسعة', 'قبعة مزدوجة ببطانة داخلية', 'أكمام بفتحة للإبهام', 'طباعة عالية الجودة', 'شعار بسيط'],
        en: ['Premium heavyweight cotton', 'Oversized fit', 'Double hood with an inner layer', 'Thumb-hole cuffs', 'High-quality print', 'Minimal branding'],
      },
      price: 289, sizes: SIZES,
      colors: [
        {
          id: 'merlot', hex: '#5c1b20',
          alias: { ar: 'عنّابي', en: 'Merlot' }, name: { ar: 'برغندي', en: 'Burgundy' },
          photo: photo('cipher-merlot.jpg', 728, 818),
          note: { ar: 'لون برغندي داكن يعكس القوة والهيبة، مناسب لكل الإطلالات وسهل التنسيق.', en: 'A deep burgundy with strength and presence. It suits every look and is easy to pair.' },
          alt: { ar: 'موديل يرتدي هودي شيفرة بلون برغندي من الأمام والخلف، مع صور قريبة للقبعة والعبارة والشعار', en: 'A model wearing the Cipher hoodie in burgundy, front and back, with close-ups of the hood, print and label' },
        },
        {
          id: 'ash', hex: '#8c8c8a',
          alias: { ar: 'رماد', en: 'Ash' }, name: { ar: 'رمادي', en: 'Gray' },
          photo: photo('cipher-ash.jpg', 553, 689),
          note: { ar: 'لون رمادي هادئ وأنيق، طبيعي ومريح للعين، يمنح مظهراً راقياً وبسيطاً في نفس الوقت.', en: 'A calm, elegant gray. Natural and easy on the eye, refined and simple at once.' },
          alt: { ar: 'موديل يرتدي هودي شيفرة الرمادي بقبعة سوداء من الأمام والخلف، مع صور قريبة للقبعة والعبارة والشعار', en: 'A model wearing the gray Cipher hoodie with a black hood, front and back, with close-ups of the hood, print and label' },
        },
      ],
    },
    {
      id: 'orbit', category: 'pullovers',
      name: { ar: 'مدار', en: 'Orbit' },
      kind: { ar: 'هودي بشعار على الظهر', en: 'Back-logo hoodie' },
      tagline: 'Defined by details.',
      details: {
        ar: ['شعار VEYLO كبير يلتف على الظهر والأكمام', 'عبارة Defined by Details على الصدر', 'أطراف وأكمام مضلّعة'],
        en: ['Oversized VEYLO wrapping the back and sleeves', '“Defined by Details” on the chest', 'Ribbed hem and cuffs'],
      },
      price: 289, sizes: SIZES,
      colors: [
        {
          id: 'eclipse', hex: '#141414',
          alias: { ar: 'كسوف', en: 'Eclipse' }, name: { ar: 'أسود', en: 'Black' },
          photo: photo('orbit-eclipse.jpg', 1149, 739),
          alt: { ar: 'هودي مدار الأسود: شعار VEYLO كبير بلون كريمي على الظهر، وعبارة Defined by Details على الصدر', en: 'The black Orbit hoodie: an oversized cream VEYLO across the back, “Defined by Details” on the chest' },
        },
        {
          id: 'moon', hex: '#a7a7a5',
          alias: { ar: 'قمر', en: 'Moon' }, name: { ar: 'رمادي', en: 'Gray' },
          photo: photo('orbit-moon.jpg', 1170, 634),
          alt: { ar: 'هودي مدار الرمادي: شعار VEYLO كبير بلون رمادي داكن على الظهر، وعبارة Defined by Details على الصدر', en: 'The gray Orbit hoodie: an oversized charcoal VEYLO across the back, “Defined by Details” on the chest' },
        },
      ],
    },
    {
      id: 'dusk', category: 'pullovers',
      name: { ar: 'غَسَق', en: 'Dusk' },
      kind: { ar: 'هودي بعبارة على الظهر', en: 'Statement-back hoodie' },
      tagline: 'Where mystery meets style.',
      details: {
        ar: ['شعار VEYLO على الصدر', 'خياطة أفقية على الصدر والظهر', 'عبارة Where Mystery Meets Style على الظهر', 'جيب أمامي'],
        en: ['VEYLO on the chest', 'Horizontal seam across chest and back', '“Where Mystery Meets Style” across the back', 'Front pocket'],
      },
      price: 289, sizes: SIZES,
      colors: [
        {
          id: 'nightfall', hex: '#121212',
          alias: { ar: 'أُفول', en: 'Nightfall' }, name: { ar: 'أسود', en: 'Black' },
          photo: photo('dusk-nightfall.jpg', 1280, 566),
          alt: { ar: 'موديل يرتدي هودي غسق الأسود: شعار VEYLO على الصدر، وعبارة Where Mystery Meets Style على الظهر', en: 'A model wearing the black Dusk hoodie: VEYLO on the chest, “Where Mystery Meets Style” across the back' },
        },
        {
          id: 'dune', hex: '#a8988a',
          alias: { ar: 'كثيب', en: 'Dune' }, name: { ar: 'رملي', en: 'Sand' },
          photo: photo('dusk-dune.jpg', 1170, 386),
          alt: { ar: 'موديل يرتدي هودي غسق الرملي: شعار VEYLO على الصدر، وعبارة Where Mystery Meets Style على الظهر', en: 'A model wearing the sand Dusk hoodie: VEYLO on the chest, “Where Mystery Meets Style” across the back' },
        },
      ],
    },
    {
      id: 'ember', category: 'sweaters',
      name: { ar: 'جَمرة', en: 'Ember' },
      kind: { ar: 'سويتر بأكمام راجلان', en: 'Raglan cut sweater' },
      tagline: null,
      details: {
        ar: ['أكمام راجلان', 'قصّة مقوّسة على الصدر', 'شعار VEYLO مطبوع'],
        en: ['Raglan sleeves', 'Curved chest cut detail', 'Printed VEYLO logo'],
      },
      price: 249, sizes: SIZES,
      colors: [
        {
          id: 'coffee', hex: '#4a3426',
          alias: { ar: 'قهوة', en: 'Coffee' }, name: { ar: 'بني', en: 'Brown' },
          photo: photo('ember-coffee.jpg', 1024, 803),
          alt: { ar: 'سويتر جمرة البني من الأمام والخلف، مع صور قريبة للخياطة المقوّسة والشعار', en: 'The brown Ember sweater, front and back, with close-ups of the curved seam and logo' },
        },
        {
          id: 'coal', hex: '#141414',
          alias: { ar: 'فحم', en: 'Coal' }, name: { ar: 'أسود', en: 'Black' },
          photo: photo('ember-coal.jpg', 1170, 850),
          alt: { ar: 'سويتر جمرة الأسود من الأمام والخلف، مع صور قريبة للخياطة المقوّسة والشعار', en: 'The black Ember sweater, front and back, with close-ups of the curved seam and logo' },
        },
      ],
    },
  ];

  const productById = (id) => PRODUCTS.find((p) => p.id === id);
  const categoryById = (id) => CATEGORIES.find((c) => c.id === id);
  const colorOf = (p, id) => p.colors.find((c) => c.id === id);

  /* ------------------------------------------------------------------------
     State
     ------------------------------------------------------------------------ */
  let lang = store.get('veylo.lang', 'ar');
  if (!I18N[lang]) lang = 'ar';

  let bag = (() => {
    const raw = store.get('veylo.bag', []);
    if (!Array.isArray(raw)) return [];
    return raw.filter((l) => {
      const p = l && productById(l.id);
      return p && colorOf(p, l.color) && p.sizes.includes(l.size) && Number.isInteger(l.qty) && l.qty > 0;
    });
  })();

  const missingPhotos = new Set();   // photos that failed to load, so re-renders don't retry them

  const t = (k, vars) => {
    let v = I18N[lang][k] ?? I18N.ar[k] ?? k;
    if (vars) Object.keys(vars).forEach((n) => { v = v.replace(`{${n}}`, vars[n]); });
    return v;
  };
  const L = (o) => o[lang] ?? o.ar;
  const money = (n) => {
    const v = n.toLocaleString('en-US');
    return lang === 'ar' ? `${v} ر.س` : `SAR ${v}`;
  };
  const countLabel = (n) => {
    if (lang !== 'ar') return n === 1 ? '1 piece' : `${n} pieces`;
    if (n === 1) return 'قطعة واحدة';
    if (n === 2) return 'قطعتان';
    if (n >= 3 && n <= 10) return `${n} قطع`;
    return `${n} قطعة`;
  };

  /* ------------------------------------------------------------------------
     Elements
     ------------------------------------------------------------------------ */
  const site = $('#site');
  const bar = $('#bar');
  const main = $('main');
  const footer = $('.foot');
  const piecesEl = $('#pieces');
  const langBtn = $('#lang-toggle');
  const qv = $('#qv');
  const qvInner = $('#qv-inner');
  const bagEl = $('#bag');
  const bagOpenBtn = $('#bag-open');
  const bagCloseBtn = $('#bag-close');
  const scrim = $('#scrim');
  const bagItems = $('#bag-items');
  const bagEmpty = $('#bag-empty');
  const bagSubtotal = $('#bag-subtotal');
  const bagCount = $('#bag-count');
  const checkoutBtn = $('#bag-checkout');
  const toastEl = $('#toast');

  /* ------------------------------------------------------------------------
     Images: every photo waits on a shimmering skeleton and fades in when it
     has loaded. A product photo that fails shows a placeholder instead.
     ------------------------------------------------------------------------ */
  function boardHTML(c) {
    const ph = c.photo;
    const missing = missingPhotos.has(ph.src);
    const img = missing
      ? ''
      : `<img class="photo__img fade-img" data-photo src="${esc(ph.src)}" width="${ph.w}" height="${ph.h}" alt="${esc(L(c.alt))}" loading="lazy">`;
    return `
      <span class="photo skel-host${missing ? ' is-missing' : ''}" style="--c:${c.hex}">
        <span class="photo__ph" aria-hidden="true">
          <svg><use href="#i-model"/></svg>
          <span class="photo__note">${esc(t('card.photoSoon'))}</span>
        </span>
        ${img}
      </span>`;
  }

  const markLoaded = (img) => img.classList.add('is-loaded');
  // load/error don't bubble, so listen in the capture phase for every image on the page
  document.addEventListener('load', (e) => {
    if (e.target instanceof HTMLImageElement && e.target.classList.contains('fade-img')) markLoaded(e.target);
  }, true);
  document.addEventListener('error', (e) => {
    const img = e.target;
    if (!(img instanceof HTMLImageElement)) return;
    if (img.hasAttribute('data-photo')) {
      missingPhotos.add(img.getAttribute('src'));
      img.parentElement.classList.add('is-missing');
      img.remove();
    } else if (img.classList.contains('fade-img')) {
      markLoaded(img);                                  // stop the shimmer either way
    }
  }, true);
  const sweepLoaded = (scope = document) => $$('img.fade-img', scope).forEach((img) => {
    if (img.complete && img.naturalWidth) markLoaded(img);
  });

  /* ------------------------------------------------------------------------
     Collection. Two ways to the pieces: on the home page, every category
     shows its banner and all its pieces; the banner's link also opens the
     category's own page (#pullovers, #sweaters).
     ------------------------------------------------------------------------ */
  const pieceName = (p, c) => `${L(p.name)} ${L(c.alias)}`;
  const arOf = (c) => (c.photo.w / c.photo.h).toFixed(4);
  const stylesOf = (cat) => PRODUCTS.filter((p) => p.category === cat.id);
  const piecesOf = (cat) => stylesOf(cat).reduce((n, p) => n + p.colors.length, 0);
  const arrowSVG = '<svg aria-hidden="true" viewBox="0 0 40 12"><path d="M0 6h38M33 1l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1"/></svg>';

  function cardHTML(p, c) {
    const label = `${pieceName(p, c)} — ${L(p.kind)}, ${L(c.name)}, ${money(p.price)}`;
    return `
      <li class="card" style="--ar:${arOf(c)}">
        <button class="card__btn" type="button" data-open="${p.id}:${c.id}" aria-label="${esc(label)}">
          ${boardHTML(c)}
          <span class="card__meta">
            <span class="card__name">${esc(L(p.name))} <em>${esc(L(c.alias))}</em></span>
            <span class="card__kind">${esc(L(p.kind))}</span>
            <span class="card__row">
              <span class="card__color"><i class="dot" style="--c:${c.hex}"></i>${esc(L(c.name))}</span>
              <span class="card__price">${money(p.price)}</span>
            </span>
          </span>
        </button>
      </li>`;
  }

  // Same layout as a real card, as shimmering blocks
  function skeletonCard(c) {
    return `
      <li class="card card--skel" style="--ar:${arOf(c)}" aria-hidden="true">
        <span class="photo skel"></span>
        <span class="card__meta"><span class="skel skel-line"></span><span class="skel skel-line skel-line--short"></span></span>
      </li>`;
  }

  // one row per style: its colourways side by side, all at the same height
  function rowsHTML(cat, filter, skeleton) {
    return stylesOf(cat).filter((p) => !filter || p.id === filter).map((p) => {
      const sum = p.colors.reduce((n, c) => n + c.photo.w / c.photo.h, 0);
      const cards = p.colors.map((c) => (skeleton ? skeletonCard(c) : cardHTML(p, c))).join('');
      return `<ul class="row" style="--sum:${sum.toFixed(4)}">${cards}</ul>`;
    }).join('');
  }

  function entryHTML(cat, { cta }) {
    const first = cat.banners[0];
    const frame = cat.frame || first;
    const layers = cat.banners.map((b, i) => `
      <div class="layer${i === 0 ? ' is-active' : ''}">
        <img class="fade-img" src="${b.img}" width="${b.w}" height="${b.h}" alt="${esc(L(b.alt))}"${b.mfocus ? ` style="--mfocus:${b.mfocus}"` : ''}>
      </div>`).join('');
    const place = `${cat.side}:${cat.inset}%;top:${cat.top}%;width:${cat.width}%`;
    return `
      <div class="entry">
        <figure class="banner skel-host${cat.frame ? ' banner--framed' : ''}" data-cycle="${cat.banners.length > 1}" style="aspect-ratio:${frame.w} / ${frame.h}${cat.frame ? `;--focus:${cat.frame.focus}` : ''}">${layers}</figure>
        <div class="entry__copy" style="${place}">
          <p class="entry__title">${esc(L(cat.title))}</p>
          <p class="entry__lede">${esc(L(cat.lede))}</p>
          ${cta ? `<a class="entry__cta" href="#${cat.id}"><span>${esc(L(cat.cta))}</span>${arrowSVG}</a>` : ''}
        </div>
      </div>`;
  }

  // Home page: each category's banner (its link opens the category page), then all its pieces
  function renderCollection() {
    piecesEl.innerHTML = CATEGORIES.map((cat) => `
      <section class="cat" id="entry-${cat.id}" aria-labelledby="home-${cat.id}-title">
        ${entryHTML(cat, { cta: true })}
        <div class="wrap cat__body">
          <header class="cat__head">
            <div>
              <p class="eyebrow latin">${esc(cat.eyebrow)}</p>
              <h3 class="cat__title" id="home-${cat.id}-title">${esc(L(cat.title))}</h3>
            </div>
            <p class="cat__count">${countLabel(piecesOf(cat))}</p>
          </header>
          <div class="rows">${rowsHTML(cat, '', false)}</div>
        </div>
      </section>`).join('');
    sweepLoaded(piecesEl);
    watchCycles();
  }

  /* ------------------------------------------------------------------------
     Category page
     ------------------------------------------------------------------------ */
  const viewHome = $('#view-home');
  const viewCat = $('#view-category');
  let pageCat = null;          // the category whose page is showing
  let pageFilter = '';         // style id, or '' for all
  let pageSkeleton = false;

  function renderCategoryPage() {
    const cat = CATEGORIES.find((c) => c.id === pageCat);
    if (!cat) return;
    const styles = stylesOf(cat);
    const other = CATEGORIES.find((c) => c.id !== cat.id);
    const chips = styles.length > 1 ? `
      <div class="chips" role="group" aria-label="${esc(t('cat.filter'))}">
        <button type="button" class="chip" data-filter="" aria-pressed="${!pageFilter}">${esc(t('cat.all'))}</button>
        ${styles.map((p) => `<button type="button" class="chip" data-filter="${p.id}" aria-pressed="${pageFilter === p.id}">${esc(L(p.name))}</button>`).join('')}
      </div>` : '';
    viewCat.innerHTML = `
      <section class="catpage" aria-labelledby="catpage-title">
        <nav class="wrap crumbs" aria-label="${esc(t('cat.crumbs'))}">
          <a href="#collection">${esc(t('nav.collection'))}</a><span aria-hidden="true">/</span><span aria-current="page">${esc(L(cat.title))}</span>
        </nav>
        ${entryHTML(cat, { cta: false })}
        <div class="wrap catpage__body">
          <header class="cat__head">
            <div>
              <p class="eyebrow latin">${esc(cat.eyebrow)}</p>
              <h1 class="cat__title" id="catpage-title" tabindex="-1">${esc(L(cat.title))}</h1>
            </div>
            <p class="cat__count">${countLabel(piecesOf(cat))}</p>
          </header>
          ${chips}
          <div class="rows${pageSkeleton ? ' is-skeleton' : ''}" aria-busy="${pageSkeleton}">${rowsHTML(cat, pageFilter, pageSkeleton)}</div>
          ${other ? `<a class="next-cat" href="#${other.id}"><span class="eyebrow latin">${esc(other.eyebrow)}</span><span class="next-cat__title">${esc(t('cat.other', { name: L(other.title) }))}</span>${arrowSVG}</a>` : ''}
        </div>
      </section>`;
    sweepLoaded(viewCat);
    watchCycles();
  }

  const decodeAll = (srcs) => Promise.all(srcs.map((src) => new Promise((res) => {
    const im = new Image();
    im.onload = im.onerror = () => res();
    im.src = src;
  })));

  let navToken = 0;           // a newer navigation cancels an older one still waiting on the loader

  async function showCategory(id) {
    const token = ++navToken;
    const fresh = pageCat !== id || viewCat.hidden;
    pageCat = id;
    if (fresh) pageFilter = '';
    viewHome.hidden = true;
    viewCat.hidden = false;
    document.title = `${L(CATEGORIES.find((c) => c.id === id).title)} · VEYLO`;
    markNav(id);
    if (!fresh) { renderCategoryPage(); return; }
    const { covered, opening } = loader.flash();          // the VEYLO loader covers the switch
    await covered;
    if (token !== navToken) return;
    pageSkeleton = true;
    renderCategoryPage();                                 // skeleton cards first, under the loader
    window.scrollTo({ top: 0, behavior: 'instant' });
    const cat = CATEGORIES.find((c) => c.id === id);
    const photos = stylesOf(cat).flatMap((p) => p.colors.map((c) => c.photo.src));
    await Promise.all([opening, Promise.race([decodeAll(photos), new Promise((r) => setTimeout(r, 2500))])]);
    await new Promise((r) => setTimeout(r, reduceMotion ? 0 : 700));   // the skeleton shows as the room opens
    if (token !== navToken || pageCat !== id) return;
    pageSkeleton = false;
    renderCategoryPage();
    $('#catpage-title')?.focus({ preventScroll: true });
  }

  async function showHome(anchor) {
    const token = ++navToken;
    const wasCat = !viewCat.hidden;
    if (wasCat) {                                         // leaving a category page: the loader covers the switch
      markNav(null);
      await loader.flash().covered;
      if (token !== navToken) return;
    }
    viewCat.hidden = true;
    viewHome.hidden = false;
    pageCat = null;
    document.title = 'VEYLO Store';
    markNav(null);
    const target = anchor && document.getElementById(anchor);
    if (target) requestAnimationFrame(() => target.scrollIntoView({ behavior: wasCat ? 'instant' : 'smooth' }));
    else if (wasCat) window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function markNav(id) {
    $$('.bar__nav a[data-route]').forEach((a) => {
      if (a.dataset.route === id) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }

  function route() {
    const h = decodeURIComponent(location.hash.slice(1));
    if (window.VEYLO_CHECKOUT?.isOpen?.()) window.VEYLO_CHECKOUT.close();
    if (CATEGORIES.some((c) => c.id === h)) showCategory(h);
    else showHome(h);
  }
  window.addEventListener('hashchange', route);

  viewCat.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-filter]');
    if (!chip) return;
    pageFilter = chip.dataset.filter;
    renderCategoryPage();
    $(`[data-filter="${pageFilter}"]`, viewCat)?.focus();
  });

  [piecesEl, viewCat].forEach((el) => el.addEventListener('click', (e) => {
    const card = e.target.closest('[data-open]');
    if (card) openQuickView(card.dataset.open);
  }));

  // Categories with more than one banner cross-fade between them while on screen
  const cycleObserver = new IntersectionObserver((entries) => {
    entries.forEach((en) => { en.target.dataset.onscreen = String(en.isIntersecting); });
  });
  function watchCycles() {
    cycleObserver.disconnect();
    $$('.entry [data-cycle="true"]').forEach((f) => cycleObserver.observe(f));
  }
  if (!reduceMotion) {
    setInterval(() => {
      if (document.hidden) return;
      $$('.entry [data-cycle="true"][data-onscreen="true"]').forEach((f) => {
        if (f.closest('[hidden]') || f.matches(':hover') || f.contains(document.activeElement)) return;
        const layers = $$('.layer', f);
        const i = layers.findIndex((l) => l.classList.contains('is-active'));
        layers[i].classList.remove('is-active');
        layers[(i + 1) % layers.length].classList.add('is-active');
      });
    }, 6000);
  }

  /* ------------------------------------------------------------------------
     The VEYLO loader. On a first visit the wordmark assembles letter by
     letter, a beam of light crosses it and the room opens from the centre.
     Later visits, page changes and payment use a short version.
     ------------------------------------------------------------------------ */
  const loader = (() => {
    const el = $('#loader');
    const CYCLE = { intro: 3400, quick: 1300 };           // must match --sweep-dur in style.css
    let hideTimer = 0;
    let cycleTimer = 0;
    const leave = () => {
      clearTimeout(cycleTimer);
      el.classList.add('is-leaving');
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => { el.hidden = true; el.className = 'loader'; }, reduceMotion ? 50 : 800);
    };
    return {
      // first paint of the site: at least one full sweep, then open once the page has loaded
      intro() {
        let first = true;
        try { first = !localStorage.getItem('veylo.visited'); localStorage.setItem('veylo.visited', '1'); } catch { /* storage unavailable: treat as a first visit */ }
        el.hidden = false;
        el.className = `loader ${first ? 'is-intro' : 'is-quick'}`;
        if (reduceMotion) { setTimeout(leave, 500); return; }
        const cycle = first ? CYCLE.intro : CYCLE.quick;
        let loaded = document.readyState === 'complete';
        if (!loaded) window.addEventListener('load', () => { loaded = true; }, { once: true });
        let sweeps = 0;
        const atCycleEnd = () => {                         // leave only between sweeps, never mid-sweep
          sweeps += 1;
          if (loaded || sweeps * cycle > 6500) leave();
          else cycleTimer = setTimeout(atCycleEnd, cycle);
        };
        cycleTimer = setTimeout(atCycleEnd, cycle);
      },
      // a cover for switching pages, one quick sweep long: `covered` once the
      // screen is covered, `opening` once it starts to open again
      flash() {
        if (!el.hidden && !el.classList.contains('is-leaving')) {
          const soon = new Promise((r) => setTimeout(r, 300));
          return { covered: soon, opening: soon };
        }
        clearTimeout(hideTimer);
        clearTimeout(cycleTimer);
        el.hidden = false;
        el.className = 'loader is-quick is-flash';
        const covered = new Promise((r) => setTimeout(r, reduceMotion ? 0 : 150));
        const opening = new Promise((r) => { cycleTimer = setTimeout(() => { leave(); r(); }, reduceMotion ? 150 : CYCLE.quick); });
        return { covered, opening };
      },
    };
  })();

  /* ------------------------------------------------------------------------
     Quick view — the whole board large, then details, colour, size
     ------------------------------------------------------------------------ */
  let qvId = null;
  let qvColor = null;
  let qvSize = null;

  function sizeLegend() {
    return esc(t('piece.size')) + (qvSize ? `: <b>${esc(qvSize)}</b>` : '');
  }

  function renderQuickView() {
    const p = productById(qvId);
    if (!p) return;
    const cat = categoryById(p.category);
    const color = colorOf(p, qvColor) || p.colors[0];
    qvColor = color.id;
    if (qvSize && !p.sizes.includes(qvSize)) qvSize = null;

    const swatches = p.colors.map((c) => `
      <input class="sr" type="radio" name="qv-color" id="qv-color-${c.id}" value="${c.id}"${c.id === color.id ? ' checked' : ''}>
      <label class="sw" for="qv-color-${c.id}" style="--c:${c.hex}" title="${esc(L(c.alias))}"><span class="sr">${esc(L(c.alias))}</span></label>`).join('');

    const sizes = p.sizes.map((s) => `
      <input class="sr" type="radio" name="qv-size" id="qv-size-${s}" value="${s}"${s === qvSize ? ' checked' : ''}>
      <label class="sz" for="qv-size-${s}">${s}</label>`).join('');

    qvInner.innerHTML = `
      <button class="icon-btn qv__close" type="button" data-qv-close>
        <svg aria-hidden="true"><use href="#i-close"/></svg>
        <span class="sr">${esc(t('bag.close'))}</span>
      </button>
      <figure class="qv__photo">
        <span class="qv__frame skel-host" style="aspect-ratio:${color.photo.w} / ${color.photo.h};--qar:${(color.photo.w / color.photo.h).toFixed(4)}">
          <img class="fade-img" src="${esc(color.photo.src)}" width="${color.photo.w}" height="${color.photo.h}" alt="${esc(L(color.alt))}">
        </span>
      </figure>
      <div class="qv__body">
        <div class="qv__info">
          <p class="eyebrow latin">${esc(cat.eyebrow)}</p>
          <h2 class="qv__title" id="qv-title">${esc(L(p.name))} <em>${esc(L(color.alias))}</em></h2>
          <p class="qv__kind">${esc(L(p.kind))}</p>
          <p class="qv__price">${money(p.price)}</p>
          ${p.tagline ? `<p class="qv__tagline latin">${esc(p.tagline)}</p>` : ''}
          <h3 class="qv__h">${esc(t('piece.details'))}</h3>
          <ul class="qv__details">${L(p.details).map((d) => `<li>${esc(d)}</li>`).join('')}</ul>
        </div>
        <div class="qv__buy">
          <fieldset class="opt">
            <legend class="opt__label">${esc(t('piece.color'))}: <b>${esc(L(color.alias))}</b> · ${esc(L(color.name))}</legend>
            <div class="swatches">${swatches}</div>
          </fieldset>
          ${color.note ? `<p class="qv__note">${esc(L(color.note))}</p>` : ''}
          <fieldset class="opt">
            <legend class="opt__label" data-legend="size">${sizeLegend()}</legend>
            <div class="sizes">${sizes}</div>
          </fieldset>
          <button class="btn btn--solid btn--block" type="button" data-qv-add>${esc(t('piece.add'))}</button>
          <p class="msg" id="qv-msg" role="status" aria-live="polite"></p>
        </div>
      </div>`;
  }

  function openQuickView(key) {
    const [id, colorId] = String(key).split(':');
    const p = productById(id);
    if (!p) return;
    qvId = id;
    qvColor = colorOf(p, colorId) ? colorId : p.colors[0].id;
    qvSize = null;
    renderQuickView();
    if (!qv.open) qv.showModal();
    qv.scrollTop = 0;
  }

  qvInner.addEventListener('change', (e) => {
    const input = e.target;
    if (!(input instanceof HTMLInputElement)) return;
    if (input.name === 'qv-color') {
      qvColor = input.value;
      renderQuickView();                                  // keeps the chosen size
      $(`#qv-color-${qvColor}`, qvInner)?.focus({ preventScroll: true });
    } else if (input.name === 'qv-size') {
      qvSize = input.value;
      $('[data-legend="size"]', qvInner).innerHTML = sizeLegend();
      $('#qv-msg', qvInner).textContent = '';
    }
  });

  qvInner.addEventListener('click', (e) => {
    if (e.target.closest('[data-qv-close]')) { qv.close(); return; }
    if (e.target.closest('[data-qv-add]')) {
      const p = productById(qvId);
      const msg = $('#qv-msg', qvInner);
      if (!qvSize) {
        msg.textContent = t('piece.pickSize');
        $(`#qv-size-${p.sizes[0]}`, qvInner)?.focus();
        return;
      }
      addToBag(p, qvColor, qvSize);
      msg.textContent = t('piece.added');
    }
  });

  // a click on the dimmed backdrop (the dialog element itself) closes it
  qv.addEventListener('click', (e) => { if (e.target === qv) qv.close(); });

  /* ------------------------------------------------------------------------
     Bag
     ------------------------------------------------------------------------ */
  function saveBag() { store.set('veylo.bag', bag); }

  function addToBag(p, color, size) {
    const line = bag.find((l) => l.id === p.id && l.color === color && l.size === size);
    if (line) line.qty = Math.min(line.qty + 1, 9);
    else bag.push({ id: p.id, color, size, qty: 1 });
    saveBag();
    renderBag();
    bump();
    toast(t('toast.added'), t('bag.view'), () => { if (qv.open) qv.close(); openBag(); });
  }

  function renderBag() {
    let count = 0;
    let subtotal = 0;
    bagItems.innerHTML = bag.map((l, i) => {
      const p = productById(l.id);
      const c = colorOf(p, l.color);
      count += l.qty;
      subtotal += p.price * l.qty;
      return `
      <li class="bag__item">
        <span class="bag__tile" style="--c:${c.hex}" aria-hidden="true"><svg class="wm"><use href="#wordmark"/></svg></span>
        <div>
          <p class="bag__name">${esc(pieceName(p, c))}</p>
          <p class="bag__variant">${esc(L(c.name))} · ${esc(l.size)}</p>
          <span class="qty">
            <button type="button" data-dec="${i}" aria-label="${esc(t('bag.dec'))}">−</button>
            <output>${l.qty}</output>
            <button type="button" data-inc="${i}" aria-label="${esc(t('bag.inc'))}">+</button>
          </span>
          <button class="bag__remove" type="button" data-remove="${i}">${esc(t('bag.remove'))}</button>
        </div>
        <p class="bag__price">${money(p.price * l.qty)}</p>
      </li>`;
    }).join('');

    bagEmpty.hidden = bag.length > 0;
    bagSubtotal.textContent = money(subtotal);
    bagCount.textContent = String(count);
    bagCount.dataset.empty = String(count === 0);
    checkoutBtn.disabled = bag.length === 0;
  }

  bagItems.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    const i = Number(b.dataset.inc ?? b.dataset.dec ?? b.dataset.remove);
    if (!bag[i]) return;
    if ('inc' in b.dataset) bag[i].qty = Math.min(bag[i].qty + 1, 9);
    else if ('dec' in b.dataset) { bag[i].qty -= 1; if (bag[i].qty < 1) bag.splice(i, 1); }
    else if ('remove' in b.dataset) bag.splice(i, 1);
    saveBag();
    renderBag();
    // keep keyboard focus inside the drawer after the list re-renders
    (bagItems.querySelector(`[data-${Object.keys(b.dataset)[0]}="${i}"]`) || bagCloseBtn).focus();
  });

  function bump() {
    if (reduceMotion) return;
    bagCount.classList.add('is-bump');
    setTimeout(() => bagCount.classList.remove('is-bump'), 260);
  }

  let lastFocus = null;
  let scrimTimer = 0;
  function openBag() {
    hideToast();                                  // the notice would otherwise sit over the checkout button on phones
    lastFocus = document.activeElement;
    clearTimeout(scrimTimer);
    scrim.hidden = false;
    void scrim.offsetWidth;
    scrim.classList.add('is-on');
    bagEl.classList.add('is-open');
    bagEl.setAttribute('aria-hidden', 'false');
    bagOpenBtn.setAttribute('aria-expanded', 'true');
    [bar, main, footer, $('#checkout')].forEach((el) => { if (el) el.inert = true; });
    requestAnimationFrame(() => bagCloseBtn.focus());
  }
  function closeBag() {
    if (!bagEl.classList.contains('is-open')) return;
    scrim.classList.remove('is-on');
    scrimTimer = setTimeout(() => { scrim.hidden = true; }, 420);
    bagEl.classList.remove('is-open');
    bagEl.setAttribute('aria-hidden', 'true');
    bagOpenBtn.setAttribute('aria-expanded', 'false');
    [bar, main, footer, $('#checkout')].forEach((el) => { if (el) el.inert = false; });
    (lastFocus && document.contains(lastFocus) && !lastFocus.closest('dialog') ? lastFocus : bagOpenBtn).focus();
  }

  bagOpenBtn.addEventListener('click', openBag);
  bagCloseBtn.addEventListener('click', closeBag);
  scrim.addEventListener('click', closeBag);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeBag(); });
  checkoutBtn.addEventListener('click', () => {
    if (!bag.length) return;
    closeBag();
    if (window.VEYLO_CHECKOUT) window.VEYLO_CHECKOUT.open();
    else toast(t('bag.preview'));
  });

  /* ------------------------------------------------------------------------
     Toast
     ------------------------------------------------------------------------ */
  let toastTimer = 0;
  function hideToast() {
    toastEl.classList.remove('is-on');
    setTimeout(() => { if (!toastEl.classList.contains('is-on')) toastEl.hidden = true; }, 380);
  }
  function toast(message, actionLabel, action) {
    toastEl.replaceChildren();
    const span = document.createElement('span');
    span.textContent = message;
    toastEl.append(span);
    if (actionLabel && action) {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = actionLabel;
      b.addEventListener('click', () => { hideToast(); action(); });
      toastEl.append(b);
    }
    // while the quick view is open it sits in the top layer, so the toast goes inside it
    (qv.open ? qv : site).append(toastEl);
    toastEl.hidden = false;
    void toastEl.offsetWidth;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, 3800);
  }
  qv.addEventListener('close', () => { if (toastEl.parentElement === qv) site.append(toastEl); });

  /* ------------------------------------------------------------------------
     Language
     ------------------------------------------------------------------------ */
  function applyLang() {
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    site.dir = dir;
    site.lang = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;

    $$('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    $$('[data-i18n-alt]').forEach((el) => { el.alt = t(el.dataset.i18nAlt); });
    $$('[data-i18n-aria]').forEach((el) => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });

    langBtn.textContent = lang === 'ar' ? 'EN' : 'عربي';
    langBtn.lang = lang === 'ar' ? 'en' : 'ar';
    langBtn.setAttribute('aria-label', t('lang.switch'));

    renderCollection();
    if (pageCat) renderCategoryPage();
    renderBag();
    if (qv.open) renderQuickView();
    langListeners.forEach((fn) => fn(lang));
  }

  langBtn.addEventListener('click', () => {
    lang = lang === 'ar' ? 'en' : 'ar';
    store.set('veylo.lang', lang);
    applyLang();
  });

  /* ------------------------------------------------------------------------
     Header hairline once the page moves
     ------------------------------------------------------------------------ */
  /* ------------------------------------------------------------------------
     Bridge for checkout.js — the only things it needs from the store
     ------------------------------------------------------------------------ */
  const langListeners = [];
  window.VEYLO = {
    get lang() { return lang; },
    esc, L, money, pieceName, productById, colorOf,
    bagLines: () => bag.map((l) => ({ ...l })),
    clearBag() { bag = []; saveBag(); renderBag(); },
    openBag,
    toast,
    onLang(fn) { langListeners.push(fn); },
  };

  const onScroll = () => bar.classList.toggle('is-solid', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------------------------------
     Hero — two banners (welcome, payment) cross-fade every 5 seconds.
     The light: on a laptop it follows the pointer and rests on the VEYLO box
     when the pointer leaves; on phones and tablets it glides on its own to a
     new random spot every few seconds.
     ------------------------------------------------------------------------ */
  const heroBanner = $('#hero-banner');
  if (heroBanner) {
    const slides = $$('.slide', heroBanner);
    const dots = $$('.hero__dot');
    const canHover = matchMedia('(hover: hover) and (pointer: fine)').matches;
    let slide = 0;
    let slideTimer = 0;
    let onScreen = true;

    const showSlide = (i) => {
      slide = (i + slides.length) % slides.length;
      slides.forEach((el, k) => el.classList.toggle('is-active', k === slide));
      dots.forEach((d, k) => d.setAttribute('aria-pressed', String(k === slide)));
    };
    const scheduleSlides = () => {
      clearInterval(slideTimer);
      if (reduceMotion || slides.length < 2) return;
      slideTimer = setInterval(() => {
        if (!document.hidden && onScreen) showSlide(slide + 1);
      }, 5000);
    };
    dots.forEach((d) => d.addEventListener('click', () => { showSlide(Number(d.dataset.slide)); scheduleSlides(); }));

    let W = 0, H = 0;
    let rest = { x: 0, y: 0 };
    let cur = { x: 0, y: 0 };
    let target = { x: 0, y: 0 };
    let running = false;
    let wanderTimer = 0;

    const paint = () => {
      heroBanner.style.setProperty('--lx', `${cur.x.toFixed(1)}px`);
      heroBanner.style.setProperty('--ly', `${cur.y.toFixed(1)}px`);
    };
    const measure = () => {
      const r = heroBanner.getBoundingClientRect();
      W = r.width; H = r.height;
      rest = { x: W * 0.72, y: H * 0.6 };
      heroBanner.style.setProperty('--lr', `${Math.max(160, W * 0.32).toFixed(0)}px`);
      cur = { ...rest };
      target = { ...rest };
      paint();
    };
    const randomSpot = () => ({ x: W * (0.1 + Math.random() * 0.8), y: H * (0.15 + Math.random() * 0.7) });
    const wander = () => {                          // phones/tablets: a new random spot every 2.2–3.4 s
      target = randomSpot();
      wanderTimer = setTimeout(wander, 2200 + Math.random() * 1200);
    };
    const loop = () => {
      const ease = canHover ? 0.08 : 0.03;          // the wandering light glides slower than the pointer one
      cur.x += (target.x - cur.x) * ease;
      cur.y += (target.y - cur.y) * ease;
      paint();
      if (onScreen) requestAnimationFrame(loop);
      else running = false;
    };
    const start = () => {
      if (reduceMotion || running || !onScreen) return;
      running = true;
      requestAnimationFrame(loop);
    };

    if (canHover) {
      heroBanner.addEventListener('pointermove', (e) => {
        const r = heroBanner.getBoundingClientRect();
        target = { x: e.clientX - r.left, y: e.clientY - r.top };
        if (reduceMotion) { cur = { ...target }; paint(); }
      });
      heroBanner.addEventListener('pointerleave', () => {
        target = { ...rest };
        if (reduceMotion) { cur = { ...rest }; paint(); }
      });
    }

    new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      start();
    }).observe(heroBanner);

    let resizeTimer = 0;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(measure, 120);
    });

    measure();
    showSlide(0);
    scheduleSlides();
    if (!canHover && !reduceMotion) wander();
    start();
  }

  /* ------------------------------------------------------------------------
     Embroidered tagline — brightens under the pointer, settles back to centre
     ------------------------------------------------------------------------ */
  const emb = $('[data-emb]');
  const manifesto = $('#story');
  if (emb && manifesto) {
    manifesto.addEventListener('pointermove', (e) => {
      const r = emb.getBoundingClientRect();
      emb.classList.add('is-tracking');
      emb.style.setProperty('--mx', `${(e.clientX - r.left).toFixed(0)}px`);
      emb.style.setProperty('--my', `${(e.clientY - r.top).toFixed(0)}px`);
    });
    manifesto.addEventListener('pointerleave', () => {
      emb.classList.remove('is-tracking');
      emb.style.setProperty('--mx', '50%');
      emb.style.setProperty('--my', '50%');
    });
  }

  applyLang();
  sweepLoaded();
  loader.intro();
  route();
  window.VEYLO.loader = loader;
})();
