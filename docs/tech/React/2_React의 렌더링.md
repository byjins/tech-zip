---
sidebar_position: 2
title: React의 렌더링
---

## React에서 말하는 Render란?

React에서 말하는 render는 DOM을 그리는 행위가 아닙니다.

```js
function Component() {
  return <div>Hello</div>;
}
```

위의 함수가 실행되는 것은 JSX를 평가하고 새로운 React Element 객체를 만들고 Fiber 트리를 구성하는 과정입니다.

## Stack Reconciler에서 Fiber까지

React는 단순히 UI를 그리는 라이브러리가 아닙니다.
React의 핵심은 **상태 변화가 발생했을 때, 무엇을 언제 어떻게 다시 그릴 것인가**에 대한 전략입니다.

이 글에서는 React 렌더링 아키텍처의 핵심인 **Reconciler**를 중심으로,
초기의 **Stack Reconciler**가 왜 한계에 부딪혔고, 현재의 **Fiber Reconciler**가 어떤 문제를 해결했는지를 흐름대로 정리해보겠습니다.

---

## React Reconciler란?

Reconciler는 다음 역할을 담당합니다.

- 이전 Virtual DOM 트리와 새로운 Virtual DOM 트리를 비교(diff)
- 변경이 필요한 부분을 식별
- 실제 DOM에 반영할 변경 작업을 스케줄링하기 위한 정보를 생성

즉, Reconciler는 **React 렌더링의 두뇌**라고 할 수 있습니다.

사용자가 `setState`, `props 변경`, `context 변경` 등을 일으키면  
React는 곧바로 DOM을 만지는 것이 아니라, 먼저 Reconciler를 통해 **어떤 변경이 필요한지 계산**합니다.

---

## Stack Reconciler의 구조와 한계

### Stack Reconciler의 구조

초기 React는 **Stack Reconciler**를 사용했습니다.
이 방식은 JavaScript의 **Call Stack**에 의존합니다.

- 컴포넌트 트리를 재귀적으로 순회
- 한 번 렌더링이 시작되면 끝까지 실행
- 모든 작업이 동기(synchronous)

```js
function renderComponent(component) {
  const children = component.render();
  children.forEach((child) => renderComponent(child));
}
```

### Stack Reconciler의 한계

> 렌더링을 중단할 수 없음

렌더링 도중 사용자 입력이나 스크롤 이벤트가 발생해도 React는 작업을 멈추지 않습니다.

결과적으로:

- 컴포넌트 트리가 커질수록 메인 스레드를 오래 점유하게되며 UI 멈춤(jank)이 발생했습니다.

> 우선순위 개념 부재

모든 업데이트는 동일한 중요도로 처리됩니다.

- 버튼 클릭
- 백그라운드 데이터 갱신

모두 같은 중요도를 가졌다고 생각하고 작업했습니다.

> 비동기 렌더링 불가

Time slicing, Concurrent Rendering 같은 개념은 구조적으로 불가능합니다.

---

## Fiber의 등장 배경

React 팀은 근본적인 질문을 던졌습니다.

> 렌더링은 반드시 한 번에 끝나야 하는 작업일까?

대규모 UI에서는 이 가정이 UX를 망치고 있었다. 그래서 React는 렌더링 방식을 재설계하게 되었습니다.

### Fiber의 목표

1. 렌더링 작업을 작은 단위로 쪼갤 것
2. 작업을 중단하고 재개할 수 있을 것
3. 우선순위 기반으로 업데이트를 처리할 것
4. 브라우저에게 제어권을 양보할 수 있을 것

> 우선순위

```js
// 개념적 예시입니다.
// Fiber는 업데이트마다 우선순위를 부여하고, 중요한 작업(Sync Lane)을 먼저 처리합니다.
const UpdatePriority = {
  Sync: 1, // 클릭, 입력
  Transition: 2, // 화면 전환
  Normal: 3, // 일반 업데이트
  Idle: 4, // 백그라운드
};
```

---

## Fiber Node 구조

Fiber는 단순한 Virtual DOM 노드가 아닌 **작업 단위(Unit of Work)** 입니다.

