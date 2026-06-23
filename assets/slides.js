/* ===== 체육 교과서 슬라이드 엔진 (공통) ===== */
(function () {
  // 테이블 자동 래퍼 (가로 스크롤 지원)
  document.querySelectorAll('.slide table').forEach(function(t){
    if(!t.parentElement.classList.contains('table-wrap')){
      var w=document.createElement('div');w.className='table-wrap';
      t.parentNode.insertBefore(w,t);w.appendChild(t);
    }
  });

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
    // 커버 슬라이드면 body에 on-cover 클래스 토글
    document.body.classList.toggle('on-cover', slides[cur].classList.contains('cover'));
    // 상단바 잠깐 보였다가 사라짐
    var topbar = document.querySelector('.topbar');
    if (topbar) {
      topbar.classList.add('show');
      clearTimeout(topbar._hideTimer);
      topbar._hideTimer = setTimeout(function () { topbar.classList.remove('show'); }, 1500);
    }
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

  // 슬라이드 클릭으로 다음 넘기기
  document.querySelector('.deck').addEventListener('click', function (e) {
    // 링크, 버튼, 인터랙티브 요소 클릭은 제외
    if (e.target.closest('a, button, input, select, textarea, .dots, .nav')) return;
    next();
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

  // ===== 목차(TOC) 오버뷰 =====
  // 버튼 생성
  var tocBtn = document.createElement('button');
  tocBtn.className = 'toc-btn';
  tocBtn.setAttribute('aria-label', '목차');
  tocBtn.innerHTML = '☰';
  document.body.appendChild(tocBtn);

  // 오버레이
  var tocOverlay = document.createElement('div');
  tocOverlay.className = 'toc-overlay';
  document.body.appendChild(tocOverlay);

  // 패널
  var tocPanel = document.createElement('div');
  tocPanel.className = 'toc-panel';

  var tocHeader = document.createElement('div');
  tocHeader.className = 'toc-header';
  tocHeader.innerHTML = '<h3>📑 슬라이드 목차</h3>';
  var tocClose = document.createElement('button');
  tocClose.className = 'toc-close';
  tocClose.innerHTML = '✕';
  tocHeader.appendChild(tocClose);
  tocPanel.appendChild(tocHeader);

  var tocGrid = document.createElement('div');
  tocGrid.className = 'toc-grid';

  slides.forEach(function (slide, i) {
    var card = document.createElement('div');
    card.className = 'toc-card';
    if (slide.classList.contains('cover')) card.classList.add('is-cover');

    // 썸네일 내용 추출
    var thumb = document.createElement('div');
    thumb.className = 'toc-thumb';

    var emoji = slide.querySelector('.emoji');
    var tag = slide.querySelector('.tag');
    var h2 = slide.querySelector('h2');
    var h1 = slide.querySelector('h1');
    var title = h2 ? h2.textContent : (h1 ? h1.textContent : '슬라이드 ' + (i + 1));

    if (emoji) {
      var me = document.createElement('div');
      me.className = 'mini-emoji';
      me.textContent = emoji.textContent;
      thumb.appendChild(me);
    }
    if (tag) {
      var mt = document.createElement('div');
      mt.className = 'mini-tag';
      mt.textContent = tag.textContent;
      thumb.appendChild(mt);
    }
    var mtitle = document.createElement('div');
    mtitle.className = 'mini-title';
    mtitle.textContent = title;
    thumb.appendChild(mtitle);

    card.appendChild(thumb);

    // 하단 번호 + 라벨
    var footer = document.createElement('div');
    footer.className = 'toc-card-footer';
    var num = document.createElement('span');
    num.className = 'num';
    num.textContent = i + 1;
    var label = document.createElement('span');
    label.className = 'label';
    label.textContent = title.length > 20 ? title.substring(0, 20) + '…' : title;
    footer.appendChild(num);
    footer.appendChild(label);
    card.appendChild(footer);

    card.addEventListener('click', function () {
      go(i);
      closeToc();
    });

    tocGrid.appendChild(card);
  });

  tocPanel.appendChild(tocGrid);
  document.body.appendChild(tocPanel);

  function openToc() {
    // 현재 슬라이드 표시
    var cards = tocGrid.querySelectorAll('.toc-card');
    cards.forEach(function (c, k) { c.classList.toggle('current', k === cur); });
    tocOverlay.classList.add('open');
    tocPanel.classList.add('open');
  }
  function closeToc() {
    tocOverlay.classList.remove('open');
    tocPanel.classList.remove('open');
  }

  tocBtn.addEventListener('click', openToc);
  tocClose.addEventListener('click', closeToc);
  tocOverlay.addEventListener('click', closeToc);

  // ESC로 닫기
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && tocPanel.classList.contains('open')) {
      closeToc();
      e.preventDefault();
    }
  });

  // 시작 슬라이드 (해시 지원)
  var start = parseInt((location.hash || '').replace('#', ''), 10);
  show(start >= 1 && start <= total ? start - 1 : 0);
})();
