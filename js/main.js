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
      var fixedPageCount = parseInt(root.getAttribute('data-pager-count'), 10);
      if (fixedPageCount > 0) return fixedPageCount;
      if (root.hasAttribute('data-page-by-card')) return Math.max(1, track.children.length);
      var maxScroll = track.scrollWidth - track.clientWidth;
      return Math.max(1, Math.ceil(maxScroll / track.clientWidth) + 1);
    }

    function getCurrentPage() {
      if (track.clientWidth <= 0) return 1;
      var fixedPageCount = parseInt(root.getAttribute('data-pager-count'), 10);
      if (fixedPageCount > 1) {
        var fixedMaxScroll = track.scrollWidth - track.clientWidth;
        if (fixedMaxScroll <= 0) return 1;
        return Math.min(fixedPageCount, Math.round(track.scrollLeft / fixedMaxScroll * (fixedPageCount - 1)) + 1);
      }
      if (root.hasAttribute('data-page-by-card')) {
        var closestIndex = 0;
        var closestDistance = Infinity;
        Array.prototype.forEach.call(track.children, function (item, index) {
          var distance = Math.abs(getCardScrollLeft(item) - track.scrollLeft);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        });
        return closestIndex + 1;
      }
      return Math.min(getPageCount(), Math.round(track.scrollLeft / track.clientWidth) + 1);
    }

    function getCardScrollLeft(card) {
      var maxScroll = track.scrollWidth - track.clientWidth;
      var centeredLeft = card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2;
      return Math.max(0, Math.min(centeredLeft, maxScroll));
    }

    function buildDots() {
      if (!dots) return;
      var count = getPageCount();
      if (dots.children.length === count) return;

      dots.textContent = '';
      for (var i = 0; i < count; i += 1) {
        var dot = document.createElement(root.hasAttribute('data-pager') ? 'button' : 'span');
        if (dot.tagName === 'BUTTON') {
          dot.type = 'button';
          dot.setAttribute('aria-label', String(i + 1) + '번째 페이지 보기');
          dot.addEventListener('click', (function (pageIndex) {
            return function () {
              var fixedPageCount = parseInt(root.getAttribute('data-pager-count'), 10);
              if (fixedPageCount > 1) {
                var fixedMaxScroll = track.scrollWidth - track.clientWidth;
                track.scrollTo({ left: fixedMaxScroll * pageIndex / (fixedPageCount - 1), behavior: 'smooth' });
                return;
              }
              if (root.hasAttribute('data-page-by-card')) {
                var targetCard = track.children[pageIndex];
                if (targetCard) track.scrollTo({ left: getCardScrollLeft(targetCard), behavior: 'smooth' });
                return;
              }
              var maxScroll = track.scrollWidth - track.clientWidth;
              track.scrollTo({ left: Math.min(track.clientWidth * pageIndex, maxScroll), behavior: 'smooth' });
            };
          })(i));
        }
        dots.appendChild(dot);
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
          var isCurrent = i === page - 1;
          dot.classList.toggle('is_current', isCurrent);
          if (dot.tagName === 'BUTTON') dot.setAttribute('aria-current', isCurrent ? 'page' : 'false');
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

    if (root.hasAttribute('data-click-slide')) {
      Array.prototype.forEach.call(track.querySelectorAll('.match_list > li'), function (card) {
        card.addEventListener('click', function (event) {
          if (hasDragged) return;
          event.preventDefault();
          event.stopPropagation();
          handleSliderMove(1);
        });
      });
    }

    track.addEventListener('scroll', render, { passive: true });
    window.addEventListener('resize', render);

    if (root.hasAttribute('data-drag')) {
      var isDragging = false;
      var startX = 0;
      var startScrollLeft = 0;
      var hasDragged = false;
      var dragDistance = 0;

      track.addEventListener('pointerdown', function (event) {
        if (event.pointerType === 'mouse' && event.button !== 0) return;
        isDragging = true;
        hasDragged = false;
        startX = event.clientX;
        startScrollLeft = track.scrollLeft;
        dragDistance = 0;
        track.classList.add('is_dragging');
        track.setPointerCapture(event.pointerId);
      });

      track.addEventListener('pointermove', function (event) {
        if (!isDragging) return;
        var distance = event.clientX - startX;
        dragDistance = distance;
        if (Math.abs(distance) > 4) hasDragged = true;
        track.scrollLeft = startScrollLeft - distance;
      });

      function stopDragging(event) {
        if (!isDragging) return;
        isDragging = false;
        track.classList.remove('is_dragging');
        if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);

        if (event.type === 'pointerup' && Math.abs(dragDistance) > 36) {
          var direction = dragDistance < 0 ? 1 : -1;
          track.scrollTo({ left: startScrollLeft + getStep() * direction, behavior: 'smooth' });
        }
      }

      track.addEventListener('pointerup', stopDragging);
      track.addEventListener('pointercancel', stopDragging);
      track.addEventListener('click', function (event) {
        if (!hasDragged) return;
        event.preventDefault();
        hasDragged = false;
      }, true);
    }

    var autoplayDelay = parseInt(root.getAttribute('data-autoplay'), 10);
    var autoplayTimer = null;

    function stopAutoplay() {
      if (autoplayTimer) window.clearTimeout(autoplayTimer);
      autoplayTimer = null;
    }

    function autoplayNext() {
      var maxScroll = track.scrollWidth - track.clientWidth;
      if (maxScroll <= 0 || document.hidden || window.innerWidth > 767) return;

      if (track.scrollLeft >= maxScroll - 1) {
        track.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        handleSliderMove(1);
      }
    }

    function startAutoplay() {
      stopAutoplay();
      if (!autoplayDelay || window.innerWidth > 767) return;
      autoplayTimer = window.setTimeout(function runAutoplay() {
        autoplayNext();
        autoplayTimer = window.setTimeout(runAutoplay, autoplayDelay);
      }, autoplayDelay);
    }

    if (autoplayDelay) {
      track.addEventListener('pointerdown', stopAutoplay);
      track.addEventListener('pointerup', startAutoplay);
      track.addEventListener('pointercancel', startAutoplay);
      track.addEventListener('click', startAutoplay);
      window.addEventListener('resize', startAutoplay);
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) stopAutoplay();
        else startAutoplay();
      });
      startAutoplay();
    }

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
    console.log('Found tab groups:', groups.length);

    Array.prototype.forEach.call(groups, function (group) {
      var tabs = group.querySelectorAll('.tab_btn');
      var newsEventSection = group.closest('.news_event');

      console.log('Processing tab group, is news_event:', !!newsEventSection);

      function activate(target) {
        Array.prototype.forEach.call(tabs, function (tab) {
          var isCurrent = tab === target;
          tab.classList.toggle('is_active', isCurrent);
          tab.setAttribute('aria-selected', isCurrent ? 'true' : 'false');

          var panelId = tab.getAttribute('aria-controls');
          var panel = panelId ? document.getElementById(panelId) : null;
          if (panel) panel.hidden = !isCurrent;
        });

        /* news_event 섹션의 탭 변경 시 텍스트 업데이트 */
        if (newsEventSection) {
          var titSection = newsEventSection.querySelector('.tit_section');
          var newsSide = newsEventSection.querySelector('.news_side p');
          var isNewsTab = target.textContent.trim() === 'NEWS';

          if (titSection) {
            titSection.textContent = isNewsTab ? 'NEWS' : 'event';
          }
          if (newsSide) {
            newsSide.innerHTML = isNewsTab ? '두산베어스의<br>뉴스' : '두산베어스의<br>이벤트 소식';
          }
        }

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
     5. 갤러리 사진 무한 흐름
     - 1번 열은 위로, 2번 열은 아래로 천천히 계속 이동
     - 마우스를 올리면 속도가 0으로 서서히 줄어들고, 벗어나면 서서히 회복
     ---------------------------------------------------------------------- */
  function initGalleryFlow() {
    var wrap = document.querySelector('.gallery_photos');
    if (!wrap) return;

    var cols = wrap.querySelectorAll('.photo_col');
    if (cols.length < 2) return;

    var shouldAnimate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!shouldAnimate) return;

    var SPEED = 52;      /* 초당 이동 픽셀 */
    var EASE_TAU = 0.25; /* 감속·가속 시간 상수(초) */

    /* 끊김 없이 순환하도록 원본 한 벌을 복제 */
    Array.prototype.forEach.call(cols, function (col) {
      Array.prototype.slice.call(col.children).forEach(function (node) {
        var clone = node.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        col.appendChild(clone);
      });
    });

    var items = Array.prototype.map.call(cols, function (col, index) {
      return { el: col, dir: index === 0 ? -1 : 1, loop: 0, pos: 0 };
    });

    /* 복제 후 기준: 전체높이 = 2*loop - gap 이므로 loop = (전체높이 + gap) / 2 */
    function measure() {
      items.forEach(function (item) {
        var gap = parseFloat(window.getComputedStyle(item.el).rowGap) || 0;
        item.loop = (item.el.offsetHeight + gap) / 2;
        if (item.loop > 0) item.pos = item.pos % item.loop;
      });
    }

    var speed = 1;
    var target = 1;
    var last = 0;
    var rafId = null;

    function draw() {
      items.forEach(function (item) {
        if (item.loop <= 0) return;
        var y = item.dir < 0 ? -item.pos : item.pos - item.loop;
        item.el.style.transform = 'translateY(' + y + 'px)';
      });
    }

    function handleFrame(now) {
      var dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;

      /* 프레임 간격과 무관하게 일정한 감속 곡선 */
      speed += (target - speed) * (1 - Math.exp(-dt / EASE_TAU));

      items.forEach(function (item) {
        if (item.loop <= 0) return;
        item.pos = (item.pos + SPEED * speed * dt) % item.loop;
      });

      draw();
      rafId = window.requestAnimationFrame(handleFrame);
    }

    function start() {
      if (rafId !== null) return;
      last = 0;
      rafId = window.requestAnimationFrame(handleFrame);
    }

    function stop() {
      if (rafId === null) return;
      window.cancelAnimationFrame(rafId);
      rafId = null;
    }

    wrap.addEventListener('mouseenter', function handleMouseEnter() {
      target = 0;
    });

    wrap.addEventListener('mouseleave', function handleMouseLeave() {
      target = 1;
    });

    var resizeTimer = null;
    window.addEventListener('resize', function handleResize() {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () {
        measure();
        draw();
      }, 150);
    });

    /* 화면 밖이거나 탭이 비활성일 때는 정지해 불필요한 연산을 줄인다 */
    var inView = false;
    var section = document.querySelector('.gallery');

    function sync() {
      if (inView && !document.hidden) start();
      else stop();
    }

    if (section && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          inView = entry.isIntersecting;
        });
        sync();
      }, { rootMargin: '200px 0px' }).observe(section);
    } else {
      inView = true;
      sync();
    }

    document.addEventListener('visibilitychange', sync);

    wrap.classList.add('is_flowing');
    measure();
    draw();
  }

  /* ----------------------------------------------------------------------
     6. 마퀴 : 콘텐츠 폭에 맞춰 재생 시간 보정
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
     7. Desktop PLAYER: stacked-card pager
     ---------------------------------------------------------------------- */
  function initDesktopPlayerStack() {
    if (window.innerWidth < 1280) return;
    var list = document.querySelector('.desktop_player_list');
    if (!list) return;

    var rows = Array.prototype.slice.call(list.querySelectorAll('.desktop_player_row'));
    if (!rows.length) return;

    var currentIndex = 0;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    function updateStack(index) {
      rows.forEach(function (row, rowIndex) {
        row.classList.remove('is_current', 'is_stack', 'is_stack_far');
        var distance = (rowIndex - index + rows.length) % rows.length;

        if (rowIndex === index) row.classList.add('is_current');
        else if (distance === 1) row.classList.add('is_stack');
        else if (distance === 2) row.classList.add('is_stack_far');
      });
    }

    function moveTo(nextIndex, direction) {
      if (nextIndex === currentIndex) return;

      var previous = rows[currentIndex];
      previous.classList.add(direction === 'next' ? 'is_exiting_next' : 'is_exiting_prev');

      currentIndex = nextIndex;
      updateStack(currentIndex);

      window.setTimeout(function () {
        previous.classList.remove('is_exiting_next', 'is_exiting_prev');
      }, reduceMotion.matches ? 0 : 650);
    }

    list.addEventListener('click', function (event) {
      var control = event.target.closest('.desktop_player_pager a[href^="#desktop_player_"]');
      if (!control) return;

      event.preventDefault();
      var target = document.querySelector(control.getAttribute('href'));
      var nextIndex = rows.indexOf(target);
      var direction = control.getAttribute('aria-label') === '다음 선수' ? 'next' : 'prev';
      if (nextIndex >= 0) moveTo(nextIndex, direction);
    });

    updateStack(currentIndex);
  }

  /* ----------------------------------------------------------------------
     초기화
     ---------------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    initScrollers();
    initTabs();
    initChips();
    initReveal();
    initGalleryFlow();
    initMarquee();
    initDesktopPlayerStack();
  });

  window.addEventListener('load', function () {
    window.dispatchEvent(new Event('resize'));
  });
})();


/* 마스코트 애니메이션 스크롤 트리거 */
document.addEventListener('DOMContentLoaded', () => {
  const mascot = document.querySelector('.guide_mascot');
  const targetSection = document.querySelector('.jamsil_guide');

  if (!targetSection || !mascot) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        mascot.classList.add('is_animated');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.2
  });

  observer.observe(targetSection);
});
