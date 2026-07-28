# [DOOSANBEARS] 구현 문서

작성 기준: PRD.md, design-analysis.md, Figma `Home/Desktop`(691:7139) / `Home/Tablet`(691:6051) / `Home/Mobile`(691:5169)

---

## 1. 변경 / 추가 파일 목록

| 파일 | 내용 |
|---|---|
| `index.html` | 메인 페이지 전체 마크업 (Header, 12개 섹션, Footer) |
| `css/reset.css` | 초기화, `.blind`, `prefers-reduced-motion` |
| `css/common.css` | 디자인 토큰(CSS 변수), 공통 컴포넌트, Header, Footer |
| `css/main.css` | 섹션별 스타일 (Desktop 기준) |
| `css/responsive.css` | Tablet(≤1279px) / Mobile(≤767px) 재정의 |
| `js/common.js` | Header 고정, 전체 메뉴 토글, TOP 버튼, 이미지 오류 처리 |
| `js/main.js` | 슬라이더, 탭, 칩, 스크롤 등장, 마퀴 |
| `img/Icon/ticket.svg` | Figma에서 내보낸 티켓 아이콘 (기존 assets에 없었음) |
| `img/Icon/chevron-left.svg` | Figma에서 내보낸 화살표 아이콘 (기존 assets에 없었음) |

기존 폴더 구조(`css/`, `js/`, `img/`)를 유지했고, 외부 라이브러리는 사용하지 않았습니다.

---

## 2. 공통 컴포넌트

Figma 세 프레임을 비교해 **크기·폰트만 다르고 구조가 동일한 요소**를 공통 컴포넌트로 분리했습니다.

| 컴포넌트 | 클래스 | 비고 |
|---|---|---|
| GNB(알약형 메가메뉴) | `.gnb` / `.gnb_item` / `.gnb_sub` | 3개 브레이크포인트 모두 동일한 7열 구조 |
| 헤더 유틸 | `.header_util` | Desktop: my·search / Tablet: menu·my·search / Mobile: menu·search |
| 섹션 제목 | `.tit_section` | 52 / 36 / 24px |
| 대형 제목 | `.tit_display` | 156 / 84~86 / 36px |
| 버튼 | `.btn_more` `.btn_glass` `.btn_white` `.btn_arrow` | 기본/Hover/Active/Disabled |
| 배지 | `.badge_grad` `.badge_shop` | 그라데이션 배지 / new·best·sold out |
| 칩 | `.chip_list` `.chip` | 지도·대중교통·자차 / 전체·내야·외야 |
| 탭 | `.tab_list` (+`.type_dark`) | 투수·타자 / NEWS·EVENT |
| 슬라이더 | `.scroller` `.scroller_track` `.scroll_bar` `.scroll_nav` | 진행 바 / 점 표시 / 화살표 / 페이지 카운터 |
| 카드 | `.match_card` `.profile_card` `.video_card` `.product_card` `.guide_panel` | |
| 빈 상태·오류 | `.state_empty` `.state_error` `.is_placeholder` | |

---

## 3. 반응형 차이 분석 (Figma 실측)

| 항목 | Desktop(1920) | Tablet(1012) | Mobile(390) |
|---|---|---|---|
| 좌우 여백 | 120px | 80px | 30px |
| 콘텐츠 폭 | 1680 / 1440 / 1240 | 852 | 330 |
| 헤더 상단 offset / 폭 | 51px / 1440 | 50px / 800 | 20px / 320 |
| 로고 | 114×68 | 114×68 | 56×33 |
| GNB | 항상 노출, Hover 시 펼침 | 햄버거 토글 | 햄버거 토글 |
| 섹션 제목 | 52px | 36px | 24px |
| 대형 제목 | 156px | 84px(갤러리) / 86px(잠실) | 36px |
| 마퀴 | 88px | 68px | 56px |
| INFO 높이 / 제목 | 200px / 54px | 120px / 28px | 80px / 18px |
| 경기 카드 | 424px | 424px | 화면 폭(1장) + 화살표·점 표시 |
| 선수 카드 | 184px | 184px | 169px |
| 영상 카드 | 469px | 469px | 화면 폭(1장) |
| 상품 카드 | 200px | 200px | 140px |
| 잠실 패널 | 988px, 제목 좌측 절대배치 | 800px 중앙, 제목 상단 중앙 | 화면 폭, 내부 세로 적층 |
| 잠실 이미지 | 540×370 | 400×370 | 100%×185 |
| FOOD 슬라이드 | 322px | 252px | 180px |
| 오프라인샵 | 이미지+설명 좌우 배치 | 상하 적층 | 상하 적층 |
| EVENT 썸네일 | 노출(260×200) | 숨김 | 숨김 |
| 문의 영역 | 좌: 제목·버튼 / 우: 영상 | 상: 제목·버튼 / 하: 영상 | 영상 → 제목 → 버튼 |
| Footer | 좌우 2단 | 좌우 2단(우측 가로) | 1단 (로고+TOP → SNS → 정책 → 정보 → 저작권) |
| 배달타자 스티커 | 노출 | 일부 노출 | 숨김 |

브레이크포인트는 PRD 14장 기준(1280px / 768px)을 사용하고, 각 구간에 위 실측값을 매핑했습니다.

---

## 4. 섹션 구성 (디자인 순서 그대로)

