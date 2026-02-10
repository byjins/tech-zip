---
sidebar_position: 7
title: Next.js는 React와 무엇이 다를까
---

# Next.js는 React와 무엇이 다를까

React를 어느 정도 써본 사람이라면 한 번쯤 이런 생각을 해봤을 것이다.

> "React만으로도 잘 되는데, 왜 굳이 Next.js를 써야 할까?"

이 질문에 제대로 답하려면  
**Next.js가 무엇을 추가했는지**보다,  
**왜 React만으로는 부족해졌는지**부터 짚어야 한다.

---

## React의 출발점: UI를 잘 그리기 위한 도구

React는 처음부터 **프레임워크**가 아니었다.  
React의 본질은 아주 단순하다.

- UI를 함수로 표현하고
- 상태 변화에 따라 다시 계산(render)하며
- 변경된 부분만 DOM에 반영한다

즉, React는 **UI 렌더링 엔진**이다.

여기에는 몇 가지 중요한 전제가 있다.

- 라우팅 ❌
- 데이터 패칭 전략 ❌
- 서버 실행 모델 ❌
- SEO ❌
- 빌드 시스템 ❌
- 이미지 최적화 ❌

이건 React의 한계라기보다는 **의도적인 선택**이다.  
React는 "어떻게 그릴 것인가"만 책임진다.

---

## React 단독 사용의 현실적인 문제들

SPA가 대세가 되면서 React는 빠르게 퍼졌지만, 실무에서는 곧 한계에 부딪혔다.

### 1. 초기 로딩 문제

```jsx
// React만 사용할 때
function App() {
  return <div>Hello World</div>;
}

// 실제로는:
// 1. 빈 HTML 다운로드
// 2. JS 번들 다운로드 (수백 KB ~ 수 MB)
// 3. React 실행
// 4. 데이터 요청 (API 호출)
// 5. 렌더링
// 6. 화면 표시
```

> 화면이 보이기까지 너무 많은 단계를 거쳐야 했다.

### 2. SEO 문제

React SPA는 기본적으로:

```html
<!DOCTYPE html>
<html>
  <body>
    <div id="root"></div>
    <script src="/bundle.js"></script>
  </body>
</html>
```

검색 엔진 입장에서는  
**내용이 없는 페이지**에 가깝다.

### 3. 프로젝트마다 반복되는 설정

매번 새 프로젝트를 시작할 때마다:

- Webpack / Vite / Rollup 설정
- Babel / TypeScript 설정
- 라우터 구성 (React Router)
- 코드 스플리팅 설정
- 환경 변수 관리
- 이미지 최적화 설정
- CSS 처리 (CSS Modules, Tailwind 등)

> "매번 똑같은 인프라를 다시 만드는 느낌"

### 4. 서버 렌더링의 복잡성

서버에서 React를 실행하려면:

- Node.js 서버 설정
- ReactDOMServer 설정
- Hydration 로직 구현
- 라우팅 서버 측 처리
- 데이터 페칭 전략 수립

이 모든 것을 직접 구현해야 했다.

---

## Next.js의 탄생 배경

Next.js는 이런 문제의식에서 출발했다.

> **"React를 제대로 쓰기 위한 기본 구조를 제공하자"**

Next.js가 해결하려던 핵심은 다음이다.

- 서버 렌더링을 쉽게
- 설정을 최소화
- 실무에서 바로 쓸 수 있는 구조 제공
- 개발자 경험 향상

즉, Next.js는  
**React 위에 얹는 실행 환경(Runtime + Convention)** 이다.

---

## React vs Next.js의 역할 차이

