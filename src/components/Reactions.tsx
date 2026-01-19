"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface ReactionsProps {
  postSlug: string;
}

const REACTION_TYPES = [
  { label: "Love", icon: "pixelart-icons-font-heart", key: "love" },
  { label: "Zap", icon: "pixelart-icons-font-zap", key: "zap" },
  { label: "Rocket", icon: "pixelart-icons-font-ship", key: "rocket" },
  { label: "Eye", icon: "pixelart-icons-font-eye", key: "eye" },
  { label: "Gift", icon: "pixelart-icons-font-gift", key: "gift" },
];

export default function Reactions({ postSlug }: ReactionsProps) {
  const [counts, setCounts] = useState<Record<string, number>>({
    love: 0,
    zap: 0,
    rocket: 0,
    eye: 0,
    gift: 0,
  });
  const [myReactions, setMyReactions] = useState<Record<string, boolean>>(
    () => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem(`reactions-${postSlug}`);
        return saved ? JSON.parse(saved) : {};
      }
      return {};
    },
  );

  useEffect(() => {
    // Fetch initial counts from Supabase
    const fetchCounts = async () => {
      const { data, error } = await supabase
        .from("reactions")
        .select("type, count")
        .eq("post_slug", postSlug);

      if (data && !error) {
        setCounts((prev) => {
          const newCounts = { ...prev };
          data.forEach((row: { type: string; count: number }) => {
            newCounts[row.type] = row.count;
          });
          return newCounts;
        });
      }
    };

    fetchCounts();
  }, [postSlug]);

  const handleReaction = async (type: string) => {
    const isActive = !!myReactions[type];
    const action = isActive ? "decrement" : "increment";

    // Optimistic UI update
    setCounts((prev) => ({
      ...prev,
      [type]:
        action === "increment" ? prev[type] + 1 : Math.max(0, prev[type] - 1),
    }));

    const newMyReactions = { ...myReactions, [type]: !isActive };
    setMyReactions(newMyReactions);
    localStorage.setItem(
      `reactions-${postSlug}`,
      JSON.stringify(newMyReactions),
    );

    try {
      await fetch("/api/reactions", {
        method: "POST",
        body: JSON.stringify({ postSlug, type, action }),
      });
    } catch (e) {
      console.error("Failed to sync reaction", e);
    }
  };

  return (
    <div className="flex flex-wrap gap-4 mt-8">
      {REACTION_TYPES.map((reac) => {
        const isActive = !!myReactions[reac.key];
        return (
          <button
            key={reac.key}
            onClick={() => handleReaction(reac.key)}
            className={`flex items-center gap-2 px-3 py-1.5 border transition-all rounded-sm group ${
              isActive
                ? "bg-accent/10 border-accent text-accent"
                : "bg-zinc-900 border-zinc-800 hover:border-accent hover:bg-zinc-800 text-zinc-500"
            }`}
          >
            <i
              className={`${reac.icon} text-lg group-hover:scale-110 transition-transform ${
                isActive
                  ? "text-accent"
                  : "text-zinc-400 group-hover:text-white"
              }`}
            />
            <span
              className={`text-[10px] font-bold font-mono ${isActive ? "text-accent" : "group-hover:text-white"}`}
            >
              {counts[reac.key]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