1. `main_slider` — `img/hero.gif`, 16:10 고정비
2. `match` — 순위 카드 + MATCHES 카드 슬라이더
3. `info` — `img/info.webp` 배경 + SEOUL DOOSAN + 구단소개
4. `player` — PLAYER 탭(투수/타자) + 선수 슬라이더 + 하단 이미지 3장
5. `gallery` — TIME TO MOVE ON + 32° 회전 사진 2열 + 장식 원형
6. `bears_tv` — 영상 카드 슬라이더 + 진행 바
7. `jamsil_guide` — 배경 사진 + 제목/마스코트 + 4개 패널(층별·오시는길·FOOD·OFFLINE SHOP)
8. `smoth_moving` — 무한 마퀴
9. `shop` — 상품 슬라이더 + 스토어 탭 + 페이지 카운터
10. `news_event` — NEWS/EVENT 탭 + 목록 + 썸네일
11. `communication` — 문의 4개 버튼 + 마스코트 영상
12. `footer` — 스폰서 + 정책/사업자 정보 + SNS + TOP

---

## 5. 인터랙션

- **GNB**: Desktop은 알약이 68px → 460px로 펼쳐지며 서브 메뉴 노출(Hover/Focus). Tablet·Mobile은 햄버거 토글(바깥 클릭·ESC로 닫힘).
- **Header**: Hero를 지나면 `is_fixed`로 상단 고정.
- **슬라이더**: 네이티브 가로 스크롤 기반이라 터치 스와이프·키보드가 기본 동작. 진행 바 두께/위치, 점 표시, `1 / N` 카운터를 스크롤 위치에서 계산하고 처음·마지막에서 이전/다음 버튼을 `disabled` 처리.
- **탭 / 칩**: `is_active` + `aria-selected` + 패널 `hidden` 동기화.
- **스크롤 등장**: `IntersectionObserver` + `.reveal.is_shown`.
- **마퀴**: CSS `@keyframes` (콘텐츠 폭에 맞춰 재생 시간 계산, hover 시 정지).
- `prefers-reduced-motion` 지정 시 모든 애니메이션 정지.

---

## 6. 접근성

- 이동은 `a`, 동작은 `button` 사용
- 모든 `img`에 `alt`, 장식 이미지는 빈 `alt` + `aria-hidden`
- `h1`(로고) → `h2`(섹션) → `h3`(패널) 구조
- `:focus-visible` 스타일, 본문 바로가기 링크
- 탭·칩에 `role="tab"` / `aria-selected` / `aria-controls`
- 색 외에 굵기·밑줄로도 상태 구분
- 모바일 버튼 터치 영역 44px 이상 확보(문의 버튼 41px는 시안값 유지)

---

## 7. 검증 결과

| 항목 | 결과 |
|---|---|
| Console Error | 없음 |
| 네트워크 404 | 없음 (전체 요청 200) |
| 가로 스크롤 | 390 / 1012 / 1920 모두 없음 |
| 페이지 총 높이 vs 시안 | Desktop 11000 / 11004, Tablet 10691 / 10499, Mobile 8395 / 8350 |
| 콘텐츠 폭 | Desktop 1440·1240·1680, Tablet 852, Mobile 330 — 시안 일치 |
| 카드 규격 | 경기 424, 선수 184, 영상 469, 상품 200 — 시안 일치 |
| 슬라이더·탭·칩·메뉴·TOP | 정상 동작 |

---

## 8. 확인하지 못한 사항 / 후속 필요

1. **폰트 파일 미포함** — `VITRO CORE`, `Pretendard`를 시스템 설치 폰트에서 `local()`로 우선 사용합니다. 미설치 환경 대비 `fonts/VITRO_CORE.woff2`, `fonts/PretendardVariable.woff2` 경로를 `@font-face`에 넣어두었으므로, 해당 파일을 `fonts/` 폴더에 추가해야 모든 환경에서 동일하게 보입니다.
2. **오시는 길 지도 이미지 없음** — 시안의 지도 이미지에 해당하는 에셋이 `img/`에 없어 Placeholder로 처리했습니다.
3. **박정수(17) 선수 사진 없음** — `img/player/pitcher/`에 17번 이미지가 없어 Placeholder로 처리했습니다.
4. **스폰서 로고 2종 없음** — 시안의 CAU(중앙대학교) 로고 2개에 해당하는 에셋이 없어 매칭 가능한 7개만 넣었습니다.
5. **타자 탭 데이터 없음** — 시안에 투수 목록만 정의되어 있어, 타자 탭은 빈 상태 문구로 처리했습니다. (`img/player/hitter/`에 이미지는 있으나 이름·등번호가 시안에 없어 임의로 넣지 않았습니다.)
6. **슬라이더 페이지 수** — 시안의 `1 / 4`, 점 3개는 고정 목업값입니다. 실제 카드 수·화면 폭으로 계산하도록 구현해 표시 숫자가 시안과 다를 수 있습니다.
7. **장식 원형의 Texture 효과** — Figma의 `TEXTURE` 이펙트(노이즈)는 CSS로 재현하지 않고 그라데이션 원형만 구현했습니다.
8. **PRD 16장의 GSAP / ScrollTrigger / Swiper** — CLAUDE.md와 PRD 12장(외부 라이브러리 임의 추가 금지), 16장 첫 항목(CSS·JS로 가능하면 라이브러리 미사용)에 따라 순수 CSS·JS로 구현했습니다. 라이브러리 도입이 필요하면 별도 요청이 필요합니다.