| 구분            | React         | Next.js                               |
| --------------- | ------------- | ------------------------------------- |
| **역할**        | UI 라이브러리 | React 프레임워크                      |
| **관심사**      | 렌더링        | 실행 환경 + 렌더링                    |
| **서버**        | 모름          | 서버 전제                             |
| **라우팅**      | 없음          | 파일 기반 (App Router / Pages Router) |
| **데이터 패칭** | 직접 구현     | Server Component, fetch 캐시 등       |
| **빌드**        | 직접 설정     | 자동 최적화                           |
| **이미지**      | 직접 처리     | 자동 최적화                           |
| **폰트**        | 직접 로드     | 자동 최적화                           |

---

## Next.js가 제공하는 핵심 기능들

### 1. 파일 기반 라우팅

**React만 사용할 때:**

```jsx
// React Router 설정 필요
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/products/:id" element={<Product />} />
      </Routes>
    </BrowserRouter>
  );
}
```

**Next.js (App Router):**

```
app/
  page.js              // / 경로
  about/
    page.js            // /about 경로
  products/
    [id]/
      page.js          // /products/:id 경로
```

파일 구조가 곧 라우트다.  
설정 파일 없이 자동으로 라우팅이 구성된다.

### 2. 서버와 클라이언트의 명확한 분리

Next.js의 핵심은 **"어디서 실행되는가"**다.

```jsx
// Server Component (기본값)
// 서버에서만 실행, 번들에 포함 안 됨
async function ProductPage({ id }) {
  const product = await db.product.findUnique({ where: { id } });
  return <div>{product.name}</div>;
}

// Client Component
("use client");
function AddToCartButton() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount((c) => c + 1)}>{count}</button>;
}
```

이 한 줄(`'use client'`)은 단순한 문법이 아니라 **실행 환경 선언**이다.

### 3. 다양한 렌더링 전략

Next.js는 상황에 맞는 렌더링 방식을 선택할 수 있다:

- **SSR (Server Side Rendering)**: 요청마다 서버에서 HTML 생성

  ```jsx
  // app/products/page.js
  async function ProductsPage() {
    const products = await fetchProducts(); // 매 요청마다 실행
    return <ProductList products={products} />;
  }
  ```

- **SSG (Static Site Generation)**: 빌드 시점에 한 번 생성

  ```jsx
  // pages/products.js (Pages Router)
  export async function getStaticProps() {
    const products = await fetchProducts();
    return { props: { products } };
  }
  ```

- **ISR (Incremental Static Regeneration)**: SSG + 주기적 재생성

  ```jsx
  export async function getStaticProps() {
    const products = await fetchProducts();
    return {
      props: { products },
      revalidate: 60, // 60초마다 재생성
    };
  }
  ```

- **Streaming**: HTML을 조각 내어 순차적으로 전달
  ```jsx
  async function Page() {
    return (
      <div>
        <Suspense fallback={<Skeleton />}>
          <SlowComponent /> {/* 나중에 스트리밍 */}
        </Suspense>
        <FastComponent /> {/* 먼저 표시 */}
      </div>
    );
  }
  ```

### 4. 자동 최적화

**이미지 최적화:**

```jsx
// React만 사용할 때
<img src="/large-image.jpg" alt="..." />;
// 문제: 큰 이미지를 그대로 전송

// Next.js
import Image from "next/image";
<Image src="/large-image.jpg" width={500} height={300} alt="..." />;
// 자동으로 최적화된 이미지 생성 및 지연 로딩
```

**폰트 최적화:**

```jsx
// React만 사용할 때
<link href="https://fonts.googleapis.com/css2?family=Inter" />;
// 문제: 외부 리소스 로딩 지연

// Next.js
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });
// 자동으로 폰트 최적화 및 self-hosting
```

**코드 스플리팅:**

- 페이지별로 자동 분리
- 동적 import 자동 처리
- 공통 코드 추출

### 5. API Routes

서버 API를 별도 백엔드 없이 구현 가능:

```jsx
// app/api/users/route.js
export async function GET(request) {
  const users = await db.user.findMany();
  return Response.json(users);
}

export async function POST(request) {
  const body = await request.json();
  const user = await db.user.create({ data: body });
  return Response.json(user);
}
```

### 6. Middleware

