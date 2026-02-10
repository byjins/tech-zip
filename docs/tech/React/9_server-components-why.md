---
sidebar_position: 9
title: Server Component는 왜 등장했을까
---

# Server Component는 왜 등장했을까

Server Component는 "SSR을 더 빠르게 만들기 위한 기술"이 아니다.  
오히려 **기존 CSR·SSR 모델이 해결하지 못한 구조적인 문제를 해결하기 위한 선택**에 가깝다.

이 글에서는 React 팀이 왜 다시 서버로 돌아가야 했는지,  
그리고 그 결정이 어떤 렌더링 철학의 변화에서 나왔는지를 정리한다.

---

## CSR의 한계: 느린 게 아니라 무거웠다

CSR의 가장 큰 문제는 속도가 아니라 **책임의 위치**였다.

- 모든 컴포넌트가 클라이언트에서 실행된다
- 데이터 패칭 로직도 클라이언트에 있다
- 결국 모든 JS가 번들로 묶인다

앱이 커질수록:

- 번들은 커지고
- hydration 비용은 늘어나고
- 초기 진입 비용은 통제하기 어려워진다

### 번들 크기 폭증의 실제 예시

전형적인 React 앱의 번들 구성을 보면:

```jsx
// 모든 컴포넌트가 클라이언트로 전송됨
import { HeavyChart } from "./components/HeavyChart"; // 200KB
import { DataTable } from "./components/DataTable"; // 150KB
import { MarkdownRenderer } from "./components/Markdown"; // 100KB
import { PDFViewer } from "./components/PDFViewer"; // 300KB
import { VideoPlayer } from "./components/VideoPlayer"; // 250KB

function App() {
  return (
    <>
      <Header /> {/* 항상 보임 */}
      <HeavyChart /> {/* 사용자 10%만 사용 */}
      <DataTable /> {/* 사용자 20%만 사용 */}
      <MarkdownRenderer /> {/* 사용자 5%만 사용 */}
      <PDFViewer /> {/* 사용자 15%만 사용 */}
      <VideoPlayer /> {/* 사용자 8%만 사용 */}
    </>
  );
}
```

**문제점:**

- 사용자가 보지도 않는 컴포넌트의 코드까지 모두 다운로드해야 함
- 사용자 10%만 쓰는 `HeavyChart`가 모든 사용자의 초기 로딩을 느리게 만듦
- 코드 스플리팅으로 나눠도, 각 청크를 로드할 때마다 네트워크 요청 발생
- 결국 **사용하지 않는 코드를 미리 다운로드하는 비용**을 모두가 지불

### 데이터 페칭의 이중 비용

CSR에서 데이터 페칭은 다음과 같은 문제를 만든다:

```jsx
function ProductPage() {
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState(null);
  const [recommendations, setRecommendations] = useState(null);

  useEffect(() => {
    // 1. 클라이언트에서 API 호출
    fetch("/api/product/123")
      .then((res) => res.json())
      .then(setProduct);

    fetch("/api/product/123/reviews")
      .then((res) => res.json())
      .then(setReviews);

    fetch("/api/product/123/recommendations")
      .then((res) => res.json())
      .then(setRecommendations);
  }, []);

  // 2. 데이터가 없으면 로딩 상태 표시
  if (!product) return <Loading />;

  // 3. 데이터가 있으면 렌더링
  return (
    <div>
      <ProductInfo data={product} />
      <Reviews data={reviews} />
      <Recommendations data={recommendations} />
    </div>
  );
}
```

**발생하는 비용:**

1. **네트워크 왕복**: 클라이언트 → 서버 → 클라이언트 (지연 시간 발생)
2. **워터폴**: 첫 요청 완료 후 다음 요청 시작 (직렬 처리)
3. **렌더링 지연**: 데이터가 올 때까지 화면에 아무것도 표시 못함
4. **불필요한 상태 관리**: 서버에서 이미 알고 있는 데이터를 클라이언트 상태로 다시 관리

### Hydration 비용의 누적

CSR 앱이 SSR로 전환되면:

