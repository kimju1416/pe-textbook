/* ===== 체육 교과서 슬라이드 엔진 (공통) ===== */
(function () {
  var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  if (!slides.length) return;
  var total = slides.length;
  var cur = 0;

  var progress = document.querySelector('.progress');
  var counter = document.querySelector('.counter');
  var prevBtn = document.getElementById('prev');
  var nextBtn = document.getElementById('next');
  var dotsBox = document.querySelector('.dots');

  // 점(dot) 생성
  var dots = [];
  if (dotsBox) {
    slides.forEach(function (_, i) {
      var d = document.createElement('i');
      d.addEventListener('click', function () { go(i); });
      dotsBox.appendChild(d);
      dots.push(d);
    });
  }

  function show(i) {
    slides[cur].classList.remove('active');
    cur = i;
    slides[cur].classList.add('active');
    slides[cur].scrollTop = 0;
    if (progress) progress.style.width = ((cur + 1) / total * 100) + '%';
    if (counter) counter.textContent = (cur + 1) + ' / ' + total;
    if (prevBtn) prevBtn.disabled = (cur === 0);
    if (nextBtn) nextBtn.disabled = (cur === total - 1);
    dots.forEach(function (d, k) { d.classList.toggle('on', k === cur); });
    if (location.hash !== '#' + (cur + 1)) {
      history.replaceState(null, '', '#' + (cur + 1));
    }
  }
  function go(i) { if (i >= 0 && i < total) show(i); }
  function next() { go(cur + 1); }
  function prev() { go(cur - 1); }

  if (nextBtn) nextBtn.addEventListener('click', next);
  if (prevBtn) prevBtn.addEventListener('click', prev);

  // 키보드
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { next(); e.preventDefault(); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { prev(); e.preventDefault(); }
    else if (e.key === 'Home') { go(0); }
    else if (e.key === 'End') { go(total - 1); }
  });

  // 터치 스와이프
  var x0 = null;
  document.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) { dx < 0 ? next() : prev(); }
    x0 = null;
  }, { passive: true });

  // 해시로 특정 슬라이드 바로가기 (#3 등)
  window.addEventListener('hashchange', function () {
    var h = parseInt((location.hash || '').replace('#', ''), 10);
    if (h >= 1 && h <= total && h - 1 !== cur) show(h - 1);
  });

  // 시작 슬라이드 (해시 지원)
  var start = parseInt((location.hash || '').replace('#', ''), 10);
  show(start >= 1 && start <= total ? start - 1 : 0);
})();
