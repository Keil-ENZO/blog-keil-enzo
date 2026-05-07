"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Authenticated, Unauthenticated } from "convex/react";
import { SignInButton } from "@clerk/nextjs";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

export default function PostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = useQuery(api.posts.getBySlug, { slug });
  const trackView = useMutation(api.views.track);

  useEffect(() => {
    if (post?._id) void trackView({ postId: post._id });
  }, [post?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (post === undefined) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="space-y-4 animate-pulse">
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
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground mb-4">Article introuvable.</p>
        <Link href="/">
          <Button variant="outline">Retour à l&apos;accueil</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1.5 -ml-2">
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">
        <article>
          <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-4">{post.title}</h1>
            <div className="flex items-center gap-3">
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
            </div>
          </header>

          <Separator className="mb-8" />

          <div className="space-y-4 text-base leading-relaxed">
            {post.content.split("\n").map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </article>

        <Separator className="my-12" />

        <CommentsSection postId={post._id} />
      </main>
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
            <Button variant="outline" size="sm">
              Se connecter
            </Button>
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