```jsx
// 서버에서 HTML 생성
<div id="root">
  <div class="product-page">
    <h1>Product Name</h1>
    <p>Description...</p>
    <!-- 수백 개의 DOM 노드 -->
  </div>
</div>

// 클라이언트에서 다시 실행
function ProductPage() {
  // 같은 컴포넌트를 다시 실행
  // 같은 데이터를 다시 fetch (또는 props로 받음)
  // DOM을 다시 생성 (하지만 서버 HTML과 일치시켜야 함)
  return <div>...</div>
}
```

**Hydration이 하는 일:**

1. 서버 HTML의 모든 DOM 노드를 순회
2. 각 노드에 대응하는 React 컴포넌트를 다시 실행
3. 이벤트 리스너를 모든 노드에 붙임
4. 상태를 초기화하고 연결

컴포넌트가 100개면 100개 모두를 다시 실행해야 한다.  
이것이 **"렌더링을 두 번 하는"** 이유다.

---

## SSR도 완전한 해결책은 아니었다

SSR은 HTML을 서버에서 만들어준다.  
하지만 컴포넌트 실행의 중심은 여전히 클라이언트였다.

- 서버는 HTML만 생성
- 클라이언트는 다시 같은 컴포넌트를 실행
- hydration이라는 이중 비용 발생

즉, **실행 위치만 나뉘었을 뿐 모델은 바뀌지 않았다.**

### SSR의 근본적인 한계

SSR이 해결한 것과 해결하지 못한 것을 명확히 구분해보자:

**해결한 것:**

- 초기 화면 표시 (FCP 개선)
- SEO
- 소셜 미리보기

**해결하지 못한 것:**

- 컴포넌트 코드는 여전히 클라이언트로 전송됨
- Hydration 비용은 그대로
- 데이터 페칭 로직은 여전히 클라이언트에 있거나, 서버에서 중복 실행

### Hydration의 실제 비용

```jsx
// 서버에서 실행
function BlogPost({ post }) {
  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
      <Comments comments={post.comments} />
      <RelatedPosts posts={post.related} />
    </article>
  );
}

// 클라이언트에서 다시 실행 (Hydration)
// 1. BlogPost 컴포넌트 함수 실행
// 2. Comments 컴포넌트 함수 실행
// 3. RelatedPosts 컴포넌트 함수 실행
// 4. 모든 DOM 노드에 이벤트 리스너 연결
// 5. 상태 초기화
```

**문제점:**

- `Comments`와 `RelatedPosts`는 정적 콘텐츠인데도 클라이언트에서 다시 실행됨
- 이 컴포넌트들에 이벤트가 없어도 React는 전체 트리를 순회해야 함
- 사용자가 스크롤하지 않아도 보이지 않는 부분까지 Hydration됨

### SSR의 데이터 중복 문제

```jsx
// 서버에서
async function getServerSideProps() {
  const product = await fetchProduct(123); // DB 쿼리
  return { props: { product } };
}

// 클라이언트에서
function ProductPage({ product }) {
  const [reviews, setReviews] = useState(null);

  useEffect(() => {
    // 또 다시 서버에 요청
    fetch("/api/product/123/reviews")
      .then((res) => res.json())
      .then(setReviews);
  }, []);

  return (
    <div>
      <ProductInfo product={product} /> {/* 서버에서 받음 */}
      <Reviews reviews={reviews} /> {/* 클라이언트에서 다시 받음 */}
    </div>
  );
}
```

**발생하는 문제:**

- 서버에서 이미 `product` 데이터를 가져왔는데, `reviews`는 클라이언트에서 다시 요청
- 같은 데이터베이스에 두 번 접근 (서버: `getServerSideProps`, 클라이언트: `useEffect`)
- 네트워크 왕복이 여전히 발생
- 상태 관리가 복잡해짐 (서버 props + 클라이언트 state)

---

## React 팀의 근본적인 질문

> 컴포넌트는 꼭 클라이언트에서 실행되어야 할까?

이 질문에서 나온 답이 Server Component다.

### 기존 모델의 가정

기존 CSR/SSR 모델은 다음과 같은 가정을 했다:

