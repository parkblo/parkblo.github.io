---
title: 프로젝트를 위한 Canvas 라이브러리 선택
description: Konva와 Fabric.js를 비교 분석하고 최종 선택 이유를 정리했습니다.
date: 2024-11-05 23:11:10 +0900
categories: [Front-End, Library/Framework]
tags: [canvas, react, konva, fabricjs, react-konva, animation, performance, comparison]
image: /assets/img/canvas-library/thumbnail.png
---

## 1. 문제 정의: 왜 Canvas 라이브러리가 필요한가?

프로젝트 초기 단계에서 다수의 도형과 복잡한 애니메이션을 구현해야 하는 요구사항이 있었습니다. SVG나 DOM 요소를 직접 조작하는 방식은 요소의 수가 증가할수록 브라우저 렌더링 부하를 가중시켜 **성능 저하를 유발**할 가능성이 컸습니다.

안정적이고 높은 성능을 보장하기 위해 팀은 Canvas API를 활용하기로 합의했습니다. 하지만 순수 Canvas API는 학습 곡선이 가파르고, 주어진 프로젝트 기간 내에 직접 객체 모델링, 이벤트 처리, 상태 관리 시스템을 구축하는 것은 비효율적이라 판단했습니다. 따라서 검증된 Canvas 라이브러리를 도입하여 개발 생산성과 안정성을 모두 확보하는 방향으로 결정했습니다.

-----

## 2. 기술 선택을 위한 핵심 평가 기준

성공적인 라이브러리 도입을 위해 다음과 같은 네 가지 핵심 기준을 수립했습니다.

1. 꾸준히 유지보수되며 충분한 사용자층을 확보했는가?
2. React 생태계와 자연스럽게 통합되며, 컴포넌트 기반 아키텍처에 적합한가?
3. 공식 문서가 체계적이고 API가 직관적이어서 팀원들이 빠르게 학습하고 적용할 수 있는가?
4. 복잡한 인터랙션과 애니메이션을 구현할 수 있는 충분한 기능을 제공하는가?

이 기준에 따라 가장 많이 사용되는 **Konva**와 **Fabric.js**를 최종 후보로 선정했습니다.

-----

## 3. Konva vs. Fabric.js 심층 비교 분석

### **1) 아키텍처 및 React 통합 방식** 🧐

React 프로젝트에서 라이브러리를 통합하는 방식은 장기적인 코드 유지보수성과 생산성에 결정적인 영향을 미칩니다.

  * **Konva (+ `react-konva`)**: **선언적(Declarative) 접근**

      * `react-konva` 래퍼(wrapper)를 통해 Canvas의 모든 요소를 React 컴포넌트처럼 다룰 수 있습니다.
      * `<Stage>`, `<Layer>`, `<Rect>`와 같은 컴포넌트를 사용하여 JSX로 캔버스 구조를 직관적으로 표현합니다.
      * React의 상태(State)와 생명주기(Lifecycle)에 완벽하게 통합되어, 데이터 변경 시 캔버스가 자동으로 리렌더링됩니다. 이는 **React 개발자에게 매우 친숙하고 일관된 개발 경험을 제공합니다.**

    <!-- end list -->

    ```tsx
    // Konva: 모든 것이 React 컴포넌트
    <Stage>
      <Layer>
        <Rect fill={color} draggable />
      </Layer>
    </Stage>
    ```

  * **Fabric.js**: **명령형(Imperative) 접근**

      * `useRef`와 `useEffect`를 사용해 Canvas DOM에 직접 접근하고, Fabric 인스턴스를 생성하여 조작합니다.
      * `canvas.add(rect)`와 같이 메서드를 호출하여 객체를 추가하고 변경합니다.
      * React의 상태와 캔버스 객체의 상태를 동기화하는 로직을 개발자가 직접 관리해야 하는 부담이 있습니다. 이는 **상태 관리가 복잡해질수록 코드의 복잡도를 높일 수 있습니다.**

    <!-- end list -->

    ```tsx
    // Fabric.js: useEffect 내에서 직접 인스턴스 조작
    useEffect(() => {
      const canvas = new fabric.Canvas(canvasRef.current);
      const rect = new fabric.Rect({ fill: 'green' });
      canvas.add(rect);
      // ...
      return () => canvas.dispose();
    }, []);
    ```

