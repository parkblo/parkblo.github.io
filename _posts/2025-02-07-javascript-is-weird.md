---
title: 자바스크립트가 조금 이상한 것 같다
description: JS의 관대함에 대해서 다룹니다.
date: 2025-02-07 13:00:00 +0900
categories: [JavaScript]
tags: [quirks, typeof, null, NaN, type coercion, equality, history]
image: /assets/img/javascript-is-weird/preview.png
---

## 들어가기 앞서서

![](/assets//img/javascript-is-weird/0.webp)

최근 모던 자바스크립트 딥다이브의 내용을 읽고있는데, 흥미로운 내용을 발견했습니다. `typeof null`는 `'object'`라는 결과가 나오는데, 보통의 상식으로는 납득하기 어려웠습니다. 왜 이런 현상이 발생할까요?

## 10일 만에 만들어진 자바스크립트

자바스크립트는 1995년, Netscape의 [Brendan Eich](https://en.wikipedia.org/wiki/Brendan_Eich)에 의해서 10일 만에 개발되었습니다. 짧은 시간 내에 개발되었기 때문에 기술적인 오류와 설계의 결함에 문제가 있었습니다. 자바스크립트의 타입들은 1~3비트의 크기인 **타입 태그**를 통해서 식별되었는데요. 객체(Object)를 나타나내는 타입 태그는 0이었다고 합니다.

여기서 문제가 발생하는데, null을 나타내는 표현 또한 모든 비트가 0x00이었기 때문에, null의 타입 태그도 object와 동일한 0으로 설정되었던 것이죠. null 혹은 object의 타입 태그 둘 중 하나는 0이 아닌 다른 것으로 설정되어야 했습니다.

## `typeof`

typeof는 값의 타입 태그를 확인해서 문자열로 타입을 반환합니다. 이때, null의 타입 태그가 0인 것을 확인하고 이를 object로 오판하는 것입니다. 이 문제를 바로잡기 위해서, 자바스크립트 표준을 담당하는 ECMAScript 측에서 수정 제안을 했지만 이는 [거절](https://web.archive.org/web/20160331031419/http://wiki.ecmascript.org:80/doku.php?id=harmony:typeof_null)되었습니다.

사유는 기존에 존재하는 수많은 웹사이트와 라이브러리 코드등이 문제가 발생할 수 있어서 웹 생태계에 혼란을 줄 것을 우려했기 때문입니다. **"작동하는 코드는 건드리지 않는다."** 라는 내부 원칙에 따라서 이 오류는 지금까지도 남아있게 되었습니다.

## 올바른 null 체크 방법은?

1. 일치 연산자인 `===`를 사용하는 것. `null`은 오직 `null`만 일치합니다.
2. true/false 검사를 사용하는 것. `null`은 `false`값인 것을 활용합니다. (만약 오로지 `null`만 판단해야 하는 경우에는 올바르지 않습니다.)

## 다른 특이한 동작들

언어적 특이함을 영어로는 Quirk라고 부릅니다. 자바스크립트에는 특히 이러한 Quirk가 많아서 개발자에게 당황을 주기도 합니다.

### `NaN === NaN`은 false

NaN은 "Not-a-Number"의 뜻을 가진, 숫자로 표현할 수 없는 값을 나타내는 특별한 값입니다. [IEEE 754](https://ko.wikipedia.org/wiki/IEEE_754) 부동소수점 표준에 따르면 NaN은 다른 NaN과 절대 같을 수 없다고 표기하고 있고, 해당 표준을 따르는 자바스크립트도 [스펙](https://es5.github.io/#x11.9.6)에 명시하였습니다.

자바스크립트를 포함하여 파이썬, 자바, C++등 거의 모든 현대 프로그래밍 언어가 IEEE 754 표준을 따르고 있는데요, 이 표준의 표현 방식에 따라서 `0.1 + 0.2 !== 0.3` 현상이 일어나기도 합니다. 배정밀도 64비트 부동 소수점을 사용하는 JavaScript는 결국에는 실수를 표현하기 위해서 유한한 개수의 비트로 무한한 개수의 실수를 표현해야 합니다. 이는 불가능이기 때문에 특정 지점에서 반올림이 이루어지는데, 이때 어쩔 수 없는 작은 오차가 발생하는 것입니다. 따라서 실수를 비교할 때는 소수점 자릿수를 제한하거나 정수로 변환 후 계산하는 등의 추가적인 작업이 필요할 수 있습니다.

### `"b" + "a" + + "a" + "a"`는 `"baNaNa"`

자바스크립트의 밈으로 등장하기도 하는 유명한 동작입니다. 작동 순서대로 뜯어보면 다음과 같습니다.

1. "b" + "a" -> "ba"
2. **+ "a" -> NaN**
3. "ba" + NaN -> "baNaN"
4. "baNaN" + "a" -> "baNaNa"

`+"a"`가 NaN이 되는 이유는 `+` 연산자가 작동하는 방식 때문입니다. 단항 `+` 연산자는 [ECMAScript 명세](https://262.ecma-international.org/14.0/#sec-unary-plus-operator)에도 나와있듯이, 피연산자를 `ToNumber` 추상 연산을 적용한 값을 반환합니다. `ToNumber` 변환 규칙에 따르면, `"12px"` 혹은 `"a"`와 같이 숫자로 표현이 불가능한 값은 `NaN`으로 변환하게 되어있습니다. 따라서 `+"a"`는 `NaN`이 되는 것입니다.

`ToNumber`과 유사하게, 연산에 참여하는 값들은 내부적으로 `ToPrimitive`라는 추상 연산을 통해 **암묵적인 타입 변환**이 일어나게 됩니다. 따라서 `"hello" + 5`와 같은 연산은 둘의 타입이 다르지만 `"hello5"`라는 결과를 얻을 수 있는 것입니다. 느슨한 비교 연산자인 `==` 또한 암묵적 변환 후 값을 비교합니다. 예를 들어서, `1 == "1"`은 string인 `"1"`이 `1`로 변환된 후 비교가 수행되기 때문에 `true`라는 결과를 얻습니다.

같은 논리로, `"" == 0`과 같은 예측하기 어려운 결과를 마주할 수 있는 것이 느슨한 비교(`==`)인데, 의도치 않은 결과가 발생할 수 있기 때문에 대부분은 타입 변환이 일어나지 않는 일치 연산자인 `===`를 사용합니다. 그런데 왜 문제가 많은 '느슨한 비교', '암묵적 타입 변환'을 만들었을까요?

## 자바스크립트는 왜 관대할까?

JavaScript는 웹을 위한 스크립팅 언어입니다. **just work**. 개발자인 Brendan Eich는 스크립트의 버그 때문에 사용자가 인터랙션 할 수 없는 상황을 막고자 했고, 자유롭고 유연한 언어를 만들고자 하는 의도가 있었습니다. 따라서 자바스크립트는 내부적으로 오류를 방지하여 최대한 실행시킬 수 있는 환경을 만들려고 하는 것입니다.

이는 개발의 편의성과 같이 장점도 있지만 자바스크립트를 취약한 언어로 만드는 특성이기도 합니다. 암묵적인 표현으로 인해서 코드의 난독성이 증가할 수 있고, 빠르게 에러를 발견하지 못할 수도 있습니다. 이러한 단점을 보완하고자 `TypeScript`나 linter 도구들이 등장하여 더욱 생산적인 개발을 도와주고 있습니다.

더 많은 자바스크립트의 이상한 점을 알고 싶다면 [wtfjs](https://github.com/denysdovhan/wtfjs)를 참고해보세요!

## 🏷️ References

- [typeof - JavaScript | MDN](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Operators/typeof)
- [harmony:typeof_null [ES Wiki]](https://web.archive.org/web/20160331031419/http://wiki.ecmascript.org:80/doku.php?id=harmony:typeof_null)
- [Forgiveness is a Virtue (of JavaScript)- CodeProject](https://www.codeproject.com/Articles/516925/Forgiveness-is-a-Virtue-of-JavaScript)
- [What makes JavaScript such a fragile programming language? - Quora](https://www.quora.com/What-makes-JavaScript-such-a-fragile-programming-language)
