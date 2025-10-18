---
title: 자바스크립트 함수(Function) 다시 바라보기
description: 함수 관점에서 이해하는 자바스크립트
date: 2025-03-06 13:00:00 +0900
categories: [Front-End, Fundamentals]
tags: [function, first-class function, closure, hoisting, arrow function, higher-order function, callback, currying, pure function, scope]     # TAG names should always be lowercase
image: /assets/img/javascript-function/preview.png
---

## 0. 들어가기 앞서서

이 글은 '모던 자바스크립트 Deep Dive' 함수 관련 내용과 관련 지식을 학습해보며 정리한 글입니다. 자바스크립트의 기본 문법에 대해서는 설명이 생략되어 있을 수 있습니다.

이 글을 통해서 JavaScript 내에서 함수가 다뤄지는 방법, 선언 방식과 그에 따른 차이, 고차 함수에 대한 설명 등을 통해 Function 이해에 도움이 되실 수 있습니다.

## 1. First Class Object

JavaScript에서 함수는 **일급 객체**입니다. 일급 객체라는 것이 조금 생소하게 느껴질 수도 있는 개념인데요. 함수에 인자로 넣을 수 있거나, 수정하기, 변수에 대입하기와 같은 **연산을 지원하는 경우** 일급 객체라고 부릅니다.

JavaScript에서는 다음과 같은 근거를 통해서 함수가 일급 객체라고 말할수 있습니다.

1. 변수에 할당이 가능하다.
2. 객체의 프로퍼티로 저장이 가능하다.
3. 다른 함수의 인자로 전달이 가능하다.
4. 다른 함수의 반환값으로 사용이 가능하다.
5. 동적인 프로퍼티 생성, 할당이 가능하다.

그리고 이렇게 함수가 일급 객체로써 다뤄지는 프로그래밍 언어는 **'일급 함수를 가진다'** 고 표현합니다. 현대적인 프로그래밍 언어 (JavaScript, Python, Rust)등은 모두 일급 함수를 가지고 있으며, 이로 인해서 함수형 프로그래밍에 특화된 모습을 보입니다.

### 1-1. 일급 함수 구현은 어려워요.

역사적으로 봤을 때, 일급 함수를 구현하는 것은 어려운 일이었습니다. 함수를 인자로 다루거나, 결과로 반환할 때, 주된 어려운 부분은 함수 안에 또 다른 중첩 함수가 있거나, 익명 함수를 사용할 때 발생합니다. 이 내부 함수들은 바깥에 존재하는 변수를 사용하는 경우가 많습니다. 이때, 내부 함수를 다른 곳으로 전달하거나 반환하면, 이 내부 함수가 원래 사용하던 바깥에 존재하는 변수를 어떻게 처리해야 할지가 문제가 됩니다. 이러한 문제를 **funarg 문제**라고 불렀습니다.

이 문제를 해결하기 위해 옛날의 C와 Pascal은 중첩 함수와 비지역 변수를 없애거나, 함수를 반환하는 행위 자체를 막아서 회피하는 식으로 해결했습니다. 그러다 **Scheme**이 **'렉시컬 스코프 + 클로저'** 를 통해서 이 문제를 해결하면서 후에 등장하는 프로그래밍 언어들에게 큰 영향을 주었습니다. 대표적으로 JavaScript도 클로저를 통해서 문제를 해결하고 있습니다.

## 2. 객체로써

돌아와서, JavaScript에서 함수는 **일급 객체**입니다. 정말 객체처럼 생성자 함수로도 만들 수 있습니다.

```js
const add = new Function("x", "y", "return x + y");
```

다만 함수 선언문과 비교했을 때, 클로저를 지원하지 않고 가독성, 유지보수 측면에서 좋지 않기 때문에 많이 사용되지 않는 방법입니다.

## 3. 선언 방식에 따른 호이스팅

JavaScript에서 함수를 나타내는 방법은 **함수 선언문**과 **함수 표현식**이 있습니다.

```js
// 함수 선언문
function add(x, y) {
  return x + y;
}

// 함수 표현식
const sub = function (x, y) {
  return x - y;
};
```

- 함수 선언문과 함수 표현식은 주변 맥락에 따라서 내부적으로 구분되어 해석됩니다.
- 함수 선언문은 `{}` 코드 블록 내에서 구문으로써 존재하고, 함수 표현식은 마치 변수에 값을 할당하는 것처럼 사용되는 모습입니다.

함수 선언문은 또한 **호이스팅**되어 선언문이 등장하기도 전에 호출이 가능하지만, 함수 표현식은 변수에 함수를 할당하는 것으로 실제 할당이 일어나기 전에는 호출이 불가능하다는 차이점이 있습니다.

## 4. 종류별로 조금씩 다른 객체 구성

```js
// 화살표 함수
const a = (x) => x + 1;

// 기명 함수
const b = function c(x) {
  return x + 1;
};

// 익명 함수
const d = function (x) {
  return x + 1;
};
```

### 4-1. 화살표 함수

![](/assets/img/javascript-function/1.webp)

