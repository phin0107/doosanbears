/**
 * main.js
 * 메인 페이지 기능 - 슬라이더 / 탭 / 칩 / 스크롤 등장 애니메이션
 */
(function () {
  'use strict';

  /* ----------------------------------------------------------------------
     1. 가로 슬라이더 (네이티브 스크롤 + 진행 바 / 페이지 표시 / 화살표)
     ---------------------------------------------------------------------- */
  function initScroller(root) {
    var track = root.querySelector('[data-role="track"]');
    if (!track) return;

    var name = root.getAttribute('data-scroller');
    var externalNav = name ? document.querySelector('[data-scroller-nav="' + name + '"]') : null;

    /* 컨트롤은 슬라이더 안쪽 또는 지정된 외부 영역에서 찾는다 */
    function pick(selector) {
      return (externalNav && externalNav.querySelector(selector)) || root.querySelector(selector);
    }

    var thumb = root.querySelector('[data-role="thumb"]');
    var dots = pick('[data-role="dots"]');
    var nowEl = pick('[data-role="now"]');
    var totalEl = pick('[data-role="total"]');
    var prevBtn = pick('[data-role="prev"]');
    var nextBtn = pick('[data-role="next"]');

    function getPageCount() {
      if (track.clientWidth <= 0) return 1;
      return Math.max(1, Math.ceil(track.scrollWidth / track.clientWidth));
    }

    function getCurrentPage() {
      if (track.clientWidth <= 0) return 1;
      return Math.min(getPageCount(), Math.round(track.scrollLeft / track.clientWidth) + 1);
    }

    function buildDots() {
      if (!dots) return;
      var count = getPageCount();
      if (dots.children.length === count) return;

      dots.textContent = '';
      for (var i = 0; i < count; i += 1) {
        dots.appendChild(document.createElement('span'));
      }
    }

    function render() {
      var pages = getPageCount();
      var page = getCurrentPage();
      var maxScroll = track.scrollWidth - track.clientWidth;

      if (thumb) {
        var ratio = track.scrollWidth > 0 ? track.clientWidth / track.scrollWidth : 1;
        thumb.style.width = Math.min(100, ratio * 100) + '%';
        thumb.style.left = (maxScroll > 0 ? (track.scrollLeft / track.scrollWidth) * 100 : 0) + '%';
      }

      if (dots) {
        buildDots();
        Array.prototype.forEach.call(dots.children, function (dot, i) {
          dot.classList.toggle('is_current', i === page - 1);
        });
      }

      if (nowEl) nowEl.textContent = String(page);
      if (totalEl) totalEl.textContent = String(pages);

      /* 첫/마지막에서 이전·다음 버튼 비활성화 */
      if (prevBtn) prevBtn.disabled = track.scrollLeft <= 1;
      if (nextBtn) nextBtn.disabled = track.scrollLeft >= maxScroll - 1;
    }

    function getStep() {
      var first = track.firstElementChild;
      if (!first) return track.clientWidth;

      var styles = window.getComputedStyle(track);
      var gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;
      var step = first.getBoundingClientRect().width + gap;

      /* 한 화면에 한 장만 보이면 화면 단위로 이동 */
      return step > track.clientWidth ? track.clientWidth : step;
    }

    function handleSliderMove(direction) {
      track.scrollBy({ left: getStep() * direction, behavior: 'smooth' });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        handleSliderMove(-1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        handleSliderMove(1);
      });
    }

    track.addEventListener('scroll', render, { passive: true });
    window.addEventListener('resize', render);

    render();
  }

  function initScrollers() {
    var list = document.querySelectorAll('[data-scroller]');
    Array.prototype.forEach.call(list, initScroller);
  }

  /* ----------------------------------------------------------------------
     2. 탭 (선수단 투수/타자, NEWS/EVENT)
     ---------------------------------------------------------------------- */
  function initTabs() {
    var groups = document.querySelectorAll('[role="tablist"].tab_list');

    Array.prototype.forEach.call(groups, function (group) {
      var tabs = group.querySelectorAll('.tab_btn');

      function activate(target) {
        Array.prototype.forEach.call(tabs, function (tab) {
          var isCurrent = tab === target;
          tab.classList.toggle('is_active', isCurrent);
          tab.setAttribute('aria-selected', isCurrent ? 'true' : 'false');

          var panelId = tab.getAttribute('aria-controls');
          var panel = panelId ? document.getElementById(panelId) : null;
          if (panel) panel.hidden = !isCurrent;
        });

        window.dispatchEvent(new Event('resize'));
      }

      Array.prototype.forEach.call(tabs, function (tab) {
        tab.addEventListener('click', function handleClick() {
          activate(tab);
        });
      });
    });
  }

  /* ----------------------------------------------------------------------
     3. 칩 (오시는 길 / 음식점 구역)
     ---------------------------------------------------------------------- */
  function initChips() {
    var groups = document.querySelectorAll('.chip_list');

    Array.prototype.forEach.call(groups, function (group) {
      var chips = group.querySelectorAll('.chip');

      Array.prototype.forEach.call(chips, function (chip) {
        chip.addEventListener('click', function handleClick() {
          Array.prototype.forEach.call(chips, function (item) {
            var isCurrent = item === chip;
            item.classList.toggle('is_active', isCurrent);
            item.setAttribute('aria-selected', isCurrent ? 'true' : 'false');
          });
        });
      });
    });
  }

  /* ----------------------------------------------------------------------
     4. 스크롤 등장 애니메이션
     ---------------------------------------------------------------------- */
  function initReveal() {
    var targets = document.querySelectorAll('.reveal');
    if (!targets.length) return;

    var shouldAnimate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!shouldAnimate || !('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(targets, function (el) {
        el.classList.add('is_shown');
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is_shown');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    Array.prototype.forEach.call(targets, function (el) {
      observer.observe(el);
    });
  }

  /* ----------------------------------------------------------------------
     5. 마퀴 : 콘텐츠 폭에 맞춰 재생 시간 보정
     ---------------------------------------------------------------------- */
  function initMarquee() {
    var track = document.querySelector('.marquee_track');
    if (!track) return;

    function handleResize() {
      var distance = track.scrollWidth / 2;
      var speed = 120; /* px per second */
      track.style.animationDuration = Math.max(12, distance / speed) + 's';
    }

    handleResize();
    window.addEventListener('resize', handleResize);
  }

  /* ----------------------------------------------------------------------
     초기화
     ---------------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    initScrollers();
    initTabs();
    initChips();
    initReveal();
    initMarquee();
  });

  window.addEventListener('load', function () {
    window.dispatchEvent(new Event('resize'));
  });
})();
