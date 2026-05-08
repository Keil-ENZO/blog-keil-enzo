import Link from "next/link";
import { NewsletterForm } from "@/components/NewsletterForm";

export function Footer() {
  return (
    <footer className="border-t mt-20">
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">

        {/* Newsletter */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-10 p-6 rounded-lg bg-muted/40 border">
          <div className="shrink-0">
            <p className="font-semibold text-sm mb-1">Rester informé</p>
            <p className="text-xs text-muted-foreground">Un email à chaque nouvel article. Pas de spam.</p>
          </div>
          <div className="flex-1">
            <NewsletterForm />
          </div>
        </div>

        {/* Liens bas de page */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Keil-Enzo. Construit avec Convex + Next.js.</p>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:text-foreground transition-colors">
              À propos
            </Link>
            <a
              href="https://github.com/Keil-ENZO"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
