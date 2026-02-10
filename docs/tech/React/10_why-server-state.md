---
sidebar_position: 10
title: 왜 우리는 전역 상태 관리에서 서버 상태 관리로 이동했을까
---

# 왜 우리는 전역 상태 관리에서 서버 상태 관리로 이동했을까

React를 처음 배울 때 우리는 이렇게 배운다.

> "상태는 위로 끌어올리고, 전역으로 공유해야 한다"

그래서 자연스럽게 Redux, MobX, Recoil 같은 **전역 상태 관리**를 도입한다.  
그런데 어느 순간부터 이런 질문이 생긴다.

- 왜 API 데이터까지 전역 상태로 관리하고 있지?
- 왜 새로고침하면 상태가 다 날아가지?
- 왜 로딩 / 에러 / 재요청 로직이 매번 반복되지?

이 지점에서 **서버 상태(Server State)** 라는 개념이 등장한다.

---

## 클라이언트 상태와 서버 상태는 본질적으로 다르다

React에서 다루는 상태는 크게 두 종류로 나뉜다.

### 클라이언트 상태 (Client State)

- UI를 위해 존재한다
- 사용자의 의도에 의해 바뀐다
- 애플리케이션 내부에서만 의미를 가진다

예:

- 모달 열림 여부
- 탭 선택 상태
- 폼 입력 값

```js
const [isOpen, setIsOpen] = useState(false);
```

이 상태는 **서버와 아무 상관이 없다.**

---

### 서버 상태 (Server State)

- 서버에 진짜 소스가 있다 (Single Source of Truth)
- 내가 바꾸지 않아도 변할 수 있다
- 항상 최신이라는 보장이 없다

예:

- 사용자 목록
- 게시글 상세 데이터
- 알림 리스트

```js
fetch("/api/users");
```

이 데이터의 주인은 React가 아니라 **서버**다.

---

## 전역 상태 관리로 서버 상태를 다루면 생기는 문제

많은 프로젝트에서 이런 코드를 본 적 있을 거다.

```js
dispatch(fetchUsers());
```

그리고 reducer 안에는:

- loading
- success
- error
- data

이 모든 게 들어 있다.

### 문제 1: 상태의 책임이 섞인다

전역 상태는 원래 이런 걸 잘한다.

- UI 상태 공유
- 사용자 액션에 따른 상태 변화

하지만 서버 상태는:

- 언제 만료되는지
- 다시 요청해야 하는지
- 다른 컴포넌트에서 이미 요청했는지

같은 **시간과 동기화의 문제**를 가진다.

Redux는 이걸 기본으로 제공하지 않는다.

#### 실제 코드 예시: Redux로 서버 상태 다루기

```js
// Redux Store
const initialState = {
  users: [],
  isLoading: false,
  error: null,
  lastFetched: null,
};

function usersReducer(state = initialState, action) {
  switch (action.type) {
    case "FETCH_USERS_START":
      return { ...state, isLoading: true, error: null };
    case "FETCH_USERS_SUCCESS":
      return {
        ...state,
        users: action.payload,
        isLoading: false,
        lastFetched: Date.now(),
      };
    case "FETCH_USERS_ERROR":
      return { ...state, isLoading: false, error: action.payload };
    default:
      return state;
  }
}

// Thunk Action
function fetchUsers() {
  return async (dispatch) => {
    dispatch({ type: "FETCH_USERS_START" });
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      dispatch({ type: "FETCH_USERS_SUCCESS", payload: data });
    } catch (error) {
      dispatch({ type: "FETCH_USERS_ERROR", payload: error.message });
    }
  };
}

// 컴포넌트에서 사용
function UserList() {
  const dispatch = useDispatch();
  const { users, isLoading, error } = useSelector((state) => state.users);

  useEffect(() => {
    // 캐시 만료 체크를 직접 구현해야 함
    const lastFetched = useSelector((state) => state.users.lastFetched);
    const CACHE_DURATION = 5 * 60 * 1000; // 5분

    if (!lastFetched || Date.now() - lastFetched > CACHE_DURATION) {
      dispatch(fetchUsers());
    }
  }, [dispatch]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return <div>{/* users 렌더링 */}</div>;
}
```

이 코드의 문제점:

