"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { PenLine, Plus, Eye, EyeOff, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

const statusLabel = {
  draft: "Brouillon",
  published: "Publié",
  archived: "Archivé",
};

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  draft: "secondary",
  published: "default",
  archived: "outline",
};

export default function AdminPage() {
  const posts = useQuery(api.posts.listAll);
  const publish = useMutation(api.posts.publish);
  const unpublish = useMutation(api.posts.unpublish);
  const remove = useMutation(api.posts.remove);

  async function handlePublish(id: Id<"posts">) {
    await publish({ id });
    toast.success("Article publié");
  }

  async function handleUnpublish(id: Id<"posts">) {
    await unpublish({ id });
    toast.success("Article repassé en brouillon");
  }

  async function handleDelete(id: Id<"posts">) {
    await remove({ id });
    toast.success("Article supprimé");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-bold text-lg tracking-tight">
              keil-enzo
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm font-medium">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/new">
              <Button size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" />
                Nouvel article
              </Button>
            </Link>
            <UserButton />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-6">Mes articles</h1>

        {posts === undefined && (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        )}

        {posts?.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <PenLine className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>Aucun article. Commence à écrire !</p>
            <Link href="/admin/new">
              <Button className="mt-4">Créer mon premier article</Button>
            </Link>
          </div>
        )}

        {posts && posts.length > 0 && (
          <div className="space-y-3">
            {posts.map((post) => (
              <Card key={post._id}>
                <CardHeader className="pb-1">
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="font-semibold leading-snug">{post.title}</h2>
                    <Badge variant={statusVariant[post.status]}>
                      {statusLabel[post.status]}
                    </Badge>
                  </div>
                </CardHeader>
                {post.excerpt && (
                  <CardContent className="pb-1">
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {post.excerpt}
                    </p>
                  </CardContent>
                )}
                <CardFooter className="gap-2">
                  {post.status === "draft" ? (
                    <Button
                      size="sm"
                      variant="default"
                      className="gap-1.5"
                      onClick={() => handlePublish(post._id)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Publier
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5"
                      onClick={() => handleUnpublish(post._id)}
                    >
                      <EyeOff className="h-3.5 w-3.5" />
                      Dépublier
                    </Button>
                  )}
                  {post.status === "published" && (
                    <Link href={`/posts/${post.slug}`}>
                      <Button size="sm" variant="ghost">
                        Voir
                      </Button>
                    </Link>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="gap-1.5 text-destructive hover:text-destructive ml-auto"
                    onClick={() => handleDelete(post._id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Supprimer
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
