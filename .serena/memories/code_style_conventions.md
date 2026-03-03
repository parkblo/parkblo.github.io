# Code Style & Conventions
- Language: TypeScript + React function components.
- Import style: 절대 경로 alias(`@/`) 적극 사용.
- Styling: Tailwind utility class 중심, 전역 토큰은 `src/app/globals.css`에 정의.
- Theme system: CSS custom properties를 semantic token(`--background`, `--foreground` 등)으로 매핑.
- MDX rendering: `src/components/MDXComponents.tsx`에서 HTML element override.
- Naming: 컴포넌트 PascalCase, 변수/함수 camelCase, 상수는 UPPER_SNAKE_CASE 또는 의미 기반 camelCase.
- Comments: 필요한 경우에만 간결하게 사용.