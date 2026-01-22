---
sidebar_position: 3
title: Promise
---

## 프로미스란?

자바스크립트는 비동기 처리를 위한 하나의 패턴으로 콜백 함수를 사용한다. 하지만 전통적인 콜백 패턴은 콜백 헬로 인해 가독성이 나쁘고 비동기 처리 중 발생한 에러의 처리가 곤란하며 여러 개의 비동기 처리를 한번에 처리하는 데도 한계가 있다.

ES6에서는 비동기 처리를 위한 또 다른 패턴으로 프로미스(Promise)를 도입했다. 프로미스는 전통적인 콜백 패턴이 가진 단점을 보완하며 비동기 처리 시점을 명확하게 표현할 수 있다는 장점이 있다.

## **콜백 패턴의 단점**

### 콜백 헬

먼저 동기식 처리 모델과 비동기식 처리 모델에 대해 간단히 살펴보자.

동기식 처리 모델(Synchronous processing model)은 직렬적으로 태스크(task)를 수행한다. 

즉, 태스크는 순차적으로 실행되며 어떤 작업이 수행 중이면 다음 태스크는 대기하게 된다. 

예를 들어 서버에서 데이터를 가져와서 화면에 표시하는 태스크를 수행할 때, 서버에 데이터를 요청하고 데이터가 응답될 때까지 이후의 태스크들은 `블로킹`된다.

![](/img/js/PromiseSync.png)

비동기식 처리 모델(Asynchronous processing model 또는 Non-Blocking processing model)은 병렬적으로 태스크를 수행한다. 즉, 태스크가 종료되지 않은 상태라 하더라도 대기하지 않고 즉시 다음 태스크를 실행한다. 

예를 들어 서버에서 데이터를 가져와서 화면에 표시하는 태스크를 수행할 때, 서버에 데이터를 요청한 이후 서버로부터 데이터가 응답될 때까지 대기하지 않고(Non-Blocking) 즉시 다음 태스크를 수행한다. 이후 서버로부터 데이터가 응답되면 이벤트가 발생하고 이벤트 핸들러가 데이터를 가지고 수행할 태스크를 계속해 수행한다.

`자바스크립트의 대부분의 DOM 이벤트와 Timer 함수(setTimeout, setInterval), Ajax 요청은 비동기식 처리 모델로 동작한다.`

![](/img/js/PromiseAsync.png)

