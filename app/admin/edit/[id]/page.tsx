"use client";

import { use, useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Editor } from "@/components/Editor";
import { TagSelector } from "@/components/TagSelector";
import { CoverImageUpload } from "@/components/CoverImageUpload";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const post = useQuery(api.posts.getById, { id: id as Id<"posts"> });
  const updatePost = useMutation(api.posts.update);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [tagIds, setTagIds] = useState<Id<"tags">[]>([]);
  const [coverImageId, setCoverImageId] = useState<Id<"_storage"> | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (post && !ready) {
      setTitle(post.title);
      setContent(post.content);
      setExcerpt(post.excerpt ?? "");
      setTagIds((post.tags ?? []).map((t: any) => t._id as Id<"tags">));
      setCoverImageId((post as any).coverImageId ?? null);
      setCoverPreviewUrl((post as any).coverUrl ?? null);
      setReady(true);
    }
  }, [post, ready]);

  async function handleSave() {
    if (!title.trim()) {
      toast.error("Le titre est obligatoire");
      return;
    }
    setSaving(true);
    try {
      await updatePost({
        id: id as Id<"posts">,
        title,
        content,
        excerpt: excerpt || undefined,
        tagIds,
        coverImageId: coverImageId,
      });
      toast.success("Article mis à jour");
      router.push("/admin");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  }

  if (post === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (post === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Article introuvable.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="gap-1.5 -ml-2">
              <ArrowLeft className="h-4 w-4" />
              Admin
            </Button>
          </Link>
          <Button onClick={handleSave} disabled={saving} size="sm" className="gap-1.5">
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Sauvegarder
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Titre</Label>
          <Input
            id="title"
            placeholder="Mon article..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl font-semibold h-12 border-0 border-b rounded-none px-0 focus-visible:ring-0 shadow-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="excerpt">
            Résumé <span className="text-muted-foreground font-normal">(optionnel)</span>
          </Label>
          <Textarea
            id="excerpt"
            placeholder="Une courte description affichée sur la liste des articles..."
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            className="resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label>Image de couverture <span className="text-muted-foreground font-normal">(optionnel)</span></Label>
          <CoverImageUpload
            value={coverImageId}
            previewUrl={coverPreviewUrl}
            onChange={(id, url) => { setCoverImageId(id); setCoverPreviewUrl(url); }}
          />
        </div>

        <div className="space-y-2">
          <Label>Tags</Label>
          <TagSelector selectedIds={tagIds} onChange={setTagIds} />
        </div>

        {ready && (
          <div className="space-y-2">
            <Label>Contenu</Label>
            <Editor
              content={content}
              onChange={setContent}
              placeholder="Commence à écrire ton article..."
            />
          </div>
        )}
      </main>
    </div>
  );
}
