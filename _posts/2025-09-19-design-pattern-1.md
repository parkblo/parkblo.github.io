---
title: 소프트웨어 디자인 패턴(1) - 싱글톤, 팩토리, 전략
description: GoF 디자인 패턴 중 널리 쓰이는 싱글톤, 팩토리, 전략 패턴에 대해 알아봅니다.
date: 2025-09-19 16:50:30 +0900
categories: [Computer Science, Design Pattern]
tags: [design pattern, singleton, factory, strategy, gof]
image: /assets/img/design-pattern-1/thumbnail.jpg
---

## 1\. 싱글톤 패턴: 단 하나의 특별한 객체

### **정의 (Definition)**

싱글톤 패턴은 특정 클래스의 인스턴스가 애플리케이션 전체에 걸쳐 **단 하나만 존재하도록 보장**하는 생성 패턴입니다. 데이터베이스 커넥션이나 전역 설정처럼, 여러 곳에서 공유해야 하지만 여러 개가 존재할 필요는 없는 객체를 다룰 때 유용하게 사용할 수 있습니다.

### **장점 (Gains)**

  * 인스턴스가 단 하나만 존재하기 때문에, 불필요한 메모리 낭비를 막을 수 있습니다.
  * 유일한 인스턴스를 통해 다른 객체들과 데이터를 공유하고, 전역적인 상태를 관리하기 용이합니다.

### **단점 (Losses)**

  * 하나의 클래스가 너무 많은 역할과 데이터를 갖게 되어 **단일 책임 원칙(SRP)을 위반**할 가능성이 커집니다.
  * 전역적으로 상태를 공유하기 때문에 다른 코드와 강하게 결합될 수 있습니다. 이로 인해 **단위 테스트(Unit Test)를 진행하기가 매우 까다로워지는** 명확한 단점이 있습니다.

### **JavaScript 구현 (Implementation)**

```javascript
class Settings {
  constructor() {
    // Settings 클래스의 인스턴스가 이미 존재한다면,
    if (Settings.instance) {
      // 새롭게 생성하지 않고 기존 인스턴스를 반환합니다.
      return Settings.instance;
    }
    // 인스턴스가 없다면, 초기 설정을 진행하고
    this.theme = 'light';
    // 자기 자신을 instance 프로퍼티에 할당합니다.
    Settings.instance = this;
  }

  getTheme() {
    return this.theme;
  }
}

const settings1 = new Settings();
const settings2 = new Settings();

// 두 변수는 정확히 동일한 인스턴스를 가리킵니다.
console.log(settings1 === settings2); // true
```

### **심화 질문**

> **Q. 싱글톤 패턴이 '안티 패턴'이라고도 불리는데, 왜 그렇게 불린다고 생각하시나요? 그리고 이에 대한 대안은 무엇이 있을까요?**
>
> A. 싱글톤 패턴이 안티 패턴으로 불리는 이유에 대해 공감합니다. 전역 상태로 인한 예측 불가능성, 테스트의 어려움, 높은 결합도가 안티 패턴으로 불리는 핵심 이유라고 생각합니다.
>
> 이에 대한 좋은 대안으로는 의존성 주입을 사용할 수 있습니다. 필요한 객체(의존성)를 클래스 내부에서 직접 생성하는 것이 아니라, 외부에서 생성하여 주입받는 방식입니다. 이를 통해 클래스 간의 결합도를 낮출 수 있고, 테스트 시에는 실제 객체 대신 Mock 객체를 쉽게 주입할 수 있어 독립적인 단위 테스트가 훨씬 용이해집니다. 이는 제어의 역전(IoC) 원칙을 따르는 좋은 설계 방법이라고 생각합니다.

-----

## 2\. 팩토리 패턴: 객체 생성은 전문가에게 맡기기

### **정의 (Definition)**

팩토리 패턴은 객체를 생성하는 코드를 별도의 클래스나 메서드(팩토리)로 분리하여, **객체 생성 과정을 캡슐화**하는 **생성 패턴**입니다. 클라이언트 코드는 어떤 구체적인 클래스가 생성되는지 몰라도, 팩토리에 요청만 하면 원하는 타입의 객체를 받을 수 있습니다.