- `length` : 함수가 기대하는 매개변수의 개수
- `name` : 함수의 이름
- `arguments` : 인자 정보에 접근할 수 있는 유사 배열 객체(Array-like Objects)
- `caller` : 현재 실행중인(콜 스택 상 바로 이전)함수의 참조

화살표 함수는 arguments, caller, this, super등이 자체적으로 바인딩되어 있지 않습니다. 해당 프로퍼티들은 일반 함수에서는 함수의 호출 방식에 따라서 동적으로 바인딩되는 값이지만, 화살표 함수는 **정의된 시점의 상위 스코프**를 가리키도록 되어있다는 것이 특징입니다.

이렇게 되면 정의된 시점에 대해서만 생각하므로 정적으로 바인딩을 하는 것인데, 이렇게 설계한 이유는 동적인 바인딩으로 인해 발생할 수 있는 **부수 효과**를 줄이고, **순수 함수**를 사용하는 것이 핵심인 함수형 프로그래밍의 방식과 연관이 있어보입니다.

순수 함수에 대해서는 본문 **8. 순수 함수**에서 추가로 설명하겠습니다.

### 4-2. 기명 함수

![](/assets/img/javascript-function/2.webp)

화살표 함수와 다르게 `arguments`, `caller` 가 자체적인 프로퍼티로 존재하는 모습을 볼 수 있습니다. 또한 `prototype`이 바인딩되어있기 때문에 생성자 함수(`new`)를 사용할 수 있는데, 이는 코드상 혼란이 발생할 수 있어서 잘 사용하지 않습니다.

### 4-3. 익명 함수

![](/assets/img/javascript-function/3.webp)

익명 함수임에도 할당되는 변수명이 name 프로퍼티의 값으로 등록되는 것을 볼 수 있습니다. 단 ES6+ 환경이 아닌 경우 익명 함수의 name은 빈 문자열로 등록됩니다. (name 프로퍼티에 의존하는 코드를 작성하면 문제가 발생할 수 있겠네요.)

## 5. 매개변수의 특성

```js
function foo(a, b) {
  // ...
}
```

기본적으로 function 내에서 a와 b 변수는 별개로 선언되는 것과 같이 동작합니다. 각 매개변수에 들어갈 정보의 경우는 외부 호출 시 넣어주는 것으로 결정됩니다. 전달되는 방법은 크게 두 가지가 있습니다.

1. **원시값의 경우**: 값 자체가 복사되어 전달 (Call by Value)
2. **객체의 경우**: 참조가 복사되어 전달 (Call by Reference)

따라서 원시값이 담긴 매개변수를 다룰 때는 원본의 변경이 일어나지 않지만, 객체를 다루는 경우 원본의 변경이 발생할 수 있어서 주의가 필요합니다.

```js
function modifyValues(a, obj) {
  a = 10; // 원시값 변경 (외부 영향 X)
  obj.prop = "modified"; // 객체 속성 변경 (외부 영향 O)
  obj = { newProp: "new" }; // 새로운 객체 할당 (외부 영향 X)
}
```

`obj.prop`이 외부 영향을 끼치며 수정되는 이유는 함수 내 지역변수에 존재하는 `obj`가 외부에 존재하는 `obj`와 메모리 주소가 같기 때문입니다. 그런데 `obj = { newProp: "new" }`의 경우는 지역변수 내 `obj`의 참조값이 수정되는 것으로 외부 변수에 대한 직접 수정이 아니기 때문에 영향을 주지 않습니다.

## 6. 즉시 실행 함수 표현 (IIFE)

```js
(function () {
  // …
})();

(() => {
  // …
})();

(async () => {
  // …
})();
```

IIFE란, 정의되자마자 즉시 실행되는 함수 표현입니다.

- 실행되고 나서 IIFE 내부 접근이 불가능해지므로, 불필요한 변수로 인한 오염을 방지할 수 있습니다.
- private하게 변수를 사용할 수 있습니다.
- 호이스팅이 되지 않습니다.

IIFE는 본래 `var`가 함수 전체, 전역 스코프에 영향을 끼칠 수 있다는 점 때문에 변수 이름 충돌 및 의도치 않은 수정이 발생하는 것을 막기위해 등장했습니다. 다만 현대 JavaScript 개발에서는 `let`, `const`와 모듈 시스템이 문제를 해결해주기 때문에 IIFE의 중요도는 낮아진 상황입니다.

## 7. 고차 함수 (Higher-Order Function)

고차 함수란, 함수를 **데이터처럼** 다루는 함수로, 다음 조건 중 하나 이상을 만족합니다.

1. 함수를 인자로 받는다.
2. 함수를 결과로 반환한다.

### 7-1. 함수를 인자로 받는 경우 (콜백 함수)

```js
function loggingWith(callback) {
  console.log("작업 시작.");
  callback();
  console.log("작업 끝.");
}
```

다른 함수를 인자로 받아서 사용하는 경우, 고차 함수는 콜백 함수를 자신의 일부분으로 합성할 수 있습니다. 즉, 콜백 함수는 고차 함수에 의해서 호출되는 관계가 됩니다.

