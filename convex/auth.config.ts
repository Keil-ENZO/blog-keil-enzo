import { AuthConfig } from "convex/server";

// On accepte l'instance Clerk de dev (via la variable d'env, présente en local)
// ET l'instance de prod (issuer en dur), pour que l'auth fonctionne quel que soit
// le déploiement, même quand auth.config.ts est évalué avec l'env local.
const domains = [
  process.env.CLERK_JWT_ISSUER_DOMAIN,
  "https://clerk.keil-enzo.com",
].filter((domain): domain is string => Boolean(domain));

export default {
  providers: [...new Set(domains)].map((domain) => ({
    domain,
    applicationID: "convex",
  })),
} satisfies AuthConfig;
