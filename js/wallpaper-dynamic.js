(function () {
  'use strict';

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  var canvas = document.createElement('canvas');
  canvas.id = 'wallpaper-dynamic-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.insertBefore(canvas, document.body.firstChild ? document.body.firstChild.nextSibling : null);

  var hero = document.querySelector('#page-header.full_page');
  var heroCanvas = null;
  if (hero) {
    heroCanvas = document.createElement('canvas');
    heroCanvas.id = 'wallpaper-hero-canvas';
    heroCanvas.setAttribute('aria-hidden', 'true');
    hero.appendChild(heroCanvas);
  }

  var canvases = [canvas];
  if (heroCanvas) canvases.push(heroCanvas);
  var contexts = canvases.map(function (item) {
    return item.getContext('2d');
  });
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
    canvases.forEach(function (item, index) {
      item.width = Math.floor(width * dpr);
      item.height = Math.floor(height * dpr);
      item.style.width = width + 'px';
      item.style.height = height + 'px';
      contexts[index].setTransform(dpr, 0, 0, dpr, 0, 0);
    });

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

  function drawGlints(target, time) {
    for (var i = 0; i < glints.length; i += 1) {
      var g = glints[i];
      var pulse = (Math.sin(time * 0.0008 + g.phase) + 1) * 0.5;
      var alpha = g.a * (0.45 + pulse * 0.55);
      var gradient = target.createRadialGradient(g.x + mouse.x, g.y + mouse.y, 0, g.x + mouse.x, g.y + mouse.y, g.r);
      gradient.addColorStop(0, 'rgba(255,255,255,' + alpha + ')');
      gradient.addColorStop(0.45, 'rgba(190,220,255,' + alpha * 0.38 + ')');
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      target.fillStyle = gradient;
      target.beginPath();
      target.arc(g.x + mouse.x, g.y + mouse.y, g.r, 0, Math.PI * 2);
      target.fill();
    }
  }

  function drawFlakes(target) {
    for (var i = 0; i < flakes.length; i += 1) {
      var f = flakes[i];
      var x = f.x + mouse.x * (f.r / 8);
      var y = f.y + mouse.y * (f.r / 10);
      target.fillStyle = 'rgba(255,255,255,' + f.a + ')';
      target.beginPath();
      target.arc(x, y, f.r, 0, Math.PI * 2);
      target.fill();

      if (f.r > 3) {
        target.strokeStyle = 'rgba(255,255,255,' + f.a * 0.35 + ')';
        target.lineWidth = 1;
        target.beginPath();
        target.moveTo(x - f.r * 1.8, y);
        target.lineTo(x + f.r * 1.8, y);
        target.moveTo(x, y - f.r * 1.8);
        target.lineTo(x, y + f.r * 1.8);
        target.stroke();
      }
    }
  }

  function updateFlakes() {
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
    }
  }

  function frame(time) {
    updateFlakes();
    contexts.forEach(function (target) {
      target.clearRect(0, 0, width, height);
      drawGlints(target, time);
      drawFlakes(target);
    });
    window.requestAnimationFrame(frame);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', updateMouse, { passive: true });
  resize();
  window.requestAnimationFrame(frame);
})();
