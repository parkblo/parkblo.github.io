"use client";

import Giscus from "@giscus/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Comments() {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="mt-10">
      <Giscus
        id="comments"
        repo="parkblo/parkblo.github.io"
        repoId="R_kgDOQ8nbXg"
        category="Announcements"
        categoryId="DIC_kwDOQ8nbXs4C1UZO"
        mapping="pathname"
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme={theme === "system" ? systemTheme : theme}
        lang="ko"
        loading="lazy"
      />
    </div>
  );
}
