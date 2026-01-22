# parkblo

Minimalist & Pixel Art Developer Blog built with Next.js and MDX.

## 🚀 Key Features

- **Strict Dark Theme**: Deep dark gray aesthetics for focus.
- **Galmuri9 Typography**: Authentic pixel-art font for a retro tech feel.
- **MDX Powered**: Write posts in Markdown with full support for React components.
- **Pixel Interactions**: Reaction buttons and animated speech bubbles.
- **SEO Optimized**: Dynamic metadata, sitemap, and robots.txt ready.
- **Community Comments**: Integrated with Utterances (GitHub Issues).

## 🛠️ Project Setup

### 1. Installation

```bash
npm install
```

### 2. Environment Variables

No environment variables are required for the base setup.

### 3. Local Development

```bash
npm run dev
```

## ✍️ Writing Guide

1. Place your `.mdx` files in the `_posts` directory.
2. Ensure the following frontmatter structure:

```markdown
---
title: "Post Title"
description: "Brief description"
category: "Development" # One of: Development, Design, Thoughts
date: "YYYY-MM-DD"
icon: "pix-code" # From pixelarticons
---
```

## 🌐 Deployment

This project is optimized for **Vercel**. Simply connect your GitHub repository and it will deploy automatically.

## 💬 Comment System (Giscus)

We use [Giscus](https://giscus.app) for comments. It uses GitHub Discussions to store comments.

### Setup Instructions

1. **Public Repo**: Your blog repository MUST be **public**.
2. **Enable Discussions**: Enable the "Discussions" feature in your GitHub repository settings.
3. **Install App**: Install the [Giscus app](https://github.com/apps/giscus) on your repository.
4. **Get Config**: Go to [giscus.app](https://giscus.app) and enter your repository details. It will generate the configuration values.
5. **Update Code**: Update `src/components/Giscus.tsx` with your values:
   ```tsx
   repo = "username/repo-name";
   repoId = "YOUR_REPO_ID";
   category = "Comments"; // or your chosen category
   categoryId = "YOUR_CATEGORY_ID";
   ```

> **Note**: Since Giscus configuration is public by design, it's safe to commit these values to your repository.

## 🌏 Alignment & Polish

- **Layout**: Centered with a `max-w-[840px]` container.
- **Interactions**: Reactions now support **toggling** (+1/-1) with `localStorage` tracking per user session.

---

Built with ❤️ by parkblo.
