# [DOOSANBEARS] 디자인 분석표

## 확인한 자료

- 디자인 원본: [@https://www.figma.com/design/xb9bnQVypSnXPyTkpnACSv/%EC%86%A1%EC%A7%80%EC%9D%80?node-id=639-1442&m=dev]
- 확인한 화면: [홈]
- 실제 에셋 위치: [img]

## 화면 목록

| 화면 | 목적 | 주요 행동 | 필요한 상태 |
|---|---|---|---|
| [doosanbears] | [사용자가 해결할 일] | [클릭·입력·이동] | [기본·로딩·빈 상태·오류] |

## 공통 영역

### Header
- 좌측 로고
- GNB 메뉴
- 검색 버튼
- 전체 메뉴 버튼
- 스크롤 시 상단 고정(확인 필요)

### Footer
- 구단 정보
- 이용약관
- 개인정보처리방침
- Family Site
- SNS 링크

### 공통 버튼
- 기본
- Hover
- Active
- Disabled

### 공통 카드
- Match Card
- Player Card
- Video Card
- Product Card
- Event Card

## 디자인 토큰

## 디자인 토큰

### Color
- Primary :  #181928
- Secondary : #ffffff
- Accent : #7E1222 / #CF0F31
- Background : #272B3A / #ffffff

### Typography
- Title : Vitro Core
- Body : Pretendard

### Spacing
- 8px Grid 기반

### Radius
- 카드 및 버튼에 공통 Radius 사용(8px)

### Shadow
- 사용 안함

## 반응형

### Mobile
390px

- 1열 레이아웃
- GNB → 햄버거 메뉴

### Tablet
1012px

- Grid 2~3열

### Desktop
1920px

- 최대 콘텐츠 폭 유지
- 다단 레이아웃

## 인터랙션

### 메뉴
- Hover
- Active
- Mobile Menu(Open/Close)

### 버튼
- Hover
- Active
- Disabled

### 스크롤
- 섹션 등장 애니메이션
- Header 상태 변경(확인 필요)

### 애니메이션
- Hero Text
- Hero Image
- Section Fade In

## 에셋

- 로고: [img]
- 이미지: [img]
- 아이콘: [img/icon]
- 폰트: [(https://vitro.co.kr/vitro/font.html),https://cactus.tistory.com/306]

## 확인된 사실

- 메인 페이지는 단일 스크롤 구조이다.
- Hero 영역이 첫 화면을 차지한다.
- 경기 일정(Card) 섹션이 존재한다.
- Player 슬라이더가 존재한다.
- Bears TV 영상 리스트가 존재한다.
- Jamsil Guide 섹션이 존재한다.
- Shop 상품 리스트가 존재한다.
- Event 영역이 존재한다.
- Footer가 존재한다.
- 전체적으로 Navy / White / Red 컬러를 사용한다.

## 아직 확인하지 못한 내용

- 폰트 Weight
- Grid 간격
- Header 고정 여부
- Hover 애니메이션
- ScrollTrigger 적용 여부
- 실제 반응형 레이아웃
- Slider 라이브러리 사용 여부
- 데이터 연동 방식(API/JSON)

## 컴포넌트 목록

- Header
- Hero
- Match Card
- Player Card
- Section Title
- Video Card
- Guide Card
- Product Card
- Event Card
- Footer

## 섹션 순서

1. Header
2. Hero
3. Match
4. Player
5. Gallery
6. Bears TV
7. Jamsil Guide
8. Shop
9. Event
10. Inquiry
11. Footer