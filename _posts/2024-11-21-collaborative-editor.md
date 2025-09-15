---
title: Y.js와 Milkdown을 활용한 실시간 동시 편집 마크다운 에디터 개발기 - HoneyFlow 개발기 (2)
description: Notion 같은 동시 편집 에디터는 어떻게 만들어야 할까
date: 2024-11-21 16:16:16 +0900
categories: [Front-End, Library/Framework]
tags: [yjs, milkdown, prosemirror, crdt, collaborative editing, websocket, react, flushsync, troubleshooting, honeyflow]
image: /assets/img/collaborative-editor/image.png
---

## 1. 문제 정의: 협업을 위한 '살아있는' 문서 에디터

Honeyflow 프로젝트의 핵심 요구사항은 여러 사용자가 동시에 문서를 편집하고, 변경사항이 모든 참여자에게 실시간으로 반영되는 **협업 환경**을 구축하는 것이었습니다. 또한, 개발 생산성과 사용자 편의성을 고려하여 **마크다운 문법**을 완벽하게 지원해야 했습니다.

이 두 가지 요구사항을 충족시키기 위해, 단순한 텍스트 에디터를 넘어 **실시간 상태 동기화**와 **유연한 마크다운 파싱**이 가능한 기술 스택을 선정하는 것이 최우선 과제였습니다.

-----

## 2. 기술 스택 및 아키텍처 설계

### **1) 왜 Milkdown + Y.js 조합인가?**

동시 편집 기능은 이미 프로젝트 전반의 상태 관리 아키텍처로 **`Y.js`** 도입이 결정된 상황이었습니다. `Y.js`는 CRDT를 기반으로 하므로, 중앙 서버 없이도 데이터 충돌을 최소화하며 상태를 동기화할 수 있는 강력한 솔루션입니다.

따라서 에디터 라이브러리 선택의 가장 중요한 기준은 **`Y.js`와의 통합 용이성**이었습니다.

`Milkdown`은 다음과 같은 장점으로 최종 선택되었습니다.

  * 강력한 텍스트 편집 엔진인 Prosemirror를 기반으로 하여, 플러그인 아키텍처를 통해 기능을 쉽게 추가하거나 커스터마이징할 수 있습니다.
  * 협업 기능을 위한 `collab` 플러그인을 공식적으로 제공하여, `Y.js`와의 바인딩(binding) 비용을 최소화할 수 있습니다.
  * 특정 UI 프레임워크에 종속되지 않아, 프로젝트의 디자인 시스템(shadcn)과 쉽게 통합할 수 있는 유연성을 제공합니다.

### **2) 전체 아키텍처 흐름**

1.  **클라이언트**: 각 사용자는 `Y.Doc` 인스턴스를 로컬에 가집니다. `Milkdown` 에디터의 모든 변경사항(transaction)은 `Y.Doc`에 반영됩니다.
2.  **데이터 동기화**: `y-websocket` 프로바이더가 `Y.Doc`의 변경사항을 감지하여 WebSocket을 통해 서버로 전송합니다. 서버는 이 변경사항을 연결된 다른 모든 클라이언트에게 브로드캐스팅합니다.
3.  **서버**: 서버는 각 문서(room)별로 `Y.Doc` 데이터를 관리합니다. `Y.encodeStateAsUpdate`를 사용해 문서의 최종 상태를 바이너리 데이터로 변환하고, 이를 데이터베이스에 영구 저장(persistence)합니다. 새로운 사용자가 접속하면, 저장된 바이너리 데이터를 `Y.applyUpdate`로 로드하여 최신 상태에서 편집을 시작할 수 있도록 합니다.

-----

## 3. 핵심 구현 내용

### **1) Block 단위 상호작용**

![img](/assets/img/collaborative-editor/1.gif)

`Milkdown`의 `BlockProvider`를 활용하여, 각 문단(block) 옆에 커스텀 UI(`Block View`)를 렌더링했습니다. 사용자가 이 UI를 드래그 앤 드롭하면, 해당 DOM 이벤트가 Prosemirror의 트랜잭션으로 변환되어 에디터의 상태(State)를 업데이트합니다. 이는 단순한 텍스트 입력을 넘어, **구조적인 편집 경험**을 제공하는 핵심 기능입니다.

