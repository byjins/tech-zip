---
sidebar_position: 2
title: Best Programmer
---

# 들어가며

최근,어떤 저자가 본인이 생각한 좋은 개발자의 역량([`The Best Programmers I Know`](https://endler.dev/2025/best-programmers/))에 대한 글을
작성했는데 서버가 터질정도로 인기가 많았었다고 해서 한번 읽어보았습니다.

저도 일을 하면서 실력있는 주니어, 시니어 개발자가 되기 위해선 어떻게 해야할까? 내가 지금 잘하고 있는걸까? 에 대한 고민을 정말 많이 했고 좋은 개발자란 무엇일까에 대한 궁금증이 있었습니다.

아마 같은 고민을하고 있는 개발자들에게 많은 도움이 될 것 같습니다.

지금부터 하나씩 알아가보며 느낀점을 한번 작성해보려고 합니다.

> 번역이 매끄럽지 않을 수 있습니다..!

## 공식 문서를 읽어라

[Read the Reference](https://endler.dev/2025/best-programmers/#read-the-reference)

> Don’t go to Stack Overflow, don’t ask the LLM, don’t guess, just go straight to the source. Oftentimes, it’s
> surprisingly accessible and well-written.

> Stack Overflow에 가지 말고, LLM에게 묻지도 말고, 추측도 하지 마라.
> **그냥 바로 소스(source)** 로 가라.
> 대부분의 경우, 생각보다 접근하기 쉽고 잘 정리되어 있다.

나도 최근까진 공식문서를 잘 보지 않았다. 공식문서는 보통 영어로 되어있어 읽지 못하는데 번역을 돌렸을 땐 한국어가 매끄럽지 않고, 이해하기 쉽지않아 읽기를 포기했다.

그래서 google에 에러난걸 그대로 복붙해서 검색해서 블로그를 참고하고, stack overflow를 참고하고, LLM(ChatGPT)에 의존하며 개발을 했다. 왜냐면 내가 많은 시간을 들이지 않고 빠른 시간내에
해결할 수 있기 때문이였다.

지금 생각해보면 비슷한 문제가 발생했을 때 이 문제가 왜, 어디서 발생했는지 근본적인 문제를 모르니 또 검색하고.. 또 복붙하게 된다. 결국 내가 사용하는 기술에 대해서 이해하고 사용하기보단 단순히
동작되면 끝인 개발을 했던 것이다.

이렇게 개발을 하게되면 발전할 수 없고 성장할 수 없다. 내가 사용하는 기술에 대해서 아무것도 모르면서 사용한다는게 말이 될까? 공식문서를 보는 개발자와 그렇지 않은 개발자는 지식의 디테일 자체가 다를 것이다.

## 도구를 깊게 이해하자

[Know Your Tools Really Well](https://endler.dev/2025/best-programmers/#know-your-tools-really-well)

> To know a tool well, you have to know: its history... its present... its limitations... its ecosystem...

> 도구를 제대로 알기 위해선 그 도구의 역사, 현재 상태, 한계점, 생태계에 대해 알아야 한다.

위에 있는 `공식문서를 읽자`와 비슷한 내용이다. 내가 사용하는 도구(기술)에 대해서 이 도구는 어떤 문제를 해결하기 위해 나왔으며 어떻게 해결을 했는지
, 현재 상태는 어떤지, 한계점은 무엇인지, 어떤 생태계인지를 이해하고 사용해야 한다. 단순히 사용만 해선 안된다.

도구의 사용 이유와 철학에 대해 고민하는 태도를 가져보자.

## 에러메시지를 읽어라

[Read The Error Message](https://endler.dev/2025/best-programmers/#read-the-error-message)

> Just by reading the error message, you can fix most of the problems on your own.

> 에러 메시지만 잘 읽으면 대부분의 문제는 스스로가 해결할 수 있다.

맞는 말이다. 보통 개발자 커리어를 막 시작한 주니어, 또는 이제 교육을 듣는 개발자에 입문하는 사람들을 보면 일부는 에러가 발생했을 때 에러메시지를 읽지 않고 그대로 LLM, 커뮤니티에 질문하고 구글에 검색한다.
물론 나쁜건아니다. 그런데 에러메시지를 읽기만해도 해결할 수 있는 것들이 있다. 그런 것들 조차 본인이 해결하지 않고 남에게 힘을 빌려 "해결해줘" 라는 마인드가 잘못된 것이다.

인프런이라는 사이트에서 일부 강의를 보면 스스로 해결할 수 있는 문제를 에러 메시지를 읽지도 않고 그대로 캡처, 복붙해서 질문게시판에 올린다.
프로그래밍은 문제를 해결하는 과정의 반복이다. 스스로 해결해보려고하고 고민해보는 습관과 자세가 필요하다.

## 문제를 분석하고 해결하자

[Break Down Problems](https://endler.dev/2025/best-programmers/#break-down-problems)

> There are problems in this world that are too hard to solve at once for anyone involved ... breaking down problems

> 세상에는 어느 누구도 한 번에 해결할 수 없는 문제들이 있다... 그래서 **문제를 쪼개는 것(breaking down problems)** 이 중요하다.

너무 큰 문제는 한번에 많은걸 해결하려고하면 코드가 복잡해지고 거대해진다. 흔히 말하는 단일 책임 원칙(SRP)을 지키지 않는 코드가 된다.
물론 이걸 지키지 않는다고 큰일이 나거나 그러지는 않는다. 그리고 단일 책임 원칙을 지킨다고해서 모든게 완벽해지지는 않을 것 같다. 너무 잘게 나누면 오히려 복잡해질 수 있다고 생각한다.

하지만 결국 어떤 거대한 문제를 분석하고 이해하기 쉽게 나누어 해결해야한다. 그러다보면 함수가 작아지고, 책임이 명확해지고 가독성이 올라간다.

## 두려움 없이 손을 더럽혀라

[Don’t Be Afraid To Get Your Hands Dirty](https://endler.dev/2025/best-programmers/#don-t-be-afraid-to-get-your-hands-dirty)

> The best devs I know read a lot of code and they are not afraid to touch it. They never say “that’s not for me” or “I
> can’t help you here.” Instead, they just start and learn.

> 내가 아는 최고의 개발자들은 코드를 많이 읽고, 주저하지 않고 직접 손을 댄다.
> 그들은 절대 “그건 내 일이 아니야” 혹은 “여긴 내가 도와줄 수 없어”라고 말하지 않는다.
> 대신 그냥 시작하고, 배우기 시작한다.

이 부분은 조금 반성하게 된다. 나는 누군가 나에게 도움을 요청하거나, 누군가 어려움에 처해있을때 내 분야가 아니라면 잘 모른다, 해본적이 없어서 모르겠다. 라는 식으로 말을 하며 아무 행동도 하지 않았다.

내가 알지 못하는 분야인데 내가 어떤 도움이 될까 싶었다. 하지만 저자가 생각하는 최고의 개발자는 그런 사람이 아니였다. 그냥 시작하고 배우고 내 것으로 만든다. 코드는 그냥 코드일 뿐이다.

시행착오를 겪는 것 자체가 성장이고 배움이다.

## 남을 도와라

[Always Help Others](https://endler.dev/2025/best-programmers/#always-help-others)

> Great engineers are in high demand and are always busy, but they always try to help.

> 뛰어난 엔지니어들은 수요가 많고 항상 바쁘지만, 항상 도우려는 노력을 잊지 않는다.

최고의 배움과 성장은 무언가를 만들어보는것과 남을 도와주는 것이라고 생각한다. 무언가를 만들어보는 것은 위의 두려움없이 손을 더렵혀라에서 나온다.

그렇다면 남을 도와주는 것이 왜 배움과 성장이 있을까? 나는 이렇게 생각한다. 누군가에게 도움을 주는 것은 내가 알고있는 것들을 알려주기 위한 것이다. 그때 어떻게 해야
더 쉽고 이해하기 쉬울까? 내가 알고있는 개념이 틀리진 않았을까 하며 다시 한번 생각을 정리하게 된다.

이것은 단순히 지식의 습득이 아닌 개념을 구조화하며 생각을 하게되는 사고훈련이다.

## 글을 써라

[Write](https://endler.dev/2025/best-programmers/#write)

> All the best engineers I know have good command over at least one human language – often more.
> their coding style will be too.

> 내가 아는 최고의 엔지니어들은 적어도 하나 이상의 인간 언어를 잘 다룰 줄 안다 — 보통은 그 이상이다. 그들의 코딩 스타일 역시 그러하다.

글을 잘 쓴다는 것은 생각을 잘 정리할 줄 아는 것이다. 그것은 코드를 작성할 때에도 보인다. 정말 잘하는 개발자들이 작성하는 글을 보면 읽기 편하다. 그만큼 잘 정리되어있는 글이다.

글쓰기는 커뮤니케이션 능력, 사고력, 설계력, 문제해결능력 모두를 키워주는 연습이다.

나는 글을 잘 못쓴다.. 그래서 글쓰기를 연습하기 위해 블로그를 작성하고 있다..

## 끊임없이 배워라

[Never Stop Learning](https://endler.dev/2025/best-programmers/#never-stop-learning)

> Some of the best devs I know are 60+ years old.
> Because they keep learning.

> 내가 아는 최고의 개발자들은 60세가 넘었지만, 그들은 계속 배우고 있기 때문에 최고다.

개발자로 오래 살아남기 위해선 배워야한다. 기술은 계속 발전하고 변하기 때문이다. 배우지 않으면 도태된다.

끊임없이 배움과 동시에 호기심과 기술을 대하는 태도 또한 갖춰야한다.

## 지위와 관계없이 배워라

[Status Doesn’t Matter](https://endler.dev/2025/best-programmers/#status-doesn-t-matter)

> The best devs talk to principal engineers and junior devs alike. There is no hierarchy.

> 최고의 개발자들은 수석 엔지니어와 주니어 개발자 모두와 이야기한다. 그들에게는 위계가 없다.

시니어에게선 오랜 경험에서 나오는 노하우, 스킬을 배울 수 있을 것이고 주니어에게는 새로운 아이디어, 새로운 관점, 최신 기술 동향 등..을 듣고 배울 수 있을 것 같다.

계급, 직급은 중요하지 않다. 서로에게 도움이 되는것이 있다면 알려주고 이끌어주고 배우면 된다.

당연히 시니어 입장에선 주니어에게 배울게 없을 수도 있다. 그렇다해서 무시하지말고 서로 성장하는 환경을 만드는게 중요할 것 같다.

## 명성을 쌓아라

[Build a Reputation](https://endler.dev/2025/best-programmers/#build-a-reputation)

> You can be a solid engineer if you do good work, but you can only be one of the best if you’re known for your good work

> 좋은 일을 꾸준히 해내면 훌륭한 엔지니어가 될 수 있다. 하지만 당신의 좋은 일이 널리 알려질 때만 최고의 엔지니어가 될 수 있다.

이 글에서 핵심은 내가 한 일에 대해 알려지는 것이 중요한 이유에 대해 설명한다. 단지 유명해지는 것이 아니다.

개인 브랜딩을 통한 신뢰를 얻을 수 있는 구조를 만들어 놓자!

## 인내심을 가져라

[Have Patience](https://endler.dev/2025/best-programmers/#have-patience)

> You need patience with computers and humans. Especially with yourself.
> That’s what separates the best from the rest.

> 당신은 컴퓨터와 사람, 자신에 대해 인내심을 가져야한다.
> 그것이 최고의 개발자를 가르는 기준이다.

개발자라는 직업은 인내심이 정말 많이 필요하다. 개발적으로도, 협업으로도 그렇다. 개발자는 끈기가 있어야한다.

포기하지않고 수많은 시행착오를 통해 성장한다. 끈기가 없다면 포기할 수 밖에 없는 직업인 것 같다.

## 컴퓨터 탓을 하지 마라

[Never Blame the Computer](https://endler.dev/2025/best-programmers/#never-blame-the-computer)

> Most developers blame the software, other people, their dog, or the weather for flaky, seemingly “random” bugs. The best devs don’t.

> 대부분의 개발자들은 불안정하고 “랜덤”해 보이는 버그를 소프트웨어, 다른 사람, 자기 강아지, 심지어 날씨 탓으로 돌린다. 하지만 최고의 개발자들은 그렇게 하지 않는다.

컴퓨터는 죄가 없다. 감정적으로 에러를 내지 않는다.

컴퓨터는 내가 입력한대로 돌아가는 기계일뿐이다! 논리적인 오류를 찾고 해결하자.

## 모른다는 말을 두려워 하지마라

[Don’t Be Afraid to Say “I Don’t Know”](https://endler.dev/2025/best-programmers/#don-t-be-afraid-to-say-i-don-t-know)

> If you are afraid to say “I don’t know”, you come from a position of hubris or defensiveness. Once you accept that, you allow yourself to learn.

> “모른다고 말하는 것을 두려워한다면, 당신은 자만심이나 방어적인 태도에서 출발한 것이다. 그것을 받아들이는 순간, 비로소 배울 수 있게 된다.”

내가 느끼기엔 대한민국에선 모른다는 말을 했을 때 무시하는 경향이 더 많은 것 같다. 그렇기에 사람들은 부끄럽지 않기 위해 방어적인 태도를 가지게 된다.

나도 아직은 무언가에 대해 모른다고 말할 때 두려운 감정이 앞선다. 하지만 부끄러워하지 않는다. 모름을 인정하고 받아들이고 배우면 된다. 내 것으로 만들면 된다.

## 추측 하지마라

[Don't Guess](https://endler.dev/2025/best-programmers/#don-t-guess)

> In the Face of Ambiguity, Refuse the Temptation to Guess

> 애매모호함 앞에서, 추측하려는 유혹을 거부하라.

가장 첫 번째 파트 **공식 문서를 읽자** 에서 나온 말이 있다.
`don’t guess, just go straight to the source`

나는 옛날에 추측을 정말 많이 했다.

예를 들면 어떤 코드를 보고 대충 이렇게 동작하겠지, 예전에 이렇게 했었는데 뭐 이렇게 하면 되겠지, 다른사람이 대충 이렇게 해서 됐다는데 되겠지 뭐.. 이런식의 해결방법 말이다.

하지만 지금은 추측하기를 하지 않기위해 노력중이다. 라이브러리, 코드에도 왜 이걸 사용하고 이렇게 로직을 작성했는지 근거를 찾기 위해 노력한다.

## 단순하게 유지해라

[Keep it Simple](https://endler.dev/2025/best-programmers/#keep-it-simple)

> Clever engineers write clever code. Exceptional engineers write simple code. That’s because most of the time, simple is enough

> 영리한 엔지니어들은 영리한 코드를 작성한다. 특출한 엔지니어들은 간단한 코드를 작성한다. 그 이유는 대부분의 경우, 간단한 것이 충분하기 때문이다.

단순함이 필요하다. 초보 개발자들은 단순한걸 복잡하게 만들고, 고수는 어려운걸 쉽게 만든다.

단순하게 작성되어있는 코드는 고민을 하지 않고 작성한 코드인가? 과연 그 코드를 작성한 사람이 실력이 없는 개발자일까?

오히려 복잡하지 않고 누가봐도 이해할 수 있도록 단순하다면 생각을 많이 한 코드는 아닐까? 라는 생각이 든다.

# 마무리

> The above is not a checklist or a competition; and great engineering is not a race.
> Just don’t trick yourself into thinking that you can skip the hard work. There is no shortcut. Good luck with your journey.

> 위의 내용은 체크리스트나 경쟁이 아니다; 훌륭한 엔지니어링은 경주가 아니다.
> 그저 힘든 일을 생략할 수 있다고 자신을 속이지 마라.
> 지름길은 없다.

좋은 개발자의 역량 15가지에 대해 알아보았다.

읽으면서 많은 생각이 들었다. 정말 어렵지 않고 너무나 당연하고 기본적인 것들이었다.

나는 좋은 개발자가 되기 위해서는 엄청난 재능, 엄청난 명예, 엄청난 기술 스킬이 필요하다고 생각하고 있었다.

하지만 내 생각은 변했다. 유명하지 않더라도, 압도적으로 뛰어난 기술 스킬이 없어도, 개발자라는 직업에서 한 획을 긋지 못하더라도 좋은 개발자는 충분히 될 수 있다.

그저 기본적인 것들을 지켜가며 성장하고 앞으로 나아가자.
