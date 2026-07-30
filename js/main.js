/**
 * main.js
 * 메인 페이지 기능 - 슬라이더 / 탭 / 칩 / 스크롤 등장 애니메이션
 */
(function () {
  'use strict';

  /* 태블릿 구간에서만 경기 카드가 스택 형태로 동작한다 */
  var CARD_STACK_QUERY = '(min-width: 768px) and (max-width: 1279px)';

  /* ----------------------------------------------------------------------
     1. 가로 슬라이더 (네이티브 스크롤 + 진행 바 / 페이지 표시 / 화살표)
     ---------------------------------------------------------------------- */
  function initScroller(root) {
    var track = root.querySelector('[data-role="track"]');
    if (!track) return;

    var name = root.getAttribute('data-scroller');
    var externalNav = name ? document.querySelector('[data-scroller-nav="' + name + '"]') : null;
    var stackMedia = root.hasAttribute('data-stack-tablet') ? window.matchMedia(CARD_STACK_QUERY) : null;
    var isPagerOnly = root.hasAttribute('data-pager-only');

    /* 카드 스택이 켜져 있는 동안에는 스크롤 기반 동작을 모두 멈춘다 */
    function isStacked() {
      return !!(stackMedia && stackMedia.matches);
    }

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
                if (targetCard) {
                  track.scrollTo({ left: getCardScrollLeft(targetCard), behavior: 'smooth' });
                }
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
      if (isStacked()) return;

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
      if (prevBtn) prevBtn.disabled = !isPagerOnly && track.scrollLeft <= 1;
      if (nextBtn) nextBtn.disabled = !isPagerOnly && track.scrollLeft >= maxScroll - 1;
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
      if (isStacked()) return;
      if (isPagerOnly) {
        var maxScroll = track.scrollWidth - track.clientWidth;
        var targetLeft = track.scrollLeft + getStep() * direction;
        if (direction > 0 && track.scrollLeft >= maxScroll - 1) targetLeft = 0;
        if (direction < 0 && track.scrollLeft <= 1) targetLeft = maxScroll;
        track.scrollTo({
          left: Math.max(0, Math.min(targetLeft, maxScroll)),
          behavior: 'smooth'
        });
        return;
      }
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
          if (isStacked() || hasDragged) return;
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
        if (isStacked()) return;
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

    var autoplayDelay = parseInt(root.getAttribute('data-autoplay'), 25);
    var autoplayTimer = null;

    function stopAutoplay() {
      if (autoplayTimer) window.clearTimeout(autoplayTimer);
      autoplayTimer = null;
    }

    function autoplayNext() {
      var maxScroll = track.scrollWidth - track.clientWidth;
      // if (maxScroll <= 0 || document.hidden || window.innerWidth > 767) return;

      if (track.scrollLeft >= maxScroll - 1) {
        track.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        handleSliderMove(1);
      }
    }

    function startAutoplay() {
      stopAutoplay();
      // if (!autoplayDelay || window.innerWidth > 767) return;
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
     1-1. 카드 스택 (태블릿 전용 : 카드를 겹쳐 쌓고 드래그로 넘긴다)
     ---------------------------------------------------------------------- */
  function initCardStack(root) {
    var track = root.querySelector('[data-role="track"]');
    if (!track) return;

    var cards = Array.prototype.slice.call(track.children);
    var total = cards.length;
    if (total < 2) return;

    var name = root.getAttribute('data-scroller');
    var externalNav = name ? document.querySelector('[data-scroller-nav="' + name + '"]') : null;
    var dots = (externalNav && externalNav.querySelector('[data-role="dots"]'))
      || root.querySelector('[data-role="dots"]');

    var media = window.matchMedia(CARD_STACK_QUERY);
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    var DEPTH = 3;          /* 화면에 보이는 카드 수 (맨 앞 1장 + 뒤 2장) */
    var STEP_X = 36;        /* 뒤 카드가 오른쪽으로 물러나는 거리(px) */
    var STEP_Y = 14;        /* 뒤 카드가 위로 올라오는 거리(px) */
    var STEP_SCALE = 0.07;  /* 뒤 카드 한 장당 축소 비율 */
    var STEP_FADE = 0.28;   /* 뒤 카드 한 장당 투명도 감소량 */
    var THROW = 72;         /* 카드가 넘어가는 최소 드래그 거리(px) */

    /* 겹친 카드 묶음이 한쪽으로 치우치지 않도록 왼쪽으로 당겨주는 보정값 */
    var BASE_X = -((DEPTH - 1) * STEP_X) / 2;

    var index = 0;
    var isActive = false;

    /* 뒤로 밀린 카드의 위치 - depth 값이 클수록 멀리 물러난다 */
    function stackTransform(depth) {
      return 'translate3d(' + (BASE_X + depth * STEP_X) + 'px, ' + (depth * -STEP_Y) + 'px, 0)'
        + ' scale(' + (1 - depth * STEP_SCALE) + ')';
    }

    /* dragX : 맨 앞 카드를 잡고 끈 거리 (왼쪽으로 끌면 음수) */
    function paint(dragX) {
      var width = cards[0].offsetWidth || track.clientWidth || 1;
      var progress = Math.min(1, Math.abs(dragX) / THROW);
      var isGoingPrev = dragX > 0;

      cards.forEach(function (card, cardIndex) {
        var distance = (cardIndex - index + total) % total;
        var isIncomingPrev = isGoingPrev && distance === total - 1;

        /* 카드가 반투명이라 맨 앞(또는 되돌아오는) 카드만 내용을 보여준다 */
        card.classList.toggle('is_card_front', distance === 0 || isIncomingPrev);

        if (distance === 0) {
          /* 맨 앞 카드 : 손가락을 따라 움직이며 살짝 기운다 */
          card.style.transform = 'translate3d(' + (BASE_X + dragX) + 'px, 0, 0) rotate(' + (dragX / 28) + 'deg)';
          card.style.opacity = String(1 - Math.min(0.4, Math.abs(dragX) / width));
          card.style.zIndex = String(total);
          card.style.pointerEvents = '';
          return;
        }

        if (isIncomingPrev) {
          /* 오른쪽으로 끄는 중 : 이전 카드가 왼쪽에서 되돌아온다 */
          card.style.transform = 'translate3d(' + (BASE_X - width * (1 - progress)) + 'px, 0, 0)'
            + ' rotate(' + (-10 * (1 - progress)) + 'deg)';
          card.style.opacity = String(progress);
          card.style.zIndex = String(total + 1);
          card.style.pointerEvents = 'none';
          return;
        }

        if (distance >= DEPTH) {
          /* 더 뒤에 있는 카드는 가장 깊은 자리에 숨긴다 */
          card.style.transform = stackTransform(DEPTH);
          card.style.opacity = '0';
          card.style.zIndex = '0';
          card.style.pointerEvents = 'none';
          return;
        }

        /* 뒤 카드 : 끄는 방향에 따라 앞으로 나오거나 더 물러난다 */
        var depth = Math.max(0, distance + (isGoingPrev ? progress : -progress));
        card.style.transform = stackTransform(depth);
        card.style.opacity = String(Math.max(0, 1 - depth * STEP_FADE));
        card.style.zIndex = String(total - distance);
        card.style.pointerEvents = 'none';
      });

      syncDots();
    }

    /* 카드 높이가 서로 달라도 잘리지 않도록 가장 큰 높이를 컨테이너에 준다 */
    function updateHeight() {
      var height = 0;
      cards.forEach(function (card) {
        height = Math.max(height, card.offsetHeight);
      });
      if (height > 0) track.style.height = height + 'px';
    }

    function syncDots() {
      if (!dots) return;
      Array.prototype.forEach.call(dots.children, function (dot, dotIndex) {
        var isCurrent = dotIndex === index;
        dot.classList.toggle('is_current', isCurrent);
        if (dot.tagName === 'BUTTON') dot.setAttribute('aria-current', isCurrent ? 'page' : 'false');
      });
    }

    function buildDots() {
      if (!dots || dots.children.length === total) return;

      dots.textContent = '';
      for (var i = 0; i < total; i += 1) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', String(i + 1) + '번째 경기 보기');
        dot.addEventListener('click', (function (targetIndex) {
          return function () {
            index = targetIndex;
            paint(0);
          };
        })(i));
        dots.appendChild(dot);
      }
    }

    function moveTo(direction) {
      index = (index + direction + total) % total;
      paint(0);
    }

    /* ---------- 드래그로 카드 넘기기 ---------- */
    var isDragging = false;
    var startX = 0;
    var dragX = 0;
    var hasDragged = false;

    track.addEventListener('pointerdown', function (event) {
      if (!isActive) return;
      if (event.pointerType === 'mouse' && event.button !== 0) return;

      isDragging = true;
      hasDragged = false;
      startX = event.clientX;
      dragX = 0;
      track.classList.add('is_card_dragging');
      track.setPointerCapture(event.pointerId);
    });

    track.addEventListener('pointermove', function (event) {
      if (!isDragging) return;
      dragX = event.clientX - startX;
      if (Math.abs(dragX) > 4) hasDragged = true;
      paint(dragX);
    });

    function stopDragging(event) {
      if (!isDragging) return;
      isDragging = false;
      track.classList.remove('is_card_dragging');
      if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);

      if (event.type === 'pointerup' && Math.abs(dragX) >= THROW) moveTo(dragX < 0 ? 1 : -1);
      else paint(0);
      dragX = 0;
    }

    track.addEventListener('pointerup', stopDragging);
    track.addEventListener('pointercancel', stopDragging);

    /* 드래그로 카드를 넘긴 직후의 클릭은 링크 이동으로 취급하지 않는다 */
    track.addEventListener('click', function (event) {
      if (!isActive) return;
      if (hasDragged) {
        event.preventDefault();
        event.stopPropagation();
        hasDragged = false;
        return;
      }
      if (root.hasAttribute('data-click-slide')) {
        event.preventDefault();
        moveTo(1);
      }
    }, true);

    /* ---------- 태블릿 구간에서만 켜고, 벗어나면 원래 슬라이더로 되돌린다 ---------- */
    function activate() {
      if (isActive) return;
      isActive = true;
      index = 0;
      track.scrollLeft = 0;
      track.classList.add('is_card_stack');
      if (reduceMotion.matches) track.classList.add('is_card_static');
      buildDots();
      updateHeight();
      paint(0);
    }

    function deactivate() {
      if (!isActive) return;
      isActive = false;
      track.classList.remove('is_card_stack', 'is_card_dragging', 'is_card_static');
      track.style.height = '';
      cards.forEach(function (card) {
        card.classList.remove('is_card_front');
        card.style.transform = '';
        card.style.opacity = '';
        card.style.zIndex = '';
        card.style.pointerEvents = '';
      });
      /* 스크롤러가 자기 기준으로 다시 만들도록 페이지 표시를 비운다 */
      if (dots) dots.textContent = '';
    }

    function sync() {
      if (media.matches) activate();
      else deactivate();
    }

    window.addEventListener('resize', function () {
      sync();
      if (isActive) {
        updateHeight();
        paint(0);
      }
    });

    sync();
  }

  function initCardStacks() {
    var list = document.querySelectorAll('[data-stack-tablet]');
    Array.prototype.forEach.call(list, initCardStack);
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
          var thumbnails = newsEventSection.querySelectorAll('[data-news-thumb]');
          var isNewsTab = target.textContent.trim() === 'NEWS';

          if (titSection) {
            titSection.textContent = isNewsTab ? 'NEWS' : 'event';
          }
          if (newsSide) {
            newsSide.innerHTML = isNewsTab ? '두산베어스의<br>뉴스' : '두산베어스의<br>이벤트 소식';
          }
          Array.prototype.forEach.call(thumbnails, function (thumbnail) {
            var targetType = isNewsTab ? 'news' : 'event';
            thumbnail.hidden = thumbnail.getAttribute('data-news-thumb') !== targetType;
          });
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
    if (window.innerWidth < 768) return;
    var root = document.querySelector('.player_desktop');
    if (!root) return;
    var list = root.querySelector('.desktop_player_list');
    if (!list) return;

    var rows = Array.prototype.slice.call(list.querySelectorAll('.desktop_player_row'));
    if (!rows.length) return;

    var pitcherMarkup = list.innerHTML;
    var tabs = Array.prototype.slice.call(root.querySelectorAll('[data-desktop-player-tab]'));
    var hitterPlayers = [
      ['2', '김민혁', 'KIM MINHYUK', '02_kim'],
      ['7', '박준영', 'PARK JUNYOUNG', '07_park'],
      ['8', '손주영', 'SON JUYOUNG', '08_son'],
      ['13', '이유찬', 'LEE YUCHAN', '13_lee'],
      ['17', '류현준', 'RYU HYUNJUN', '17_ryu'],
      ['23', '강승호', 'KANG SEUNGHO', '23_kang']
    ];
    var currentIndex = 0;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    function createHitterMarkup() {
      return hitterPlayers.map(function (player, index) {
        var previous = hitterPlayers[(index - 1 + hitterPlayers.length) % hitterPlayers.length];
        var next = hitterPlayers[(index + 1) % hitterPlayers.length];
        var photos = [1, 2, 3].map(function (photoIndex) {
          return '<img src="img/player/hitter/' + player[3] + '_more' + photoIndex +
            '.webp" alt="경기 중인 ' + player[1] + ' 선수">';
        }).join('');

        return '<article class="desktop_player_row" id="desktop_hitter_' + player[0] + '">' +
          '<div class="desktop_player_side">' +
          '<a class="profile_card" href="#"><span class="profile_img">' +
          '<img src="img/player/hitter/' + player[3] + '.webp" alt="' + player[1] + ' 선수">' +
          '<span class="profile_icons"><span><img src="img/Icon/heart.svg" alt=""></span>' +
          '<span><img src="img/Icon/headphones.svg" alt=""></span></span></span>' +
          '<span class="profile_tit"><span class="profile_name_group">' +
          '<span class="profile_name"><strong>' + player[1] + '</strong><span>타자</span></span>' +
          '<span class="profile_roman">' + player[2] + '</span></span>' +
          '<span class="profile_no">' + player[0] + '</span></span></a>' +
          '<nav class="desktop_player_pager" aria-label="타자 목록">' +
          '<a class="pager_arrow" href="#desktop_hitter_' + previous[0] + '" aria-label="이전 선수">‹</a>' +
          '<span>' + (index + 1) + '</span><span>/</span><span>' + hitterPlayers.length + '</span>' +
          '<a class="pager_arrow" href="#desktop_hitter_' + next[0] + '" aria-label="다음 선수">›</a>' +
          '</nav></div><div class="desktop_player_photos">' + photos + '</div></article>';
      }).join('');
    }

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

    function renderCategory(category) {
      list.innerHTML = category === 'hitter' ? createHitterMarkup() : pitcherMarkup;
      rows = Array.prototype.slice.call(list.querySelectorAll('.desktop_player_row'));
      currentIndex = 0;
      updateStack(currentIndex);
    }

    list.addEventListener('click', function (event) {
      var control = event.target.closest('.desktop_player_pager a[href^="#desktop_"]');
      if (!control) return;

      event.preventDefault();
      var target = list.querySelector(control.getAttribute('href'));
      var nextIndex = rows.indexOf(target);
      var direction = nextIndex === (currentIndex + 1) % rows.length ? 'next' : 'prev';
      if (nextIndex >= 0) moveTo(nextIndex, direction);
    });

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        renderCategory(tab.getAttribute('data-desktop-player-tab'));
      });
    });

    updateStack(currentIndex);
  }

  /* ----------------------------------------------------------------------
     초기화
     ---------------------------------------------------------------------- */
  function initMobilePlayer() {
    var root = document.querySelector('.player_mobile');
    if (!root) return;
    var players = {
      pitcher: [
        ['1', '박치국', 'PARK CHIGUK', '01_park.webp', '01_park'],
        ['4', '김동주', 'KIM DONGJU', '04_kim.webp', '04_kim'],
        ['12', '타카다 타쿠토', 'TAKADA TAKUTO', '12_takada.webp', '12_takada'],
        ['15', '최주형', 'CHOI JUHYEONG', '15_choi.webp', ''],
        ['16', '김정우', 'KIM JEONG WOO', '16_kim.webp', '16_kim'],
        ['17', '박정수', 'PARK JUNG SOO', '17_park.webp', '17_park']
      ],
      hitter: [
        ['2', '김민혁', 'KIM MINHYUK', '02_kim.webp', '02_kim'],
        ['7', '박준영', 'PARK JUNYOUNG', '07_park.webp', '07_park'],
        ['8', '손주영', 'SON JUYOUNG', '08_son.webp', '08_son'],
        ['13', '이유찬', 'LEE YUCHAN', '13_lee.webp', '13_lee'],
        ['17', '류현준', 'RYU HYUNJUN', '17_ryu.webp', '17_ryu'],
        ['23', '강승호', 'KANG SEUNGHO', '23_kang.webp', '23_kang']
      ]
    };
    var category = 'pitcher';
    var currentIndex = 0;
    var slides = root.querySelector('[data-mobile-player-slides]');
    var current = root.querySelector('[data-mobile-player-current]');
    var total = root.querySelector('[data-mobile-player-total]');
    var tabs = Array.prototype.slice.call(root.querySelectorAll('[data-mobile-player-tab]'));

    function render() {
      var item = players[category][currentIndex];
      var folder = category === 'pitcher' ? 'pitcher' : 'hitter';
      var photos = item[4]
        ? [1, 2, 3].map(function (index) {
          return '<img src="img/player/' + folder + '/' + item[4] + '_more' + index + '.webp" alt="' + item[1] + ' 선수 경기 사진">';
        }).join('')
        : '<span class="player_mobile_placeholder">이미지 준비중</span>'.repeat(3);
      slides.innerHTML = '<article class="player_mobile_slide"><a class="profile_card" href="#">' +
        '<span class="profile_img"><img src="img/player/' + folder + '/' + item[3] + '" alt="' + item[1] + ' 선수">' +
        '<span class="profile_icons"><span><img src="img/Icon/heart.svg" alt=""></span><span><img src="img/Icon/headphones.svg" alt=""></span></span></span>' +
        '<span class="profile_tit"><span class="profile_name_group"><span class="profile_name"><strong>' + item[1] + '</strong><span>' + (category === 'pitcher' ? '투수' : '타자') + '</span></span>' +
        '<span class="profile_roman">' + item[2] + '</span></span><span class="profile_no">' + item[0] + '</span></span></a>' +
        '<div class="player_mobile_photos">' + photos + '</div></article>';
      current.textContent = currentIndex + 1;
      total.textContent = players[category].length;
    }

    root.querySelector('[data-mobile-player-prev]').addEventListener('click', function () {
      currentIndex = (currentIndex - 1 + players[category].length) % players[category].length;
      render();
    });
    root.querySelector('[data-mobile-player-next]').addEventListener('click', function () {
      currentIndex = (currentIndex + 1) % players[category].length;
      render();
    });
    function activateTab(tab) {
        category = tab.getAttribute('data-mobile-player-tab');
        currentIndex = 0;
        tabs.forEach(function (item) {
          var isActive = item === tab;
          item.classList.toggle('is_active', isActive);
          item.setAttribute('aria-selected', isActive ? 'true' : 'false');
          item.setAttribute('tabindex', isActive ? '0' : '-1');
        });
        slides.setAttribute('aria-labelledby', tab.id);
        render();
    }

    tabs.forEach(function (tab, tabIndex) {
      tab.addEventListener('click', function () {
        activateTab(tab);
      });

      tab.addEventListener('keydown', function (event) {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        var direction = event.key === 'ArrowRight' ? 1 : -1;
        var nextIndex = (tabIndex + direction + tabs.length) % tabs.length;
        activateTab(tabs[nextIndex]);
        tabs[nextIndex].focus();
      });
    });
    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initScrollers();
    initTabs();
    initChips();
    initReveal();
    initGalleryFlow();
    initMarquee();
    initDesktopPlayerStack();
    initMobilePlayer();
  });

  window.addEventListener('load', function () {
    window.dispatchEvent(new Event('resize'));
  });
})();