각 Fiber Node는 컴포넌트 하나를 표현하며, 링크드 리스트 형태로 트리를 구성합니다.

```js
const fiberNode = {
  type,            // 컴포넌트 타입
  key,
  stateNode,       // 실제 DOM 또는 클래스 인스턴스
  child,
  sibling,
  return,          // 부모 Fiber
  pendingProps,
  memoizedProps,
  memoizedState,
  alternate,       // 이전 Fiber (더블 버퍼링)
  flags            // side effect 정보
};
```

이 구조 덕분에 React는

- 현재 작업 위치를 기억하고 언제든지 작업을 멈췄다가 다시 이어서 처리할 수 있습니다.

---

## Stack vs Fiber 비교

| 항목        | Stack Reconciler | Fiber Reconciler |
| ----------- | ---------------- | ---------------- |
| 작업 단위   | 함수 호출        | 객체(Fiber Node) |
| 렌더링 방식 | 동기             | 비동기 가능      |
| 중단 / 재개 | 불가능           | 가능             |
| 우선순위    | 없음             | 있음             |
| 대규모 UI   | 취약             | 안정적           |

---

## Render Phase / Commit Phase

Fiber는 렌더링을 두 단계로 분리

### Render Phase

**"무엇을 그릴지 계산하는 과정"**

- Fiber 트리 생성
- diff 계산
- side effect 수집
- DOM 조작을 하지 않음

> Render Phase는 중단 가능하며, 재시작할 수 있고, 여러번 실행될 수 있습니다.

### Commit Phase

**"실제로 화면에 반영하는 과정"**

- 실제 DOM 업데이트
- ref 연결
- useEffect 실행

> Commit Phase는 반드시 동기적이며, 중단이 불가능합니다.

이 분리 구조가 **Concurrent Rendering의 핵심**입니다.

---

## Concurrent Rendering (동시성 렌더링)의 기반

> React에서의 동시성은 여러 렌더링 작업을 실제로 동시에 실행하는 것이 아니라, 중요한 작업을 먼저 처리하기 위해 작업을 나눠서 번갈아 수행하는 것을 의미한다.

Fiber는 렌더링을 작은 단위로 쪼개서 처리한다.

```js
while (work && !shouldYield()) {
  work = performUnitOfWork(work);
}
```

- 일정 시간 작업 후
- 브라우저에게 제어권 반환
- 다음 프레임에서 이어서 실행

이 방식 덕분에:

- UI는 반응성을 유지
- 무거운 렌더링도 자연스럽게 처리

---

## 실무에서 우리가 체감하는 변화

### render는 언제든 중단될 수 있다

그래서 render 함수는 반드시 **순수 함수**여야 한다.

```js
// ❌ 잘못된 예
function Component() {
  doSideEffect();
  return <div />;
}
```

### dev의 StrictMode에에서 렌더가 두 번 실행되는 이유

이는 실제 사용자 환경에서 발생할 수 있는 중단/재시작 시나리오를 개발 단계에서 미리 드러내기 위함입니다.

### Suspense와 Transition

- `startTransition`
- `useDeferredValue`
- Suspense fallback

이 모든 기능은 Fiber 없이는 불가능합니다.

---

## 용어 정리

- Rendering: 새로운 UI를 계산하는 전체 과정
- Reconciliation: 이전 트리와 새로운 트리를 비교하는 과정
- Render Phase: Fiber 트리를 만들고 변경점을 수집하는 단계
- Commit Phase: 실제 DOM에 변경을 반영하는 단계

## 정리

- Stack Reconciler는 단순하지만 확장성에 한계가 있었다.
- Fiber는 렌더링을 **중단 가능한 작업**으로 재정의
- Concurrent Rendering은 Fiber 아키텍처 위에서만 가능하다.

### 주의할 점

- render 단계에서 side effect를 만들지 말아야 합니다.
- state 업데이트를 렌더링과 분리해서 사고해야 합니다.
- React가 렌더링을 여러 번 할 수 있음을 항상 전제로 코드를 작성해야 합니다.

React의 렌더링을 이해한다는 것은 **React를 사용하는 이유를 이해하는 것**과 같다.
