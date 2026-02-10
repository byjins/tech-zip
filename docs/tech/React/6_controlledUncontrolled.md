---
sidebar_position: 6
title: Controlled vs Uncontrolled
---

# Controlled vs Uncontrolled

React에서 폼(input, textarea, select 등)을 다루다 보면 반드시 마주치는 개념이 있다.  
바로 **Controlled Component**와 **Uncontrolled Component**다.

이 둘의 차이는 단순히 “state를 쓰느냐 안 쓰느냐”가 아니라,  
**누가 진짜 데이터의 주인(source of truth)이냐**에 대한 이야기다.

---

## 핵심 한 줄 요약

- **Controlled**: 값의 주인이 React(state)
- **Uncontrolled**: 값의 주인이 DOM

---

## Controlled Component란?

Controlled Component는 **폼의 값이 React state에 의해 완전히 제어되는 컴포넌트**다.

### 기본 예제

```javascript
function ControlledInput() {
  const [value, setValue] = React.useState("");

  return <input value={value} onChange={(e) => setValue(e.target.value)} />;
}
```

### 여기서 중요한 포인트

- input의 value는 항상 `state`에서 온다
- 사용자의 입력 → `onChange` → `setState`
- **state가 바뀌어야 화면이 바뀐다**

즉, 이 input은 React의 통제 아래 있다.

---

## Controlled의 렌더링 흐름

1. 사용자가 키 입력
2. onChange 이벤트 발생
3. setState 호출
4. 컴포넌트 리렌더링
5. 새로운 value가 input에 반영

> 입력 하나하나가 렌더링 트리거가 된다

---

## Controlled Component의 장점

### 1. 단일 진실 공급원 (Single Source of Truth)

- 입력 값이 항상 state에 있음
- 서버 전송, 검증, 조건부 렌더링이 쉬움

```javascript
const isValid = value.length > 3;
```

### 2. 즉각적인 검증과 가공

```javascript
onChange={(e) => {
  const next = e.target.value.replace(/[^0-9]/g, '');
  setValue(next);
}}
```

### 3. React 생태계와의 궁합

- React Hook Form
- validation 로직
- 상태 기반 UI

---

## Controlled Component의 단점

### 1. 잦은 렌더링

- 입력할 때마다 setState
- 대량 입력 / 복잡한 컴포넌트에선 비용 발생

> 물론 대부분의 경우 문제 안 됨  
> 문제 되는 건 **설계가 잘못됐을 때**

### 2. 코드가 장황해질 수 있음

```javascript
value = { value };
onChange = { handleChange };
```

---

## Uncontrolled Component란?

Uncontrolled Component는 **폼의 값을 React가 직접 관리하지 않는 방식**이다.  
값은 DOM 내부에 있고, 필요할 때만 꺼내 쓴다.

### 기본 예제

```javascript
function UncontrolledInput() {
  const inputRef = React.useRef(null);

  const handleSubmit = () => {
    alert(inputRef.current.value);
  };

  return (
    <>
      <input ref={inputRef} />
      <button onClick={handleSubmit}>확인</button>
    </>
  );
}
```

---

## Uncontrolled의 특징

- value를 React state로 관리하지 않음
- DOM이 상태를 가지고 있음
- React는 **참조(ref)**만 알고 있음

> 말 그대로 React의 통제 밖에 있는 input

---

## Uncontrolled Component의 장점

### 1. 렌더링 최소화

- 입력 중에는 리렌더링 없음
- 대량 입력, 성능 민감한 경우 유리

### 2. 기존 HTML 패턴과 유사

- non-React 라이브러리 연동
- 레거시 코드와의 결합

---

## Uncontrolled Component의 단점

### 1. 상태 추적이 어려움

- 값이 언제 바뀌는지 React는 모름
- 검증, 조건부 UI 구현이 까다로움

### 2. 선언적이지 않음

```javascript
inputRef.current.value;
```

→ 명령형 코드 증가

---

## Controlled vs Uncontrolled 비교

| 구분      | Controlled    | Uncontrolled |
| --------- | ------------- | ------------ |
| 값의 주인 | React state   | DOM          |
| 렌더링    | 입력마다 발생 | 거의 없음    |
| 검증      | 쉬움          | 어려움       |
| 선언성    | 높음          | 낮음         |

---

## 실무에서는 어떤 걸 써야 할까?

### 기본 원칙

> **폼 데이터가 비즈니스 로직에 영향을 준다면 Controlled**

예:

- 로그인
- 회원가입
- 검색 필터
- 설정 화면

### Uncontrolled가 더 나은 경우

- 단순 입력
- 한번에 제출
- 성능이 매우 중요한 경우
- 외부 라이브러리와의 통합

---

## 혼합 패턴 (실무에서 자주 등장)

```javascript
const inputRef = useRef(null);
const [submittedValue, setSubmittedValue] = useState(null);

const handleSubmit = () => {
  setSubmittedValue(inputRef.current.value);
};
```

> 입력 중엔 uncontrolled  
> 제출 시점에만 controlled 영역으로 편입

---

## React 관점에서의 정리

- React는 여전히 **Controlled를 기본 철학**으로 둔다
- Concurrent Rendering 환경에서는
  - 예측 가능한 상태 흐름
  - 선언적인 UI
    가 더 중요해진다

> 그래서 **의도가 있는 경우가 아니라면 Controlled가 기본 선택**

---

## 정리

- Controlled vs Uncontrolled는 성능 문제가 아니라 **설계 문제**
- “누가 상태를 소유하는가”를 먼저 생각하자
- 대부분의 비즈니스 폼은 Controlled가 정답
- Uncontrolled는 도구이지, 기본값은 아니다
