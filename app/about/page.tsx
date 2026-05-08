import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { GitBranch, Mail } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "À propos",
  description: "Qui est Keil-Enzo ? Développeur passionné par le web et les nouvelles technologies.",
};

const skills = [
  "TypeScript", "Python", "Next.js", "Convex", "Tailwind CSS",
  "Node.js", "LLMs", "Blockchain", "Git",
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-16">
        {/* Hero */}
        <section className="mb-14">
          <div className="flex items-start gap-6 mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/60 flex items-center justify-center text-3xl font-bold text-primary shrink-0">
              E
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-1">Keil-Enzo</h1>
              <p className="text-muted-foreground">Développeur · Créateur · Curieux</p>
            </div>
          </div>
          <p className="text-base leading-relaxed text-muted-foreground">
            Bienvenue sur mon blog. J&apos;écris sur le développement web, les outils que j&apos;utilise
            au quotidien, et les projets sur lesquels je travaille. Ce blog est construit en public —
            tu peux suivre son évolution en temps réel.
          </p>
        </section>

        <Separator className="mb-14" />

        {/* Ce que je fais */}
        <section className="mb-14">
          <h2 className="text-xl font-bold mb-4">Ce que je fais</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Je construis des applications web et des outils propulsés par l&apos;IA — chatbots, intégrations
            LLM, automatisations. J&apos;aime explorer ce qui est possible à l&apos;intersection du code
            et des modèles de langage, aussi bien en Python qu&apos;avec Next.js côté web.
          </p>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        </section>

        <Separator className="mb-14" />

        {/* Ce blog */}
        <section className="mb-14">
          <h2 className="text-xl font-bold mb-4">Ce blog</h2>
          <div className="space-y-3 text-muted-foreground leading-relaxed">
            <p>
              J&apos;écris sur ce qui m&apos;intéresse : des tutoriels techniques, des retours
              d&apos;expérience sur des projets, des découvertes d&apos;outils et parfois juste
              des réflexions sur le métier.
            </p>
            <p>
              Pas de contenu payant, pas de newsletter agressive — juste du contenu honnête publié
              quand j&apos;ai quelque chose à dire.
            </p>
          </div>
        </section>

        <Separator className="mb-14" />

        {/* Contact */}
        <section>
          <h2 className="text-xl font-bold mb-4">Me contacter</h2>
          <p className="text-muted-foreground mb-6">
            Une question, une idée de collaboration, ou juste envie de dire bonjour ?
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="https://github.com/Keil-ENZO" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="gap-2">
                <GitBranch className="h-4 w-4" />
                GitHub
              </Button>
            </a>
            <a href="mailto:enzo.keil06@icloud.com">
              <Button variant="outline" className="gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Button>
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