요청과 응답 사이에 로직 실행:

```jsx
// middleware.js
export function middleware(request) {
  // 인증 체크
  // 리다이렉트
  // 헤더 수정
  // 등등
}

export const config = {
  matcher: "/dashboard/:path*",
};
```

---

## Next.js는 React의 렌더링 규칙을 바꾸지 않았다

중요한 포인트가 있다.

> Next.js는 React의 렌더링 규칙을 바꾸지 않는다.

- Virtual DOM
- Reconciliation
- 참조 비교
- 불변성
- Hooks 규칙

이 모든 것은 그대로다.

달라진 건 **언제, 어디서 실행되느냐**뿐이다.

---

## Next.js의 철학: Convention over Configuration

Next.js는 **설정보다 관례**를 선호한다.

**React만 사용할 때:**

- Webpack 설정 파일 (수백 줄)
- Babel 설정
- 라우터 설정
- 코드 스플리팅 설정
- 환경 변수 설정
- 등등...

**Next.js:**

- `next.config.js` (최소한의 설정만)
- 파일 구조가 곧 설정
- 기본값이 최적화되어 있음

---

## Next.js의 두 가지 라우터

### Pages Router (레거시, 여전히 지원됨)

```
pages/
  index.js          // /
  about.js          // /about
  products/
    [id].js         // /products/:id
  api/
    users.js        // /api/users
```

- 파일 기반 라우팅
- `getServerSideProps`, `getStaticProps` 사용
- 더 많은 제어권

### App Router (권장, Next.js 13+)

```
app/
  page.js           // /
  layout.js         // 레이아웃
  about/
    page.js         // /about
  products/
    [id]/
      page.js       // /products/:id
  api/
    users/
      route.js      // /api/users
```

- Server Component 기본
- `layout.js`, `loading.js`, `error.js` 등 특수 파일
- 더 나은 성능과 개발자 경험

---

## 왜 Next.js는 지금의 React와 잘 맞을까

React 18 이후의 변화는 명확하다.

- Concurrent Rendering
- Server Component
- Streaming
- Suspense

이 모든 건 **단일 실행 환경에서는 불가능한 모델**이다.

Next.js는 React가 가고자 하는 방향을  
**가장 먼저 받아들인 실행 플랫폼**이다.

---

## 실무에서 Next.js를 선택하는 이유

### 1. 개발 속도

- 설정 시간 절약
- 표준 패턴 제공
- 빠른 프로토타이핑

### 2. 성능

- 자동 최적화
- 서버 렌더링
- 이미지/폰트 최적화

### 3. SEO

- 서버 렌더링으로 검색 엔진 최적화
- 메타데이터 관리 용이

### 4. 생산성

- 파일 구조만으로 라우팅
- API Routes로 풀스택 개발
- 타입 안정성 (TypeScript 지원)

---

## 언제 React만 사용하고, 언제 Next.js를 사용할까?

### React만 사용하기 좋은 경우

- 단순한 SPA
- 내부 도구/대시보드
- SEO가 중요하지 않음
- 완전한 제어가 필요함
- 이미 다른 프레임워크 사용 중

### Next.js를 사용하기 좋은 경우

- SEO가 중요한 웹사이트
- 빠른 초기 로딩이 중요
- 서버 렌더링이 필요
- 풀스택 개발이 필요
- 표준 패턴을 따르고 싶음
- 프로덕션 최적화가 중요

---

## 정리

- React는 UI를 그리는 엔진이다
- Next.js는 그 엔진을 실행시키는 환경이다
- React만으로 부족해진 이유는 "렌더링"이 아니라 "실행 환경" 때문이다
- Next.js는 React를 대체하지 않는다
- React를 **제대로 쓰기 위한 전제**를 제공할 뿐이다

Next.js는 React 개발자가 **인프라 구축에 시간을 쓰지 않고, 비즈니스 로직에 집중할 수 있게** 만든 프레임워크다.
