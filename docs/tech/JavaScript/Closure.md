---
sidebar_position: 1
title: Closure
---

# Closure

자바스크립트의 고유의 개념이 아니다. 함수를 일급 객체로 취급하는 함수형 프로그래밍 언어에서 사용되는 중요한 특성이다.

클로저는 자바스크립트 고유의 개념이 아니므로 클로저의 정의가 ECMAScript 사양에 등장하지 않는다.

MDN에서는 클로저에 대해 다음과 같이 정의하고 있다.

> 클로저 함수는 그 **함수가 선언된 렉시컬 환경과의 조합**이다.

```jsx
const x = 1;

function outerFunc() {
  const x = 10;

  function innerFunc() {
    console.log(x); // 10
  }

  innerFunc();
}

outerFunc();
```

outerFunc함수 내부에 innerFunc가 정의되고 호출되었다. 이때 중첩 함수 innerFunc의 상위 스코프는 외부 함수 outerFunc의 x변수에 접근할 수 있다.

만약 innerFunc 함수가 outerFunc 함수의 내부에서 정의된 중첩 함수가 아니라면 innerFunc 함수를 outerFunc 함수의 내부에서 호출한다 하더라도 outerFunc 함수의 변수에 접근할 수 없다.

```jsx
const x = 1;

function outerFunc() {
  const x = 10;
  innerFunc();
}

function innerFunc() {
  console.log(x); // 1
}

outerFunc();
```

이 같은 현상이 발생하는 이유는 자바스크립트가 렉시컬 스코프를 따르는 프로그래밍 언어이기 때문이다.

## 렉시컬 스코프

**자바스크립트 엔진은 함수를 어디서 호출했는지가 아니라 함수를 어디에 정의했는지에 따라 상위 스코프를 결정한다. 이를 `렉시컬 스코프(정적 스코프)`라 한다.**

> 렉시컬 환경의 “외부 렉시컬 환경에 대한 참조"에 저장할 참조값, 즉 상위 스코프에 대한 참조는 함수 정의가 평가되는 시점에 함수가 정의된 환경(위치)에 의해 결정된다. 이것이 바로 렉시컬 스코프이다.

## 함수 객체의 내부 슬롯 [[Environment]]

함수가 정의된 환경(위치)과 호출되는 환경(위치)은 다를 수 있다. 따라서 렉시컬 스코프가 가능하려면 함수는 자신이 호출되는 환경과는 상관없이 자신이 정의된 환경, 즉 스코프(함수 정의가 위치하는 스코프가 바로 상위 스코프)를 기억해야한다. 이를 위해 **함수는 자신의 내부 슬롯 [[Environment]]에 자신이 정의된 환경, 즉 상위 스코프의 참조를 저장한다.**

## 클로저와 렉시컬 환경

```jsx
const x = 1;

// ①
function outer() {
  const x = 10;
  const inner = function () {
    console.log(x);
  }; // ②
  return inner;
}

// outer 함수를 호출하면 중첩 함수 inner를 반환한다.
// 그리고 outer 함수의 실행 컨텍스트는 실행 컨텍스트 스택에서 팝되어 제거된다.
const innerFunc = outer(); // ③
innerFunc(); // ④ 10
```

이처럼 외부 함수보다 중첩 함수가 더 오래 유지되는 경우 중첩 함수는 이미 생명 주기가 종료한 외부 함수의 변수를 참조할 수 있다. 이러한 중첩 함수를 클로저(closure)라 부른다.

> 실행컨텍스트를 생각하면 outer함수의 실행 컨텍스트는 실행 컨텍스트에서 제거되지만 outer함수의 렉시컬 환경까지 소멸하는 것은 아니다.

- 그 이유는 ?
  outer 함수의 렉시컬 환경은 inner 함수의 [[Environment]] 내부 슬롯에 의해 참조되고 있고 inner함수는 전역 변수 innerFunc에 의해 참조되고 있으므로 가비지 컬렉션의 대상이 되지 않기 때문이다. 가비지 컬렉터는 누군가 참조하고 있는 메모리 공간을 함부로 해제하지 않는다.

> 클로저는 중첩 함수가 상위 스코프의 식별자를 참조하고 있고 중첩 함수가 외부 함수보다 더 오래 유지되는 경우에 한정하는 것이 일반적이다.

## 클로저의 활용

