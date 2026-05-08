"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PenLine, Plus, Eye, EyeOff, Trash2, BarChart2, TrendingUp, Pencil, Users } from "lucide-react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { ViewsChart } from "@/components/ViewsChart";

const statusLabel: Record<string, string> = {
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
  const viewTotals = useQuery(api.views.totalByPost);
  const chartData = useQuery(api.views.last30Days);
  const subscriberCount = useQuery(api.newsletter.count);
  const publish = useMutation(api.posts.publish);
  const unpublish = useMutation(api.posts.unpublish);
  const remove = useMutation(api.posts.remove);

  const totalViews = viewTotals
    ? Object.values(viewTotals as Record<string, number>).reduce((s, n) => s + n, 0)
    : 0;

  const publishedCount = posts?.filter((p) => p.status === "published").length ?? 0;

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

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-8">

        {/* Stats globales */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card>
            <CardHeader className="pb-1 pt-4 px-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Eye className="h-3.5 w-3.5" />
                Vues totales
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-2xl font-bold">{totalViews.toLocaleString("fr-FR")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-1 pt-4 px-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <PenLine className="h-3.5 w-3.5" />
                Articles publiés
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-2xl font-bold">{publishedCount}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-1 pt-4 px-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <BarChart2 className="h-3.5 w-3.5" />
                Articles totaux
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-2xl font-bold">{posts?.length ?? 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-1 pt-4 px-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Users className="h-3.5 w-3.5" />
                Abonnés newsletter
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-2xl font-bold">{subscriberCount ?? 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* Graphique vues 30 jours */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Vues sur les 30 derniers jours
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartData ? (
              <ViewsChart data={chartData} />
            ) : (
              <div className="h-40 bg-muted animate-pulse rounded" />
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* Liste des articles */}
        <div>
          <h2 className="text-lg font-bold mb-4">Articles</h2>

          {posts === undefined && (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          )}

          {posts?.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <PenLine className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>Aucun article. Commence à écrire !</p>
              <Link href="/admin/new">
                <Button className="mt-4">Créer mon premier article</Button>
              </Link>
            </div>
          )}

          {posts && posts.length > 0 && (
            <div className="space-y-3">
              {posts.map((post) => {
                const views = viewTotals?.[post._id as string] ?? 0;
                return (
                  <Card key={post._id}>
                    <CardHeader className="pb-1">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-semibold leading-snug">{post.title}</h3>
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
                    <CardFooter className="gap-2 flex-wrap">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mr-2">
                        <Eye className="h-3.5 w-3.5" />
                        {views.toLocaleString("fr-FR")} vue{views > 1 ? "s" : ""}
                      </div>

                      {post.status === "draft" ? (
                        <Button
                          size="sm"
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

                      <Link href={`/admin/edit/${post._id}`}>
                        <Button size="sm" variant="outline" className="gap-1.5">
                          <Pencil className="h-3.5 w-3.5" />
                          Modifier
                        </Button>
                      </Link>

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
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