/* 잠실 가이드 마스코트: 화면 중앙을 따라 좌우로 움직이며 내려오기 */
document.addEventListener('DOMContentLoaded', function () {
  var mascot = document.querySelector('.guide_mascot');
  var targetSection = document.querySelector('.jamsil_guide');

  if (!targetSection || !mascot) return;

  var rafId = null;
  var currentX = 0;
  var currentY = 0;
  var targetX = 0;
  var targetY = 0;
  var lastTime = 0;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function calculateMascotTarget() {
    var sectionRect = targetSection.getBoundingClientRect();
    var sectionTop = window.scrollY + sectionRect.top;
    var sectionHeight = targetSection.offsetHeight;
    var mascotStyle = window.getComputedStyle(mascot);
    var mascotTop = parseFloat(mascotStyle.top) || 0;
    var mascotLeft = mascot.offsetLeft;
    var mascotWidth = mascot.offsetWidth;
    var mascotHeight = mascot.offsetHeight;
    var bottomGap = Math.max(40, window.innerHeight * 0.08);
    var maxTravel = Math.max(
      0,
      sectionHeight - mascotTop - mascotHeight - bottomGap
    );

    /*
     * 마스코트의 중심을 화면 세로 중앙에 맞추되 섹션 밖으로는
     * 나가지 않게 제한한다. 스크롤을 올리면 같은 경로로 돌아온다.
     */
    var centeredY = window.scrollY + (window.innerHeight - mascotHeight) / 2
      - sectionTop - mascotTop;
    var translateY = Math.max(0, Math.min(maxTravel, centeredY));
    var progress = maxTravel > 0 ? translateY / maxTravel : 0;

    /*
     * 가로 경로: 가운데 → 오른쪽 → 왼쪽 → 가운데.
     * sin 곡선을 사용해 방향 전환이 부드럽고, 화면 가장자리의
     * 안전 여백 안에서만 움직이도록 이동 폭을 제한한다.
     */
    var viewportWidth = document.documentElement.clientWidth;
    var centerX = (viewportWidth - mascotWidth) / 2;
    var edgeGap = Math.max(20, viewportWidth * 0.04);
    var maxAmplitude = Math.max(
      0,
      Math.min(centerX - edgeGap, viewportWidth - edgeGap - centerX - mascotWidth)
    );
    var amplitude = Math.min(viewportWidth * 0.28, maxAmplitude);
    var pathX = Math.sin(progress * Math.PI * 2) * amplitude;
    var translateX = centerX - mascotLeft + pathX;

    targetX = translateX;
    targetY = translateY;
  }

  function renderMascotPosition(now) {
    var deltaTime = lastTime ? Math.min((now - lastTime) / 1000, 0.05) : 0;
    var ease = reduceMotion.matches ? 1 : 1 - Math.exp(-deltaTime / 0.14);
    lastTime = now;

    currentX += (targetX - currentX) * ease;
    currentY += (targetY - currentY) * ease;

    mascot.style.setProperty('--mascot_scroll_x', currentX + 'px');
    mascot.style.setProperty('--mascot_scroll_y', currentY + 'px');

    if (
      Math.abs(targetX - currentX) > 0.1 ||
      Math.abs(targetY - currentY) > 0.1
    ) {
      rafId = window.requestAnimationFrame(renderMascotPosition);
      return;
    }

    currentX = targetX;
    currentY = targetY;
    mascot.style.setProperty('--mascot_scroll_x', currentX + 'px');
    mascot.style.setProperty('--mascot_scroll_y', currentY + 'px');
    rafId = null;
    lastTime = 0;
  }

  function requestRender() {
    calculateMascotTarget();
    if (rafId !== null) return;
    rafId = window.requestAnimationFrame(renderMascotPosition);
  }

  calculateMascotTarget();
  currentX = targetX;
  currentY = targetY;
  mascot.style.setProperty('--mascot_scroll_x', currentX + 'px');
  mascot.style.setProperty('--mascot_scroll_y', currentY + 'px');
  window.addEventListener('scroll', requestRender, { passive: true });
  window.addEventListener('resize', requestRender);
  window.addEventListener('load', requestRender);
});

/* 문의 섹션이 화면에 들어오면 마스코트 영상 재생 */
document.addEventListener('DOMContentLoaded', function () {
  var section = document.querySelector('.communication');
  var video = document.querySelector('.qna_vid video');

  if (!section || !video) return;

  var isInView = false;

  function syncVideoPlayback() {
    if (isInView && !document.hidden) {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          /* 브라우저가 자동 재생을 차단하면 조용히 정지 상태를 유지 */
        });
      }
      return;
    }

    video.pause();
    video.currentTime = 0;
  }

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        isInView = entry.isIntersecting && entry.intersectionRatio >= 0.35;
      });
      syncVideoPlayback();
    }, {
      threshold: [0, 0.35]
    });

    observer.observe(section);
  } else {
    isInView = true;
    syncVideoPlayback();
  }

  document.addEventListener('visibilitychange', syncVideoPlayback);
});