```js
const triple = numbers.map((number) => number * 3);
const evens = numbers.filter((number) => number % 2 === 0);
const sum = numbers.reduce((acc, curr) => acc + curr, 0);
```

JavaScript에 내장된 고차 함수들은 콜백 함수를 인자로 넘겨줄 수 있는 경우가 많습니다.

### 7-2. 함수를 결과로 반환하는 경우 (클로저, 커링)

```js
function outerFunction() {
  let outerVar = "Hello";

  function innerFunction() {
    console.log(outerVar); // 내부 함수에서 외부 함수의 변수 접근
  }

  return innerFunction;
}

const myClosure = outerFunction();
myClosure(); // outerFunction 실행이 끝났음에도 outerVar에 접근 가능
```

본문 **1-1**에서 일급 함수 구현의 어려움을 **클로저**를 통해서 해결했다는 내용이 있었습니다. 클로저는 그 함수가 선언될 때 주변 환경(Lexical Environment)를 함께 기억하는 것을 말합니다.

```js
const curriedAdd = (a) => (b) => (c) => a + b + c;

const add1 = curriedAdd(1); // b => c => 1+b+c
const add1and2 = add1(2); // c => 1+2+c
const result = add1and2(3); // 1+2+3
```

클로저를 활용하여 여러 인자를 받는 함수를 **하나의 인자를 받는 함수들의 체인**으로 만드는 기법은 **커링**(currying)이라고 합니다. 실제로는 어떻게 활용할 수 있을까요?

```js
// 1. 커링을 사용하지 않는 경우
function handleClick(id, event) {
  console.log("Clicked item with ID:", id);
  // event 처리
}

<button onClick={(event) => handleClick(1, event)}>Item 1</button>
<button onClick={(event) => handleClick(2, event)}>Item 2</button>

// 2. 커링을 사용하는 경우
function curriedHandleClick(id) {
  return function(event) {
    console.log("Clicked item with ID:", id);
    // event 처리
  };
}

<button onClick={curriedHandleClick(1)}>Item 1</button>
<button onClick={curriedHandleClick(2)}>Item 2</button>
```

이벤트 핸들러에 커링을 활용한 예시입니다. event 객체를 명시적으로 작성하지 않아도 되어서 중복 코드를 줄일 수 있고, 추후 이벤트 처리 로직이 복잡한 경우에도 함수를 조합하여 기능을 확장해 나갈 수 있습니다.

## 8. 순수 함수

**순수 함수**란 동일한 인자가 전달되었을 때, 언제나 동일한 값을 반환하는 함수를 말합니다.

```js
function add(a, b) {
  return a + b;
}

add(1, 2); // 3
add(1, 2); // 3
```

위와 같이 **1, 2**라는 인자를 넣었을때 add 함수는 항상 3을 반환하고 있습니다. 이는 순수 함수입니다. 그렇다면 비순수 함수는 어떤 모습일까요?

```js
let count = 0;

function increase() {
  return ++count;
}

increase(); // 1
increase(); // 2
```

increase 함수는 인자에 변화가 없지만 매 실행마다 다른 결과가 반환되고 있습니다. 외부에 존재하는 count에 의존하여 실제 변경을 수행하기 때문입니다. 상태 변화를 추적하기 어렵고, 그에 따라 테스트하기 어려운 코드가 되기 때문에 비순수 함수를 지양하는 것이 좋습니다.

비순수 함수가 만들어지는 가장 흔한 경우는 인자에 객체가 전달되는 상황입니다. 본문 **5. 매개변수의 특성**에서 언급했듯이, 객체가 전달될 때는 객체 참조가 전달되므로 외부 객체에 변경을 일으킬 수 있습니다. 따라서 [스프레드 연산자](https://ko.javascript.info/rest-parameters-spread#ref-1924) 혹은 [구조 분해 할당](https://ko.javascript.info/destructuring-assignment)을 통해서 값을 가져온 후 사용하는 것이 안전합니다.

```js
function getFullName(person) {
  const { firstName, lastName } = person;
  return `${firstName} ${lastName}`;
}

const person = { firstName: "John", lastName: "Doe" };
const fullName = getFullName(person);
```

## 9. 마치며

단순히 JS의 특성으로 생각했던 클로저가 사실은 함수형 프로그래밍이 마주한 문제를 해결하기 위한 방법 중 하나였다는 사실을 알고나서 언어를 바라보는 시야가 더 넓어지는 것 같습니다. 그리고 함수를 객체로 다루는 개념과 고차 함수를 연관지어 생각해보며 파편화된 지식을 붙여볼 수 있었습니다. 다 계획이 있었군요..!

## 🏷️ References

- [일급 함수 - 위키백과, 우리 모두의 백과사전](https://ko.wikipedia.org/wiki/%EC%9D%BC%EA%B8%89_%ED%95%A8%EC%88%98)
- [Funarg 문제 - 위키피디아](https://en.wikipedia.org/wiki/Funarg_problem)
- [IIFE - MDN Web Docs 용어 사전: 웹 용어 정의 MDN](https://developer.mozilla.org/ko/docs/Glossary/IIFE)
