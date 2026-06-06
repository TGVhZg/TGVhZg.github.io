(function () {
  'use strict';

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  var canvas = document.createElement('canvas');
  canvas.id = 'wallpaper-dynamic-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.insertBefore(canvas, document.body.firstChild ? document.body.firstChild.nextSibling : null);

  var ctx = canvas.getContext('2d');
  var width = 0;
  var height = 0;
  var dpr = 1;
  var flakes = [];
  var glints = [];
  var mouse = { x: 0, y: 0 };

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function makeFlake() {
    return {
      x: rand(0, width),
      y: rand(-height, height),
      r: rand(1.1, 4.4),
      vx: rand(-0.18, 0.34),
      vy: rand(0.28, 1.05),
      a: rand(0.32, 0.82),
      phase: rand(0, Math.PI * 2),
      drift: rand(0.16, 0.58)
    };
  }

  function makeGlint() {
    return {
      x: rand(0, width),
      y: rand(0, height * 0.55),
      r: rand(8, 24),
      a: rand(0.05, 0.18),
      phase: rand(0, Math.PI * 2)
    };
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var flakeCount = Math.min(150, Math.max(70, Math.round(width * height / 12000)));
    var glintCount = Math.min(16, Math.max(8, Math.round(width / 120)));

    flakes = [];
    glints = [];
    for (var i = 0; i < flakeCount; i += 1) flakes.push(makeFlake());
    for (var j = 0; j < glintCount; j += 1) glints.push(makeGlint());
  }

  function updateMouse(event) {
    mouse.x = (event.clientX / width - 0.5) * 12;
    mouse.y = (event.clientY / height - 0.5) * 8;
  }

  function drawGlints(time) {
    for (var i = 0; i < glints.length; i += 1) {
      var g = glints[i];
      var pulse = (Math.sin(time * 0.0008 + g.phase) + 1) * 0.5;
      var alpha = g.a * (0.45 + pulse * 0.55);
      var gradient = ctx.createRadialGradient(g.x + mouse.x, g.y + mouse.y, 0, g.x + mouse.x, g.y + mouse.y, g.r);
      gradient.addColorStop(0, 'rgba(255,255,255,' + alpha + ')');
      gradient.addColorStop(0.45, 'rgba(190,220,255,' + alpha * 0.38 + ')');
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(g.x + mouse.x, g.y + mouse.y, g.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawFlakes() {
    for (var i = 0; i < flakes.length; i += 1) {
      var f = flakes[i];
      f.phase += 0.006;
      f.x += f.vx + Math.sin(f.phase) * f.drift;
      f.y += f.vy;

      if (f.y > height + 12) {
        f.y = rand(-60, -8);
        f.x = rand(0, width);
      }
      if (f.x < -20) f.x = width + 20;
      if (f.x > width + 20) f.x = -20;

      var x = f.x + mouse.x * (f.r / 8);
      var y = f.y + mouse.y * (f.r / 10);
      ctx.fillStyle = 'rgba(255,255,255,' + f.a + ')';
      ctx.beginPath();
      ctx.arc(x, y, f.r, 0, Math.PI * 2);
      ctx.fill();

      if (f.r > 3) {
        ctx.strokeStyle = 'rgba(255,255,255,' + f.a * 0.35 + ')';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x - f.r * 1.8, y);
        ctx.lineTo(x + f.r * 1.8, y);
        ctx.moveTo(x, y - f.r * 1.8);
        ctx.lineTo(x, y + f.r * 1.8);
        ctx.stroke();
      }
    }
  }

  function frame(time) {
    ctx.clearRect(0, 0, width, height);
    drawGlints(time);
    drawFlakes();
    window.requestAnimationFrame(frame);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', updateMouse, { passive: true });
  resize();
  window.requestAnimationFrame(frame);
})();
