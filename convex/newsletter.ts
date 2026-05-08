import { mutation, internalAction, internalQuery, query } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";

export const subscribe = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Adresse email invalide");
    }
    const existing = await ctx.db
      .query("subscribers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (existing) return { alreadySubscribed: true };
    const token =
      Date.now().toString(36) + Math.random().toString(36).slice(2);
    await ctx.db.insert("subscribers", {
      email,
      token,
      subscribedAt: Date.now(),
    });
    return { alreadySubscribed: false };
  },
});

export const unsubscribeByToken = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const sub = await ctx.db
      .query("subscribers")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();
    if (!sub) return { found: false };
    await ctx.db.delete(sub._id);
    return { found: true };
  },
});

export const count = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Non authentifié");
    const subs = await ctx.db.query("subscribers").take(10000);
    return subs.length;
  },
});

export const listAllInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("subscribers").take(10000);
  },
});

export const sendNewPostEmail = internalAction({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("RESEND_API_KEY non configuré — email non envoyé");
      return;
    }

    const post = await ctx.runQuery(api.posts.getById, { id: args.postId });
    if (!post) return;

    const subscribers = await ctx.runQuery(internal.newsletter.listAllInternal);
    if (subscribers.length === 0) return;

    const fromEmail =
      process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
    const siteUrl =
      process.env.SITE_URL ?? "http://localhost:3000";

    for (const sub of subscribers) {
      const unsubscribeUrl = `${siteUrl}/unsubscribe?token=${sub.token}`;
      const html = `
<!DOCTYPE html>
<html>
<body style="font-family:system-ui,-apple-system,sans-serif;max-width:580px;margin:0 auto;padding:32px 24px;color:#111;">
  <p style="color:#888;font-size:12px;margin-bottom:24px;text-transform:uppercase;letter-spacing:.08em;">keil-enzo.dev</p>
  <h1 style="font-size:22px;font-weight:700;margin:0 0 12px;">${post.title}</h1>
  ${post.excerpt ? `<p style="color:#555;margin:0 0 24px;line-height:1.6;">${post.excerpt}</p>` : ""}
  <a href="${siteUrl}/posts/${post.slug}" style="display:inline-block;background:#111;color:#fff;padding:10px 22px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:500;">Lire l'article →</a>
  <hr style="margin:40px 0;border:none;border-top:1px solid #eee;">
  <p style="font-size:12px;color:#aaa;">Tu reçois cet email car tu t'es abonné à keil-enzo.dev.<br>
  <a href="${unsubscribeUrl}" style="color:#aaa;">Se désabonner</a></p>
</body>
</html>`;

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: sub.email,
          subject: `Nouvel article : ${post.title}`,
          html,
        }),
      });
    }
  },
});
