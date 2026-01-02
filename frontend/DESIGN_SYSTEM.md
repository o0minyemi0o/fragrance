# 🎨 디자인 시스템 마이그레이션 가이드

기존 프론트엔드 코드를 새로운 디자인 시스템으로 전환하는 방법입니다.

---

## 📊 현재 상태

### ✅ 완료된 작업

1. **디자인 토큰 시스템** ✨
   - 📁 `/src/styles/tokens/` - 6개 토큰 파일
   - 🎨 100+ CSS 변수 (색상, 타이포그래피, 간격, 테두리, 애니메이션)
   - 🔄 한 곳만 수정하면 전체 앱 스타일 변경

2. **Storybook 설정** 📚
   - React + Vite 통합
   - 디자인 토큰 자동 로드
   - Addons: a11y, docs, vitest

3. **아토믹 디자인 컴포넌트** 🧬
   - **Atoms (5개)**: Button, Input, Label, Textarea, Select
   - **Molecules (2개)**: FormField, Card
   - **Organisms (2개)**: Modal, Navigation

4. **모든 컴포넌트에 Storybook 스토리**
   - 각 컴포넌트별 10+ 스토리
   - 실제 사용 예시 포함

### 🔄 마이그레이션 필요한 기존 컴포넌트

```
src/components/ (기존)
├── AddIngredientModal.tsx      → Modal + FormField로 재구성
├── DevelopMode.tsx             → 새 컴포넌트 사용
├── FormulationMode.tsx         → 새 컴포넌트 사용
├── IngredientManager.tsx       → Card, Navigation 사용
├── LibraryView.tsx             → Card, Navigation 사용
└── App.tsx                     → Navigation 사용
```

---

## 🔧 마이그레이션 전략

### 옵션 A: 점진적 마이그레이션 (권장)
기존 컴포넌트를 유지하면서 새 컴포넌트를 점진적으로 도입합니다.

**장점:**
- 앱이 깨지지 않음
- 단계별로 테스트 가능
- 롤백 가능

**단계:**
1. App.tsx의 네비게이션을 새 Navigation 컴포넌트로 교체
2. AddIngredientModal을 새 Modal로 재작성
3. 각 페이지의 버튼/입력 필드를 새 atoms로 교체
4. LibraryView의 카드를 새 Card 컴포넌트로 교체

### 옵션 B: 전면 리팩터링
한 번에 모든 컴포넌트를 새 구조로 변경합니다.

**장점:**
- 빠른 전환
- 일관된 코드베이스

**단점:**
- 일시적으로 앱이 작동하지 않을 수 있음
- 많은 변경이 한 번에 발생

---

## 📝 마이그레이션 예시

### 1. 기존 버튼 → 새 Button 컴포넌트

**기존 코드:**
```tsx
<button
  className="save-button"
  onClick={handleSave}
  disabled={loading}
>
  {loading ? 'Saving...' : 'Save'}
</button>
```

**새 코드:**
```tsx
import { Button } from '@/components/atoms';

<Button
  variant="primary"
  onClick={handleSave}
  disabled={loading}
>
  {loading ? 'Saving...' : 'Save'}
</Button>
```

**CSS 삭제 가능:**
```css
/* ❌ 이제 필요 없음 - 디자인 토큰으로 자동 처리 */
.save-button {
  padding: 12px 30px;
  background: var(--secondary-color);
  color: white;
  /* ... */
}
```

---

### 2. 기존 Form → 새 FormField

**기존 코드:**
```tsx
<div className="form-group">
  <label htmlFor="email">
    Email <span style={{ color: 'red' }}>*</span>
  </label>
  <input
    id="email"
    type="email"
    placeholder="Enter email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
  {error && <span className="error">{error}</span>}
</div>
```

**새 코드:**
```tsx
import { FormField } from '@/components/molecules';

<FormField
  id="email"
  label="Email"
  type="input"
  required
  placeholder="Enter email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  errorMessage={error}
/>
```

---

### 3. App.tsx 네비게이션 교체

**기존 코드:**
```tsx
<nav className="app-nav">
  <button
    className={`nav-button ${currentTab === 'generate' ? 'active' : ''}`}
    onClick={() => setCurrentTab('generate')}
  >
    Generate
  </button>
  {/* ... */}
</nav>
```