> **[분석]** 우리 팀은 컴포넌트 기반의 재사용성과 예측 가능한 상태 관리를 중요하게 생각합니다. Konva의 선언적 방식은 **React의 설계 철학과 완벽하게 일치**하여, 장기적으로 더욱 **안정적이고 확장성 있는 코드**를 작성하는 데 유리하다고 판단했습니다.

-----

### **2) 기능 구현 코드 비교: Free Drawing** ✍️

특정 기능 구현 시 코드의 직관성과 간결성을 비교했습니다.

  * `Konva`는 마우스 이벤트(mousedown, mousemove, mouseup)를 직접 조합하여 그리기 기능을 구현해야 합니다. 이는 자유도가 높지만, 기본적인 기능을 위해 더 많은 코드가 필요함을 의미합니다.
  * `Fabric.js`는 `isDrawingMode: true` 옵션 하나로 그리기 모드를 즉시 활성화할 수 있습니다. 내장된 브러시와 옵션을 제공하여 **단순한 기능을 빠르게 구현하는 데 매우 유리합니다.**

> **[분석]** Free drawing과 같이 특정 기능에 대해서는 Fabric.js가 더 간결한 API를 제공합니다. 만약 프로젝트의 핵심 기능이 '단순한 그림판'이라면 Fabric.js가 더 나은 선택일 수 있습니다. 하지만 우리 프로젝트는 도형의 **복잡한 상호작용과 상태 변화**가 핵심이므로, 초기 구현의 간결성보다는 **전체 아키텍처의 일관성**이 더 중요하다고 판단했습니다.

-----

### **3) 생태계 및 성능** 🚀

![img](/assets/img/canvas-library/1.png)

  * **NPM 다운로드 수:** Konva가 Fabric.js 대비 약 2배 높은 주간 다운로드 수를 기록하고 있어, 더 활발한 커뮤니티와 생태계를 기대할 수 있습니다.
  * **번들 사이즈:** `react-konva`는 63.6KB로, 2.6MB인 Fabric.js에 비해 훨씬 가볍습니다. 이는 초기 로딩 성능에 긍정적인 영향을 미칩니다.
  * **문서화:** 두 라이브러리 모두 문서가 잘 되어 있으나, Konva는 React, Vue 등 프레임워크별 가이드를 별도로 제공하여 학습 편의성이 더 높았습니다.

> **[분석]** 번들 사이즈와 커뮤니티 활성도 모두 Konva가 우위에 있었습니다. 특히 프레임워크별 가이드는 팀원들의 학습 비용을 줄여줄 수 있는 중요한 장점입니다.

-----

## 4. 최종 결정: Konva를 선택한 이유

우리 팀은 최종적으로 `Konva`를 선택했습니다. Fabric.js가 특정 기능에 대해 더 간단한 API를 제공하는 매력이 있었지만, 다음과 같은 이유로 Konva가 우리 프로젝트의 장기적인 목표에 더 부합한다고 결론 내렸습니다.

1. 선언적인 컴포넌트 기반 아키텍처는 코드의 가독성, 재사용성, 유지보수성을 극대화합니다. 이는 복잡한 UI 상태를 다루어야 하는 우리 프로젝트에 필수적이었습니다.
2. 모든 캔버스 요소가 React의 State에 의해 제어되므로, 데이터 흐름을 추적하기 쉽고 잠재적인 버그를 줄일 수 있습니다.
3. 가벼운 번들 사이즈, 활발한 커뮤니티, 그리고 React에 특화된 공식 문서는 프로젝트의 개발 속도와 안정성을 높여줄 것이라 기대합니다.

이번 기술 분석 과정을 통해 단순히 인기 있는 라이브러리를 따르기보다, 우리 팀의 개발 철학과 프로젝트의 요구사항에 가장 적합한 도구를 **논리적 근거에 따라 선택하는 경험**을 할 수 있었습니다.

-----

## References

* [React: Comparison of JS Canvas Libraries (Konvajs vs Fabricjs) - DEV Community](https://dev.to/lico/react-comparison-of-js-canvas-libraries-konvajs-vs-fabricjs-1dan)
* [Konva vs Fabric vs Canvas API 라이브러리 선택과정](https://devysi0827.tistory.com/101)
* [Getting started with react and canvas via Konva | Konva - JavaScript 2d canvas library](https://konvajs.org/docs/react/index.html)
* [fabricjs.com/docs](https://fabricjs.com/docs/)
* https://konvajs.org/docs/react/Simple_Animations.html
* https://konvajs.org/docs/react/Complex_Animations.html
* https://fabricjs.com/demos/animation-easing/