### **장점 (Gains)**

  * 클라이언트 코드가 구체적인 클래스가 아닌 팩토리에만 의존하므로, 새로운 클래스가 추가되거나 변경되어도 **클라이언트 코드는 수정할 필요가 없습니다.**
  * 객체 생성과 관련된 모든 로직이 한곳(팩토리)에 모여있어, **코드의 유지보수가 매우 편리**해집니다.
  * 새로운 종류의 객체를 추가해야 할 때, 팩토리에 생성 로직만 추가하면 되므로 **확장성이 좋습니다.**

### **단점 (Losses)**

  * 생성할 객체의 종류가 몇 개 안 되고 로직이 단순하다면, 팩토리를 만드는 것이 오히려 코드를 불필요하게 복잡하게 만들 수 있습니다.

### **JavaScript 구현 (Implementation)**

**Before:**

```javascript
// 클라이언트 코드(UI)가 Button, Input 클래스에 직접 의존하고 있습니다.
class UI {
  render(props) {
    let component;
    if (props.type === 'button') {
      component = new Button(props.text);
    } else if (props.type === 'input') {
      component = new Input(props.placeholder);
    }
    component.mount();
  }
}
```

**After (Simple Factory):**

```javascript
// 팩토리가 객체 생성 책임을 모두 가져갑니다.
class ComponentFactory {
  create(props) {
    switch (props.type) {
      case 'button':
        return new Button(props.text);
      case 'input':
        return new Input(props.placeholder);
      default:
        throw new Error(`알 수 없는 컴포넌트 타입입니다: ${props.type}`);
    }
  }
}

// 클라이언트는 이제 팩토리를 통해 객체를 받으므로, 구체적인 클래스를 몰라도 됩니다.
class UI {
  constructor(factory) {
    this.factory = factory;
  }
  
  render(props) {
    const component = this.factory.create(props);
    component.mount();
  }
}
```

### **심화 질문**

> **Q. 방금 설명한 Simple Factory에 가까운데, Factory Method Pattern과는 어떤 차이가 있나요?**
>
> A. 네, 제가 든 예시는 객체 생성을 하나의 클래스가 전담하는 Simple Factory 방식에 가깝습니다.
>
> Factory Method 패턴과의 가장 큰 차이점은 **객체 생성을 서브클래스에게 위임한다**는 점입니다. 상위 클래스에서는 객체를 생성하는 '메서드의 뼈대'만 정의하고, 실제 어떤 객체를 생성할지는 이 상위 클래스를 상속받는 하위 클래스에서 구체적으로 결정합니다. 예를 들어 `Dialog`라는 부모 클래스가 `createButton` 메서드를 가지고 있다면, `WindowsDialog` 자식 클래스는 `WindowsButton`을, `MacDialog` 자식 클래스는 `MacButton`을 생성하도록 만드는 방식입니다. 이처럼 **상속을 통해 객체 생성을 확장**한다는 점에서 차이가 있습니다.

-----

## 3\. 전략 패턴: 필요할 때마다 행동을 갈아 끼우는 유연함

### **정의 (Definition)**

전략 패턴은 **다양한 행동(알고리즘)들을 각각의 객체로 캡슐화**하고, 이들을 자유롭게 교체해서 사용할 수 있도록 만드는 행동 패턴입니다. 이 패턴의 가장 큰 매력은, 컨텍스트(전략을 사용하는 객체)의 코드를 전혀 바꾸지 않고도 그 행동 방식을 동적으로 바꿀 수 있다는 점입니다.

### **장점 (Gains)**

  * 새로운 전략(알고리즘)이 추가되어도 기존 코드를 수정할 필요가 없으므로, **OCP(개방-폐쇄 원칙)를 잘 지킬 수 있습니다.**
  * 컨텍스트 내부에 있던 복잡한 `if-else` 분기문을 제거하여 코드를 훨씬 깔끔하게 만들 수 있습니다.
  * 각 전략이 독립된 객체로 존재하기 때문에, 개별적으로 단위 테스트를 하기가 매우 편리합니다.

