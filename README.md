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

Create a `.env.local` file with the following:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

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

## 🗄️ Database Setup (Supabase)

To enable persistent reactions, created a table in your Supabase project:

1. **Create Table**:
   - name: `reactions`
   - columns:
     - `id`: uuid (primary key)
     - `post_slug`: text
     - `type`: text (e.g., love, zap, rocket)
     - `count`: int8 (default 0)
     - `created_at`: timestamptz

2. **Enable RLS**:
   - Ensure the `anon` role has permissions to `SELECT`, `INSERT`, and `UPDATE` on the `reactions` table.

## 💬 Comment System (Utterances)

Utterances uses GitHub Issues to store comments.

1. **Public Repo**: Your blog repository MUST be **public**.
2. **Install App**: Install the [utterances app](https://github.com/apps/utterances) on your repository.
3. **Configure**: Update `src/components/Comments.tsx` with your repo string:
   ```tsx
   repo = "username/repo-name";
   ```

## 🌏 Alignment & Polish

- **Layout**: Centered with a `max-w-[840px]` container.
- **Interactions**: Reactions now support **toggling** (+1/-1) with `localStorage` tracking per user session.

---

Built with ❤️ by parkblo.