1. **모든 컴포넌트는 클라이언트에서 실행되어야 한다**
2. **데이터는 별도로 가져와야 한다** (컴포넌트와 분리)
3. **서버는 HTML만 생성한다** (렌더링 결과만 전송)

이 가정들이 문제의 근원이었다.

---

## Server Component의 핵심 아이디어

Server Component는 이 가정들을 뒤집었다:

- 일부 컴포넌트는 서버에서만 실행한다
- 클라이언트로 JS를 보내지 않는다
- 데이터 패칭과 렌더링을 한 곳에서 끝낸다

이로 인해:

- 번들 크기 감소
- hydration 대상 감소
- 데이터 접근 위치 명확화

### Server Component의 작동 원리

Server Component는 기존 SSR과 근본적으로 다르다:

```jsx
// Server Component (서버에서만 실행)
async function ProductInfo({ productId }) {
  // 서버에서 직접 DB 접근
  const product = await db.product.findUnique({ where: { id: productId } });
  const reviews = await db.review.findMany({ where: { productId } });

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <ReviewsList reviews={reviews} /> {/* 이것도 Server Component */}
    </div>
  );
}

// Client Component (클라이언트에서 실행)
("use client");

function AddToCartButton({ productId }) {
  const [isAdding, setIsAdding] = useState(false);

  const handleClick = () => {
    setIsAdding(true);
    // 클라이언트에서 서버 액션 호출
    addToCart(productId);
  };

  return <button onClick={handleClick}>Add to Cart</button>;
}
```

**차이점:**

1. **Server Component**: 서버에서만 실행되고, 결과만 직렬화되어 전송됨
2. **Client Component**: 클라이언트로 번들에 포함되고, Hydration됨
3. **경계**: `'use client'` 지시어로 명확히 구분

### 기존 SSR vs Server Component

**기존 SSR:**

```jsx
// 서버: HTML 문자열 생성
const html = ReactDOMServer.renderToString(<App />);
// 결과: "<div><h1>Hello</h1></div>"

// 클라이언트: 같은 컴포넌트를 다시 실행하여 Hydration
ReactDOM.hydrateRoot(document.getElementById("root"), <App />);
// 모든 컴포넌트가 다시 실행됨
```

**Server Component:**

```jsx
// 서버: 컴포넌트 실행 결과를 직렬화
async function ServerComponent() {
  const data = await fetchData();
  return <div>{data}</div>;
}
// 결과: 직렬화된 컴포넌트 트리 (JSON 형태)

// 클라이언트: Server Component는 실행하지 않음
// 오직 Client Component만 Hydration
("use client");
function ClientComponent() {
  return <button>Click</button>;
}
```

**핵심 차이:**

- 기존 SSR: 서버에서 HTML 생성 → 클라이언트에서 다시 실행
- Server Component: 서버에서 실행 → 결과만 전송 → 클라이언트는 실행 안 함

### 번들 크기 감소의 실제 효과

```jsx
// Before: 모든 컴포넌트가 클라이언트 번들에 포함
import { HeavyChart } from "./HeavyChart"; // 200KB → 번들에 포함
import { MarkdownRenderer } from "./Markdown"; // 100KB → 번들에 포함
import { PDFViewer } from "./PDFViewer"; // 300KB → 번들에 포함

function BlogPost({ post }) {
  return (
    <article>
      <MarkdownRenderer content={post.content} />
      <HeavyChart data={post.chartData} />
      <PDFViewer url={post.pdfUrl} />
    </article>
  );
}

// After: Server Component는 번들에서 제외
// Server Component
async function BlogPost({ postId }) {
  const post = await db.post.findUnique({ where: { id: postId } });

  return (
    <article>
      <MarkdownRenderer content={post.content} /> {/* 서버에서만 실행 */}
      <HeavyChart data={post.chartData} /> {/* 서버에서만 실행 */}
      <PDFViewer url={post.pdfUrl} /> {/* 서버에서만 실행 */}
    </article>
  );
}

// 번들 크기: 600KB → 0KB (이 컴포넌트들은 번들에 포함되지 않음)
```

**실제 효과:**