### **단점 (Losses)**

  * 간단한 로직에 적용하면 오히려 자잘한 객체들이 너무 많아져서 구조가 복잡해 보일 수 있습니다.
  * 클라이언트가 어떤 전략들이 있는지 알고, 상황에 맞는 전략을 직접 선택해서 주입해야 하는 책임이 생길 수 있습니다.

### **JavaScript 구현 (Implementation)**

```javascript
// 다양한 유효성 검사 규칙(전략)들을 객체로 캡슐화합니다.
const validationStrategies = {
  required: (value) => value.trim().length > 0,
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
};

// 컨텍스트(Validator)는 구체적인 검사 방식을 모르고, 주입받은 전략을 실행만 합니다.
class Validator {
  setStrategy(strategy) {
    this.strategy = strategy;
  }

  validate(value) {
    if (!this.strategy) throw new Error("검증 전략이 설정되지 않았습니다.");
    return this.strategy(value);
  }
}

// 클라이언트 코드
const validator = new Validator();

validator.setStrategy(validationStrategies.email);
console.log(validator.validate("test@test.com")); // true

validator.setStrategy(validationStrategies.required);
console.log(validator.validate("")); // false
```

### **심화 질문**

> **Q. 전략 패턴과 상태 패턴은 구조가 매우 유사해 보이는데, 둘의 차이점은 무엇인가요?**
>
> A. 두 패턴 모두 행동을 캡슐화하지만, 제가 이해한 바로는 그 '의도'에 가장 큰 차이가 있습니다.
>
>   * **전략 패턴**은 '어떻게' 일 처리를 할 것인가에 대한 **알고리즘을 교체**하는 데 중점을 둡니다. 주로 클라이언트가 여러 알고리즘 중 하나를 능동적으로 선택해서 컨텍스트의 행동을 바꿉니다.
>   * **상태 패턴**은 객체가 자신의 '내부 상태'에 따라 **행동 자체가 바뀌는 것**을 표현하는 데 중점을 둡니다. 상태 변경이 컨텍스트 내부에서 자율적으로 일어나며, 클라이언트는 상태를 직접 제어하지 않는 경우가 많습니다.

-----

## 4\. 세 가지 패턴 비교 분석

세 가지 패턴을 공부하면서, 각 패턴이 어떤 문제를 해결하기 위해 존재하는지 그 '의도'를 파악하는 것이 가장 중요하다고 느꼈습니다.

  * **생성 vs. 행동:** **싱글톤**과 **팩토리**는 객체를 '만드는' 방법에 대한 **생성 패턴**입니다. 반면 **전략 패턴**은 객체가 '어떻게 행동할지'에 대한 **행동 패턴**입니다.
  * **무엇을 감추는가?:**
      * **싱글톤**은 **인스턴스가 여러 개 생성될 가능성**을 감추고, 오직 하나만 존재함을 보장합니다.
      * **팩토리**는 **어떤 클래스를 생성할지에 대한 구체적인 결정**을 감추고, 클라이언트의 부담을 덜어줍니다.
      * **전략**은 **어떻게 행동할지에 대한 구체적인 알고리즘 구현**을 감추고, 클라이언트에게는 일관된 사용법을 제공합니다.

이 패턴들은 서로 조합해서 더 큰 시너지를 낼 수도 있습니다. 예를 들어, **팩토리**를 사용해서 상황에 맞는 **전략** 객체를 생성해 주거나, 상태가 없는 **전략** 객체를 **싱글톤**으로 만들어 관리하는 것도 가능합니다.

## 5\. 마치며

지금까지 **싱글톤, 팩토리, 전략 패턴**에 대해 학습한 내용을 정리해 보았습니다. 디자인 패턴은 단순히 코드를 예쁘게 만드는 기술이 아니라, 미래에 발생할 변경에 유연하게 대처하고 다른 개발자들과 원활하게 협업하기 위한 중요한 설계 도구라는 것을 다시 한번 느꼈습니다.

긴 글 읽어주셔서 감사합니다!