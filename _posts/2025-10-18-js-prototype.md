---
title: 자바스크립트는 왜 프로토타입을 선택했을까?
description: 자바스크립트가 프로토타입 기반 언어가 된 역사적, 기술적 배경을 정리했습니다.
date: 2025-10-18 20:40:00 +0900
categories: [Front-End, Fundamentals]
tags: [javascript, prototype, brendan eich, es6, class]
image: /assets/img/js-prototype/1.png
---

## TL;DR

JavaScript의 Prototype 모델 채택은 심도 있는 설계의 결과라기 보다는, 10일이라는 극단적인 개발 시간, 비즈니스적 요구, 그리고 기존 프로그래밍 언어의 아이디어를 융합한 [브렌던 아이크](https://ko.wikipedia.org/wiki/%EB%B8%8C%EB%A0%8C%EB%8D%98_%EC%95%84%EC%9D%B4%ED%81%AC)의 최선의 선택지였습니다.

## 1. JavaScript 개발의 딜레마

### 시간 vs 복잡성

넷스케이프와 마이크로소프트는 동적 웹페이지를 구현할 스크립트 언어가 시급한 상황이었고, 넷스케이프에서 먼저 우위를 점하기 위해서 브렌던 아이크에게 개발 시간을 단 10일 제공했습니다. 이 시간 제약 내에서 Java나 C++처럼 복잡한 클래스 기반 시스템을 설계하는 것은 불가능에 가까웠고, 구현 속도를 위해 프로토타입 모델을 선택했습니다.

### 경영진의 요구

넷스케이프 경영진은 당시 엄청난 인기를 끌던 Java와 연관성을 만들어내기 위해, 언어가 Java처럼 보여야한다고 요구했습니다. 동시에 브렌던 아이크는 **Scheme**과 같은 언어의 우아함을 추구했던 열망을 가지고 있었습니다. 이로 인해서 언어 내부는 **Scheme**의 함수형 프로그래밍, **Self**의 프로토타입 객체 모델, 그리고 `{}`와 `function` 키워드를 사용하는 **C** 언어 계열의 구문을 갖게 되는 혼합체가 되었습니다. 따라서 JavaScript는 순수한 함수형 언어도, 순수한 객체 지향 언어도 아닌 언어가 됩니다.

**Scheme**의 영향으로 인해 클로저 개념이 채택되기도 했는데요, 이 내용은 앞서 작성했던 글인 [자바스크립트 함수(Function) 다시 바라보기](https://brad.kr/posts/javascript-function/)에서 다룬 적 있습니다!

### 파트너십 vs 경쟁

넷스케이프는 Sun으로부터 Java 라이선스를 받고 있었기 때문에, JavaScript가 Java의 경쟁자가 되는 것은 피해야 했습니다. JavaScript에 클래스가 도입되었다면, Java와 관련되어 외부와 내부의 비판에 직면했을 가능성이 있습니다. 프로토타입 모델을 채택함으로, Java와는 다른 언어임을 명확히 했고 'Java를 보완해줄 수 있는 언어'라는 포지션을 확보했습니다.

## 2. JS 내에서 Prototype은 어떻게 동작할까요?

자바스크립트의 객체 모델은 객체가 다른 객체에게 작업을 위임하는 방식으로 동작합니다. 이를 위해 사용된 핵심 개념이 **프로토타입 체인**입니다.

1. 자바스크립트에서 어떤 객체의 속성 혹은 메서드에 접근할 때, 엔진은 먼저 그 객체 자체에서 해당 속성을 찾습니다.
2. 만약 찾지 못하면, 객체 내부의 `[[Prototype]]` 이라는 숨겨진 링크를 따라 자신의 '프로토타입'이 되는 다른 객체로 이동하여 다시 검색합니다.
3. 2번 과정은 해당하는 속성 혹은 메서드를 발견하거나, 체인의 가장 끝인 `Object.prototype`에 도달할 때 까지 반복됩니다.

### 코드를 보며 이해해보자 (1)

```js
// 프로토타입 객체
const animal = {
  breathe: function() {
    console.log("숨을 쉰다.");
  }
};

// 'animal'을 프로토타입으로 하는 'dog' 객체 생성
const dog = Object.create(animal);
dog.bark = function() {
  console.log("멍멍!");
};

dog.bark();    // "멍멍!" (dog 객체 자신에게 있음)
dog.breathe(); // "숨을 쉰다." (dog에 없으므로 프로토타입인 animal에서 찾아 실행)
```

위는 `Object.create()`를 사용하여 프로토타입 상속을 직접적으로 보여주는 예제입니다. `animal`이라는 원본 객체를 prototype으로 삼아서 물려받는 `dog`이라는 새로운 객체를 만드는 코드입니다.

![img](/assets/img/js-prototype/1.png)

캡처와 같이 `dog`의 `[[Prototype]]`을 타고 들어가니 `breathe()`를 발견할 수 있게됩니다.

### 코드를 보며 이해해보자 (2)

`new` 키워드는 새로운 객체를 만들고, 그 객체의 `[[Prototype]]` 링크를 생성자 함수의 `prototype` 속성에 자동으로 연결해주는 역할을 합니다.

```js
// 'Animal'은 생성자 함수입니다.
function Animal(name) {
  this.name = name;
}

// 모든 Animal 객체가 공유할 메서드를 prototype에 추가합니다.
Animal.prototype.breathe = function() {
  console.log(this.name + "가 숨을 쉰다.");
};

// 'new' 키워드가 dog 객체의 [[Prototype]]을 Animal.prototype으로 연결합니다.
const dog = new Animal("멍멍이");

dog.breathe(); // "멍멍이가 숨을 쉰다." (dog에 없으므로 프로토타입에서 찾아 실행)
```

`[[Prototype]]`과 `.prototype`이 다소 혼란스럽게 느껴집니다. 둘의 역할은 완전히 다릅니다.

- `[[Prototype]]`: JS의 모든 객체가 가지고 있으며, 프로토타입 체인을 형성하는 link 역할을 합니다. 직접 접근이 불가능합니다. (`__proto__` 사용은 비표준입니다.)
- `.prototype`: 생성자 함수와 `class`만이 가지고 있으며, 생성자 함수가 만들어 낼 모든 객체들이 공유할 속성과 메서드를 담아두는 설계도 역할을 합니다. `함수이름.prototype`으로 직접 접근하여 추가/수정이 가능합니다.

## 3. ES6+에서 등장한 `class`

`class` 도입의 가장 큰 목표는 Java, C#등의 클래스 기반 언어에 익숙한 개발자의 진입장벽을 낮추는 것이었습니다. 프로토타입의 개념을 직접 익히지 않더라도 키워드를 사용해 객체를 만들고 상속 관계를 쉽게 설정할 수 있게 되었습니다.

`class` 문법으로 만든 객체도 내부적으로는 여전히 프로토타입 체인을 통해서 동작합니다. `class`로 적혀진 코드는 JS 엔진에서 이를 생성자 함수와 `prototype`을 조작하는 코드로 자동 변환합니다. 즉, 기존 프로토타입 방식을 깔끔하게 사용할 수 있도록 하는 **문법적 설탕**입니다.

> 문법적 설탕(Syntactic Sugar): 사람이 이해하고 표현하기 쉽게 디자인된 문법

### 코드를 보며 이해해보자

```js
// ES6 class
class Car {
  constructor(make, model) {
    this.make = make;
    this.model = model;
  }
  display() {
    console.log(`${this.make} ${this.model}`);
  }
}
```

위 코드는 내부적으로 아래의 ES5 생성자 함수와 거의 동일하게 동작합니다.

```js
function Car_ES5(make, model) {
  this.make = make;
  this.model = model;
}
Car_ES5.prototype.display = function() {
  console.log(`${this.make} ${this.model}`);
};
```

## 마치며 ..

JS는 치밀하게 계획될 시간이 부족했지만, 핵심 문제에 집중하여 개발되어 단순하지만 효과적이고 유연한 구조가 만들어졌다고 생각합니다. 수십 년간 웹 생태계의 중심에 있는 JavaScript를 보며 본질에 접근하는 자세의 중요성을 배웁니다.