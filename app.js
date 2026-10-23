/* BMW design study — shared motion + interaction.
   GSAP/Lenis are vendored locally. If any library fails, the page stays fully usable:
   every animated element is visible by default and only enhanced from here. */
(function () {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined';
  if (hasGsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ——— smooth scroll (Lenis + GSAP ticker) ——— */
  if (!reduced && typeof window.Lenis !== 'undefined' && hasGsap) {
    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1 });
    lenis.on('scroll', () => { if (window.ScrollTrigger) ScrollTrigger.update(); });
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* ——— preloader (home only): counts, then lifts and plays the hero intro ——— */
  const pre = document.getElementById('preloader');
  const heroIntro = () => {
    if (!hasGsap || reduced) return;
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.from('.hero h1 .line > span', { yPercent: 115, duration: 1.1, stagger: 0.12 })
      .from('.hero-sub, .hero-spec, .hero-cta', { y: 26, opacity: 0, duration: 0.9, stagger: 0.09 }, '-=0.65')
      .from('.stage', { opacity: 0, scale: 1.04, duration: 1.2 }, '-=0.8')
      .from('.hero-stats .stat', { y: 24, opacity: 0, duration: 0.7, stagger: 0.07 }, '-=0.8');
  };
  if (pre) {
    const num = pre.querySelector('.pl-num');
    const bars = pre.querySelectorAll('.pl-bar i');
    let p = 0;
    const iv = setInterval(() => {
      p = Math.min(100, p + Math.ceil(Math.random() * 16));
      if (num) num.textContent = p + '%';
      bars.forEach((b, i) => { b.style.width = Math.max(0, Math.min(100, p * 3 - i * 100)) + '%'; });
      if (p >= 100) {
        clearInterval(iv);
        window.__plDone = true;
        setTimeout(() => {
          if (hasGsap && !reduced) {
            gsap.to(pre, { yPercent: -100, duration: 0.9, ease: 'expo.inOut', onComplete: () => { pre.style.display = 'none'; } });
          } else { pre.style.display = 'none'; }
          heroIntro();
        }, 220);
      }
    }, 95);
  }

  if (hasGsap && window.ScrollTrigger && !reduced) {
    /* ——— scroll reveals ——— */
    gsap.utils.toArray('[data-reveal]').forEach(el => {
      gsap.from(el, {
        y: 38, opacity: 0, duration: 1, ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 86%' }
      });
    });
    /* ——— parallax photos ——— */
    gsap.utils.toArray('[data-parallax]').forEach(img => {
      gsap.fromTo(img, { yPercent: -8 }, {
        yPercent: 8, ease: 'none',
        scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
    /* ——— counters ——— */
    gsap.utils.toArray('[data-count]').forEach(el => {
      const end = parseFloat(el.dataset.count);
      const dec = parseInt(el.dataset.decimals || '0', 10);
      const obj = { v: 0 };
      ScrollTrigger.create({
        trigger: el, start: 'top 88%', once: true,
        onEnter: () => gsap.to(obj, {
          v: end, duration: 1.6, ease: 'power3.out',
          onUpdate: () => { el.textContent = obj.v.toFixed(dec); }
        })
      });
    });
  } else {
    /* no-motion path: counters land on their final values directly */
    document.querySelectorAll('[data-count]').forEach(el => {
      const dec = parseInt(el.dataset.decimals || '0', 10);
      el.textContent = parseFloat(el.dataset.count).toFixed(dec);
    });
  }

  /* ——— card tilt (pointer-fine devices only, rAF-throttled) ——— */
  if (!reduced && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.card').forEach(card => {
      let raf = null;
      card.addEventListener('pointermove', e => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          const r = card.getBoundingClientRect();
          const rx = ((e.clientY - r.top) / r.height - 0.5) * -5;
          const ry = ((e.clientX - r.left) / r.width - 0.5) * 5;
          card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
          raf = null;
        });
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }

  /* ——— models filter ——— */
  const chips = document.querySelectorAll('.chip');
  if (chips.length) {
    chips.forEach(chip => chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const f = chip.dataset.filter;
      document.querySelectorAll('[data-cat]').forEach(el => {
        const show = f === 'all' || el.dataset.cat.split(' ').includes(f);
        el.style.display = show ? '' : 'none';
      });
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    }));
  }

  /* ——— test-drive form: validation + success state ——— */
  const form = document.getElementById('tdForm');
  if (form) {
    const success = document.getElementById('formSuccess');
    const setInvalid = (id, bad) => {
      const field = document.getElementById(id).closest('.field');
      if (field) field.classList.toggle('invalid', bad);
      return !bad;
    };
    form.addEventListener('submit', e => {
      e.preventDefault();
      const name = document.getElementById('fName').value.trim();
      const contact = document.getElementById('fContact').value.trim();
      const model = document.getElementById('fModel').value;
      const date = document.getElementById('fDate').value;
      const consent = document.getElementById('fConsent').checked;
      let ok = true;
      ok = setInvalid('fName', name.length < 2) && ok;
      ok = setInvalid('fContact', !(/^\S+@\S+\.\S+$/.test(contact) || contact.replace(/\D/g, '').length >= 7)) && ok;
      ok = setInvalid('fModel', !model) && ok;
      const today = new Date(); today.setHours(0, 0, 0, 0);
      ok = setInvalid('fDate', !date || new Date(date + 'T00:00:00') < today) && ok;
      const consentField = document.getElementById('fConsent').closest('.field');
      if (consentField) consentField.classList.toggle('invalid', !consent);
      ok = ok && consent;
      if (!ok) {
        const firstBad = form.querySelector('.field.invalid input, .field.invalid select');
        if (firstBad) firstBad.focus();
        return;
      }
      document.getElementById('successModel').textContent = model;
      form.style.display = 'none';
      success.style.display = 'block';
      success.setAttribute('tabindex', '-1');
      success.focus();
      success.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
    });
    form.querySelectorAll('input, select').forEach(el =>
      el.addEventListener('input', () => {
        const f = el.closest('.field');
        if (f) f.classList.remove('invalid');
      }));
  }

  /* ——— footer year ——— */
  document.querySelectorAll('.yr').forEach(el => { el.textContent = new Date().getFullYear(); });
})();
