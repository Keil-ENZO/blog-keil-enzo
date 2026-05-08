import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tags").order("asc").collect();
  },
});

export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Non authentifié");

    const slug = args.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const existing = await ctx.db
      .query("tags")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();

    if (existing) return existing._id;

    return await ctx.db.insert("tags", { name: args.name, slug });
  },
});

export const getForPost = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const links = await ctx.db
      .query("postTags")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();

    return (await Promise.all(links.map((l) => ctx.db.get(l.tagId)))).filter(Boolean);
  },
});