- 초기 번들 크기가 크게 감소
- 사용자가 보지 않는 컴포넌트 코드를 다운로드하지 않음
- 코드 스플리팅보다 더 근본적인 해결책 (애초에 클라이언트로 보내지 않음)

### 데이터 접근 위치의 명확화

```jsx
// Server Component: 데이터베이스에 직접 접근
async function ProductPage({ productId }) {
  // 서버에서 직접 실행
  const product = await db.product.findUnique({
    where: { id: productId },
    include: {
      reviews: true,
      recommendations: true,
      images: true,
    },
  });

  // 모든 데이터를 한 번에 가져옴
  return (
    <div>
      <ProductHeader product={product} />
      <ProductImages images={product.images} />
      <ReviewsList reviews={product.reviews} />
      <Recommendations items={product.recommendations} />
    </div>
  );
}
```

**장점:**

1. **단일 데이터 소스**: 서버에서 모든 데이터를 한 번에 가져옴
2. **워터폴 제거**: 여러 API 호출이 아닌 단일 DB 쿼리
3. **타입 안정성**: 서버와 클라이언트 간 데이터 구조가 명확
4. **보안**: 데이터베이스 접근이 서버에서만 이루어짐

### Hydration 대상의 선택적 축소

```jsx
// Server Component (Hydration 안 됨)
function StaticContent({ text }) {
  return <p>{text}</p>;
}

// Client Component (Hydration 됨)
("use client");
function InteractiveButton() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount((c) => c + 1)}>{count}</button>;
}

// 페이지 구성
function Page() {
  return (
    <div>
      <StaticContent text="This is static" /> {/* Hydration 안 됨 */}
      <StaticContent text="This too" /> {/* Hydration 안 됨 */}
      <StaticContent text="And this" /> {/* Hydration 안 됨 */}
      <InteractiveButton /> {/* 이것만 Hydration */}
    </div>
  );
}
```

**효과:**

- 정적 콘텐츠는 Hydration 대상에서 제외
- 인터랙티브한 부분만 클라이언트로 전송
- Hydration 비용이 크게 감소

---

## Server Component는 SSR의 진화다

Server Component는 CSR ↔ SSR의 중간 지점이 아니다.

> **컴포넌트 실행 위치를 설계할 수 있게 만든 모델 변화**다.

### 컴포넌트 실행 위치의 설계 가능성

이제 개발자가 **어떤 컴포넌트를 어디서 실행할지** 결정할 수 있다:

```jsx
// 정적 콘텐츠 → Server Component
async function BlogPost({ id }) {
  const post = await db.post.findUnique({ where: { id } });
  return (
    <article>
      <h1>{post.title}</h1>
      <Markdown content={post.content} />
    </article>
  );
}

// 인터랙티브 UI → Client Component
("use client");
function CommentForm() {
  const [comment, setComment] = useState("");
  return (
    <form>
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} />
      <button>Submit</button>
    </form>
  );
}

// 하이브리드: Server Component 안에 Client Component 포함
async function BlogPostPage({ id }) {
  const post = await db.post.findUnique({ where: { id } });

  return (
    <div>
      <BlogPost post={post} /> {/* Server Component */}
      <CommentForm /> {/* Client Component */}
      <RelatedPosts postId={id} /> {/* Server Component */}
    </div>
  );
}
```

**설계 원칙:**

1. **기본은 Server Component**: 정적이거나 서버 데이터가 필요한 경우
2. **필요할 때만 Client Component**: 이벤트 핸들러, 상태, 브라우저 API가 필요한 경우
3. **명확한 경계**: `'use client'`로 의도를 명확히 표현

---

## Server Component의 제약사항

Server Component는 강력하지만, 모든 것을 할 수는 없다:

### 사용할 수 없는 것들

```jsx
// ❌ 상태 관리 불가
async function ServerComponent() {
  const [count, setCount] = useState(0); // 에러!
  return <div>{count}</div>;
}

// ❌ 이벤트 핸들러 불가
async function ServerComponent() {
  return <button onClick={() => {}}>Click</button>; // 에러!
}

// ❌ 브라우저 API 사용 불가
async function ServerComponent() {
  const width = window.innerWidth; // 에러!
  return <div>{width}</div>;
}

// ❌ useEffect, useLayoutEffect 등 불가
async function ServerComponent() {
  useEffect(() => {}, []); // 에러!
  return <div>Hello</div>;
}
```

