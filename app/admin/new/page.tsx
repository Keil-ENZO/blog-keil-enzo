"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function NewPostPage() {
  const router = useRouter();
  const createPost = useMutation(api.posts.create);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!title.trim()) {
      toast.error("Le titre est obligatoire");
      return;
    }
    setSaving(true);
    try {
      await createPost({ title, content, excerpt: excerpt || undefined });
      toast.success("Article sauvegardé en brouillon");
      router.push("/admin");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="gap-1.5 -ml-2">
              <ArrowLeft className="h-4 w-4" />
              Admin
            </Button>
          </Link>
          <Button onClick={handleSave} disabled={saving} size="sm" className="gap-1.5">
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Sauvegarder en brouillon
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Titre</Label>
          <Input
            id="title"
            placeholder="Mon premier article..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-medium h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="excerpt">Résumé (optionnel)</Label>
          <Textarea
            id="excerpt"
            placeholder="Une courte description affichée sur la liste des articles..."
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Contenu</Label>
          <Textarea
            id="content"
            placeholder="Écris ton article ici..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={20}
            className="font-mono text-sm resize-none"
          />
        </div>
      </main>
    </div>
  );
}
