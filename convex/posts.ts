import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

async function withTags(ctx: any, post: any) {
  const author = await ctx.db.get(post.authorId);
  const links = await ctx.db
    .query("postTags")
    .withIndex("by_post", (q: any) => q.eq("postId", post._id))
    .collect();
  const tags = (await Promise.all(links.map((l: any) => ctx.db.get(l.tagId)))).filter(Boolean);
  const coverUrl = post.coverImageId ? await ctx.storage.getUrl(post.coverImageId) : null;
  return { ...post, author, tags, coverUrl };
}

export const listPublished = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .order("desc")
      .collect();
    return Promise.all(posts.map((p) => withTags(ctx, p)));
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Non authentifié");
    const posts = await ctx.db.query("posts").order("desc").collect();
    return Promise.all(posts.map((p) => withTags(ctx, p)));
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const post = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (!post) return null;
    return withTags(ctx, post);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    excerpt: v.optional(v.string()),
    tagIds: v.optional(v.array(v.id("tags"))),
    coverImageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Non authentifié");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("Utilisateur non trouvé");
    if (user.role !== "admin" && user.role !== "author") throw new Error("Accès refusé");

    const slug =
      args.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") +
      "-" +
      Date.now();

    const postId = await ctx.db.insert("posts", {
      title: args.title,
      slug,
      content: args.content,
      excerpt: args.excerpt,
      authorId: user._id,
      status: "draft",
      ...(args.coverImageId ? { coverImageId: args.coverImageId } : {}),
    });

    for (const tagId of args.tagIds ?? []) {
      await ctx.db.insert("postTags", { postId, tagId });
    }

    return postId;
  },
});

export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    if (args.query.trim().length < 2) return [];
    const byTitle = await ctx.db
      .query("posts")
      .withSearchIndex("search_title", (q) =>
        q.search("title", args.query).eq("status", "published")
      )
      .take(5);
    const byExcerpt = await ctx.db
      .query("posts")
      .withSearchIndex("search_excerpt", (q) =>
        q.search("excerpt", args.query).eq("status", "published")
      )
      .take(5);
    const seen = new Set<string>();
    const results = [];
    for (const post of [...byTitle, ...byExcerpt]) {
      if (!seen.has(post._id as string)) {
        seen.add(post._id as string);
        results.push(post);
      }
    }
    return results.slice(0, 8);
  },
});

export const getById = query({
  args: { id: v.id("posts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.id);
    if (!post) return null;
    return withTags(ctx, post);
  },
});

export const getRelated = query({
  args: { postId: v.id("posts"), tagIds: v.array(v.id("tags")) },
  handler: async (ctx, args) => {
    if (args.tagIds.length === 0) return [];
    const seen = new Set<string>();
    const candidates: typeof args.postId[] = [];
    for (const tagId of args.tagIds) {
      const links = await ctx.db
        .query("postTags")
        .withIndex("by_tag", (q: any) => q.eq("tagId", tagId))
        .collect();
      for (const link of links) {
        const id = link.postId as string;
        if (id !== (args.postId as string) && !seen.has(id)) {
          seen.add(id);
          candidates.push(link.postId);
        }
      }
    }
    const related = await Promise.all(
      candidates.slice(0, 3).map(async (id) => {
        const post = await ctx.db.get(id);
        if (!post || post.status !== "published") return null;
        return post;
      })
    );
    return related.filter(Boolean);
  },
});

export const update = mutation({
  args: {
    id: v.id("posts"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    tagIds: v.optional(v.array(v.id("tags"))),
    coverImageId: v.optional(v.union(v.id("_storage"), v.null())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Non authentifié");
    const { id, tagIds, coverImageId, ...fields } = args;
    const patch: Partial<{ title: string; content: string; excerpt: string; coverImageId: any }> = {};
    if (fields.title !== undefined) patch.title = fields.title;
    if (fields.content !== undefined) patch.content = fields.content;
    if (fields.excerpt !== undefined) patch.excerpt = fields.excerpt;

    if (coverImageId === null) {
      const post = await ctx.db.get(id);
      if (post) {
        const { _id, _creationTime, coverImageId: _cov, ...rest } = post as any;
        await ctx.db.replace(id, rest);
      }
    } else if (coverImageId !== undefined) {
      patch.coverImageId = coverImageId;
    }

    if (Object.keys(patch).length > 0) await ctx.db.patch(id, patch);

    if (tagIds !== undefined) {
      const existing = await ctx.db
        .query("postTags")
        .withIndex("by_post", (q: any) => q.eq("postId", id))
        .collect();
      for (const link of existing) await ctx.db.delete(link._id);
      for (const tagId of tagIds) await ctx.db.insert("postTags", { postId: id, tagId });
    }
  },
});

export const publish = mutation({
  args: { id: v.id("posts") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: "published", publishedAt: Date.now() });
    await ctx.scheduler.runAfter(0, internal.newsletter.sendNewPostEmail, {
      postId: args.id,
    });
  },
});

export const unpublish = mutation({
  args: { id: v.id("posts") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: "draft" });
  },
});

export const remove = mutation({
  args: { id: v.id("posts") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const createAndPublish = internalMutation({
  args: {
    title: v.string(),
    content: v.string(),
    excerpt: v.optional(v.string()),
    tagIds: v.optional(v.array(v.id("tags"))),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.query("users").first();
    if (!user) throw new Error("Aucun utilisateur trouvé");

    const slug =
      args.title.toLowerCase().normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") + "-" + Date.now();

    const postId = await ctx.db.insert("posts", {
      title: args.title,
      slug,
      content: args.content,
      excerpt: args.excerpt,
      authorId: user._id,
      status: "published",
      publishedAt: Date.now(),
    });

    for (const tagId of args.tagIds ?? []) {
      await ctx.db.insert("postTags", { postId, tagId });
    }

    return postId;
  },
});