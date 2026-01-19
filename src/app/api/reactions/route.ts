import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { postSlug, type, action = "increment" } = await req.json();

    if (!postSlug || !type) {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 },
      );
    }

    // Check if entry exists
    const { data, error: selectError } = await supabase
      .from("reactions")
      .select("count")
      .eq("post_slug", postSlug)
      .eq("type", type)
      .single();

    if (selectError && selectError.code !== "PGRST116") {
      throw selectError;
    }

    const currentCount = data?.count || 0;
    const newCount =
      action === "increment" ? currentCount + 1 : Math.max(0, currentCount - 1);

    if (data) {
      const { error: updateError } = await supabase
        .from("reactions")
        .update({ count: newCount })
        .eq("post_slug", postSlug)
        .eq("type", type);
      if (updateError) throw updateError;
    } else if (action === "increment") {
      const { error: insertError } = await supabase
        .from("reactions")
        .insert({ post_slug: postSlug, type, count: 1 });
      if (insertError) throw insertError;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
