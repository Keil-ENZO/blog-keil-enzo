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

function resolveName(identity: {
  name?: string | null;
  givenName?: string | null;
  familyName?: string | null;
  email?: string | null;
}): string {
  if (identity.name) return identity.name;
  const parts = [identity.givenName, identity.familyName].filter(Boolean).join(" ");
  if (parts) return parts;
  if (identity.email) return identity.email.split("@")[0];
  return "Anonyme";
}

export const upsertUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Non authentifié");

    const adminEmail = process.env.ADMIN_EMAIL;
    const isAdmin = adminEmail && identity.email === adminEmail;
    const name = resolveName(identity);

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name,
        email: identity.email ?? existing.email,
        avatarUrl: identity.pictureUrl ?? existing.avatarUrl,
        ...(isAdmin && existing.role !== "admin" ? { role: "admin" as const } : {}),
      });
    } else {
      await ctx.db.insert("users", {
        clerkId: identity.subject,
        name,
        email: identity.email ?? "",
        avatarUrl: identity.pictureUrl ?? undefined,
        role: isAdmin ? "admin" : "reader",
      });
    }
  },
});