- 캐시 만료 로직을 **매번 직접 구현**해야 함
- 다른 컴포넌트에서 같은 데이터를 요청하면 **중복 요청** 발생
- 데이터가 만료되었는지 확인하는 로직이 **분산**됨

---

### 문제 2: 캐싱 전략이 없다

전역 상태에 저장된 서버 데이터는:

- 캐시인지?
- 최신인지?
- 다시 요청해야 하는지?

에 대한 정보가 없다.

그래서 결국 이런 코드가 늘어난다.

```js
// ❌ 나쁜 예: 빈 배열 체크만으로 캐싱 판단
if (!users.length) {
  dispatch(fetchUsers());
}

// ❌ 조금 나은 예: 하지만 여전히 불완전함
const CACHE_TIME = 5 * 60 * 1000;
if (!users.length || Date.now() - lastFetched > CACHE_TIME) {
  dispatch(fetchUsers());
}

// ❌ 문제: 다른 컴포넌트에서 이미 요청 중인지 모름
// → 같은 API를 여러 번 호출하게 됨
```

이건 캐싱이 아니라 **우연히 동작하는 조건문**이다.

#### 실제 문제 상황

```js
// Header 컴포넌트
function Header() {
  const dispatch = useDispatch();
  const users = useSelector((state) => state.users);

  useEffect(() => {
    if (!users.length) {
      dispatch(fetchUsers()); // 요청 1
    }
  }, []);

  return <div>User: {users[0]?.name}</div>;
}

// Sidebar 컴포넌트 (같은 화면에 렌더링됨)
function Sidebar() {
  const dispatch = useDispatch();
  const users = useSelector((state) => state.users);

  useEffect(() => {
    if (!users.length) {
      dispatch(fetchUsers()); // 요청 2 (중복!)
    }
  }, []);

  return <div>{users.length} users</div>;
}

// 결과: 같은 API를 2번 호출하게 됨
```

이런 중복 요청은:

- 서버 부하 증가
- 불필요한 네트워크 트래픽
- 사용자 경험 저하 (로딩 상태가 여러 번 나타남)

---

### 문제 3: 비동기 상태가 기하급수적으로 늘어난다

API 하나당 필요한 상태:

- data
- isLoading
- isError
- error

API가 10개면 상태는 최소 40개다.

그리고 이 로직은…  
**모든 화면에서 반복된다.**

#### 실제 코드 예시: 상태 폭증

```js
// Redux Store - API가 많아질수록 상태가 폭증
const initialState = {
  // Users API
  users: [],
  usersLoading: false,
  usersError: null,

  // Posts API
  posts: [],
  postsLoading: false,
  postsError: null,

  // Comments API
  comments: [],
  commentsLoading: false,
  commentsError: null,

  // Notifications API
  notifications: [],
  notificationsLoading: false,
  notificationsError: null,

  // ... API가 10개면 상태가 40개로 늘어남
};

// 각 API마다 비슷한 reducer 로직 반복
function usersReducer(state, action) {
  switch (action.type) {
    case "FETCH_USERS_START":
      return { ...state, usersLoading: true, usersError: null };
    case "FETCH_USERS_SUCCESS":
      return { ...state, users: action.payload, usersLoading: false };
    case "FETCH_USERS_ERROR":
      return { ...state, usersLoading: false, usersError: action.payload };
    // ... 같은 패턴 반복
  }
}

function postsReducer(state, action) {
  switch (action.type) {
    case "FETCH_POSTS_START":
      return { ...state, postsLoading: true, postsError: null };
    // ... 거의 동일한 로직
  }
}
```

이런 반복 코드는:

- 보일러플레이트 코드 증가
- 실수 가능성 증가 (타입 오타, 상태 이름 불일치)
- 유지보수 어려움

---

## 서버 상태 관리 라이브러리가 해결하려는 문제

React Query, SWR 같은 라이브러리는 질문을 이렇게 바꾼다.

> "이 데이터를 어떻게 저장할까?"  
> → "이 데이터는 언제 신뢰할 수 있을까?"

---

### 서버 상태 관리의 핵심 책임

서버 상태 관리 라이브러리는 다음을 기본으로 제공한다.

- 캐싱
- 중복 요청 제거
- 자동 리페치
- 로딩 / 에러 상태 표준화
- 서버와의 동기화

