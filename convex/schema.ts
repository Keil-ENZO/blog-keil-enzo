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
    coverImageId: v.optional(v.id("_storage")),
  })
    .index("by_slug", ["slug"])
    .index("by_author", ["authorId"])
    .index("by_status", ["status"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["status"],
    })
    .searchIndex("search_excerpt", {
      searchField: "excerpt",
      filterFields: ["status"],
    }),

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

  comments: defineTable({
    postId: v.id("posts"),
    authorId: v.id("users"),
    content: v.string(),
    parentId: v.optional(v.id("comments")),
  }).index("by_post", ["postId"]),

  postViews: defineTable({
    postId: v.id("posts"),
    date: v.string(),
    count: v.number(),
  })
    .index("by_post_date", ["postId", "date"])
    .index("by_post", ["postId"]),

  subscribers: defineTable({
    email: v.string(),
    token: v.string(),
    subscribedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_token", ["token"]),
});