### 사용할 수 있는 것들

```jsx
// ✅ 비동기 데이터 페칭
async function ServerComponent() {
  const data = await fetch("https://api.example.com/data");
  return <div>{data}</div>;
}

// ✅ 서버 리소스 직접 접근
async function ServerComponent() {
  const file = await fs.readFile("data.json");
  return <div>{file}</div>;
}

// ✅ 다른 Server Component 사용
async function ServerComponent() {
  return (
    <div>
      <AnotherServerComponent />
    </div>
  );
}

// ✅ Client Component를 자식으로 포함
async function ServerComponent() {
  return (
    <div>
      <ClientComponent /> {/* 가능 */}
    </div>
  );
}
```

### 경계의 중요성

Server Component와 Client Component의 경계는 **명확히 구분**되어야 한다:

```jsx
// ❌ 잘못된 패턴: Server Component가 Client Component의 props로 함수 전달
async function ServerComponent() {
  const handleClick = () => {}; // 함수는 직렬화 불가
  return <ClientComponent onClick={handleClick} />;
}

// ✅ 올바른 패턴: Server Action 사용
async function ServerComponent() {
  return <ClientComponent action={serverAction} />;
}

async function serverAction() {
  "use server";
  // 서버에서 실행되는 액션
}
```

---

## 실제 사용 사례와 성능 개선

### 케이스 1: 블로그 플랫폼

**Before (CSR):**

```jsx
function BlogPost({ id }) {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState(null);

  useEffect(() => {
    fetch(`/api/posts/${id}`)
      .then((r) => r.json())
      .then(setPost);
    fetch(`/api/posts/${id}/comments`)
      .then((r) => r.json())
      .then(setComments);
  }, [id]);

  if (!post) return <Loading />;

  return (
    <article>
      <MarkdownRenderer content={post.content} /> {/* 100KB 번들 */}
      <CommentsList comments={comments} />
    </article>
  );
}
```

**After (Server Component):**

```jsx
async function BlogPost({ id }) {
  const post = await db.post.findUnique({
    where: { id },
    include: { comments: true },
  });

  return (
    <article>
      <MarkdownRenderer content={post.content} /> {/* 번들에 포함 안 됨 */}
      <CommentsList comments={post.comments} />
    </article>
  );
}
```

**개선 효과:**

- 초기 번들 크기: 100KB 감소
- 데이터 로딩: 워터폴 제거, 단일 DB 쿼리
- Hydration 비용: MarkdownRenderer는 Hydration 안 됨

### 케이스 2: 대시보드 애플리케이션

**Before:**

```jsx
function Dashboard() {
  const [charts, setCharts] = useState(null);
  const [tables, setTables] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/charts").then((r) => r.json()),
      fetch("/api/tables").then((r) => r.json()),
    ]).then(([c, t]) => {
      setCharts(c);
      setTables(t);
    });
  }, []);

  return (
    <div>
      <HeavyChartLibrary data={charts} /> {/* 200KB 번들 */}
      <DataTableLibrary data={tables} /> {/* 150KB 번들 */}
    </div>
  );
}
```

**After:**

```jsx
async function Dashboard() {
  const [charts, tables] = await Promise.all([
    db.chart.findMany(),
    db.table.findMany(),
  ]);

  return (
    <div>
      <HeavyChartLibrary data={charts} /> {/* 번들에 포함 안 됨 */}
      <DataTableLibrary data={tables} /> {/* 번들에 포함 안 됨 */}
    </div>
  );
}
```

**개선 효과:**

- 초기 번들 크기: 350KB 감소
- 데이터 로딩: 서버에서 병렬 처리, 클라이언트 네트워크 요청 제거
- 사용자 경험: 첫 화면 표시까지 시간 단축

---

## 데이터 페칭 패턴의 변화

### 기존 패턴: 클라이언트에서 데이터 페칭