```js
const { data, isLoading, error } = useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,
});
```

이 한 줄에 담긴 의미는 생각보다 크다.

#### React Query가 자동으로 처리하는 것들

```js
// 1. 자동 캐싱
// 같은 queryKey로 요청하면 캐시된 데이터를 즉시 반환
const { data: users1 } = useQuery({ queryKey: ["users"], queryFn: fetchUsers });
const { data: users2 } = useQuery({ queryKey: ["users"], queryFn: fetchUsers });
// users1과 users2는 같은 데이터 (중복 요청 없음)

// 2. 자동 리페치
useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,
  staleTime: 5 * 60 * 1000, // 5분간 fresh
  cacheTime: 10 * 60 * 1000, // 10분간 캐시 유지
  refetchOnWindowFocus: true, // 창 포커스 시 자동 리페치
  refetchOnReconnect: true, // 네트워크 재연결 시 자동 리페치
});

// 3. 로딩/에러 상태 자동 관리
const { data, isLoading, isError, error } = useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,
});
// isLoading, isError, error가 자동으로 관리됨

// 4. 중복 요청 제거
// 같은 queryKey로 여러 컴포넌트에서 동시에 요청해도
// 실제로는 한 번만 요청하고 결과를 공유
function ComponentA() {
  const { data } = useQuery({ queryKey: ["users"], queryFn: fetchUsers });
  // 요청 발생
}

function ComponentB() {
  const { data } = useQuery({ queryKey: ["users"], queryFn: fetchUsers });
  // 같은 요청이지만 중복 요청 없이 캐시 사용
}
```

#### Redux vs React Query 비교

**Redux 방식 (수동 관리):**

```js
// Redux: 모든 것을 수동으로 구현해야 함
function UserList() {
  const dispatch = useDispatch();
  const { users, isLoading, error, lastFetched } = useSelector(
    (state) => state.users,
  );

  useEffect(() => {
    const CACHE_TIME = 5 * 60 * 1000;
    const shouldFetch =
      !users.length || !lastFetched || Date.now() - lastFetched > CACHE_TIME;

    if (shouldFetch) {
      dispatch(fetchUsers());
    }
  }, [dispatch, users.length, lastFetched]);

  // 포커스 시 리페치를 원하면?
  useEffect(() => {
    const handleFocus = () => {
      dispatch(fetchUsers());
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [dispatch]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  return <div>{/* users 렌더링 */}</div>;
}
```

**React Query 방식 (자동 관리):**

```js
// React Query: 선언적으로 설정만 하면 자동 처리
function UserList() {
  const {
    data: users,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  return <div>{/* users 렌더링 */}</div>;
}
```

코드가 **훨씬 간결**하고, **자동으로 최적화**된다.

---

## 왜 이제는 서버 상태를 분리해서 생각해야 할까

### 1. React는 상태 관리 라이브러리가 아니다

React는:

- 상태를 저장한다
- 상태 변경 시 다시 렌더링한다

하지만:

- 언제 최신인지
- 언제 다시 요청할지

같은 문제는 다루지 않는다.

이건 React의 책임이 아니다.

---

### 2. 서버 상태는 UI 상태가 아니다

서버 상태는:

- 여러 화면에서 공유된다
- 화면이 사라져도 유지되어야 한다
- 새로고침 후에도 다시 복구된다

이 특성은 전역 UI 상태와 완전히 다르다.

---

### 3. SSR / Next.js 환경에서 더 중요해진다

SSR 환경에서는:

- 서버에서 이미 데이터를 가져온다
- 클라이언트에서는 그 데이터를 재사용해야 한다

서버 상태 관리가 없다면:

- 같은 요청을 서버와 클라이언트에서 두 번 한다
- 데이터 일관성이 깨진다

React Query의 hydration은 이 문제를 정확히 겨냥한다.

#### SSR에서의 서버 상태 관리 예시

**문제 상황: Redux로 SSR 구현**

