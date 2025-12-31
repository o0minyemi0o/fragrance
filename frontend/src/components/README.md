# 🎨 프론트엔드 디자인 시스템

아토믹 디자인 원칙을 따르는 재사용 가능한 컴포넌트 라이브러리입니다.

## 📁 구조

```
components/
├── atoms/        # 최소 단위 (Button, Input, Label, Textarea, Select)
├── molecules/    # atoms 조합 (FormField, Card)
├── organisms/    # 복잡한 기능 단위 (Modal, Navigation)
├── layouts/      # 페이지 레이아웃
└── pages/        # 완성된 페이지
```

---

## 🧬 아토믹 디자인 계층

### Atoms (원자)
가장 기본적인 UI 요소로, 더 이상 분해할 수 없는 최소 단위입니다.

**사용 가능한 컴포넌트:**
- `Button` - 3가지 variant (primary, secondary, outline), 3가지 size (sm, md, lg)
- `Input` - 텍스트 입력 필드
- `Label` - 폼 라벨
- `Textarea` - 여러 줄 텍스트 입력
- `Select` - 드롭다운 선택

```tsx
import { Button, Input, Label } from '@/components/atoms';

<Button variant="primary" size="md">Click me</Button>
<Input placeholder="Enter text" />
<Label required>Email</Label>
```

### Molecules (분자)
Atoms를 결합하여 만든 작은 기능 단위입니다.

**사용 가능한 컴포넌트:**
- `FormField` - Label + Input/Textarea/Select 통합
- `Card` - 콘텐츠 카드 (Header, Body, Footer)

```tsx
import { FormField, Card, CardHeader, CardBody } from '@/components/molecules';

<FormField
  id="email"
  label="Email Address"
  type="input"
  required
  placeholder="Enter your email"
/>

<Card hoverable>
  <CardHeader>
    <h3>Card Title</h3>
  </CardHeader>
  <CardBody>
    <p>Card content goes here</p>
  </CardBody>
</Card>
```

### Organisms (유기체)
Molecules와 Atoms를 조합한 독립적인 기능 블록입니다.

**사용 가능한 컴포넌트:**
- `Modal` - 중앙 모달 다이얼로그
- `Navigation` - 탭 네비게이션 (vertical/horizontal)

```tsx
import { Modal, Navigation } from '@/components/organisms';

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Modal Title"
  footer={
    <>
      <Button variant="outline">Cancel</Button>
      <Button variant="primary">Confirm</Button>
    </>
  }
>
  <p>Modal content</p>
</Modal>

<Navigation
  items={[
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
  ]}
  activeId={activeId}
  onItemClick={setActiveId}
/>
```

---

## 🎨 디자인 토큰 시스템

모든 스타일은 CSS 변수로 정의된 디자인 토큰을 사용합니다.

### 색상 토큰
```css
var(--color-primary)          /* #85933e - 메인 브랜드 컬러 */
var(--color-secondary)        /* #9b9d5a - 보조 컬러 */
var(--color-text-primary)     /* #666 - 주요 텍스트 */
var(--color-error)            /* #F44336 - 에러 */
var(--color-success)          /* #4CAF50 - 성공 */
```

### 타이포그래피
```css
var(--font-size-sm)           /* 14px */
var(--font-size-md)           /* 16px */
var(--font-size-lg)           /* 18px */
var(--font-weight-normal)     /* 400 */
var(--font-weight-semibold)   /* 600 */
```

### 간격 (4px 배수)
```css
var(--spacing-xs)             /* 4px */
var(--spacing-sm)             /* 8px */
var(--spacing-md)             /* 12px */
var(--spacing-lg)             /* 16px */
var(--spacing-xl)             /* 20px */
```

### 테두리 & 그림자
```css
var(--border-radius-sm)       /* 5px */
var(--border-radius-md)       /* 8px */
var(--border-radius-lg)       /* 10px */
var(--shadow-sm)              /* 약한 그림자 */
var(--shadow-md)              /* 보통 그림자 */
var(--shadow-lg)              /* 강한 그림자 */
```

### 애니메이션
```css
var(--transition-default)     /* all 300ms ease */
var(--duration-fast)          /* 150ms */
var(--duration-normal)        /* 300ms */
```

---

## 🎯 디자인 토큰 변경하기

**토큰만 수정하면 전체 앱의 스타일이 일관되게 변경됩니다!**

### 예시: 메인 컬러 변경

`/src/styles/tokens/colors.css` 파일에서:
```css
:root {
  --color-primary: #85933e;  /* 현재 올리브 그린 */
}
```

↓ 변경

```css
:root {
  --color-primary: #3498db;  /* 파란색으로 변경 */
}
```

이렇게 **한 줄만 수정**하면:
- 모든 Primary 버튼이 파란색으로 변경
- 모든 포커스 아웃라인이 파란색으로 변경
- Navigation의 active 상태가 파란색으로 변경
- 전체 앱이 일관된 새로운 테마로 변경!

---

## 📚 Storybook

각 컴포넌트를 독립적으로 보고 테스트할 수 있습니다.

### Storybook 실행
```bash
npm run storybook
```

브라우저에서 `http://localhost:6006` 접속

### Storybook에서 할 수 있는 것:
- ✅ 모든 컴포넌트 시각적으로 확인
- ✅ Props 실시간 변경하며 테스트
- ✅ 다양한 상태(hover, disabled 등) 확인
- ✅ 디자인 토큰 변경 결과 즉시 확인
- ✅ 반응형 디자인 테스트

---

## 💡 사용 예시

### 로그인 폼
```tsx
import { FormField } from '@/components/molecules';
import { Button } from '@/components/atoms';

function LoginForm() {
  return (
    <form>
      <FormField
        id="email"
        label="Email"
        type="input"
        required
        placeholder="Enter your email"
      />
      <FormField
        id="password"
        label="Password"
        type="input"
        required
        placeholder="Enter password"
      />
      <Button variant="primary" fullWidth>
        Login
      </Button>
    </form>
  );
}
```

### 재료 추가 모달
```tsx
import { Modal } from '@/components/organisms';
import { FormField } from '@/components/molecules';
import { Button } from '@/components/atoms';

function AddIngredientModal({ isOpen, onClose }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Ingredient"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary">Add</Button>
        </>
      }
    >
      <FormField
        id="name"
        label="Ingredient Name"
        type="input"
        required
      />
      <FormField
        id="note"
        label="Note Family"
        type="select"
        required
      >
        <option value="">Select...</option>
        <option value="top">Top Note</option>
        <option value="middle">Middle Note</option>
        <option value="base">Base Note</option>
      </FormField>
    </Modal>
  );
}
```

---

## 🚀 다음 단계

### 현재 완료:
- ✅ 디자인 토큰 시스템 (6개 파일, 100+ 토큰)
- ✅ Storybook 설정
- ✅ Atoms (5개 컴포넌트)
- ✅ Molecules (2개 컴포넌트)
- ✅ Organisms (2개 컴포넌트)

### 진행 중:
- 🔄 기존 컴포넌트를 새 구조로 마이그레이션
- 🔄 디자인 토큰 변경 테스트

---

## 📖 추가 문서

- 모든 컴포넌트는 TypeScript로 작성되어 타입 안정성 보장
- CSS Modules 사용으로 스타일 충돌 방지
- 각 컴포넌트는 독립적으로 테스트 가능
- 접근성(a11y) 고려한 마크업

---

**Made with ❤️ using Atomic Design + Design Tokens**