상태를 안전하게 변경하고 유지하기 위해 사용한다. 다시 말해, 상태가 의도치 않게 변경되지 않도록 상태를 완전하게 은닉하고 특정 함수에게만 상태 변경을 허용하기 위해 사용한다.

```jsx
// 카운트 상태 변수
let num = 0;

// 카운트 상태 변경 함수
const increase = function () {
  // 카운트 상태를 1만큼 증가 시킨다.
  return ++num;
};

console.log(increase()); // 1
console.log(increase()); // 2
console.log(increase()); // 3
```

위 코드의 문제점은 카운트 상태는 전역 변수를 통해 관리되고 있기 때문에 언제든지 누구나 접근할 수 있고 변경할 수 있다!

> 안전한 방법

```jsx
// 카운트 상태 변경 함수
const increase = (function () {
  // 카운트 상태 변수
  let num = 0;

  // 클로저
  return function () {
    // 카운트 상태를 1만큼 증가 시킨다.
    return ++num;
  };
})();

console.log(increase()); // 1
console.log(increase()); // 2
console.log(increase()); // 3
```

### 왜 클로저라는걸 사용할까?

변수 값은 누군가에 의해 언제든지 변경될 수 있어 오류 발생의 근본적 원인이 될 수 있다. 외부 상태 변경이나 가변(mutable) 데이터를 피하고 불변성(immutability)을 지향하는 함수형 프로그래밍에서 부수 효과를 최대한 억제하여 오류를 피하고 프로그램의 안정성을 높이기 위해 클로저는 적즉적으로 사용된다.

```jsx
// 함수를 인수로 전달받고 함수를 반환하는 고차 함수
// 이 함수는 카운트 상태를 유지하기 위한 자유 변수 counter를 기억하는 클로저를 반환한다.
function makeCounter(aux) {
  // 카운트 상태를 유지하기 위한 자유 변수
  let counter = 0;

  // 클로저를 반환
  return function () {
    // 인수로 전달 받은 보조 함수에 상태 변경을 위임한다.
    counter = aux(counter);
    return counter;
  };
}

// 보조 함수
function increase(n) {
  return ++n;
}

// 보조 함수
function decrease(n) {
  return --n;
}

// 함수로 함수를 생성한다.
// makeCounter 함수는 보조 함수를 인수로 전달받아 함수를 반환한다
const increaser = makeCounter(increase); // ①
console.log(increaser()); // 1
console.log(increaser()); // 2

// increaser 함수와는 별개의 독립된 렉시컬 환경을 갖기 때문에 카운터 상태가 연동하지 않는다.
const decreaser = makeCounter(decrease); // ②
console.log(decreaser()); // -1
console.log(decreaser()); // -2
```

이때 주의할 점은 makeCounter 함수를 호출해 함수를 반환할 때 반환된 함수는 자신만의 독립된 렉시컬 환경을 갖는다는것이다.

> 해결법

```jsx
// 함수를 반환하는 고차 함수
// 이 함수는 카운트 상태를 유지하기 위한 자유 변수 counter를 기억하는 클로저를 반환한다.
const counter = (function () {
  // 카운트 상태를 유지하기 위한 자유 변수
  let counter = 0;

  // 함수를 인수로 전달받는 클로저를 반환
  return function (aux) {
    // 인수로 전달 받은 보조 함수에 상태 변경을 위임한다.
    counter = aux(counter);
    return counter;
  };
})();

// 보조 함수
function increase(n) {
  return ++n;
}

// 보조 함수
function decrease(n) {
  return --n;
}

// 보조 함수를 전달하여 호출
console.log(counter(increase)); // 1
console.log(counter(increase)); // 2

// 자유 변수를 공유한다.
console.log(counter(decrease)); // 1
console.log(counter(decrease)); // 0
```

## 캡슐화와 정보 은닉

캡슐화는 객체의 상태를 나타내는 프로퍼티와 프로퍼티를 참조하고 조작할 수 있는 동작인 메서드를 하나로 묶는 것을 말한다. 캡슐화는 객체의 특정 프로퍼티나 메서드를 감출 목적으로 사용하기도 하는데 이를 정보 은닉이라 한다.

정보 은닉은 외부에 공개할 필요가 없는 구현의 일부를 외부에 공개되지 않도록 감추어 적절치 못한 접근으로 부터 객체의 상태가 변경되는 것을 방지해 정보를 보호하고, 객체 간의 상호 의존성, 즉 결합도를 낮추는 효과가 있다.