**새 코드:**
```tsx
import { Navigation } from '@/components/organisms';

<Navigation
  items={[
    { id: 'generate', label: 'Generate' },
    { id: 'ingredients', label: 'Ingredients' },
    { id: 'accords', label: 'Accords' },
    { id: 'formulas', label: 'Formulas' },
  ]}
  activeId={currentTab}
  onItemClick={setCurrentTab}
  orientation="vertical"
/>
```

**CSS 삭제 가능:**
```css
/* ❌ 100+ 줄의 네비게이션 CSS 제거 가능 */
.app-nav { /* ... */ }
.nav-button { /* ... */ }
.nav-button.active { /* ... */ }
/* 모든 미디어 쿼리 등... */
```

---

### 4. AddIngredientModal 재작성

**새 구조:**
```tsx
import { Modal } from '@/components/organisms';
import { FormField } from '@/components/molecules';
import { Button } from '@/components/atoms';

function AddIngredientModal({ isOpen, onClose, onSubmit }) {
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
          <Button variant="primary" onClick={onSubmit}>
            Add Ingredient
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <FormField
          id="name"
          label="Ingredient Name"
          type="input"
          required
          placeholder="e.g., Lavender Essential Oil"
        />

        <FormField
          id="inci"
          label="INCI Name"
          type="input"
          placeholder="Chemical name"
        />

        <FormField
          id="note"
          label="Note Family"
          type="select"
          required
        >
          <option value="">Select note family...</option>
          <option value="top">Top Note</option>
          <option value="middle">Middle Note</option>
          <option value="base">Base Note</option>
        </FormField>

        <FormField
          id="description"
          label="Odor Description"
          type="textarea"
          rows={4}
          placeholder="Describe the scent..."
        />
      </div>
    </Modal>
  );
}
```

**결과:**
- 340줄 → 60줄로 축소
- 모든 CSS 제거 (디자인 토큰 사용)
- 일관된 스타일
- 접근성 자동 처리

---

## 🎯 마이그레이션 체크리스트

### Phase 1: 기본 요소 교체
- [ ] App.tsx의 네비게이션 → Navigation 컴포넌트
- [ ] 모든 `<button>` → Button 컴포넌트
- [ ] 모든 `<input>` → Input/FormField 컴포넌트
- [ ] 모든 `<textarea>` → Textarea/FormField 컴포넌트
- [ ] 모든 `<select>` → Select/FormField 컴포넌트

### Phase 2: 복합 컴포넌트 교체
- [ ] AddIngredientModal → Modal + FormField로 재작성
- [ ] LibraryView의 카드 → Card 컴포넌트
- [ ] IngredientManager의 카드 → Card 컴포넌트

### Phase 3: CSS 정리
- [ ] 기존 컴포넌트 CSS 파일 삭제
- [ ] App.css에서 중복 스타일 제거
- [ ] 디자인 토큰만 사용하도록 확인

### Phase 4: 테스트
- [ ] 모든 페이지 기능 테스트
- [ ] 반응형 디자인 확인
- [ ] 디자인 토큰 변경 테스트
- [ ] Storybook에서 모든 컴포넌트 확인

---

## 🚀 빠른 시작

### 1. npm 패키지 설치
```bash
cd /Users/minhye/myproject/fragrance/frontend
sudo chown -R 501:20 "/Users/minhye/.npm"  # npm 권한 수정
npm install
```

### 2. Storybook 실행
```bash
npm run storybook
```

### 3. 디자인 토큰 테스트
`/src/styles/tokens/colors.css`에서 `--color-primary` 값 변경 후 Storybook 확인

### 4. 첫 번째 마이그레이션
App.tsx의 네비게이션부터 시작 (가장 쉬운 작업)

---

## 💡 팁

### CSS 변수 사용하기
기존 CSS에서도 디자인 토큰 사용 가능:

```css
/* ❌ 기존 방식 */
.my-element {
  color: #666;
  font-size: 16px;
  padding: 12px;
}

/* ✅ 토큰 사용 */
.my-element {
  color: var(--color-text-primary);
  font-size: var(--font-size-md);
  padding: var(--spacing-md);
}
```

### CSS Modules 파일명
새 컴포넌트 CSS는 `.module.css` 확장자 사용:
```tsx
// MyComponent.tsx
import styles from './MyComponent.module.css';

<div className={styles.container}>...</div>
```

---

## 📞 도움이 필요한가요?

- 📚 `/src/components/README.md` - 컴포넌트 사용법
- 🎨 Storybook - 모든 컴포넌트 예시
- 🔍 각 컴포넌트의 `.stories.tsx` 파일 - 실제 사용 코드

---

**Happy Coding! 🎉**
