"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { UserButton, SignInButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PenLine } from "lucide-react";

export default function Home() {
  const posts = useQuery(api.posts.listPublished);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg tracking-tight">
            keil-enzo
          </Link>
          <div className="flex items-center gap-3">
            <Authenticated>
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <PenLine className="h-4 w-4" />
                  Écrire
                </Button>
              </Link>
              <UserButton />
            </Authenticated>
            <Unauthenticated>
              <SignInButton mode="modal">
                <Button variant="outline" size="sm">
                  Connexion
                </Button>
              </SignInButton>
            </Unauthenticated>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Articles</h1>
          <p className="text-muted-foreground">Développement, design et tout le reste.</p>
        </div>

        <Separator className="mb-10" />

        {posts === undefined && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        )}

        {posts?.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">Aucun article publié pour l&apos;instant.</p>
            <Authenticated>
              <Link href="/admin/new">
                <Button className="mt-4">Écrire le premier article</Button>
              </Link>
            </Authenticated>
          </div>
        )}

        {posts && posts.length > 0 && (
          <div className="space-y-6">
            {posts.map((post) => (
              <Link key={post._id} href={`/posts/${post.slug}`} className="block group">
                <Card className="transition-colors hover:bg-muted/50">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-4">
                      <h2 className="text-xl font-semibold group-hover:underline leading-snug">
                        {post.title}
                      </h2>
                      <Badge variant="secondary" className="shrink-0 text-xs">
                        {post.publishedAt
                          ? new Date(post.publishedAt).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </Badge>
                    </div>
                  </CardHeader>
                  {post.excerpt && (
                    <CardContent className="pb-2">
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {post.excerpt}
                      </p>
                    </CardContent>
                  )}
                  <CardFooter>
                    <div className="flex items-center gap-2">
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
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
