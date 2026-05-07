import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByPost = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .order("asc")
      .collect();

    return Promise.all(
      comments.map(async (comment) => {
        const author = await ctx.db.get(comment.authorId);
        return { ...comment, author };
      })
    );
  },
});

export const create = mutation({
  args: {
    postId: v.id("posts"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Connecte-toi pour commenter");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("Utilisateur non trouvé");

    if (!args.content.trim()) throw new Error("Le commentaire ne peut pas être vide");

    return await ctx.db.insert("comments", {
      postId: args.postId,
      authorId: user._id,
      content: args.content.trim(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("comments") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Non authentifié");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    const comment = await ctx.db.get(args.id);
    if (!comment) throw new Error("Commentaire introuvable");

    const isOwner = comment.authorId === user?._id;
    const isAdmin = user?.role === "admin";

    if (!isOwner && !isAdmin) throw new Error("Non autorisé");

    await ctx.db.delete(args.id);
  },
});
