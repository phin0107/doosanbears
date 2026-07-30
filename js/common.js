/**
 * common.js
 * 모든 페이지 공통 기능 - Header / 전체 메뉴 / TOP 버튼 / 이미지 오류 처리
 */
(function () {
  'use strict';

  var DESKTOP_MIN = 1280;

  /* ----------------------------------------------------------------------
     1. Header : 스크롤 시 상단 고정
     ---------------------------------------------------------------------- */
  function initHeaderScroll() {
    var header = document.getElementById('header');
    var hero = document.querySelector('.main_slider');
    if (!header || !hero) return;

    var isFixed = false;

    function handleScroll() {
      var limit = hero.offsetHeight - header.offsetHeight;
      var shouldFix = window.scrollY > limit;

      if (shouldFix !== isFixed) {
        isFixed = shouldFix;
        header.classList.toggle('is_fixed', isFixed);
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
     초기화
     ---------------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    initHeaderScroll();
    initMenuToggle();
    initTopButton();
    initImageFallback();
  });
})();
