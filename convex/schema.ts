import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    avatarUrl: v.optional(v.string()),
    role: v.union(v.literal("admin"), v.literal("author"), v.literal("reader")),
  }).index("by_clerkId", ["clerkId"]),

  posts: defineTable({
    title: v.string(),
    slug: v.string(),
    content: v.string(),
    excerpt: v.optional(v.string()),
    authorId: v.id("users"),
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived")
    ),
    publishedAt: v.optional(v.number()),
  })
    .index("by_slug", ["slug"])
    .index("by_author", ["authorId"])
    .index("by_status", ["status"]),

  tags: defineTable({
    name: v.string(),
    slug: v.string(),
  }).index("by_slug", ["slug"]),

  postTags: defineTable({
    postId: v.id("posts"),
    tagId: v.id("tags"),
  })
    .index("by_post", ["postId"])
    .index("by_tag", ["tagId"]),
});
