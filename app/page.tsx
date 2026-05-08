"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Authenticated } from "convex/react";

export default function Home() {
  const posts = useQuery(api.posts.listPublished);
  const allTags = useQuery(api.tags.list) ?? [];
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const filteredPosts = selectedTag
    ? posts?.filter((p) =>
        p.tags?.some((t: any) => t?.slug === selectedTag)
      )
    : posts;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="border-b bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 py-14">
          <p className="text-sm text-muted-foreground mb-2 font-mono">Bienvenue</p>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Salut, je suis <span className="text-primary">Enzo</span>.
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
            Je partage mes explorations en développement, IA, crypto et design.
            Pas de fluff — juste ce que j&apos;apprends vraiment.
          </p>
          <div className="flex gap-3 mt-6">
            <Link href="/about">
              <Button variant="outline" size="sm">En savoir plus</Button>
            </Link>
            <Authenticated>
              <Link href="/admin/new">
                <Button size="sm">Écrire un article</Button>
              </Link>
            </Authenticated>
          </div>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-4 py-10">

        {/* Filtres par tag */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button onClick={() => setSelectedTag(null)}>
              <Badge
                variant={selectedTag === null ? "default" : "outline"}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              >
                Tous
              </Badge>
            </button>
            {allTags.map((tag) => (
              <button key={tag._id} onClick={() => setSelectedTag(
                selectedTag === tag.slug ? null : tag.slug
              )}>
                <Badge
                  variant={selectedTag === tag.slug ? "default" : "outline"}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                >
                  {tag.name}
                </Badge>
              </button>
            ))}
          </div>
        )}

        <Separator className="mb-8" />

        {/* Liste des articles */}
        {filteredPosts === undefined && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        )}

        {filteredPosts?.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">
              {selectedTag
                ? `Aucun article avec ce tag pour l'instant.`
                : "Aucun article publié pour l'instant."}
            </p>
            {selectedTag && (
              <Button variant="ghost" size="sm" className="mt-3" onClick={() => setSelectedTag(null)}>
                Voir tous les articles
              </Button>
            )}
          </div>
        )}

        {filteredPosts && filteredPosts.length > 0 && (
          <div className="space-y-6">
            {filteredPosts.map((post) => (
              <Link key={post._id} href={`/posts/${post.slug}`} className="block group">
                <Card className="transition-colors hover:bg-muted/50 overflow-hidden">
                  {(post as any).coverUrl && (
                    <div className="w-full h-44 overflow-hidden">
                      <img
                        src={(post as any).coverUrl}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-4">
                      <h2 className="text-xl font-semibold group-hover:underline leading-snug">
                        {post.title}
                      </h2>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {post.publishedAt
                          ? new Date(post.publishedAt).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </span>
                    </div>
                  </CardHeader>

                  {post.excerpt && (
                    <CardContent className="pb-2">
                      <p className="text-muted-foreground text-sm line-clamp-2">{post.excerpt}</p>
                    </CardContent>
                  )}

                  <CardFooter className="gap-3 flex-wrap">
                    <div className="flex items-center gap-2 mr-auto">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={post.author?.avatarUrl} />
                        <AvatarFallback className="text-xs">
                          {post.author?.name?.[0]?.toUpperCase() ?? "?"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">
                        {post.author?.name ?? "Anonyme"}
                      </span>
                    </div>
                    {post.tags?.map((tag: any) =>
                      tag ? (
                        <Badge key={tag._id} variant="secondary" className="text-xs">
                          {tag.name}
                        </Badge>
                      ) : null
                    )}
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
