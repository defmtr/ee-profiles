/* ============================================================
   roster_hero.js — hero node-network background.
   Shared by the live preview and the downloaded/deployed page.
   Draws a calm blue constellation with flowing light packets +
   pointer parallax, echoing the 8080 student-login background.
   Honors prefers-reduced-motion and #profile[data-glow="off"]
   (both fall back to a single static frame).
   ============================================================ */
(function () {
  function init() {
    var canvas = document.getElementById('heroNet');
    if (!canvas || !canvas.getContext) return;
    var host = canvas.parentElement, ctx = canvas.getContext('2d');
    var profile = document.getElementById('profile');
    // always animate (per request), regardless of prefers-reduced-motion; only #profile[data-glow="off"] stops it
    var glowOff = profile && profile.getAttribute('data-glow') === 'off';
    var animate = !glowOff;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, T = 0, nodes = [], pk = [], raf = null, running = false, TH = 150;
    var mx = 0, my = 0, tx = 0, ty = 0;

    function rnd(n) { return (Math.random() * n) | 0; }
    function nb(i) {
      var b = [];
      for (var j = 0; j < nodes.length; j++) {
        if (j === i) continue;
        var dx = nodes[j].x - nodes[i].x, dy = nodes[j].y - nodes[i].y;
        if (dx * dx + dy * dy < TH * TH) b.push(j);
      }
      return b.length ? b[rnd(b.length)] : i;
    }
    function spawn() { var a = rnd(nodes.length); return { a: a, b: nb(a), t: Math.random(), s: 0.006 + Math.random() * 0.01 }; }
    function build() {
      nodes = [];
      var n = Math.max(34, Math.min(120, Math.round(W * H / 6800)));
      for (var i = 0; i < n; i++) {
        var x = Math.random() * W, y = Math.random() * H;
        nodes.push({ bx: x, by: y, x: x, y: y, ph: Math.random() * 6.28, sp: 0.25 + Math.random() * 0.55, amp: 8 + Math.random() * 12, r: 1 + Math.random() * 1.6, pl: Math.random() * 6.28, act: 0 });
      }
      pk = [];
      var np = Math.max(6, Math.min(16, (n / 6) | 0));
      for (var k = 0; k < np; k++) pk.push(spawn());
    }
    function step() {
      T += 0.008; tx += (mx - tx) * 0.05; ty += (my - ty) * 0.05;
      for (var i = 0; i < nodes.length; i++) {
        var d = nodes[i];
        d.x = d.bx + Math.sin(T * d.sp + d.ph) * d.amp + tx * d.amp * 0.6;
        d.y = d.by + Math.cos(T * d.sp * 0.9 + d.ph) * d.amp + ty * d.amp * 0.6;
        d.act *= 0.95;
      }
      for (var k = 0; k < pk.length; k++) {
        var p = pk[k]; p.t += p.s;
        if (p.t >= 1) { nodes[p.b].act = 1; p.t = 0; p.a = p.b; p.b = nb(p.a); }
      }
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < nodes.length; i++) for (var j = i + 1; j < nodes.length; j++) {
        var dx = nodes[j].x - nodes[i].x, dy = nodes[j].y - nodes[i].y, d2 = dx * dx + dy * dy;
        if (d2 < TH * TH) {
          var op = (1 - Math.sqrt(d2) / TH) * 0.28;
          ctx.strokeStyle = 'rgba(96,152,224,' + op.toFixed(3) + ')';
          ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke();
        }
      }
      for (var n2 = 0; n2 < nodes.length; n2++) {
        var d = nodes[n2], gl = 0.5 + 0.5 * Math.sin(T * 1.8 + d.pl), a = Math.min(1, 0.45 + gl * 0.35 + d.act * 0.4);
        ctx.beginPath(); ctx.fillStyle = 'rgba(140,190,245,' + a.toFixed(3) + ')';
        ctx.shadowBlur = 5 + gl * 6 + d.act * 10; ctx.shadowColor = 'rgba(90,170,245,.9)';
        ctx.arc(d.x, d.y, d.r + d.act * 1.5, 0, 6.283); ctx.fill(); ctx.shadowBlur = 0;
      }
      for (var m = 0; m < pk.length; m++) {
        var p = pk[m], u = nodes[p.a], v = nodes[p.b], x = u.x + (v.x - u.x) * p.t, y = u.y + (v.y - u.y) * p.t;
        ctx.beginPath(); ctx.shadowBlur = 12; ctx.shadowColor = 'rgba(150,220,255,1)';
        ctx.fillStyle = 'rgba(224,244,255,.95)'; ctx.arc(x, y, 2.1, 0, 6.283); ctx.fill(); ctx.shadowBlur = 0;
      }
    }
    function resize() {
      var r = host.getBoundingClientRect();
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build(); draw();
    }
    function loop() { if (!running) return; step(); draw(); raf = requestAnimationFrame(loop); }
    function start() { if (running) return; running = true; raf = requestAnimationFrame(loop); }

    if (animate) {
      host.addEventListener('pointermove', function (e) {
        var r = host.getBoundingClientRect();
        mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        my = ((e.clientY - r.top) / r.height - 0.5) * 2;
      });
      host.addEventListener('pointerleave', function () { mx = 0; my = 0; });
    }
    resize();
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(host);
    if (animate) start();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
