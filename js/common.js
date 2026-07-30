/**
 * common.js
 * 모든 페이지 공통 기능 - Header / 전체 메뉴 / TOP 버튼 / 이미지 오류 처리
 */
(function () {
  'use strict';

  var DESKTOP_MIN = 1280;

  /* ----------------------------------------------------------------------
     1. Header : 스크롤 시 상단 고정 + 방향에 따라 숨김/표시
     ---------------------------------------------------------------------- */
  function initHeaderScroll() {
    var header = document.getElementById('header');
    var hero = document.querySelector('.main_slider');
    if (!header || !hero) return;

    var isFixed = false;
    var lastScrollY = Math.max(0, window.scrollY);
    var DIRECTION_THRESHOLD = 6;

    function handleScroll() {
      var currentScrollY = Math.max(0, window.scrollY);
      var limit = hero.offsetHeight - header.offsetHeight;
      var shouldFix = currentScrollY > limit;

      if (shouldFix !== isFixed) {
        isFixed = shouldFix;
        header.classList.toggle('is_fixed', isFixed);
      }

      if (!isFixed) {
        header.classList.remove('is_hidden');
        lastScrollY = currentScrollY;
        return;
      }

      /* 전체 메뉴가 열려 있거나 스크롤이 잠긴 동안에는 헤더를 유지 */
      if (
        header.querySelector('.gnb.is_open') ||
        document.documentElement.classList.contains('is_menu_locked')
      ) {
        header.classList.remove('is_hidden');
        lastScrollY = currentScrollY;
        return;
      }

      var scrollDelta = currentScrollY - lastScrollY;
      if (Math.abs(scrollDelta) >= DIRECTION_THRESHOLD) {
        header.classList.toggle('is_hidden', scrollDelta > 0);
        lastScrollY = currentScrollY;
      }
    }

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
  }

  /* ----------------------------------------------------------------------
     2. 전체 메뉴 (Tablet / Mobile 햄버거)
     ---------------------------------------------------------------------- */
  function initMenuToggle() {
    var toggle = document.getElementById('menu_toggle');
    var gnb = document.getElementById('gnb');
    var closeBtn = document.getElementById('gnb_close');
    if (!toggle || !gnb) return;

    var label = toggle.querySelector('.blind');
    var menuItems = gnb.querySelectorAll('.gnb_item');
    var lockedScrollY = 0;
    var isScrollLocked = false;

    function isMobileMenu() {
      return window.matchMedia('(max-width: 767px)').matches;
    }

    function lockPageScroll() {
      if (isScrollLocked) return;
      lockedScrollY = window.scrollY;
      document.documentElement.classList.add('is_menu_locked');
      document.body.classList.add('is_menu_locked');
      document.body.style.position = 'fixed';
      document.body.style.top = '-' + lockedScrollY + 'px';
      document.body.style.left = '0';
      document.body.style.width = '100%';
      isScrollLocked = true;
    }

    function unlockPageScroll() {
      if (!isScrollLocked) return;
      document.documentElement.classList.remove('is_menu_locked');
      document.body.classList.remove('is_menu_locked');
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.width = '';

      /* html의 smooth scroll 때문에 복귀 위치가 애니메이션되지 않도록 일시 해제 */
      var prevBehavior = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollTo(0, lockedScrollY);
      document.documentElement.style.scrollBehavior = prevBehavior;

      isScrollLocked = false;
    }

    function setOpen(isOpen) {
      gnb.classList.toggle('is_open', isOpen);
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      if (label) label.textContent = isOpen ? '전체 메뉴 닫기' : '전체 메뉴 열기';

      /* 전체 메뉴가 열려 있는 동안 페이지 스크롤 차단 */
      if (isOpen) lockPageScroll();
      else unlockPageScroll();
    }

    function handleMenuToggle() {
      setOpen(!gnb.classList.contains('is_open'));
    }

    toggle.addEventListener('click', handleMenuToggle);

    /*
     * 데스크톱에서 hover/focus로 펼쳐진 GNB도 아래 방향 스크롤 시 닫는다.
     * 포인터가 메뉴를 벗어나거나 다시 포커스하면 다음 탐색을 허용한다.
     */
    var lastMenuScrollY = Math.max(0, window.scrollY);
    window.addEventListener('scroll', function () {
      var currentScrollY = Math.max(0, window.scrollY);
      var isScrollingDown = currentScrollY - lastMenuScrollY >= 6;

      if (isScrollingDown) {
        if (gnb.classList.contains('is_open')) setOpen(false);
        gnb.classList.add('is_scroll_closed');

        if (gnb.contains(document.activeElement)) {
          document.activeElement.blur();
        }
      }

      if (Math.abs(currentScrollY - lastMenuScrollY) >= 6) {
        lastMenuScrollY = currentScrollY;
      }
    }, { passive: true });

    gnb.addEventListener('mouseleave', function () {
      gnb.classList.remove('is_scroll_closed');
    });

    gnb.addEventListener('focusin', function () {
      gnb.classList.remove('is_scroll_closed');
    });

    function setActiveMenu(activeItem) {
      menuItems.forEach(function (menuItem) {
        var menuTitle = menuItem.querySelector('.gnb_tit');
        var isActive = menuItem === activeItem;
        menuItem.classList.toggle('is_active', isActive);
        if (menuTitle) menuTitle.classList.toggle('is_active', isActive);
      });
    }

    menuItems.forEach(function (item, index) {
      var title = item.querySelector('.gnb_tit');
      if (index === 0) setActiveMenu(item);
      if (!title) return;
      title.addEventListener('click', function (e) {
        if (!isMobileMenu()) return;
        e.preventDefault();
        setActiveMenu(item);
      });
    });

    /* 닫기 버튼 클릭 시 메뉴 닫기 */
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        setOpen(false);
        toggle.focus();
      });
    }

    /* 바깥 영역 클릭 시 닫기 */
    document.addEventListener('click', function (e) {
      if (!gnb.classList.contains('is_open')) return;
      if (gnb.contains(e.target) || toggle.contains(e.target)) return;
      setOpen(false);
    });

    /* ESC 로 닫기 */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && gnb.classList.contains('is_open')) {
        setOpen(false);
        toggle.focus();
      }
    });

    /* 데스크톱 폭으로 넓어지면 상태 초기화 */
    window.addEventListener('resize', function () {
      if (window.innerWidth >= DESKTOP_MIN) setOpen(false);
      else if (!gnb.classList.contains('is_open')) unlockPageScroll();
    });
  }

  /* ----------------------------------------------------------------------
     3. TOP 버튼
     ---------------------------------------------------------------------- */
  function initTopButton() {
    var btn = document.getElementById('btn_top');
    if (!btn) return;

    btn.addEventListener('click', function handleClick() {
      var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
  }

  /* ----------------------------------------------------------------------
     4. 이미지 로드 실패 시 Placeholder 표시
     ---------------------------------------------------------------------- */
  function initImageFallback() {
    var images = document.querySelectorAll('img');

    Array.prototype.forEach.call(images, function (img) {
      img.addEventListener('error', function handleError() {
        var box = img.parentElement;
        if (box) box.classList.add('is_placeholder');
        img.style.display = 'none';
      });
    });
  }

  /* ----------------------------------------------------------------------
     5. Footer sponsor : 끊김 없는 무한 가로 롤링
     ---------------------------------------------------------------------- */
  function initSponsorMarquee() {
    var sponsor = document.querySelector('.sponsor_wrap');
    if (!sponsor || sponsor.children.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var originals = Array.prototype.slice.call(sponsor.children);

    function appendCloneSet() {
      originals.forEach(function (item) {
        var clone = item.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');

        Array.prototype.forEach.call(clone.querySelectorAll('a, button'), function (control) {
          control.setAttribute('tabindex', '-1');
        });

        sponsor.appendChild(clone);
      });
    }

    appendCloneSet();

    var firstClone = sponsor.children[originals.length];
    var resizeTimer = null;

    function measure() {
      var firstOriginal = sponsor.firstElementChild;
      if (!firstOriginal || !firstClone) return;

      var distance = firstClone.offsetLeft - firstOriginal.offsetLeft;
      if (distance <= 0) return;

      /* 한 세트가 화면보다 짧아도 빈 구간이 생기지 않게 복제 세트를 보충 */
      while (sponsor.scrollWidth < window.innerWidth + distance) {
        appendCloneSet();
      }

      var pixelsPerSecond = 70;
      sponsor.style.setProperty('--sponsor_translate', (-distance) + 'px');
      sponsor.style.setProperty('--sponsor_duration', Math.max(18, distance / pixelsPerSecond) + 's');
      sponsor.classList.add('is_rolling');
    }

    window.addEventListener('resize', function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(measure, 150);
    });

    window.addEventListener('load', measure);
    measure();
  }

  /* ----------------------------------------------------------------------
     초기화
     ---------------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    initHeaderScroll();
    initMenuToggle();
    initTopButton();
    initImageFallback();
    initSponsorMarquee();
  });
})();
