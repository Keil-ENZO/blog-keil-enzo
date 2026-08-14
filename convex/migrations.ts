import { internalMutation } from "./_generated/server";

// Mutation ponctuelle : consolide toutes les données vers la vraie fiche
// utilisateur d'Enzo (instance Clerk Production), supprime l'ancienne fiche
// "Anonyme" migrée depuis la dev, et corrige nom + rôle.
//
// L'ID Clerk cible vient de l'env Convex, il n'a rien à faire dans le repo :
//   npx convex env set ADMIN_CLERK_ID user_xxx --prod
//
// À lancer une seule fois en prod :
//   npx convex run migrations:consolidateToEnzo --prod
export const consolidateToEnzo = internalMutation({
  args: {},
  handler: async (ctx) => {
    const REAL_CLERK_ID = process.env.ADMIN_CLERK_ID;
    if (!REAL_CLERK_ID) {
      throw new Error(
        "ADMIN_CLERK_ID manquant. Lance : npx convex env set ADMIN_CLERK_ID user_xxx --prod"
      );
    }

    const realUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", REAL_CLERK_ID))
      .unique();
    if (!realUser) throw new Error("Fiche utilisateur réelle introuvable");

    // 1. Nom affiché + rôle admin
    await ctx.db.patch(realUser._id, { name: "Enzo", role: "admin" });

    // 2. Réassigner tous les articles à la vraie fiche
    const posts = await ctx.db.query("posts").collect();
    for (const post of posts) {
      if (post.authorId !== realUser._id) {
        await ctx.db.patch(post._id, { authorId: realUser._id });
      }
    }

    // 3. Réassigner les commentaires (anciennes données migrées)
    const comments = await ctx.db.query("comments").collect();
    for (const comment of comments) {
      if (comment.authorId !== realUser._id) {
        await ctx.db.patch(comment._id, { authorId: realUser._id });
      }
    }

    // 4. Supprimer les autres fiches (l'ancienne "Anonyme")
    const users = await ctx.db.query("users").collect();
    let usersDeleted = 0;
    for (const user of users) {
      if (user._id !== realUser._id) {
        await ctx.db.delete(user._id);
        usersDeleted++;
      }
    }

    return {
      postsReassigned: posts.length,
      commentsReassigned: comments.length,
      usersDeleted,
    };
  },
});