```jsx
// 클라이언트 컴포넌트
function ProductList() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data)
        setLoading(false)
      })
  }, [])

  if (loading) return <Loading />
  return <div>{products.map(...)}</div>
}
```

**문제점:**

- 클라이언트에서 네트워크 요청
- 로딩 상태 관리 필요
- 에러 처리 복잡
- 타입 안정성 부족

### 새로운 패턴: Server Component에서 직접 접근

```jsx
// Server Component
async function ProductList() {
  const products = await db.product.findMany();

  return (
    <div>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

**장점:**

- 서버에서 직접 DB 접근 (빠름)
- 로딩 상태 불필요 (서버에서 완료 후 전송)
- 타입 안정성 (서버와 클라이언트 타입 일치)
- 보안 (DB 접근이 서버에서만)

### Server Actions와의 조합

```jsx
// Server Action
async function addProduct(formData) {
  "use server";
  const name = formData.get("name");
  await db.product.create({ data: { name } });
  revalidatePath("/products");
}

// Client Component
("use client");
function AddProductForm() {
  return (
    <form action={addProduct}>
      <input name="name" />
      <button type="submit">Add</button>
    </form>
  );
}

// Server Component
async function ProductsPage() {
  const products = await db.product.findMany();

  return (
    <div>
      <ProductList products={products} />
      <AddProductForm /> {/* Server Action 사용 */}
    </div>
  );
}
```

---

## React 렌더링 모델의 변화

Server Component는 React의 **렌더링 모델 자체를 확장**한 것이다:

### 렌더링 위치의 선택권

```
┌─────────────────────────────────────┐
│  Server Component                  │
│  - 서버에서만 실행                 │
│  - 번들에 포함 안 됨               │
│  - DB 직접 접근 가능               │
└─────────────────────────────────────┘
              │
              │ props 전달
              ▼
┌─────────────────────────────────────┐
│  Client Component                   │
│  - 클라이언트에서 실행              │
│  - 번들에 포함됨                    │
│  - 상태, 이벤트 사용 가능           │
└─────────────────────────────────────┘
```

### React의 진화 방향

Server Component는 React의 **다음 단계**를 보여준다:

1. **렌더링 위치의 명시적 제어**: 개발자가 어디서 실행할지 결정
2. **데이터와 UI의 통합**: 데이터 페칭과 렌더링을 한 곳에서
3. **점진적 향상**: 기본은 서버, 필요할 때만 클라이언트
4. **성능과 개발자 경험의 균형**: 번들 크기 감소와 타입 안정성

### React의 철학 변화

기존 React:

- "UI를 함수로 표현하자"
- "상태 변화에 따라 다시 렌더링하자"

Server Component 이후:

- "UI를 함수로 표현하자" (동일)
- "상태 변화에 따라 다시 렌더링하자" (동일)
- **"어디서 실행할지 선택할 수 있게 하자"** (새로운 철학)

---

## 정리

Server Component는 성능 최적화 기술이 아니다.

- 렌더링 책임 분리
- 데이터와 UI의 거리 단축
- React 렌더링 모델의 재설계

### 핵심 메시지

1. **문제의 본질**: CSR/SSR의 문제는 속도가 아니라 **책임의 위치**였다
2. **해결책**: 컴포넌트 실행 위치를 **설계 가능**하게 만듦
3. **효과**: 번들 크기 감소, Hydration 비용 감소, 데이터 접근 최적화
4. **철학**: 기본은 서버, 필요할 때만 클라이언트

Server Component는 React가 **"어디서 실행될지"**를 개발자가 선택할 수 있게 만든, 렌더링 모델의 근본적인 변화다.

---

## 참고: Server Component의 구현

Server Component는 React의 공식 기능이지만,  
실제로 사용하려면 이를 지원하는 프레임워크가 필요하다:

- **Next.js 13+**: App Router에서 기본 지원
- **Remix**: Server Component 지원
- **React Server Components**: 실험적 기능 (프레임워크 없이 직접 사용 가능)

각 프레임워크는 Server Component를 자체 방식으로 구현하지만,  
핵심 개념과 철학은 동일하다.
