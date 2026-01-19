"use client";

import { useEffect, useRef } from "react";

export default function Comments() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://utteranc.es/client.js";
    script.async = true;
    script.setAttribute("repo", "parkblo/new-blog"); // Placeholder repo
    script.setAttribute("issue-term", "pathname");
    script.setAttribute("theme", "github-dark");
    script.setAttribute("crossorigin", "anonymous");

    const currentRef = ref.current;
    if (currentRef) {
      currentRef.appendChild(script);
    }

    return () => {
      if (currentRef) {
        currentRef.innerHTML = "";
      }
    };
  }, []);

  return <div ref={ref} className="mt-10" />;
}
