import { query, mutation } from "./_generated/server";

export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});

export const upsertUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Non authentifié");

    const adminEmail = process.env.ADMIN_EMAIL;
    const isAdmin = adminEmail && identity.email === adminEmail;

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: identity.name ?? existing.name,
        email: identity.email ?? existing.email,
        avatarUrl: identity.pictureUrl ?? existing.avatarUrl,
        // Promouvoir en admin si l'email correspond
        ...(isAdmin && existing.role !== "admin" ? { role: "admin" as const } : {}),
      });
    } else {
      await ctx.db.insert("users", {
        clerkId: identity.subject,
        name: identity.name ?? "Anonyme",
        email: identity.email ?? "",
        avatarUrl: identity.pictureUrl ?? undefined,
        role: isAdmin ? "admin" : "reader",
      });
    }
  },
});