자바스크립트에서 빈번하게 사용되는 [비동기식 처리 모델](https://poiemaweb.com/js-async)은 요청을 병렬로 처리하여 다른 요청이 블로킹(blocking, 작업 중단)되지 않는 장점이 있다.

```jsx
step1(function(value1) {
  step2(value1, function(value2) {
    step3(value2, function(value3) {
      step4(value3, function(value4) {
        step5(value4, function(value5) {
            // value5를 사용하는 처리
        });
      });
    });
  });
});
```

콜백 헬이 발생하는 이유에 대해 살펴보자. 비동기 처리 모델은 실행 완료를 기다리지 않고 즉시 다음 태스크를 실행한다. 

따라서 비동기 함수(비동기를 처리하는 함수) 내에서 처리 결과를 반환(또는 전역 변수에의 할당)하면 기대한 대로 동작하지 않는다. **다음 코드를 살펴보자.**

```jsx
<!DOCTYPE html>
<html>
<body>
  <script>
    // 비동기 함수
    function get(url) {
      // XMLHttpRequest 객체 생성
      const xhr = new XMLHttpRequest();

      // 서버 응답 시 호출될 이벤트 핸들러
      xhr.onreadystatechange = function () {
        // 서버 응답 완료가 아니면 무시
        if (xhr.readyState !== XMLHttpRequest.DONE) return;

        if (xhr.status === 200) { // 정상 응답
          console.log(xhr.response);
          // 비동기 함수의 결과에 대한 처리는 반환할 수 없다.
          return xhr.response; // ①
        } else { // 비정상 응답
          console.log('Error: ' + xhr.status);
        }
      };

      // 비동기 방식으로 Request 오픈
      xhr.open('GET', url);
      // Request 전송
      xhr.send();
    }

    // 비동기 함수 내의 readystatechange 이벤트 핸들러에서 처리 결과를 반환(①)하면 순서가 보장되지 않는다.
    const res = get('http://jsonplaceholder.typicode.com/posts/1');
    console.log(res); // ② undefined
  </script>
</body>
</html>
```

만일 비동기 함수의 처리 결과를 가지고 다른 비동기 함수를 호출해야 하는 경우, 함수의 호출이 중첩(nesting)이 되어 복잡도가 높아지는 현상이 발생하는데 이를 **Callback Hell**이라 한다.

> **Callback Hell은 코드의 가독성을 나쁘게 하고 복잡도를 증가시켜 실수를 유발하는 원인이 되며 에러 처리가 곤란하다.**

## 에러 처리의 한계

```jsx
try {
  setTimeout(() => { throw new Error('Error!'); }, 1000);
} catch (e) {
  console.log('에러를 캐치하지 못한다..');
  console.log(e);
}
```

try 블록 내에서 setTimeout 함수가 실행되면 1초 후에 콜백 함수가 실행되고 이 콜백 함수는 예외를 발생시킨다. 하지만 이 예외는 catch 블록에서 캐치되지 않는다. 그 이유에 대해 알아보자.

**비동기 처리 함수**의 **콜백 함수**는 해당 **이벤트(timer 함수의 tick 이벤트, XMLHttpRequest의readystatechange 이벤트 등)가 발생**하면 `태스트 큐(Task queue)로 이동한 후 호출 스택이 비어졌을 때`, `호출 스택으로 이동되어 실행된다.` 

setTimeout 함수는 비동기 함수이므로 콜백 함수가 실행될 때까지 기다리지 않고 즉시 종료되어 호출 스택에서 제거된다. 

이후 tick 이벤트가 발생하면 setTimeout 함수의 콜백 함수는 태스트 큐로 이동한 후 호출 스택이 비어졌을 때 호출 스택으로 이동되어 실행된다. 이때 setTimeout 함수는 이미 호출 스택에서 제거된 상태이다. 이것은 setTimeout 함수의 콜백 함수를 호출한 것은 setTimeout 함수가 아니다라는 것을 의미한다. setTimeout 함수의 콜백 함수의 호출자(caller)가 setTimeout 함수라면 호출 스택에 setTimeout 함수가 존재해야 하기 때문이다.

`예외(exception)는 호출자(caller) 방향으로 전파된다.` 하지만 위에서 살펴본 바와 같이 setTimeout 함수의 콜백 함수를 호출한 것은 setTimeout 함수가 아니다. 따라서 setTimeout 함수의 콜백 함수 내에서 발생시킨 에러는 catch 블록에서 캐치되지 않아 프로세스는 종료된다.

이러한 문제를 극복하기 위해 [**`Promise`**](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Promise)가 제안되었다. Promise는 ES6에 정식 채택되어 **IE를 제외한** 대부분의 브라우저가 지원하고 있다.

## 프로미스의 생성

프로미스는 Promise 생성자 함수를 통해 인스턴스화한다. 

Promise 생성자 함수는 비동기 작업을 수행할 콜백 함수를 인자로 전달받는데 이 콜백 함수는 `resolve`와 `reject` 함수를 인자로 전달받는다.

```jsx
// Promise 객체의 생성
const promise = new Promise((resolve, reject) => {
  // 비동기 작업을 수행한다.

  if (/* 비동기 작업 수행 성공 */) {
    resolve('result');
  }
  else { /* 비동기 작업 수행 실패 */
    reject('failure reason');
  }
});
```

> **Promise는 비동기 처리가 성공(fulfilled)하였는지 또는 실패(rejected)하였는지 등의 상태(state) 정보를 갖는다.**
> 

| 상태 | 의미 | 구현 |
| --- | --- | --- |
| **pending** | 비동기 처리가 아직 수행되지 않은 상태 | resolve 또는 reject 함수가 아직 호출되지 않은 상태 |
| **fulfilled** | 비동기 처리가 수행된 상태 (성공) | resolve 함수가 호출된 상태 |
| **rejected** | 비동기 처리가 수행된 상태 (실패) | reject 함수가 호출된 상태 |
| **settled** | 비동기 처리가 수행된 상태 (성공 또는 실패) | resolve 또는 reject 함수가 호출된 상태 |

> Promise 생성자 함수가 인자로 전달받은 콜백 함수는 내부에서 비동기 처리 작업을 수행한다.
> 

이때 비동기 처리가 `성공`하면 콜백 함수의 인자로 전달받은 resolve 함수를 호출한다. 

이때 프로미스는 ‘`fulfilled`’ 상태가 된다. 

비동기 처리가 `실패`하면 reject 함수를 호출한다. 

이때 프로미스는 ‘`rejected`’ 상태가 된다. 

> Promise를 사용하여 비동기 함수를 정의해보자.
> 

```jsx
const promiseAjax = (method, url, payload) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.send(JSON.stringify(payload));

    xhr.onreadystatechange = function () {
      // 서버 응답 완료가 아니면 무시
      if (xhr.readyState !== XMLHttpRequest.DONE) return;

      if (xhr.status >= 200 && xhr.status < 400) {
        // resolve 메소드를 호출하면서 처리 결과를 전달
        resolve(xhr.response); // Success!
      } else {
        // reject 메소드를 호출하면서 에러 메시지를 전달
        reject(new Error(xhr.status)); // Failed...
      }
    };
  });
};
```

위 예제처럼 비동기 함수 내에서 Promise 객체를 생성하고 그 내부에서 비동기 처리를 구현한다. 이때 비동기 처리에 성공하면 resolve 메소드를 호출한다. 이때 resolve 메소드의 인자로 비동기 처리 결과를 전달한다. 이 처리 결과는 Promise 객체의 후속 처리 메소드로 전달된다. 만약 비동기 처리에 실패하면 reject 메소드를 호출한다. 이때 reject 메소드의 인자로 에러 메시지를 전달한다. 

이 에러 메시지는 Promise 객체의 후속 처리 메소드로 전달된다.

## 프로미스의 후속 처리 메서드

Promise로 구현된 비동기 함수는 Promise 객체를 반환하여야 한다. 

Promise로 구현된 비동기 함수를 호출하는 측(promise consumer)에서는 Promise 객체의 후속 처리 메소드(then, catch)를 통해 비동기 처리 결과 또는 에러 메시지를 전달받아 처리한다. 

Promise 객체는 상태를 갖는다고 하였다. 

이 상태에 따라 **후속 처리 메소드**를 `체이닝 방식으로 호출`한다. 

> Promise의 후속 처리 메소드는 아래와 같다.
> 
- **then**

then 메소드는 두 개의 콜백 함수를 인자로 전달 받는다. 
첫 번째 콜백 함수는 성공(fulfilled, resolve 함수가 호출된 상태) 시 호출되고 
두 번째 함수는 실패(rejected, reject 함수가 호출된 상태) 시 호출된다.
**`then 메소드는 Promise를 반환한다.`**

- **catch**

예외(비동기 처리에서 발생한 에러와 then 메소드에서 발생한 에러)가 발생하면 호출된다. catch 메소드는 Promise를 반환한다.

## 프로미스의 에러 처리

비동기 함수 get은 Promise 객체를 반환한다. 

비동기 처리 결과에 대한 후속 처리는 Promise 객체가 제공하는 후속 처리 메서드 then, catch, finally를 사용하여 수행한다. 

**비동기 처리 시에 발생한 에러는 `then 메서드의 두 번째 콜백 함수로 처리할 수 있다`.**

```jsx
const wrongUrl = 'https://jsonplaceholder.typicode.com/XXX/1';

// 부적절한 URL이 지정되었기 때문에 에러가 발생한다.
promiseAjax(wrongUrl)
  .then(res => console.log(res), err => console.error(err)); // Error: 404
```

> 비동기 처리에서 발생한 에러는 Promise 객체의 후속 처리 메서드 catch를 사용해서 처리할 수도 있다.
> 

```jsx
const wrongUrl = 'https://jsonplaceholder.typicode.com/XXX/1';

// 부적절한 URL이 지정되었기 때문에 에러가 발생한다.
promiseAjax(wrongUrl)
  .then(res => console.log(res))
  .catch(err => console.error(err)); // Error: 404
```

> catch 메서드를 호출하면 내부적으로 `then(undefined, onRejected)`을 호출한다. 위 예제는 내부적으로 다음과 같이 처리된다.
> 

```jsx
const wrongUrl = 'https://jsonplaceholder.typicode.com/XXX/1';

// 부적절한 URL이 지정되었기 때문에 에러가 발생한다.
promiseAjax(wrongUrl)
  .then(res => console.log(res))
  .then(undefined, err => console.error(err)); // Error: 404
```

> 단, then 메서드의 두 번째 콜백 함수는 첫 번째 콜백 함수에서 발생한 에러를 캐치하지 못하고 코드가 복잡해져서 가독성이 좋지 않다.
> 

```jsx
promiseAjax('https://jsonplaceholder.typicode.com/todos/1')
  .then(res => console.xxx(res), err => console.error(err));
  // 두 번째 콜백 함수는 첫 번째 콜백 함수에서 발생한 에러를 캐치하지 못한다.
```

> catch 메서드를 모든 then 메서드를 호출한 이후에 호출하면 비동기 처리에서 발생한 에러(reject 함수가 호출된 상태)뿐만 아니라 then 메서드 내부에서 발생한 에러까지 모두 캐치할 수 있다.
> 

```jsx
promiseAjax('https://jsonplaceholder.typicode.com/todos/1')
  .then(res => console.xxx(res))
  .catch(err => console.error(err)); // TypeError: console.xxx is not a function
```

> 또한 then 메서드에 두 번째 콜백 함수를 전달하는 것보다 catch 메서드를 사용하는 것이 가독성이 좋고 명확하다. `따라서 에러 처리는 then 메서드에서 하지 말고 catch 메서드를 사용하는 것을 권장한다.`
> 

## 프로미스 체이닝

비동기 함수의 처리 결과를 가지고 다른 비동기 함수를 호출해야 하는 경우, 함수의 호출이 중첩(nesting)이 되어 복잡도가 높아지는 콜백 헬이 발생한다. 

**프로미스는 후속 처리 메소드를 체이닝(chainning)하여** **여러 개의 프로미스를 연결하여 사용할 수 있다.** 이로써 `콜백 헬을 해결`한다.

Promise 객체를 반환한 비동기 함수는 프로미스 후속 처리 메소드인 then이나 catch 메소드를 사용할 수 있다. 따라서 then 메소드가 Promise 객체를 반환하도록 하면(then 메소드는 기본적으로 Promise를 반환한다.) 여러 개의 프로미스를 연결하여 사용할 수 있다.

> 아래는 서버로 부터 특정 포스트를 취득한 후, 그 포스트를 작성한 사용자의 아이디로 작성된 모든 포스트를 검색하는 예제이다.
> 

```jsx
<!DOCTYPE html>
<html>
<body>
  <pre class="result"></pre>
  <script>
    const $result = document.querySelector('.result');
    const render = content => { $result.textContent = JSON.stringify(content, null, 2); };

    const promiseAjax = (method, url, payload) => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.send(JSON.stringify(payload));

        xhr.onreadystatechange = function () {
          if (xhr.readyState !== XMLHttpRequest.DONE) return;

          if (xhr.status >= 200 && xhr.status < 400) {
            resolve(xhr.response); // Success!
          } else {
            reject(new Error(xhr.status)); // Failed...
          }
        };
      });
    };

    const url = 'http://jsonplaceholder.typicode.com/posts';

    // 포스트 id가 1인 포스트를 검색하고 프로미스를 반환한다.
    promiseAjax('GET', `${url}/1`)
      // 포스트 id가 1인 포스트를 작성한 사용자의 아이디로 작성된 모든 포스트를 검색하고 프로미스를 반환한다.
      .then(res => promiseAjax('GET', `${url}?userId=${JSON.parse(res).userId}`))
      .then(JSON.parse)
      .then(render)
      .catch(console.error);
  </script>
</body>
</html>
```

## 프로미스의 정적 메소드

Promise는 주로 생성자 함수로 사용되지만 함수도 객체이므로 메소드를 갖을 수 있다.

> Promise 객체는 4가지 정적 메소드를 제공한다.
> 

### Promise.resolve/Promise.reject

Promise.resolve와 Promise.reject 메소드는 존재하는 값을 Promise로 래핑하기 위해 사용한다.

> 정적 메소드 Promise.resolve 는 인자로 전달된 값을 resolve하는 Promise를 생성한다.
> 

```jsx
const resolvedPromise = Promise.resolve([1, 2, 3]);
resolvedPromise.then(console.log); // [ 1, 2, 3 ]

//동일하게 동작
const resolvedPromise = new Promise(resolve => resolve([1, 2, 3]));
resolvedPromise.then(console.log); // [ 1, 2, 3 ]
```

> 정적 메소드 Promise.reject 는 인자로 전달된 값을 reject하는 Promise를 생성한다.
> 

```jsx
const rejectedPromise = Promise.reject(new Error('Error!'));
rejectedPromise.catch(console.log); // Error: Error!

//동일하게 동작
const rejectedPromise = new Promise((resolve, reject) => reject(new Error('Error!')));
rejectedPromise.catch(console.log); // Error: Error!
```

### Promise.all

Promise.all 메소드는 프로미스가 담겨 있는 배열 등의 [이터러블](https://poiemaweb.com/es6-iteration-for-of)을 인자로 전달 받는다. 

그리고 전달받은 모든 프로미스를 병렬로 처리하고 그 처리 결과를 resolve하는 새로운 프로미스를 반환한다. 

> 아래 예제를 살펴보자.
> 

```jsx
Promise.all([
  new Promise(resolve => setTimeout(() => resolve(1), 3000)), // 1
  new Promise(resolve => setTimeout(() => resolve(2), 2000)), // 2
  new Promise(resolve => setTimeout(() => resolve(3), 1000))  // 3
]).then(console.log) // [ 1, 2, 3 ]
  .catch(console.log);
```

Promise.all 메소드는 3개의 프로미스를 담은 배열을 전달받았다. 각각의 프로미스는 아래와 같이 동작한다.

- 첫번째 프로미스는 3초 후에 1을 resolve하여 처리 결과를 반환한다.
- 두번째 프로미스는 2초 후에 2을 resolve하여 처리 결과를 반환한다.
- 세번째 프로미스는 1초 후에 3을 resolve하여 처리 결과를 반환한다.

Promise.all 메소드는 전달받은 모든 프로미스를 병렬로 처리한다. 이때 모든 프로미스의 처리가 종료될 때까지 기다린 후 아래와 모든 처리 결과를 resolve 또는 reject한다.

- 모든 프로미스의 처리가 성공하면 **각각의 프로미스가 resolve한 처리 결과를 배열에 담아 resolve하는 새로운 프로미스를 반환**한다. 이때 첫번째 프로미스가 가장 나중에 처리되어도 Promise.all 메소드가 반환하는 프로미스는 첫번째 프로미스가 resolve한 처리 결과부터 차례대로 배열에 담아 그 배열을 resolve하는 새로운 프로미스를 반환한다.
- 즉, **`처리 순서가 보장된다.`**
- 프로미스의 처리가 하나라도 실패하면 가장 먼저 실패한 프로미스가 reject한 에러를 reject하는 새로운 프로미스를 즉시 반환한다.

```jsx
Promise.all([
  new Promise((resolve, reject) => setTimeout(() => reject(new Error('Error 1!')), 3000)),
  new Promise((resolve, reject) => setTimeout(() => reject(new Error('Error 2!')), 2000)),
  new Promise((resolve, reject) => setTimeout(() => reject(new Error('Error 3!')), 1000))
]).then(console.log)
  .catch(console.log); // Error: Error 3!
```

위 예제의 경우, 세번째 프로미스가 가장 먼저 실패하므로 세번째 프로미스가 reject한 에러가 catch 메소드로 전달된다.

> Promise.all 메소드는 전달 받은 이터러블의 요소가 프로미스가 아닌 경우, Promise.resolve 메소드를 통해 프로미스로 래핑된다.
> 

```jsx
Promise.all([
  1, // => Promise.resolve(1)
  2, // => Promise.resolve(2)
  3  // => Promise.resolve(3)
]).then(console.log) // [1, 2, 3]
  .catch(console.log);
```

> 아래는 github id로 github 사용자 이름을 취득하는 예제이다.
> 

```jsx
const githubIds = ['jeresig', 'ahejlsberg', 'ungmo2'];

Promise.all(githubIds.map(id => fetch(`https://api.github.com/users/${id}`)))
  // [Response, Response, Response] => Promise
  .then(responses => Promise.all(responses.map(res => res.json())))
  // [user, user, user] => Promise
  .then(users => users.map(user => user.name))
  // [ 'John Resig', 'Anders Hejlsberg', 'Ungmo Lee' ]
  .then(console.log)
  .catch(console.log);
```

위 예제의 Promise.all 메소드는 fetch 함수가 반환한 3개의 프로미스의 배열을 인수로 전달받고 이 프로미스들을 병렬 처리한다. 

모든 프로미스의 처리가 성공하면 Promise.all 메소드는 각각의 프로미스가 resolve한 3개의 Response 객체가 담긴 배열을 resolve하는 새로운 프로미스를 반환하고 후속 처리 메소드 then에는 3개의 Response 객체가 담긴 배열이 전달된다.

이때 json 메소드는 프로미스를 반환하므로 한번 더 Promise.all 메소드를 호출해야 하는 것에 주의하자. 

두번째 호출한 Promise.all 메소드는 github로 부터 취득한 3개의 사용자 정보 객체가 담긴 배열을 resolve하는 프로미스를 반환하고 후속 처리 메소드 then에는 3개의 사용자 정보 객체가 담긴 배열이 전달된다.

### Promise.race

Promise.race 메소드는 Promise.all 메소드와 동일하게 프로미스가 담겨 있는 배열 등의 [이터러블](https://poiemaweb.com/es6-iteration-for-of)을 인자로 전달 받는다. 

그리고 Promise.race 메소드는 Promise.all 메소드처럼 모든 프로미스를 병렬 처리하는 것이 아니라 가장 먼저 처리된 프로미스가 resolve한 처리 결과를 resolve하는 새로운 프로미스를 반환한다.

```jsx
Promise.race([
  new Promise(resolve => setTimeout(() => resolve(1), 3000)), // 1
  new Promise(resolve => setTimeout(() => resolve(2), 2000)), // 2
  new Promise(resolve => setTimeout(() => resolve(3), 1000))  // 3
]).then(console.log) // 3
  .catch(console.log);
```

> 에러가 발생한 경우는 Promise.all 메소드와 동일하게 처리된다. 즉, Promise.race 메소드에 전달된 프로미스 처리가 하나라도 실패하면 가장 먼저 실패한 프로미스가 reject한 에러를 reject하는 새로운 프로미스를 즉시 반환한다.
> 

```jsx
Promise.race([
  new Promise((resolve, reject) => setTimeout(() => reject(new Error('Error 1!')), 3000)),
  new Promise((resolve, reject) => setTimeout(() => reject(new Error('Error 2!')), 2000)),
  new Promise((resolve, reject) => setTimeout(() => reject(new Error('Error 3!')), 1000))
]).then(console.log)
  .catch(console.log); // Error: Error 3!
```

### Promise.allSettled

Promise.allSettled 메서드는 전달받은 프로미스가 모두 settled 상태(비동기 처리가 수행된 상태,즉 fulfilled 또는 rejected 상태)가 되면 처리 결과를 배열로 반환한다. ES11(ECMAScript 2020)에 도입되었다

즉, Promise.allSettled 메서드는 비동기 처리 성공 여부와 상관없이 모두 처리한 결과를 반환한다.

```jsx
Promise.allSettled([
  new Promise(resolve => setTimeout(() => resolve(1), 2000)),
  new Promise((_, reject) => setTimeout(() => reject(new Error('Error!')), 1000))
]).then(console.log);
/*
[
  {status: "fulfilled", value: 1},
  {status: "rejected", reason: Error: Error! at <anonymous>:3:54}
]
*/
```

## 마이크로태스크 큐

다음 예제를 보고 어떤 순서로 로그가 출력될지 생각해보자!!

```jsx
setTimeout(() => console.log(1), 0);

Promise.resolve()
  .then(() => console.log(2))
  .then(() => console.log(3));
```

프로미스의 후속 처리 메서드도 비동기로 동작하므로 1->2->3의 순으로 출력될 것처럼 보이지만2->3->1 순으로 출력된다. 

> 그 이유는 프로미스의 후속 처리 메서드의 콜백 함수는 태스크 큐가 아니라마이크로태스트 큐에 저장되기 때문이다!
> 

마이크로태스크 큐는 태스크 큐와는 별도의 큐다. 마이크로태스트 큐에는 프로미스의 후속 처리 메서드의 콜백 함수가 일시 저장된다. 

그 외의 비동기 함수의 콜백 함수나 이벤트 핸들러는 태스크 큐에 저장된다.콜백 함수나 이벤트 핸들러를 일시 저장한다는 점에서 태스크 큐와 동일하지만 `마이크로태스크 큐는 태스크 큐보다 우선순위가 높다.` 

> 즉, 이벤트 루프는 콜 스택이 비면 `먼저 마이크로태스크 큐에서 가져오고`, `마이크로태스크 큐가 비면 그제서야 태스트큐에서 가져와서 처리한다.`
> 

## fetch

위의 비동기 요청 예시에서 XMLHttpRequest 객체를 사용했지만 fetch는 이와 동일하게 HTTP 요청 전송 기능을 제공하는 클라이언트 사이트 Web API다. XMLHttpRequest 객체보다 사용법이 간단하고 프로미스를 지원하기 때문에 비동기 처리를 위한 콜백 패턴의 단점에서 자유롭다.

```jsx
// 기본 문법
const promise = fetch(url [, options])
```

fetch 함수는 HTTP 응답을 나타내는 Response 객체를 래핑한 Promise 객체를 반환한다.

```jsx
fetch('https://jsonplaceholder.typicode.com/todos/1')
  .then(response => console.log(response));
```

> fetch 사용시 주의할 점

fetch함수가 반환하는 프로미스는 기본적으로 404 Not Found나 500 Internal Server Error와 같은 HTTP에러가 발생해도 에러를 reject하지 않고 불리언 타입의 ok 상태를 false로 설정한 response 객체를 resolve한다.

오프라인 등의 네트워크 장애나 CORS에러에 의해 요청이 완료되지 못한 경우에만 프로미스를 reject한다!

**`그렇기에 명시적으로 resolve한 불리언 타입의 ok상태를 확인해 명시적으로 에러를 처리해야 할 필요가 있다.`**



## 질문

1. Promise란 무엇이고, 왜 필요할까요?
   > Promise는 생성과 실행이 분리되어 있나요?

2. Promise.then 체이닝은 어떻게 동작하나요?
   > then에서 에러를 throw 하면 어떻게 되나요?

3. Promise와 async / await의 차이는 무엇인가요?
   > async 함수는 항상 Promise를 반환하나요?
