/* ==========================================================================
   VEYLO — checkout (demo, end to end)
   Bag → delivery details → shipping → payment → confirmation.

   DEMO ONLY: nothing is charged and nothing typed here leaves the page.
   - Card payments accept only the DEMO_CARDS below, then a simulated bank
     verification step (code 1234). Card details are never stored.
   - Apple Pay, tabby and tamara open simulated approval sheets.
   - Delivery details are remembered in this browser for convenience.
   Shipping fees are placeholders — set real ones in SHIPPING.
   ========================================================================== */
(() => {
  'use strict';
  const V = window.VEYLO;
  const root = document.getElementById('checkout');
  const sheet = document.getElementById('pay-sheet');
  if (!V || !root || !sheet) return;

  const $ = (s, r = document) => r.querySelector(s);
  const esc = V.esc;
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
  };

  /* ------------------------------------------------------------------------
     Copy
     ------------------------------------------------------------------------ */
  const I18N = {
    ar: {
      back: 'العودة للمتجر',
      title: 'إتمام الطلب',
      demo: 'وضع تجريبي: لن يُخصم أي مبلغ ولا تُرسل أي بيانات. لا تُدخل بيانات بطاقة حقيقية، واستخدم البطاقات التجريبية.',
      'step.delivery': 'التوصيل', 'step.shipping': 'الشحن', 'step.payment': 'الدفع',
      'f.name': 'الاسم الكامل', 'f.phone': 'رقم الجوال', 'f.email': 'البريد الإلكتروني (اختياري)',
      'f.city': 'المدينة', 'f.cityPick': 'اختر المدينة', 'f.district': 'الحي', 'f.street': 'الشارع ورقم المبنى',
      'f.notes': 'ملاحظات للمندوب (اختياري)',
      'e.name': 'اكتب اسمك الكامل.',
      'e.phone': 'اكتب رقم جوال سعودي من 10 أرقام يبدأ بـ 05.',
      'e.email': 'البريد الإلكتروني غير صحيح.',
      'e.city': 'اختر المدينة.', 'e.district': 'اكتب اسم الحي.', 'e.street': 'اكتب الشارع ورقم المبنى.',
      'go.shipping': 'متابعة إلى الشحن', 'go.payment': 'متابعة إلى الدفع', 'go.back': 'رجوع',
      'h.delivery': 'إلى أين نوصل طلبك؟', 'h.shipping': 'اختر طريقة الشحن', 'h.payment': 'اختر طريقة الدفع',
      'ship.to': 'التوصيل إلى', edit: 'تعديل',
      'ship.standard': 'شحن عادي', 'ship.standardSub': '3 إلى 5 أيام عمل',
      'ship.express': 'شحن سريع', 'ship.expressSub': 'يوم إلى يومي عمل',
      'ship.arrives': 'يصل بين {a} و{b}',
      'pay.card': 'بطاقة مدى أو فيزا أو ماستركارد', 'pay.cardSub': 'تحقّق من البنك قبل الدفع',
      'pay.applepay': 'Apple Pay', 'pay.applepaySub': 'ادفع بلمسة من جهازك',
      'pay.tabby': 'tabby', 'pay.tabbySub': 'قسّمها على 4 دفعات بدون فوائد',
      'pay.tamara': 'tamara', 'pay.tamaraSub': 'قسّمها على 3 دفعات بدون فوائد',
      'c.number': 'رقم البطاقة', 'c.name': 'الاسم على البطاقة', 'c.exp': 'تاريخ الانتهاء', 'c.cvc': 'رمز الأمان',
      'e.cardNumber': 'رقم البطاقة غير مكتمل.',
      'e.cardDemo': 'في الوضع التجريبي تعمل البطاقات التجريبية فقط. اختر واحدة من القائمة.',
      'e.cardName': 'اكتب الاسم كما يظهر على البطاقة.',
      'e.cardExp': 'تاريخ الانتهاء غير صحيح أو منتهٍ.',
      'e.cardCvc': 'رمز الأمان 3 أرقام.',
      'demo.title': 'بطاقات تجريبية', 'demo.ok': 'تنجح', 'demo.decline': 'تُرفض',
      'demo.rest': 'مع أي تاريخ انتهاء مستقبلي وأي رمز من 3 أرقام.', 'demo.use': 'استخدم',
      'pay.now': 'ادفع {total}', 'pay.applepayBtn': 'ادفع عبر Apple Pay',
      'pay.tabbyBtn': 'المتابعة مع tabby', 'pay.tamaraBtn': 'المتابعة مع tamara',
      'plan.today': 'اليوم', 'plan.of': '{n} دفعات من {amt}',
      'pay.declined': 'رُفضت البطاقة. جرّب بطاقة أخرى أو طريقة دفع مختلفة.',
      'sum.title': 'ملخص الطلب', 'sum.toggle': 'عرض ملخص الطلب', 'sum.subtotal': 'المجموع الفرعي',
      'sum.shipping': 'الشحن', 'sum.shipLater': 'يُحدد في الخطوة التالية', 'sum.total': 'الإجمالي',
      'sum.vat': 'شامل ضريبة القيمة المضافة 15%: {vat}', 'sum.qty': 'الكمية {n}',
      'sh.cancel': 'إلغاء', 'sh.confirm': 'تأكيد', 'sh.approve': 'موافقة', 'sh.code': 'رمز التحقق',
      'sh.demoCode': 'الرمز التجريبي: 1234', 'sh.wrong': 'الرمز غير صحيح. الرمز التجريبي هو 1234.',
      'sh.3dsTitle': 'تحقق من عملية الدفع', 'sh.3dsBody': 'أرسل البنك رمز تحقق إلى جوالك {phone}.',
      'sh.amount': 'المبلغ', 'sh.merchant': 'التاجر',
      'sh.apCard': 'البطاقة', 'sh.apCardVal': 'Visa •••• 4242 (تجريبية)', 'sh.apShip': 'الشحن إلى',
      'sh.apContact': 'التواصل', 'sh.apPay': 'ادفع لـ VEYLO', 'sh.apConfirm': 'تأكيد الدفع',
      'sh.apHint': 'على جهاز حقيقي تؤكد بالضغط مرتين على الزر الجانبي.',
      'sh.bnplTitle': 'تأكيد رقم جوالك', 'sh.bnplBody': 'أرسلنا رمزاً إلى {phone} لتأكيد خطة الدفع.',
      proc: 'جارٍ تأكيد الدفع…',
      'done.thanks': 'شكراً لك، {name}', 'done.confirmed': 'تم تأكيد طلبك.', 'done.no': 'رقم الطلب',
      'done.demo': 'طلب تجريبي، لم يُخصم أي مبلغ.', 'done.eta': 'التوصيل المتوقع', 'done.paid': 'طريقة الدفع',
      'done.to': 'التوصيل إلى', 'done.items': 'القطع', 'done.more': 'مواصلة التسوق',
      'done.cardPaid': '{brand} •••• {last4}', 'done.plan': '{brand}، {n} دفعات',
      empty: 'حقيبتك فارغة.',
    },
    en: {
      back: 'Back to store',
      title: 'Checkout',
      demo: 'Demo mode: nothing is charged and nothing you type is sent. Don’t enter real card details. Use the demo cards.',
      'step.delivery': 'Delivery', 'step.shipping': 'Shipping', 'step.payment': 'Payment',
      'f.name': 'Full name', 'f.phone': 'Mobile number', 'f.email': 'Email (optional)',
      'f.city': 'City', 'f.cityPick': 'Choose a city', 'f.district': 'District', 'f.street': 'Street and building number',
      'f.notes': 'Notes for the courier (optional)',
      'e.name': 'Enter your full name.',
      'e.phone': 'Enter a Saudi mobile number: 10 digits starting with 05.',
      'e.email': 'That email address isn’t valid.',
      'e.city': 'Choose a city.', 'e.district': 'Enter the district.', 'e.street': 'Enter the street and building number.',
      'go.shipping': 'Continue to shipping', 'go.payment': 'Continue to payment', 'go.back': 'Back',
      'h.delivery': 'Where should we deliver?', 'h.shipping': 'Choose shipping', 'h.payment': 'Choose how to pay',
      'ship.to': 'Deliver to', edit: 'Edit',
      'ship.standard': 'Standard', 'ship.standardSub': '3 to 5 business days',
      'ship.express': 'Express', 'ship.expressSub': '1 to 2 business days',
      'ship.arrives': 'Arrives {a} – {b}',
      'pay.card': 'mada, Visa or Mastercard', 'pay.cardSub': 'Verified by your bank before paying',
      'pay.applepay': 'Apple Pay', 'pay.applepaySub': 'Pay with a touch from your device',
      'pay.tabby': 'tabby', 'pay.tabbySub': 'Split into 4 interest-free payments',
      'pay.tamara': 'tamara', 'pay.tamaraSub': 'Split into 3 interest-free payments',
      'c.number': 'Card number', 'c.name': 'Name on card', 'c.exp': 'Expiry', 'c.cvc': 'Security code',
      'e.cardNumber': 'The card number is incomplete.',
      'e.cardDemo': 'In demo mode only the demo cards work. Pick one from the list.',
      'e.cardName': 'Enter the name as it appears on the card.',
      'e.cardExp': 'The expiry date is invalid or in the past.',
      'e.cardCvc': 'The security code is 3 digits.',
      'demo.title': 'Demo cards', 'demo.ok': 'succeeds', 'demo.decline': 'is declined',
      'demo.rest': 'Use any future expiry date and any 3-digit code.', 'demo.use': 'Use',
      'pay.now': 'Pay {total}', 'pay.applepayBtn': 'Pay with Apple Pay',
      'pay.tabbyBtn': 'Continue with tabby', 'pay.tamaraBtn': 'Continue with tamara',
      'plan.today': 'Today', 'plan.of': '{n} payments of {amt}',
      'pay.declined': 'The card was declined. Try another card or a different payment method.',
      'sum.title': 'Order summary', 'sum.toggle': 'Show order summary', 'sum.subtotal': 'Subtotal',
      'sum.shipping': 'Shipping', 'sum.shipLater': 'Set at the next step', 'sum.total': 'Total',
      'sum.vat': 'Includes 15% VAT: {vat}', 'sum.qty': 'Qty {n}',
      'sh.cancel': 'Cancel', 'sh.confirm': 'Confirm', 'sh.approve': 'Approve', 'sh.code': 'Verification code',
      'sh.demoCode': 'Demo code: 1234', 'sh.wrong': 'That code is wrong. The demo code is 1234.',
      'sh.3dsTitle': 'Verify your payment', 'sh.3dsBody': 'Your bank sent a code to {phone}.',
      'sh.amount': 'Amount', 'sh.merchant': 'Merchant',
      'sh.apCard': 'Card', 'sh.apCardVal': 'Visa •••• 4242 (demo)', 'sh.apShip': 'Ship to',
      'sh.apContact': 'Contact', 'sh.apPay': 'Pay VEYLO', 'sh.apConfirm': 'Confirm payment',
      'sh.apHint': 'On a real device you’d confirm with a double-click of the side button.',
      'sh.bnplTitle': 'Confirm your mobile number', 'sh.bnplBody': 'We sent a code to {phone} to confirm your payment plan.',
      proc: 'Confirming your payment…',
      'done.thanks': 'Thank you, {name}', 'done.confirmed': 'Your order is confirmed.', 'done.no': 'Order number',
      'done.demo': 'Demo order. Nothing was charged.', 'done.eta': 'Expected delivery', 'done.paid': 'Payment',
      'done.to': 'Deliver to', 'done.items': 'Pieces', 'done.more': 'Continue shopping',
      'done.cardPaid': '{brand} •••• {last4}', 'done.plan': '{brand}, {n} payments',
      empty: 'Your bag is empty.',
    },
  };
  const t = (k, vars) => {
    let s = I18N[V.lang][k] ?? I18N.ar[k] ?? k;
    if (vars) Object.keys(vars).forEach((v) => { s = s.replace(`{${v}}`, vars[v]); });
    return s;
  };

  /* ------------------------------------------------------------------------
     Data
     ------------------------------------------------------------------------ */
  const CITIES = [
    ['الرياض', 'Riyadh'], ['جدة', 'Jeddah'], ['مكة المكرمة', 'Makkah'], ['المدينة المنورة', 'Madinah'],
    ['الدمام', 'Dammam'], ['الخبر', 'Al Khobar'], ['الظهران', 'Dhahran'], ['الأحساء', 'Al Ahsa'],
    ['الجبيل', 'Jubail'], ['الطائف', 'Taif'], ['تبوك', 'Tabuk'], ['أبها', 'Abha'],
    ['خميس مشيط', 'Khamis Mushait'], ['بريدة', 'Buraidah'], ['حائل', 'Hail'], ['جازان', 'Jazan'],
    ['نجران', 'Najran'], ['ينبع', 'Yanbu'],
  ];
  // PLACEHOLDER fees and times — replace with the real ones
  const SHIPPING = {
    standard: { fee: 25, days: [3, 5] },
    express: { fee: 45, days: [1, 2] },
  };
  // The only cards the demo accepts. Anything else is refused before "payment".
  const DEMO_CARDS = {
    4242424242424242: { brand: 'Visa', ok: true },
    5555555555554444: { brand: 'Mastercard', ok: true },
    4000000000000002: { brand: 'Visa', ok: false },
  };
  const DEMO_CODE = '1234';
  const PLANS = { tabby: 4, tamara: 3 };

  /* ------------------------------------------------------------------------
     State
     ------------------------------------------------------------------------ */
  let step = 'delivery';                       // delivery | shipping | payment | processing | done
  let form = Object.assign({ name: '', phone: '', email: '', city: '', district: '', street: '', notes: '' },
    store.get('veylo.checkout', {}));
  let ship = 'standard';
  let method = 'card';
  let card = { number: '', name: '', exp: '', cvc: '' };   // never stored
  let errors = {};
  let payError = '';
  let order = null;
  let sheetKind = null;
  let busy = false;

  /* ------------------------------------------------------------------------
     Helpers
     ------------------------------------------------------------------------ */
  const latinDigits = (s) => String(s).replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
  const digits = (s) => latinDigits(s).replace(/\D/g, '');
  const money = (n) => {
    const v = Number.isInteger(n) ? n.toLocaleString('en-US') : n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return V.lang === 'ar' ? `${v} ر.س` : `SAR ${v}`;
  };
  const cityName = (ar) => { const c = CITIES.find((x) => x[0] === ar); return c ? (V.lang === 'ar' ? c[0] : c[1]) : ar; };
  const normPhone = (s) => {
    let d = digits(s);
    if (d.startsWith('00966')) d = d.slice(5); else if (d.startsWith('966')) d = d.slice(3);
    if (d.length === 9 && d.startsWith('5')) d = `0${d}`;
    return d;
  };
  const maskPhone = (p) => (p.length >= 4 ? `${p.slice(0, 3)} ••• •• ${p.slice(-2)}` : p);
  const dateFmt = (d, opts) => new Intl.DateTimeFormat(V.lang === 'ar' ? 'ar-SA-u-ca-gregory-nu-latn' : 'en-GB', opts).format(d);
  const dayName = (d) => dateFmt(d, { weekday: 'long', day: 'numeric', month: 'long' });
  const shortDay = (d) => dateFmt(d, { day: 'numeric', month: 'short' });
  const addBusinessDays = (from, n) => {                    // Saudi weekend: Friday and Saturday
    const d = new Date(from);
    let left = n;
    while (left > 0) { d.setDate(d.getDate() + 1); if (d.getDay() !== 5 && d.getDay() !== 6) left -= 1; }
    return d;
  };
  const eta = (kind) => SHIPPING[kind].days.map((n) => addBusinessDays(new Date(), n));
  const luhn = (num) => {
    let sum = 0;
    for (let i = 0; i < num.length; i += 1) {
      let n = +num[num.length - 1 - i];
      if (i % 2) { n *= 2; if (n > 9) n -= 9; }
      sum += n;
    }
    return sum % 10 === 0;
  };
  const brandOf = (num) => (/^4/.test(num) ? 'Visa' : /^(5[1-5]|2[2-7])/.test(num) ? 'Mastercard' : '');

  function lines() {
    return V.bagLines().map((l) => {
      const p = V.productById(l.id);
      const c = V.colorOf(p, l.color);
      return { ...l, p, c, total: p.price * l.qty };
    });
  }
  function totals() {
    const subtotal = lines().reduce((n, l) => n + l.total, 0);
    const fee = step === 'delivery' ? null : SHIPPING[ship].fee;
    const total = subtotal + (fee || 0);
    return { subtotal, fee, total, vat: Math.round((total * 15 / 115) * 100) / 100 };
  }

  /* ------------------------------------------------------------------------
     Open / close
     ------------------------------------------------------------------------ */
  const main = $('main');
  const footer = $('.foot');

  function open() {
    if (!lines().length) { V.toast(t('empty')); return; }
    step = 'delivery'; errors = {}; payError = ''; order = null;
    root.hidden = false; main.hidden = true; footer.hidden = true;
    render();
    window.scrollTo({ top: 0, behavior: 'instant' });
    $('#co-title')?.focus({ preventScroll: true });
  }
  function close() {
    if (sheet.open) sheet.close();
    root.hidden = true; main.hidden = false; footer.hidden = false;
    card = { number: '', name: '', exp: '', cvc: '' };
  }
  function goStep(s) {
    step = s; errors = {}; payError = '';
    render();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  // Any link outside the checkout (header, logo) takes you back to the store first
  document.addEventListener('click', (e) => {
    if (root.hidden) return;
    const a = e.target.closest('a[href^="#"]');
    if (a && !root.contains(a)) close();
  }, true);

  /* ------------------------------------------------------------------------
     Rendering
     ------------------------------------------------------------------------ */
  function field(id, key, control, { full = false, hint = '' } = {}) {
    const err = errors[key];
    return `
      <div class="field${full ? ' field--full' : ''}">
        <label for="${id}">${esc(t(`f.${key}`))}</label>
        ${control}
        ${hint ? `<span class="field__hint">${esc(hint)}</span>` : ''}
        <span class="field__err" id="${id}-err"${err ? '' : ' hidden'}>${err ? esc(err) : ''}</span>
      </div>`;
  }
  const inv = (key) => (errors[key] ? ' aria-invalid="true"' : '');

  function stepper() {
    const order3 = ['delivery', 'shipping', 'payment'];
    const cur = order3.indexOf(step);
    return `<ol class="steps">${order3.map((s, i) => {
      const cls = i === cur ? 'is-current' : i < cur ? 'is-done' : '';
      const tag = i < cur ? 'button type="button"' : 'span';
      const end = i < cur ? 'button' : 'span';
      return `<li><${tag} class="step ${cls}" data-step="${s}"${i === cur ? ' aria-current="step"' : ''}>
        <span class="step__n">${i + 1}</span><span>${esc(t(`step.${s}`))}</span></${end}></li>`;
    }).join('')}</ol>`;
  }

  function summaryHTML() {
    const ls = lines();
    const tt = totals();
    const wide = window.matchMedia('(min-width: 901px)').matches;
    return `
      <details class="sum"${wide ? ' open' : ''}>
        <summary class="sum__toggle"><span>${esc(t('sum.toggle'))}</span><b>${money(tt.total)}</b></summary>
        <h2 class="sum__title">${esc(t('sum.title'))}</h2>
        <ul class="sum__items">${ls.map((l) => `
          <li class="sum__item">
            <span class="sum__tile" style="--c:${l.c.hex}" aria-hidden="true"><svg class="wm"><use href="#wordmark"/></svg></span>
            <span class="sum__what">
              <span class="sum__name">${esc(V.pieceName(l.p, l.c))}</span>
              <span class="sum__meta">${esc(V.L(l.c.name))} · ${esc(l.size)} · ${esc(t('sum.qty', { n: l.qty }))}</span>
            </span>
            <span class="sum__price">${money(l.total)}</span>
          </li>`).join('')}
        </ul>
        <dl class="sum__rows">
          <div><dt>${esc(t('sum.subtotal'))}</dt><dd>${money(tt.subtotal)}</dd></div>
          <div><dt>${esc(t('sum.shipping'))}</dt><dd>${tt.fee == null ? `<span class="sum__later">${esc(t('sum.shipLater'))}</span>` : money(tt.fee)}</dd></div>
          <div class="sum__total"><dt>${esc(t('sum.total'))}</dt><dd>${money(tt.total)}</dd></div>
        </dl>
        <p class="sum__vat">${esc(t('sum.vat', { vat: money(tt.vat) }))}</p>
      </details>`;
  }

  function deliveryHTML() {
    const cities = CITIES.map(([ar, en]) => `<option value="${esc(ar)}"${form.city === ar ? ' selected' : ''}>${esc(V.lang === 'ar' ? ar : en)}</option>`).join('');
    return `
      <form class="co__form" data-form="delivery" novalidate>
        <h2 class="co__h">${esc(t('h.delivery'))}</h2>
        <div class="fields">
          ${field('co-name', 'name', `<input class="input" id="co-name" name="name" autocomplete="name" value="${esc(form.name)}"${inv('name')} aria-describedby="co-name-err">`, { full: true })}
          ${field('co-phone', 'phone', `<input class="input" id="co-phone" name="phone" type="tel" inputmode="tel" dir="ltr" autocomplete="tel" placeholder="05X XXX XXXX" value="${esc(form.phone)}"${inv('phone')} aria-describedby="co-phone-err">`)}
          ${field('co-email', 'email', `<input class="input" id="co-email" name="email" type="email" dir="ltr" autocomplete="email" value="${esc(form.email)}"${inv('email')} aria-describedby="co-email-err">`)}
          ${field('co-city', 'city', `<select class="input" id="co-city" name="city" autocomplete="address-level2"${inv('city')} aria-describedby="co-city-err"><option value="">${esc(t('f.cityPick'))}</option>${cities}</select>`)}
          ${field('co-district', 'district', `<input class="input" id="co-district" name="district" value="${esc(form.district)}"${inv('district')} aria-describedby="co-district-err">`)}
          ${field('co-street', 'street', `<input class="input" id="co-street" name="street" autocomplete="street-address" value="${esc(form.street)}"${inv('street')} aria-describedby="co-street-err">`, { full: true })}
          ${field('co-notes', 'notes', `<textarea class="input" id="co-notes" name="notes" rows="2">${esc(form.notes)}</textarea>`, { full: true })}
        </div>
        <div class="co__actions">
          <button class="btn btn--solid" type="submit">${esc(t('go.shipping'))}</button>
        </div>
      </form>`;
  }

  function addressCard() {
    return `
      <div class="addr">
        <div>
          <p class="addr__label">${esc(t('ship.to'))}</p>
          <p>${esc(form.name)} · <span dir="ltr">${esc(form.phone)}</span></p>
          <p class="addr__line">${esc(form.street)}، ${esc(form.district)}، ${esc(cityName(form.city))}</p>
        </div>
        <button class="link-btn" type="button" data-step="delivery">${esc(t('edit'))}</button>
      </div>`;
  }

  function shippingHTML() {
    const opt = (k) => {
      const [a, b] = eta(k);
      return `
        <label class="choice">
          <input type="radio" name="ship" value="${k}"${ship === k ? ' checked' : ''}>
          <span class="choice__body">
            <span class="choice__title">${esc(t(`ship.${k}`))}</span>
            <span class="choice__sub">${esc(t(`ship.${k}Sub`))} · ${esc(t('ship.arrives', { a: dayName(a), b: dayName(b) }))}</span>
          </span>
          <span class="choice__price">${money(SHIPPING[k].fee)}</span>
        </label>`;
    };
    return `
      <div class="co__form">
        ${addressCard()}
        <h2 class="co__h">${esc(t('h.shipping'))}</h2>
        <div class="choices">${opt('standard')}${opt('express')}</div>
        <div class="co__actions">
          <button class="btn btn--solid" type="button" data-go="payment">${esc(t('go.payment'))}</button>
          <button class="btn btn--quiet" type="button" data-step="delivery">${esc(t('go.back'))}</button>
        </div>
      </div>`;
  }

  function planHTML(kind) {
    const n = PLANS[kind];
    const total = totals().total;
    const each = Math.round((total / n) * 100) / 100;
    const rows = Array.from({ length: n }, (_, i) => {
      const d = new Date(); d.setMonth(d.getMonth() + i);
      return `<li><span>${esc(i === 0 ? t('plan.today') : shortDay(d))}</span><b>${money(each)}</b></li>`;
    }).join('');
    return `<p class="plan__lede">${esc(t('plan.of', { n, amt: money(each) }))}</p><ol class="plan plan--${n}">${rows}</ol>`;
  }

  function cardPanel() {
    const brand = brandOf(digits(card.number));
    const cardErr = (key) => (errors[key] ? `<span class="field__err" id="co-${key}-err">${esc(errors[key])}</span>` : '');
    const demo = Object.entries(DEMO_CARDS).map(([num, c]) => `
      <li><code dir="ltr">${num.replace(/(\d{4})(?=\d)/g, '$1 ')}</code>
        <span>${esc(c.ok ? t('demo.ok') : t('demo.decline'))}</span>
        <button class="link-btn" type="button" data-demo="${num}">${esc(t('demo.use'))}</button></li>`).join('');
    return `
      <form class="pay-panel" data-form="card" novalidate>
        <div class="fields">
          <div class="field field--full">
            <label for="co-cnum">${esc(t('c.number'))}</label>
            <div class="input-wrap">
              <input class="input input--ltr" id="co-cnum" inputmode="numeric" dir="ltr" autocomplete="off" placeholder="0000 0000 0000 0000" value="${esc(card.number)}"${inv('cardNumber')} aria-describedby="co-cardNumber-err">
              <span class="input-wrap__tag" id="co-brand">${esc(brand)}</span>
            </div>
            ${cardErr('cardNumber')}
          </div>
          <div class="field field--full">
            <label for="co-cname">${esc(t('c.name'))}</label>
            <input class="input" id="co-cname" autocomplete="off" dir="ltr" value="${esc(card.name)}"${inv('cardName')} aria-describedby="co-cardName-err">
            ${cardErr('cardName')}
          </div>
          <div class="field">
            <label for="co-cexp">${esc(t('c.exp'))}</label>
            <input class="input input--ltr" id="co-cexp" inputmode="numeric" dir="ltr" autocomplete="off" placeholder="MM/YY" value="${esc(card.exp)}"${inv('cardExp')} aria-describedby="co-cardExp-err">
            ${cardErr('cardExp')}
          </div>
          <div class="field">
            <label for="co-ccvc">${esc(t('c.cvc'))}</label>
            <input class="input input--ltr" id="co-ccvc" inputmode="numeric" dir="ltr" autocomplete="off" placeholder="123" value="${esc(card.cvc)}"${inv('cardCvc')} aria-describedby="co-cardCvc-err">
            ${cardErr('cardCvc')}
          </div>
        </div>
        <div class="democards">
          <p class="democards__title">${esc(t('demo.title'))}</p>
          <ul>${demo}</ul>
          <p class="democards__rest">${esc(t('demo.rest'))}</p>
        </div>
        <button class="btn btn--solid btn--block" type="submit">${esc(t('pay.now', { total: money(totals().total) }))}</button>
      </form>`;
  }

  function paymentHTML() {
    const opt = (k, latin) => `
      <label class="choice">
        <input type="radio" name="method" value="${k}"${method === k ? ' checked' : ''}>
        <span class="choice__body">
          <span class="choice__title"${latin ? ' dir="ltr"' : ''}>${esc(t(`pay.${k}`))}</span>
          <span class="choice__sub">${esc(t(`pay.${k}Sub`))}</span>
        </span>
      </label>`;
    let panel = '';
    if (method === 'card') panel = cardPanel();
    if (method === 'applepay') panel = `<div class="pay-panel"><button class="btn btn--apple btn--block" type="button" data-sheet="applepay">${esc(t('pay.applepayBtn'))}</button></div>`;
    if (method === 'tabby' || method === 'tamara') {
      panel = `<div class="pay-panel">${planHTML(method)}<button class="btn btn--solid btn--block" type="button" data-sheet="${method}">${esc(t(`pay.${method}Btn`))}</button></div>`;
    }
    return `
      <div class="co__form">
        ${addressCard()}
        <h2 class="co__h">${esc(t('h.payment'))}</h2>
        ${payError ? `<p class="co__alert" role="alert">${esc(payError)}</p>` : ''}
        <div class="choices">${opt('card')}${opt('applepay', true)}${opt('tabby', true)}${opt('tamara', true)}</div>
        ${panel}
        <div class="co__actions">
          <button class="btn btn--quiet" type="button" data-step="shipping">${esc(t('go.back'))}</button>
        </div>
      </div>`;
  }

  function processingHTML() {
    return `
      <div class="co__proc" role="status">
        <span class="mini-loader" aria-hidden="true"><svg class="wm"><use href="#wordmark"/></svg><svg class="wm mini-loader__lit"><use href="#wordmark"/></svg></span>
        <p>${esc(t('proc'))}</p>
      </div>`;
  }

  function doneHTML() {
    const o = order;
    const first = (o.form.name.trim().split(/\s+/)[0]) || '';
    const paid = o.method === 'card' ? t('done.cardPaid', { brand: o.brand, last4: o.last4 })
      : o.method === 'applepay' ? 'Apple Pay'
        : t('done.plan', { brand: o.method, n: PLANS[o.method] });
    return `
      <div class="done">
        <span class="done__mark" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="1.4"/></svg></span>
        <h1 class="done__title" id="co-title" tabindex="-1">${esc(t('done.thanks', { name: first }))}</h1>
        <p class="done__lede">${esc(t('done.confirmed'))}</p>
        <p class="done__label">${esc(t('done.no'))}</p>
        <p class="done__no" dir="ltr">${esc(o.no)}</p>
        <p class="done__demo">${esc(t('done.demo'))}</p>
        <dl class="done__grid">
          <div><dt>${esc(t('done.eta'))}</dt><dd>${esc(dayName(o.eta[0]))} – ${esc(dayName(o.eta[1]))}</dd></div>
          <div><dt>${esc(t('done.paid'))}</dt><dd dir="auto">${esc(paid)}</dd></div>
          <div class="done__wide"><dt>${esc(t('done.to'))}</dt><dd>${esc(o.form.name)} · <span dir="ltr">${esc(o.form.phone)}</span><br>${esc(o.form.street)}، ${esc(o.form.district)}، ${esc(cityName(o.form.city))}</dd></div>
        </dl>
        <ul class="sum__items done__items">${o.lines.map((l) => `
          <li class="sum__item">
            <span class="sum__tile" style="--c:${l.c.hex}" aria-hidden="true"><svg class="wm"><use href="#wordmark"/></svg></span>
            <span class="sum__what">
              <span class="sum__name">${esc(V.pieceName(l.p, l.c))}</span>
              <span class="sum__meta">${esc(V.L(l.c.name))} · ${esc(l.size)} · ${esc(t('sum.qty', { n: l.qty }))}</span>
            </span>
            <span class="sum__price">${money(l.total)}</span>
          </li>`).join('')}
        </ul>
        <dl class="sum__rows done__rows">
          <div><dt>${esc(t('sum.subtotal'))}</dt><dd>${money(o.subtotal)}</dd></div>
          <div><dt>${esc(t('sum.shipping'))}</dt><dd>${money(o.fee)}</dd></div>
          <div class="sum__total"><dt>${esc(t('sum.total'))}</dt><dd>${money(o.total)}</dd></div>
        </dl>
        <button class="btn btn--solid" type="button" data-done>${esc(t('done.more'))}</button>
      </div>`;
  }

  function render() {
    if (step === 'done' && order) {
      root.innerHTML = `<div class="wrap co__wrap">${doneHTML()}</div>`;
      return;
    }
    let body = '';
    if (step === 'delivery') body = deliveryHTML();
    if (step === 'shipping') body = shippingHTML();
    if (step === 'payment') body = paymentHTML();
    if (step === 'processing') body = processingHTML();
    root.innerHTML = `
      <div class="wrap co__wrap">
        <div class="co__top">
          <button class="co__back" type="button" data-close>${V.lang === 'ar' ? '→' : '←'} ${esc(t('back'))}</button>
          <h1 class="co__title" id="co-title" tabindex="-1">${esc(t('title'))}</h1>
        </div>
        <p class="co__demo">${esc(t('demo'))}</p>
        ${step === 'processing' ? '' : stepper()}
        <div class="co__grid">
          <div class="co__main">${body}</div>
          <aside class="co__sum" aria-label="${esc(t('sum.title'))}">${summaryHTML()}</aside>
        </div>
      </div>`;
  }

  /* ------------------------------------------------------------------------
     Validation
     ------------------------------------------------------------------------ */
  function validateDelivery() {
    const e = {};
    form.phone = normPhone(form.phone) || form.phone;
    if (form.name.trim().length < 3) e.name = t('e.name');
    if (!/^05\d{8}$/.test(form.phone)) e.phone = t('e.phone');
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = t('e.email');
    if (!form.city) e.city = t('e.city');
    if (form.district.trim().length < 2) e.district = t('e.district');
    if (form.street.trim().length < 3) e.street = t('e.street');
    return e;
  }

  function validateCard() {
    const e = {};
    const num = digits(card.number);
    if (num.length < 16 || !luhn(num)) e.cardNumber = t('e.cardNumber');
    else if (!DEMO_CARDS[num]) e.cardNumber = t('e.cardDemo');
    if (card.name.trim().length < 2) e.cardName = t('e.cardName');
    const m = /^(\d{2})\/(\d{2})$/.exec(card.exp);
    if (!m || +m[1] < 1 || +m[1] > 12) e.cardExp = t('e.cardExp');
    else {
      const end = new Date(2000 + +m[2], +m[1], 0, 23, 59, 59);
      if (end < new Date()) e.cardExp = t('e.cardExp');
    }
    if (!/^\d{3}$/.test(digits(card.cvc))) e.cardCvc = t('e.cardCvc');
    return e;
  }

  function focusFirstError() {
    const bad = root.querySelector('[aria-invalid="true"]');
    if (bad) bad.focus();
  }

  /* ------------------------------------------------------------------------
     Events
     ------------------------------------------------------------------------ */
  root.addEventListener('input', (e) => {
    const el = e.target;
    if (el.closest('[data-form="delivery"]') && el.name in form) {
      form[el.name] = el.value;
      if (errors[el.name]) { delete errors[el.name]; el.removeAttribute('aria-invalid'); const m = $(`#${el.id}-err`); if (m) { m.hidden = true; m.textContent = ''; } }
      return;
    }
    if (el.id === 'co-cnum') {
      const d = digits(el.value).slice(0, 16);
      el.value = d.replace(/(\d{4})(?=\d)/g, '$1 ');
      card.number = el.value;
      const tag = $('#co-brand'); if (tag) tag.textContent = brandOf(d);
    } else if (el.id === 'co-cexp') {
      let d = digits(el.value).slice(0, 4);
      if (d.length >= 3) d = `${d.slice(0, 2)}/${d.slice(2)}`;
      el.value = d; card.exp = d;
    } else if (el.id === 'co-ccvc') {
      el.value = digits(el.value).slice(0, 3); card.cvc = el.value;
    } else if (el.id === 'co-cname') {
      card.name = el.value;
    }
  });

  root.addEventListener('change', (e) => {
    const el = e.target;
    if (el.name === 'city') { form.city = el.value; return; }
    if (el.name === 'ship') { ship = el.value; render(); return; }
    if (el.name === 'method') { method = el.value; payError = ''; errors = {}; render(); $(`input[name="method"][value="${method}"]`, root)?.focus(); }
  });

  root.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target.dataset.form;
    if (f === 'delivery') {
      errors = validateDelivery();
      if (Object.keys(errors).length) { render(); focusFirstError(); return; }
      store.set('veylo.checkout', form);
      goStep('shipping');
    } else if (f === 'card') {
      if (busy) return;
      errors = validateCard();
      payError = '';
      if (Object.keys(errors).length) { render(); focusFirstError(); return; }
      openSheet('3ds');
    }
  });

  root.addEventListener('click', (e) => {
    const b = e.target.closest('button, [data-step]');
    if (!b) return;
    if (b.hasAttribute('data-close')) { close(); window.scrollTo({ top: 0, behavior: 'instant' }); return; }
    if (b.hasAttribute('data-done')) { close(); document.getElementById('collection')?.scrollIntoView(); return; }
    if (b.dataset.step && b.tagName === 'BUTTON') { goStep(b.dataset.step); return; }
    if (b.dataset.go === 'payment') { goStep('payment'); return; }
    if (b.dataset.demo) {
      card.number = b.dataset.demo.replace(/(\d{4})(?=\d)/g, '$1 ');
      if (!card.name) card.name = form.name;
      if (!card.exp) { const d = new Date(); card.exp = `12/${String((d.getFullYear() + 3) % 100).padStart(2, '0')}`; }
      if (!card.cvc) card.cvc = '123';
      errors = {};
      render();
      $('button[type="submit"]', root)?.focus();
      return;
    }
    if (b.dataset.sheet) openSheet(b.dataset.sheet);
  });

  /* ------------------------------------------------------------------------
     Approval sheets: bank verification (3-D Secure), Apple Pay, tabby, tamara
     ------------------------------------------------------------------------ */
  function sheetHTML(kind, err = '') {
    const total = money(totals().total);
    const otp = `
      <div class="field">
        <label for="sheet-otp">${esc(t('sh.code'))}</label>
        <input class="input otp" id="sheet-otp" inputmode="numeric" autocomplete="one-time-code" dir="ltr" maxlength="4" placeholder="••••"${err ? ' aria-invalid="true"' : ''} aria-describedby="sheet-err">
        <span class="field__err" id="sheet-err"${err ? '' : ' hidden'}>${esc(err)}</span>
        <span class="field__hint">${esc(t('sh.demoCode'))}</span>
      </div>`;
    const rows = (pairs) => `<dl class="sheet__rows">${pairs.map(([k, v, ltr]) => `<div><dt>${esc(k)}</dt><dd${ltr ? ' dir="ltr"' : ''}>${v}</dd></div>`).join('')}</dl>`;
    if (kind === '3ds') {
      const num = digits(card.number);
      return `
        <p class="sheet__brand" dir="ltr">3-D Secure · ${esc(brandOf(num))} •••• ${esc(num.slice(-4))}</p>
        <h2 class="sheet__title" id="sheet-title">${esc(t('sh.3dsTitle'))}</h2>
        ${rows([[t('sh.merchant'), 'VEYLO', true], [t('sh.amount'), esc(total)]])}
        <p class="sheet__text">${esc(t('sh.3dsBody', { phone: maskPhone(form.phone) }))}</p>
        ${otp}
        <div class="sheet__actions"><button class="btn btn--solid" type="button" data-sheet-ok>${esc(t('sh.confirm'))}</button><button class="btn btn--quiet" type="button" data-sheet-cancel>${esc(t('sh.cancel'))}</button></div>`;
    }
    if (kind === 'applepay') {
      return `
        <p class="sheet__brand" dir="ltr">Apple Pay</p>
        <h2 class="sheet__title" id="sheet-title" dir="ltr">VEYLO</h2>
        ${rows([
          [t('sh.apCard'), esc(t('sh.apCardVal'))],
          [t('sh.apShip'), `${esc(form.street)}، ${esc(form.district)}، ${esc(cityName(form.city))}`],
          [t('sh.apContact'), esc(form.phone), true],
          [t('sh.apPay'), `<b>${esc(total)}</b>`],
        ])}
        <p class="sheet__hint">${esc(t('sh.apHint'))}</p>
        <div class="sheet__actions"><button class="btn btn--apple" type="button" data-sheet-ok>${esc(t('sh.apConfirm'))}</button><button class="btn btn--quiet" type="button" data-sheet-cancel>${esc(t('sh.cancel'))}</button></div>`;
    }
    // tabby / tamara
    return `
      <p class="sheet__brand" dir="ltr">${esc(kind)}</p>
      <h2 class="sheet__title" id="sheet-title">${esc(t('sh.bnplTitle'))}</h2>
      ${planHTML(kind)}
      <p class="sheet__text">${esc(t('sh.bnplBody', { phone: maskPhone(form.phone) }))}</p>
      ${otp}
      <div class="sheet__actions"><button class="btn btn--solid" type="button" data-sheet-ok>${esc(t('sh.approve'))}</button><button class="btn btn--quiet" type="button" data-sheet-cancel>${esc(t('sh.cancel'))}</button></div>`;
  }

  function openSheet(kind, err = '') {
    sheetKind = kind;
    sheet.innerHTML = `<div class="sheet__inner">${sheetHTML(kind, err)}</div>`;
    if (!sheet.open) sheet.showModal();
    ($('#sheet-otp', sheet) || $('[data-sheet-ok]', sheet))?.focus();
  }

  sheet.addEventListener('click', (e) => {
    if (e.target === sheet || e.target.closest('[data-sheet-cancel]')) { sheet.close(); return; }
    if (!e.target.closest('[data-sheet-ok]')) return;
    const otp = $('#sheet-otp', sheet);
    if (otp && digits(otp.value) !== DEMO_CODE) { openSheet(sheetKind, t('sh.wrong')); return; }
    const kind = sheetKind;
    sheet.close();
    pay(kind === '3ds' ? 'card' : kind);
  });
  sheet.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.id === 'sheet-otp') { e.preventDefault(); $('[data-sheet-ok]', sheet)?.click(); }
  });

  /* ------------------------------------------------------------------------
     Paying and the order
     ------------------------------------------------------------------------ */
  function pay(kind) {
    if (busy) return;
    busy = true;
    const num = digits(card.number);
    const declined = kind === 'card' && DEMO_CARDS[num] && !DEMO_CARDS[num].ok;
    step = 'processing';
    render();
    window.scrollTo({ top: 0, behavior: 'instant' });
    setTimeout(() => {
      busy = false;
      if (declined) {
        step = 'payment';
        payError = t('pay.declined');
        render();
        $('.co__alert', root)?.scrollIntoView({ block: 'center' });
        return;
      }
      const tt = totals();
      order = {
        no: `VEY-${String(Math.floor(100000 + Math.random() * 900000))}`,
        lines: lines(),
        subtotal: tt.subtotal, fee: tt.fee, total: tt.total,
        form: { ...form },
        method: kind,
        brand: brandOf(num), last4: num.slice(-4),
        eta: eta(ship),
      };
      card = { number: '', name: '', exp: '', cvc: '' };
      V.clearBag();
      step = 'done';
      render();
      window.scrollTo({ top: 0, behavior: 'instant' });
      $('#co-title')?.focus({ preventScroll: true });
    }, reduceMotionDelay());
  }
  function reduceMotionDelay() { return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 400 : 1800; }

  V.onLang(() => {
    if (!root.hidden) render();
    if (sheet.open && sheetKind) openSheet(sheetKind);
  });

  window.VEYLO_CHECKOUT = { open, close, isOpen: () => !root.hidden };
})();