### **2) `y-websocket`을 이용한 실시간 협업 구현**

![img](/assets/img/collaborative-editor/2.gif)

`collab` 플러그인을 사용하여 `Milkdown` 에디터 인스턴스를 `Y.js` 문서에 연결했습니다. 컴포넌트가 마운트될 때 `y-websocket` 연결을 수립하고, 언마운트 시 연결을 해제하여 메모리 누수를 방지하는 생명주기 관리에 초점을 맞췄습니다. `synced` 이벤트를 리스닝하여, 초기 동기화가 완료된 시점에 기본 템플릿을 적용하는 로직을 추가했습니다.

-----

## 4. 트러블슈팅: `flushSync` 경고 분석 및 해결

### **1) 문제 현상**

개발 중 다음과 같은 React 경고가 지속적으로 발생했습니다.

![img](/assets/img/collaborative-editor/3.png)

> "flushSync was called from inside a lifecycle method. React cannot flush when React is already rendering."

`flushSync`는 DOM 업데이트를 동기적으로 강제 실행하는 함수인데, 이것이 React의 렌더링 생명주기(`useEffect`) 내에서 호출되어 충돌이 발생한 것입니다.

### **2) 원인 분석**

디버깅 결과, `Milkdown`의 `collab` 플러그인 내부 또는 의존성 라이브러리가 Prosemirror의 상태 변경을 React 컴포넌트에 동기적으로 반영하기 위해 `flushSync`를 사용하고 있었습니다. `useEffect` 내에서 에디터를 초기화할 때 이 로직이 실행되면서, **이미 진행 중인 React 렌더링 사이클과 `flushSync`의 강제 렌더링이 충돌**한 것이 문제의 원인이었습니다.

### **3) 해결 과정: Macro-task를 이용한 실행 시점 분리**

React는 렌더링 사이클을 마이크로태스크(Micro-task) 큐에서 처리합니다. 따라서 경고 메시지에서 제안하는 대로 `flushSync` 호출을 마이크로태스크(e.g., `Promise.resolve().then()`)로 옮기더라도, 여전히 동일한 렌더링 사이클 내에서 실행될 가능성이 있습니다.

가장 확실한 해결책은 **`flushSync` 호출을 현재의 렌더링 사이클이 완전히 끝난 뒤로 미루는 것**입니다. 이를 위해 `setTimeout(..., 0)`을 사용하여 `flushSync` 로직을 **매크로태스크(Macro-task)** 큐로 보냈습니다.

```jsx
useEffect(() => {
  // 현재 렌더링 사이클이 모두 종료된 후, 다음 이벤트 루프에서 실행되도록 예약
  const timerId = setTimeout(() => {
    // 에디터 초기화 및 flushSync를 호출하는 로직 실행
    initializeEditor(); 
  }, 0);

  return () => clearTimeout(timerId);
}, []);
```

이 방식을 통해 React의 렌더링 작업이 `flushSync` 호출을 방해하지 않도록 실행 시점을 명확하게 분리하여 문제를 해결할 수 있었습니다.

-----

## 5. 향후 과제 및 개선 방향 (Roadmap)

  * Notion의 슬래시(`/`) 커맨드나 텍스트 블록 변환과 같은 기능을 플러그인 기반으로 확장할 수 있는 커맨드 시스템을 설계하고 도입할 계획입니다.
  * 현재 분리된 `Block View`를 `shadcn` 컴포넌트와 통합하고, 에디터의 스타일을 디자인 시스템에 맞춰 일관성 있게 다듬는 작업이 필요합니다.
  * 여러 사용자가 동시에 같은 텍스트를 수정하거나, 네트워크 지연이 발생하는 등 다양한 동시 편집 시나리오에 대한 테스트 케이스를 구축하여 서비스 안정성을 확보할 것입니다.

-----

## References
- [Collaborative Editing](https://milkdown.dev/docs/guide/collaborative-editing)
- [Total Studio – Serverless CRDT-Based Markdown Editor](https://blog.mi.hdm-stuttgart.de/index.php/2024/08/31/total-studio-serverless-crdt-based-markdown-editor/)
- [Using Milkdown Kit](https://milkdown.dev/docs/guide/using-milkdown-kit)
- https://docs.yjs.dev/api/document-updates