# 🍵 나만의 중국어 AI 친구

> 단순 번역기가 아니라, **왜 그렇게 말하는지**까지 알려주는 맥락 기반 중국어 학습 웹앱

중국어 학습자의 **오류 유형 분석**과 **맥락 중심 언어 학습**을 반영한 교육용 번역 학습 프로젝트입니다.
기존 기계번역의 한계(직역 문제 · 맥락 부족 · 문화 표현 부족 · 학습 피드백 부재)를 보완하는 것을 목표로 합니다.

---

## ✨ 주요 기능

- **한국어 ↔ 중국어 번역** 방향 전환
- **상황(맥락) 선택** : 친구와 대화 · 학교 발표 · 여행 · SNS · 공식 표현
- **9개 학습 항목 결과 카드**
  1. 자연 번역
  2. 직역(어색한 표현)
  3. 병음(Pinyin)
  4. 핵심 문법 설명
  5. 학습자 오류 피드백 (한국어식 표현 탐지 · 직역 위험 설명)
  6. 상황별 표현 차이
  7. 실제 중국 회화 표현
  8. 문화적 맥락 설명
  9. HSK 난이도 표시
- **오류 분석 엔진** : 미리 작성한 정교한 분석 + 규칙 기반 한국어식 오류 탐지
- **모바일 반응형** 디자인

---

## 🛠 사용 기술

- **React 18** + **Vite**
- **JavaScript (ES Modules)**
- **CSS** (디자인 토큰 + 컴포넌트 스타일 분리)

---

## 📁 프로젝트 구조

```
chinese-ai-friend/
├─ index.html              # Vite 진입 HTML (폰트 로드)
├─ package.json            # 의존성 / 스크립트
├─ vite.config.js          # Vite 설정
├─ public/
│   └─ favicon.svg         # 파비콘
└─ src/
    ├─ components/         # 재사용 UI 컴포넌트
    │   ├─ Header.jsx          # 상단 로고 + 소개
    │   ├─ TranslatorInput.jsx # 방향 토글 + 입력창 + 제출
    │   ├─ SituationSelector.jsx # 상황 선택 버튼
    │   ├─ ResultCard.jsx      # 결과 카드 공통 래퍼
    │   ├─ ResultView.jsx      # 9개 결과 항목 조립
    │   └─ Footer.jsx          # 하단 안내
    ├─ pages/
    │   └─ HomePage.jsx    # 메인 페이지 (상태 관리)
    ├─ data/
    │   ├─ situations.js   # 상황 옵션 데이터
    │   ├─ sampleData.js   # 미리 작성한 예문 분석 데이터
    │   └─ analyzer.js     # 분석 엔진 (샘플 + 규칙 기반)
    ├─ styles/
    │   ├─ global.css      # 전역 변수/기본 스타일
    │   └─ components.css  # 컴포넌트 스타일
    ├─ App.jsx             # 루트 컴포넌트
    └─ main.jsx            # 진입점
```

---

## 🚀 로컬에서 실행하기

> Node.js 18 이상이 필요합니다. (https://nodejs.org 에서 설치)

```bash
# 1. 의존성 설치
npm install

# 2. 개발 서버 실행
npm run dev
# → 터미널에 표시되는 http://localhost:5173 주소를 브라우저에서 열기

# 3. 빌드 (배포용 파일 생성)
npm run build

# 4. 빌드 결과 미리보기
npm run preview
```

---

## 🤖 실제 생성형 AI 연동 (선택)

현재 분석은 **미리 작성한 예문 데이터 + 규칙 기반 탐지**로 동작합니다.
실제 생성형 AI를 붙이고 싶다면, API 키를 프론트엔드에 직접 두면 안 되므로
**서버리스 함수(백엔드)**를 통해 호출해야 합니다.

`src/data/analyzer.js` 하단의 `callRealAI()` 주석을 참고하세요.
Vercel 사용 시 `api/analyze.js` 서버리스 함수를 만들고 환경변수에 키를 저장하면 됩니다.

---

## ⚠️ 안내

학습 보조용 도구입니다. 중요한 표현은 선생님이나 원어민에게 한 번 더 확인하세요.
