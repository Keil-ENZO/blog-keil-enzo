import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

function today() {
  return new Date().toISOString().split("T")[0];
}

export const track = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const date = today();
    const existing = await ctx.db
      .query("postViews")
      .withIndex("by_post_date", (q) =>
        q.eq("postId", args.postId).eq("date", date)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { count: existing.count + 1 });
    } else {
      await ctx.db.insert("postViews", { postId: args.postId, date, count: 1 });
    }
  },
});

export const totalByPost = query({
  args: {},
  handler: async (ctx) => {
    const allViews = await ctx.db.query("postViews").collect();
    const totals: Record<string, number> = {};
    for (const v of allViews) {
      const key = v.postId as string;
      totals[key] = (totals[key] ?? 0) + v.count;
    }
    return totals;
  },
});

export const last30Days = query({
  args: {},
  handler: async (ctx) => {
    const allViews = await ctx.db.query("postViews").collect();

    const days: { date: string; label: string; count: number }[] = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const date = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
      days.push({ date, label, count: 0 });
    }

    for (const view of allViews) {
      const day = days.find((d) => d.date === view.date);
      if (day) day.count += view.count;
    }

    return days;
  },
});

export const statsByPost = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const views = await ctx.db
      .query("postViews")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();

    const total = views.reduce((sum, v) => sum + v.count, 0);

    const days: { date: string; label: string; count: number }[] = [];
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const date = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
      const found = views.find((v) => v.date === date);
      days.push({ date, label, count: found?.count ?? 0 });
    }

    return { total, last14Days: days };
  },
});
