# AI 법정 (MVP 1)

고등학교 법과 사회 수업용 **AI 법정 / 인공지능 판사** 웹앱의 MVP 1단계 구현입니다.

## 기술 스택

- Next.js (App Router)
- TypeScript
- React
- Tailwind CSS
- Gemini API (`@google/genai`)
- 브라우저 localStorage (기록/키 저장)

## 현재 구현 범위 (MVP 1 + MVP 2 + MVP 3 일부)

- 기본 레이아웃 (사이드바 + 메인 패널)
- 사이드바 검색 기록 UI
- Gemini API 키 설정창 (저장/연결 테스트/삭제)
- 사건 유형 선택 카드
- 법률 분야 선택 카드(다중 선택)
- 6단계 사건 질문 스텝퍼
- AI 사건 정리 API 호출
- localStorage 기록 저장/복원/삭제
- 국가법령정보 API 판례 검색
- 판례 목록 표시
- 판례 본문 조회
- 판례 본문 기반 AI 요약(비교 포인트)
- 책임 판단 기준 분석
- 양형/처분 방향 분석
- AI 판결문 3안 생성 및 수업 토론 질문 제안

## 실행 방법

1. 폴더 이동
   - `cd ai-judge`
2. 의존성 설치
   - `npm install`
3. 환경 변수 파일 준비
   - `.env.example`를 참고해 `.env.local` 생성
   - MVP 1에서는 `LAW_API_OC`를 실제로 사용하지 않지만, MVP 2를 위해 미리 정의합니다.
4. 개발 서버 실행
   - `npm run dev`
5. 브라우저 접속
   - [http://localhost:3000](http://localhost:3000)

## 환경 변수

`.env.example`

```env
LAW_API_OC=your_law_api_oc_here
```

주의:
- 학생 Gemini API 키는 `.env`에 넣지 않습니다.
- 앱 오른쪽 상단 설정창에서 입력하고 localStorage에 저장합니다.

## 주요 파일 구조

```text
src/
  app/
    api/
      ai/
        precedent-summary/route.ts
        summarize/route.ts   # AI 사건 정리
        test/route.ts        # Gemini 키 연결 테스트
        verdict/route.ts     # 책임/양형/판결문 3안 생성
      law/
        detail/route.ts      # 판례 본문 조회
        search/route.ts      # 판례 검색
    globals.css
    layout.tsx
    page.tsx                 # MVP 1 메인 화면
  components/
    ai-summary-panel.tsx
    case-type-selector.tsx
    legal-field-selector.tsx
    question-stepper.tsx
    settings-modal.tsx
    sidebar.tsx
  lib/
    constants.ts
    gemini.ts
    law-api.ts
    prompts.ts
    storage.ts
  types/
    case.ts
```

## 안내 문구 / 안전장치

앱 내에서 다음 내용을 표시합니다.

- 이 서비스는 교육용 참고 자료입니다.
- AI 판결은 실제 판결과 다를 수 있습니다.
- 실제 법률 문제는 전문가 상담이 필요합니다.
- Gemini API 키는 비밀번호처럼 관리해야 합니다.
- 공용 컴퓨터에서는 수업 후 API 키와 기록을 삭제해야 합니다.

## 다음 단계(MVP 4 예정)
- 판례 비교 섹션 정교화
- 교사용 출력 포맷(활동지) 추가
- 판결문 선택본 저장/공유 기능
