/* ============================================================
   preview_rpage.js — runs on the downloaded/deployed profile page.
   The DOM is already baked in, so this only wires interactions:
   language toggle, publication/project tabs, and scroll-reveal.
   The hero canvas is handled separately by roster_hero.js.
   ============================================================ */
(function () {
  function init() {
    var profile = document.getElementById('profile');

    // language toggle (hero mini-link + overview button share one action)
    var langBtn = document.getElementById('langBtn');
    var langMini = document.getElementById('langMini');
    function toggleLang() {
      var cn = profile.getAttribute('data-lang') === 'cn';
      profile.setAttribute('data-lang', cn ? 'en' : 'cn');
      if (langBtn) langBtn.textContent = cn ? '中文' : 'English';
      if (langMini) langMini.textContent = cn ? '中' : 'EN';
    }
    if (langBtn) langBtn.addEventListener('click', toggleLang);
    if (langMini) langMini.addEventListener('click', function (e) { e.preventDefault(); toggleLang(); });

    // publication / project tabs
    document.querySelectorAll('.tabs').forEach(function (tabs) {
      tabs.addEventListener('click', function (e) {
        var btn = e.target.closest('button');
        if (!btn) return;
        tabs.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
        var sec = tabs.closest('.sec');
        sec.querySelectorAll('.work').forEach(function (w) { w.classList.remove('active'); });
        var target = document.getElementById(btn.getAttribute('data-target'));
        if (target) target.classList.add('active');
      });
    });

    // scroll-reveal (opt-in so a JS-less page still shows everything)
    var secs = document.querySelectorAll('.sec');
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (profile) profile.classList.add('reveal');
    if (reduce || !('IntersectionObserver' in window)) {
      secs.forEach(function (s) { s.classList.add('in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
      }, { threshold: 0.12 });
      secs.forEach(function (s) { io.observe(s); });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