```js
// 서버에서 데이터 가져오기
async function getServerSideProps() {
  const users = await fetchUsers();
  return {
    props: {
      initialUsers: users,
    },
  };
}

// 클라이언트에서 Redux Store 초기화
function App({ initialUsers }) {
  const dispatch = useDispatch();

  useEffect(() => {
    // 서버에서 받은 데이터를 Redux에 넣기
    dispatch({ type: "SET_USERS", payload: initialUsers });
  }, [dispatch, initialUsers]);

  // 하지만 컴포넌트는 이미 마운트된 후...
  // → 서버 데이터와 클라이언트 상태가 불일치할 수 있음
}
```

**해결: React Query의 hydration**

```js
// 서버에서 데이터 가져오기
async function getServerSideProps() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
}

// 클라이언트에서 hydration
function App({ dehydratedState }) {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={dehydratedState}>
        {/* 서버에서 가져온 데이터가 자동으로 캐시에 들어감 */}
        {/* 클라이언트에서 같은 queryKey로 요청하면 즉시 반환 */}
        <UserList />
      </Hydrate>
    </QueryClientProvider>
  );
}

function UserList() {
  // 서버에서 가져온 데이터를 즉시 사용 가능
  // 추가 요청 없이 캐시된 데이터 사용
  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  return <div>{/* users 렌더링 */}</div>;
}
```

이렇게 하면:

- 서버에서 가져온 데이터를 클라이언트에서 재사용
- 불필요한 중복 요청 방지
- 서버와 클라이언트 데이터 일관성 보장

---

## 이제 전역 상태 관리는 어디에 쓰는 게 맞을까

전역 상태 관리가 사라지는 건 아니다.

다만 역할이 명확해졌다.

### 전역 상태 관리에 어울리는 것

- 인증 정보 (로그인 여부)
- 테마
- 언어
- UI 전역 설정
- 모달 열림/닫힘 상태
- 사이드바 토글 상태

**특징:** 클라이언트에서만 존재하고, 서버와 동기화할 필요가 없는 상태

```js
// ✅ 전역 상태 관리가 적합한 예시
const [theme, setTheme] = useState("light");
const [isSidebarOpen, setIsSidebarOpen] = useState(false);
const [selectedLanguage, setSelectedLanguage] = useState("ko");

// 이 상태들은:
// - 서버에 저장할 필요 없음
// - 새로고침 후 초기화되어도 됨
// - 사용자의 UI 선호도일 뿐
```

### 서버 상태 관리에 어울리는 것

- API로 가져오는 모든 데이터
- 목록 / 상세 / 통계
- 서버가 소스인 데이터
- 사용자 프로필 정보
- 게시글 목록
- 댓글 목록
- 알림 목록

**특징:** 서버가 Single Source of Truth이고, 캐싱/동기화가 필요한 데이터

```js
// ✅ 서버 상태 관리가 적합한 예시
const { data: users } = useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,
});

const { data: post } = useQuery({
  queryKey: ["post", postId],
  queryFn: () => fetchPost(postId),
});

// 이 데이터들은:
// - 서버가 진짜 소스
// - 다른 사용자가 변경할 수 있음
// - 캐싱과 자동 리페치가 필요함
```

### 애매한 경우: 어떻게 판단할까?

**질문 1: 이 데이터의 진짜 주인은 누구인가?**

```js
// ❌ 클라이언트가 주인 → 전역 상태
const [draftPost, setDraftPost] = useState({ title: "", content: "" });
// 아직 저장하지 않은 임시 데이터

// ✅ 서버가 주인 → 서버 상태
const { data: savedPost } = useQuery({
  queryKey: ["post", postId],
  queryFn: () => fetchPost(postId),
});
// 이미 저장된 데이터
```

**질문 2: 이 데이터가 만료될 수 있는가?**

```js
// ❌ 만료 없음 → 전역 상태
const [isModalOpen, setIsModalOpen] = useState(false);
// 모달 상태는 만료 개념이 없음

// ✅ 만료 가능 → 서버 상태
const { data: notifications } = useQuery({
  queryKey: ["notifications"],
  queryFn: fetchNotifications,
  staleTime: 1 * 60 * 1000, // 1분 후 만료
});
// 알림은 계속 업데이트됨
```

**질문 3: 다른 화면에서도 이 데이터가 필요한가?**