> 자바스크립트는 public, private, protected 같은 접근 제한자를 제공하지 않는다. 따라서 자바스크립트 객체의 모든 프로퍼티와 메서드는 기본적으로 외부에 공개되어 있다. 즉, 객체의 모든 프로퍼티와 메서드는 기본적으로 public이다.

```jsx
const Person = (function () {
  let _age = 0; // private

  // 생성자 함수
  function Person(name, age) {
    this.name = name; // public
    _age = age;
  }

  // 프로토타입 메서드
  Person.prototype.sayHi = function () {
    console.log(`Hi! My name is ${this.name}. I am ${_age}.`);
  };

  // 생성자 함수를 반환
  return Person;
})();

const me = new Person("Lee", 20);
me.sayHi(); // Hi! My name is Lee. I am 20.
console.log(me.name); // Lee
console.log(me._age); // undefined

const you = new Person("Kim", 30);
you.sayHi(); // Hi! My name is Kim. I am 30.
console.log(you.name); // Kim
console.log(you._age); // undefined
```

만약 여러개의 person 생성자 함수가 인스턴스를 생성할 경우 \_age 변수의 상태가 유지되지 않는다는 것이다.

```jsx
const me = new Person("Lee", 20);
me.sayHi(); // Hi! My name is Lee. I am 20.

const you = new Person("Kim", 30);
you.sayHi(); // Hi! My name is Kim. I am 30.

// _age 변수 값이 변경된다!
me.sayHi(); // Hi! My name is Lee. I am 30.
```

이처럼 자바스크립트는 완벽하게 정보 은닉을 지원하지 않는다. 인스턴스 메서드를 사용한다면 자유 변수를 통해 private을 흉내 낼 수는 있지만 프로토타입 메서드를 사용하면 이마저도 불가능해진다.

> ES6의 Symbol 또는 WeakMap을 사용하여 private한 프러퍼티를 흉내 내기도 했으나 근본적인 해결책이 되지는 않는다.

다행히도 2021년 1월 현재, TC39 프로세스의 stage3에는 클래스에 private 필드를 정의할 수 있는 새로운 표준 사양이 제안되어 있다.

## 자주 발생하는 실수

아래를 클로저를 사용할 때 자주 발생할 수 있는 실수를 보여주는 예제다.

```jsx
var funcs = [];

for (var i = 0; i < 3; i++) {
  funcs[i] = function () {
    return i;
  }; // ①
}

for (var j = 0; j < funcs.length; j++) {
  console.log(funcs[j]()); // 3 3 3
}
```

i를 참조하여 봤을 때 i의 값 3이 출력된다.

```jsx
var funcs = [];

for (var i = 0; i < 3; i++) {
  funcs[i] = (function (id) {
    // ①
    return function () {
      return id;
    };
  })(i);
}

for (var j = 0; j < funcs.length; j++) {
  console.log(funcs[j]());
}
```

var를 사용하여 해결할 수 있는 방법이다. ES6의 let을 사용하면 더욱 깔끔하게 해결할 수 있다.

```jsx
const funcs = [];

for (let i = 0; i < 3; i++) {
  funcs[i] = function () {
    return i;
  };
}

for (let i = 0; i < funcs.length; i++) {
  console.log(funcs[i]()); // 0 1 2
}
```

> 고차 함수를 사용하는 방법

변수와 반복문의 사용을 억제할 수 있기 때문에 오류를 줄이고 가독성을 좋게 만든다.

```jsx
// 요소가 3개인 배열을 생성하고 배열의 인덱스를 반환하는 함수를 요소로 추가한다.
// 배열의 요소로 추가된 함수들은 모두 클로저다.
const funcs = Array.from(new Array(3), (_, i) => () => i); // (3) [ƒ, ƒ, ƒ]

// 배열의 요소로 추가된 함수 들을 순차적으로 호출한다.
funcs.forEach((f) => console.log(f())); // 0 1 2
```

## 질문

1. 클로저란 무엇이고, 왜 자바스크립트에서 중요할까?

   > 클로저를 사용하면 메모리 관점에서 어떤 문제가 생길 수 있나요?

2. 클로저를 실무에서 사용해본 경험이 있나요?

   > 구현에서 클로저가 없었다면 어떤 문제가 생겼을까요?

3. React에서 클로저로 인해 발생하는 문제를 알고 있나요?
   > stale closure를 해결하기 위한 방법에는 어떤 것들이 있나요?
