직접 사용하기 위해 만든 Next.js 기반의 미니멀한 픽셀 아트 스타일 블로그입니다.

## 🚀 주요 기능

- **다크/라이트 테마 지원**: 사용자 선호에 따른 테마 토글 가능.
- **MDX 지원**: Markdown + React Component를 완벽하게 지원하는 포스팅 작성.
- **SEO 최적화**: 동적 메타데이터, 사이트맵, robots.txt 제공.
- **커뮤니티 댓글**: Giscus 연동.

## 🛠️ 프로젝트 설정

### 1. 설치

```bash
npm install
```

### 2. 환경 변수

기본 설정을 위해 필요한 환경 변수는 없습니다.

### 3. 로컬 개발 환경 실행

```bash
npm run dev
```

## ✍️ 글 작성 가이드

1. `.mdx` 파일을 `_posts` 디렉토리에 추가합니다.
2. 다음과 같은 frontmatter 구조를 준수해야 합니다:

```markdown
---
title: "포스트 제목"
description: "짧은 요약 설명"
category: "Development" # 다음 중 하나: Development, Design, Thoughts
date: "YYYY-MM-DD"
icon: "pix-code" # pixelarticons에서 선택
---
```

## 🌐 배포

이 프로젝트는 **Vercel** 또는 **GitHub Pages**에 배포할 수 있습니다.

### Vercel

GitHub 저장소를 Vercel에 연결하면 자동으로 배포됩니다.

### GitHub Pages

이 프로젝트는 정적 내보내기(static export) 및 GitHub Actions를 통한 자동 배포가 설정되어 있습니다.

1. **GitHub Pages 활성화**:
   - 저장소의 **Settings** > **Pages**로 이동합니다.
   - **Build and deployment** > **Source**에서 **GitHub Actions**를 선택합니다.
2. **Main 브랜치에 푸시**: 포함된 [deploy.yml](.github/workflows/deploy.yml) 워크플로우가 `main` 브랜치에 푸시될 때마다 사이트를 자동으로 빌드하고 배포합니다.
3. **배포 대기**: 저장소의 **Actions** 탭에서 빌드 진행 상황을 확인할 수 있습니다. 완료되면 `https://<username>.github.io/<repo-name>/`에서 사이트를 확인할 수 있습니다.

> [!IMPORTANT]
> 정적 내보내기 방식이므로 서버 사이드 렌더링(SSR)이나 API 라우트는 작동하지 않습니다.

## 💬 댓글 시스템 (Giscus)

댓글 시스템으로 [Giscus](https://giscus.app)를 사용합니다. GitHub Discussions를 저장소로 활용합니다.

### 설정 방법

1. **공개 저장소**: 블로그 저장소는 반드시 **Public(공개)** 상태여야 합니다.
2. **Discussions 활성화**: GitHub 저장소 설정에서 "Discussions" 기능을 활성화합니다.
3. **앱 설치**: 저장소에 [Giscus 앱](https://github.com/apps/giscus)을 설치합니다.
4. **설정값 획득**: [giscus.app](https://giscus.app)에 접속하여 저장소 정보를 입력하고 생성된 설정값을 확인합니다.
5. **코드 업데이트**: `src/components/Giscus.tsx` 파일을 본인의 설정값으로 업데이트합니다:
   ```tsx
   repo = "username/repo-name";
   repoId = "YOUR_REPO_ID";
   category = "Comments"; // 또는 선택한 카테고리
   categoryId = "YOUR_CATEGORY_ID";
   ```

---

## 🔍 검색 엔진 최적화

블로그가 구글, 네이버 등 검색 엔진에 노출되도록 다음 단계를 수행하세요.

### 1. Google Search Console

1. [구글 서치 콘솔](https://search.google.com/search-console)에 접속하여 Google 계정으로 로그인합니다.
2. **속성 추가**를 클릭하고 **URL 접두어** 방식(예: `https://your-blog.vercel.app`)을 선택하거나 **도메인** 방식을 선택합니다.
3. 소유권 확인:
   - **HTML 태그** 방식을 선택하고 메타 태그를 복사합니다.
   - `src/app/layout.tsx`의 `<head>` 영역(또는 Metadata 설정)에 추가하거나, Vercel 배포 시 환경 변수로 설정할 수도 있지만, 가장 쉬운 방법은 **HTML 파일 업로드**나 **DNS 레코드** 방식입니다.
   - Vercel을 사용한다면 자동으로 제공되는 `.vercel.app` 도메인은 이미 최적화되어 있으나, 커스텀 도메인을 쓴다면 DNS 설정이 필요합니다.
4. **Sitemap 제출**:
   - 좌측 메뉴의 **Sitemaps**를 클릭합니다.
   - `sitemap.xml`을 입력하고 제출합니다. (Next.js가 자동으로 `https://your-domain/sitemap.xml`을 생성합니다)

### 2. Naver Search Advisor

1. [네이버 서치 어드바이저](https://searchadvisor.naver.com/)에 접속합니다.
2. **웹마스터 도구**로 이동하여 사이트 URL을 등록합니다.
3. 소유권 확인:
   - **HTML 태그**를 선택하고, 해당 메타 태그를 `src/app/layout.tsx`의 `metadata` 객체 내 `verification` 속성에 추가합니다.
   ```tsx
   // src/app/layout.tsx 예시
   export const metadata: Metadata = {
     // ...기존 설정
     verification: {
       google: "구글-인증-코드",
       other: {
         "naver-site-verification": "네이버-인증-코드",
       },
     },
   };
   ```
4. **사이트맵 제출**:
   - **요청** > **사이트맵 제출** 메뉴에서 `sitemap.xml`을 입력하고 확인을 누릅니다.

### 3. Robots.txt

이 프로젝트는 `src/app/robots.ts`를 통해 자동으로 `robots.txt`를 생성합니다.
`https://your-domain/robots.txt`에 접속하여 다음과 같이 나오는지 확인하세요:

```txt
User-Agent: *
Allow: /
Disallow: /private/
Sitemap: https://your-domain/sitemap.xml
```
