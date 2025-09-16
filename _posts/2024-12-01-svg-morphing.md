---
title: JavaScript와 CSS 없이 구현하는 SVG 모핑 - HoneyFlow 개발기 (3)
description: Circle → Hexagon 모핑을 구현하며 원리, 제약, 해결 과정을 정리했습니다.
date: 2024-12-01 15:25:25 +0900
categories: [Front-End, UX]
tags: [svg, smil, morphing, animation, path, bezier, interpolation, web standards, honeyflow]
image: /assets/img/svg-morphing/thumbnail.gif
---

## 1. 과제 정의: 의존성 없는 UI 애니메이션

![img](/assets/img/svg-morphing/1.png)

프로젝트 UI 초안에 따라, 여러 개의 메뉴 버튼이 원형으로 나타나 육각형으로 변하며 펼쳐지는 애니메이션을 구현해야 했습니다.

`framer-motion` 같은 라이브러리를 사용하면 쉽게 구현할 수 있었지만, 이 하나의 기능을 위해 새로운 라이브러리 의존성을 추가하는 것은 **번들 사이즈 증가와 잠재적 성능 저하**를 고려했을 때 과하다고 판단했습니다. 따라서 웹 표준 기술만으로 문제를 해결하는 방법을 모색하기로 결정했습니다.

핵심 과제는 **'원(Circle) SVG'를 '육각형(Hexagon) SVG'로 자연스럽게 변형(morphing)시키는 것**이었습니다.

---

## 2. 첫 번째 접근과 한계: CSS Transition

가장 먼저 떠올린 방법은 CSS의 `transition` 속성을 활용하는 것이었습니다. 두 도형을 모두 SVG `<path>`로 정의하고, `path`의 모양을 결정하는 `d` 속성에 `transition`을 적용하면 될 것이라 가정했습니다.

하지만 테스트 결과, `transition`은 `d` 속성을 애니메이션 대상으로 지원하지 않았습니다. `d` 속성은 복잡한 문자열 데이터이기 때문에 브라우저가 중간 상태를 보간(interpolate)할 수 없기 때문입니다. 이로써 CSS만으로 해결하려는 첫 번째 시도는 실패로 돌아갔습니다.

---

## 3. 대안 탐색과 새로운 문제: SMIL을 활용한 네이티브 애니메이션

CSS의 한계를 확인한 후, SVG 명세 자체에 포함된 애니메이션 기능을 찾아보았습니다. 그 결과 **SMIL(Synchronized Multimedia Integration Language)**을 사용하는 SVG `<animate>` 요소를 발견했습니다.

`<animate>`는 CSS나 JavaScript 없이 SVG 요소의 속성을 시간에 따라 변경할 수 있는 강력한 기능입니다. 하지만 예상과 달리 두 도형 사이를 부드럽게 전환하는 것이 아니라 특정 시점에 모양이 뚝 끊기며 바뀌는 현상이 발생했습니다.

![img](/assets/img/svg-morphing/2.gif)

---

## 4. 근본 원인 분석: 왜 모핑이 부드럽지 않았는가?

심층 분석 결과, SVG Path가 부드럽게 보간되기 위해서는 **시작과 끝 `path` 데이터가 다음 세 가지 조건을 반드시 만족해야 한다**는 사실을 발견했습니다.

1.  **앵커 포인트(Anchor Point)의 수가 동일해야 한다.**
2.  **앵커 포인트의 순서가 논리적으로 일치해야 한다.**
3.  **모든 경로 명령어(Command)의 타입이 동일해야 한다.** (e.g., `M`, `L`, `C`, `Q` 등)

문제의 원인은 명확했습니다. 원은 곡선을 그리는 명령어(`C` 또는 `Q`)로, 육각형은 직선을 그리는 명령어(`L`)로 구성되어 있어 **경로 명령어 타입이 불일치**했던 것입니다.

---

## 5. 해결책: SVG Path 데이터 구조 일치시키기

해결책은 **육각형을 직선(`L`)이 아닌 곡선(`Q`) 명령어로 다시 그리는 것**이었습니다. `Q`는 2차 베지에 곡선(Quadratic Bézier curve) 명령어로, 제어점을 조절하여 직선에 가깝게 표현하는 것이 가능했습니다.

두 도형의 `path` 데이터를 동일한 수와 순서의 `Q` 명령어로 재구성하는 까다로운 과정을 통해 두 도형의 `path` 데이터 구조를 완벽하게 일치시켰고, 마침내 부드러운 모핑 애니메이션을 구현할 수 있었습니다.

![img](/assets/img/svg-morphing/3.gif)

---

## 6. 결론: 네이티브 API와 라이브러리 사이의 트레이드오프

이번 경험을 통해, 복잡해 보이는 애니메이션도 웹 표준 기술에 대한 깊은 이해가 있다면 외부 라이브러리 없이 구현할 수 있음을 배웠습니다.

물론 `path` 데이터를 직접 조작하는 것은 생산성이 떨어질 수 있습니다. 결국 중요한 것은 **문제의 복잡성과 프로젝트의 요구사항을 정확히 판단하여, 네이티브 기술의 깊이를 탐구할 것인지 혹은 생산성을 위해 라이브러리를 활용할 것인지를 결정하는 엔지니어링적 의사결정 능력**이라고 생각합니다.

---

## References

- https://www.w3.org/TR/SVG2/paths.html
- https://stackoverflow.com/questions/32729752/css-transition-animation-doesnt-work-on-svg-paths-d-attribute-change
- [SVG animation with SMIL - SVG: Scalable Vector Graphics](https://developer.mozilla.org/en-US/docs/Web/SVG/SVG_animation_with_SMIL)
- https://developer.mozilla.org/en-US/docs/Web/SVG/Element/animate