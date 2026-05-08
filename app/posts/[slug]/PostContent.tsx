"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Clock, Link2, Share2 } from "lucide-react";
import { Authenticated, Unauthenticated } from "convex/react";
import { SignInButton } from "@clerk/nextjs";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

function readingTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function PostContent({ slug }: { slug: string }) {
  const post = useQuery(api.posts.getBySlug, { slug });
  const trackView = useMutation(api.views.track);

  const tagIds = (post?.tags ?? []).map((t: any) => t._id as Id<"tags">);
  const related = useQuery(
    api.posts.getRelated,
    post?._id ? { postId: post._id, tagIds } : "skip"
  );

  useEffect(() => {
    if (post?._id) void trackView({ postId: post._id });
  }, [post?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Lien copié !");
  }

  function handleShareTwitter() {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(post?.title ?? "");
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  }

  if (post === undefined) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-12 space-y-4 animate-pulse">
          <div className="h-8 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-1/4" />
          <div className="h-px bg-muted" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-4 bg-muted rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (post === null) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground mb-4">Article introuvable.</p>
          <Link href="/">
            <Button variant="outline">Retour à l&apos;accueil</Button>
          </Link>
        </div>
      </div>
    );
  }

  const minutes = readingTime(post.content);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-12">
        <article>
          <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-4">{post.title}</h1>
            <div className="flex items-center gap-3 flex-wrap">
              <Avatar className="h-8 w-8">
                <AvatarImage src={post.author?.avatarUrl} />
                <AvatarFallback className="text-xs">
                  {post.author?.name?.[0]?.toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{post.author?.name ?? "Anonyme"}</p>
                {post.publishedAt && (
                  <p className="text-xs text-muted-foreground">
                    {new Date(post.publishedAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                <Clock className="h-3.5 w-3.5" />
                {minutes} min de lecture
              </div>
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {post.tags.map((tag: any) =>
                  tag ? (
                    <Badge key={tag._id} variant="secondary" className="text-xs">
                      {tag.name}
                    </Badge>
                  ) : null
                )}
              </div>
            )}
          </header>

          {(post as any).coverUrl && (
            <div className="mb-8 -mx-4 sm:mx-0 rounded-none sm:rounded-lg overflow-hidden">
              <img
                src={(post as any).coverUrl}
                alt={post.title}
                className="w-full h-64 sm:h-80 object-cover"
              />
            </div>
          )}

          <Separator className="mb-8" />

          <div
            className="prose prose-neutral dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        {/* Boutons de partage */}
        <div className="flex items-center gap-2 mt-10">
          <span className="text-sm text-muted-foreground">Partager :</span>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleCopyLink}>
            <Link2 className="h-3.5 w-3.5" />
            Copier le lien
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleShareTwitter}>
            <Share2 className="h-3.5 w-3.5" />
            Twitter / X
          </Button>
        </div>

        {/* Articles liés */}
        {related && related.length > 0 && (
          <>
            <Separator className="my-10" />
            <section>
              <h2 className="text-lg font-bold mb-4">Articles liés</h2>
              <div className="space-y-3">
                {related.map((r: any) => (
                  <Link key={r._id} href={`/posts/${r.slug}`} className="block group">
                    <Card className="transition-colors hover:bg-muted/50">
                      <CardHeader className="py-3">
                        <p className="font-medium group-hover:underline leading-snug">{r.title}</p>
                        {r.publishedAt && (
                          <p className="text-xs text-muted-foreground">
                            {new Date(r.publishedAt).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        )}
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}

        <Separator className="my-12" />

        <CommentsSection postId={post._id} />
      </main>

      <Footer />
    </div>
  );
}

function CommentsSection({ postId }: { postId: Id<"posts"> }) {
  const comments = useQuery(api.comments.listByPost, { postId });
  const me = useQuery(api.users.getMe);
  const addComment = useMutation(api.comments.create);
  const deleteComment = useMutation(api.comments.remove);

  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit() {
    if (!content.trim()) return;
    setSending(true);
    try {
      await addComment({ postId, content });
      setContent("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSending(false);
    }
  }

  async function handleDelete(id: Id<"comments">) {
    try {
      await deleteComment({ id });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    }
  }

  return (
    <section>
      <h2 className="text-xl font-bold mb-6">
        Commentaires {comments && comments.length > 0 && `(${comments.length})`}
      </h2>

      <Authenticated>
        <div className="mb-8 space-y-3">
          <Textarea
            placeholder="Laisse un commentaire..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
          />
          <Button onClick={handleSubmit} disabled={sending || !content.trim()} size="sm">
            Publier
          </Button>
        </div>
      </Authenticated>

      <Unauthenticated>
        <div className="mb-8 p-4 rounded-lg border bg-muted/50 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Connecte-toi pour laisser un commentaire.
          </p>
          <SignInButton mode="modal">
            <Button variant="outline" size="sm">Se connecter</Button>
          </SignInButton>
        </div>
      </Unauthenticated>

      {comments === undefined && (
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded animate-pulse" />
          ))}
        </div>
      )}

      {comments?.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Aucun commentaire pour l&apos;instant. Sois le premier !
        </p>
      )}

      {comments && comments.length > 0 && (
        <div className="space-y-5">
          {comments.map((comment) => {
            const isOwner = me?._id === comment.authorId;
            const isAdmin = me?.role === "admin";
            return (
              <div key={comment._id} className="flex gap-3">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={comment.author?.avatarUrl} />
                  <AvatarFallback className="text-xs">
                    {comment.author?.name?.[0]?.toUpperCase() ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-sm font-medium">
                      {comment.author?.name ?? "Anonyme"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment._creationTime).toLocaleDateString("fr-FR")}
                    </span>
                    {(isOwner || isAdmin) && (
                      <button
                        onClick={() => handleDelete(comment._id)}
                        className="ml-auto text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
