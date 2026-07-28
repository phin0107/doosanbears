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
    if (!toggle || !gnb) return;

    var label = toggle.querySelector('.blind');

    function setOpen(isOpen) {
      gnb.classList.toggle('is_open', isOpen);
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      if (label) label.textContent = isOpen ? '전체 메뉴 닫기' : '전체 메뉴 열기';
    }

    function handleMenuToggle() {
      setOpen(!gnb.classList.contains('is_open'));
    }

    toggle.addEventListener('click', handleMenuToggle);

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
