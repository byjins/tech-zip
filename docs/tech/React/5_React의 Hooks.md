---
sidebar_position: 5
title: React의 Hooks
---

# React Hooks

그런데 막상 실무에서 보면 `useState`, `useEffect`는 쓰고 있지만  
**왜 이렇게 써야 하는지**는 애매하게 알고 넘어가는 경우가 많다.

이 글에서는 React 19 기준으로  
Hooks를 *API 목록*이 아니라 **렌더링 규칙 위에서 동작하는 도구**로 다시 정리해보려고 한다.

---

## Hooks를 이해하기 전에 꼭 받아들여야 할 전제

- 컴포넌트는 객체가 아니라 함수다.
- 렌더링은 한 번 실행되고 끝나는 게 아니라, 계속 다시 실행되는 계산이다.
- Hooks는 렌더링 과정에 끼어드는 장치다.

```js
function Counter() {
  const [count, setCount] = useState(0);
  return <button>{count}</button>;
}
```

이 함수는 한 번 만들어지고 유지되는 게 아니다.  
**렌더링이 일어날 때마다 처음부터 다시 실행된다.**

---

## useState

> 상태는 저장이 아니라 “다음 렌더링을 위한 값”

```js
const [count, setCount] = useState(0);
```

`useState`를 쓰면 흔히 이렇게 생각한다.

> “count라는 값을 메모리에 저장해두는 거구나”

하지만 실제로는 조금 다르다.

**상태 업데이트는 즉시 반영되지 않는다.**

```js
setCount(count + 1);
console.log(count); // 여전히 이전 값
```

`setCount`는 값을 바로 바꾸지 않는다.  
**다음 렌더링에서 사용할 값을 예약**할 뿐이다.

그래서 연속 업데이트에서는 함수형 업데이트가 필요하다.

```js
setCount((prev) => prev + 1);
setCount((prev) => prev + 1);
```

이 패턴은 권장사항이 아니라 **동시성 렌더링 환경에서 안전하게 동작하기 위한 필수 패턴**이다.

---

## useEffect

> 렌더링이 끝난 “뒤”에 실행되는 코드

```js
useEffect(() => {
  document.title = `count: ${count}`;
}, [count]);
```

useEffect는 렌더링을 구성하지 않는다.  
이미 그려진 결과에 **반응**할 뿐이다.

그래서 다음과 같은 코드는 항상 위험하다.

```js
useEffect(() => {
  setCount(count + 1);
}, [count]);
```

→ 렌더링 → effect → 상태 변경 → 렌더링  
무한 루프의 전형적인 형태다.

> Effect는 “상태를 만들기 위한 수단”이 아니라  
> “렌더링 결과와 외부 세계를 동기화하는 장치”다.

---

## useLayoutEffect

> 화면이 그려지기 직전에 개입해야 할 때

```js
useLayoutEffect(() => {
  const height = ref.current.offsetHeight;
  setHeight(height);
}, []);
```

useLayoutEffect는 DOM이 바뀐 직후,
**브라우저가 화면을 그리기 전에 실행된다.**

그래서:

- 레이아웃 측정
- 스크롤 위치 보정
- 깜빡임 방지

같은 경우에만 사용해야 한다.

남용하면 렌더링 전체를 막아버린다.

---

## useRef

> 렌더링과 무관한 값을 들고 있을 때

```js
const inputRef = useRef(null);
```

useRef의 핵심 특징은 이것이다.

- 값이 바뀌어도 렌더링을 트리거하지 않는다
- 렌더링 사이에서 값을 유지한다

```js
const renderCount = useRef(0);
renderCount.current += 1;
```

이 패턴은 디버깅이나 외부 라이브러리 연동에서 자주 쓰인다.

---

## useMemo

> 값을 캐싱하는 게 아니라 “계산을 생략”하는 도구

```js
const total = useMemo(() => {
  return items.reduce((sum, item) => sum + item.price, 0);
}, [items]);
```

useMemo는 값을 저장하려고 쓰는 게 아니다.

- 의존성이 바뀌지 않으면
- 계산 자체를 다시 하지 않는다

계산 비용이 크지 않다면, 쓰지 않는 게 더 낫다.

---

## useCallback

```js
const onClick = useCallback(() => {
  setCount((c) => c + 1);
}, []);
```

useCallback은 함수 재생성을 막기 위한 게 아니다.  
**참조 동일성을 유지하기 위한 도구**다.

주 용도는:

- React.memo와 함께 사용
- deps 배열에 함수가 들어가는 경우

> 함수 메모이제이션의 진짜 목적이다.

---

## React 19: useTransition

> 사용자 경험을 지키는 Hook

```js
const [isPending, startTransition] = useTransition();

startTransition(() => {
  setList(nextList);
});
```

이 업데이트는 “중요하지만 급하지 않은 작업”으로 처리된다.

- 입력은 즉시 반응
- 리스트 업데이트는 뒤에서 처리

---

## React 19: useActionState

> 서버 액션과 상태의 연결

```js
const [state, action, isPending] = useActionState(createPost, initialState);
```

이 Hook은 서버 액션을 호출하면서 생기는

- 로딩
- 에러
- 결과

를 렌더링 흐름 안으로 자연스럽게 끌어온다.

---

## Custom Hook

> 로직을 숨기는 게 아니라 드러내는 방식

```js
function useCounter() {
  const [count, setCount] = useState(0);
  const increase = () => setCount((c) => c + 1);
  return { count, increase };
}
```

Custom Hook의 목적은:

- 중복 제거
- 관심사 분리
- 의도 표현

---

## 정리

Hooks는 편의 기능이 아니다.

- 렌더링은 계산이다
- 상태는 다음 렌더링을 위한 입력이다
- Hooks는 이 규칙을 코드로 강제한다