```js
// ❌ 특정 화면에만 필요 → 로컬 상태
const [formData, setFormData] = useState({});
// 폼 데이터는 해당 폼에만 필요

// ✅ 여러 화면에서 공유 → 서버 상태
const { data: currentUser } = useQuery({
  queryKey: ["currentUser"],
  queryFn: fetchCurrentUser,
});
// 현재 사용자 정보는 여러 곳에서 사용됨
```

---

## 실제 마이그레이션 예시

기존 Redux 코드를 React Query로 마이그레이션하는 예시를 보자.

### Before: Redux로 구현

```js
// Redux Store
const initialState = {
  users: [],
  isLoading: false,
  error: null,
  lastFetched: null,
};

// Redux Actions
const FETCH_USERS_START = "FETCH_USERS_START";
const FETCH_USERS_SUCCESS = "FETCH_USERS_SUCCESS";
const FETCH_USERS_ERROR = "FETCH_USERS_ERROR";

// Redux Thunk
function fetchUsers() {
  return async (dispatch) => {
    dispatch({ type: FETCH_USERS_START });
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      dispatch({ type: FETCH_USERS_SUCCESS, payload: data });
    } catch (error) {
      dispatch({ type: FETCH_USERS_ERROR, payload: error.message });
    }
  };
}

// 컴포넌트
function UserList() {
  const dispatch = useDispatch();
  const { users, isLoading, error } = useSelector((state) => state.users);

  useEffect(() => {
    const lastFetched = useSelector((state) => state.users.lastFetched);
    const CACHE_TIME = 5 * 60 * 1000;

    if (!lastFetched || Date.now() - lastFetched > CACHE_TIME) {
      dispatch(fetchUsers());
    }
  }, [dispatch]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {users.map((user) => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

### After: React Query로 마이그레이션

```js
// API 함수 (순수 함수)
async function fetchUsers() {
  const response = await fetch("/api/users");
  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }
  return response.json();
}

// 컴포넌트
function UserList() {
  const {
    data: users,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    staleTime: 5 * 60 * 1000, // 5분간 fresh
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {users?.map((user) => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

**개선된 점:**

- 코드 라인 수: ~50줄 → ~20줄
- 보일러플레이트 제거: reducer, action, thunk 불필요
- 자동 캐싱: 수동 캐시 로직 제거
- 중복 요청 방지: 자동으로 처리
- 타입 안정성: TypeScript와 함께 사용 시 더 나은 타입 추론

## 성능 및 개발자 경험 비교

### 개발 생산성

| 항목           | Redux                                 | React Query               |
| -------------- | ------------------------------------- | ------------------------- |
| 초기 설정      | 복잡 (store, reducer, action, thunk)  | 간단 (QueryClient만 설정) |
| API 하나 추가  | ~50줄 코드 (reducer + action + thunk) | ~5줄 코드 (useQuery만)    |
| 캐싱 로직      | 수동 구현 필요                        | 자동 제공                 |
| 중복 요청 방지 | 수동 구현 필요                        | 자동 제공                 |
| 리페치 전략    | 수동 구현 필요                        | 선언적 설정               |

### 런타임 성능

| 항목              | Redux          | React Query           |
| ----------------- | -------------- | --------------------- |
| 중복 요청         | 발생 가능      | 자동 제거             |
| 불필요한 리렌더링 | 발생 가능      | 최적화됨              |
| 메모리 사용       | 모든 상태 유지 | 만료된 캐시 자동 정리 |
| 네트워크 요청     | 수동 관리      | 자동 최적화           |

## 정리

전역 상태 관리에서 서버 상태 관리로 이동한 이유는 단순한 유행이 아니다.

- 서버 상태는 본질적으로 다르다
- 전역 상태는 그 문제를 풀기 어렵다
- React 생태계가 그 한계를 인정했다

이제 중요한 질문은 이거다.

> "이 상태의 진짜 주인은 누구인가?"

그 질문에 서버라고 답한다면,  
그건 전역 상태가 아니라 **서버 상태**다.

### 핵심 요약

1. **클라이언트 상태**: React state나 전역 상태 관리로 충분
2. **서버 상태**: React Query, SWR 같은 서버 상태 관리 라이브러리 사용
3. **구분 기준**: 데이터의 진짜 주인이 누구인가?
4. **결과**: 코드가 간결해지고, 성능이 향상되며, 유지보수가 쉬워짐
