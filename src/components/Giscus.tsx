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
        repo="parkblo/new-blog"
        repoId="R_kgDONqylgA"
        category="General"
        categoryId="DIC_kwDONqylgM4CmA_l"
        mapping="pathname"
        term="Welcome to @giscus/react component!"
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
