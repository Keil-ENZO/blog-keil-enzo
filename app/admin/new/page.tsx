"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { marked } from "marked";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Editor } from "@/components/Editor";
import { TagSelector } from "@/components/TagSelector";
import { CoverImageUpload } from "@/components/CoverImageUpload";
import { ArrowLeft, Loader2, Save, FileText } from "lucide-react";
import { toast } from "sonner";

function stripQuotes(s: string): string {
  return s.replace(/^["'](.+)["']$/, "$1").trim();
}

function parseObsidianMarkdown(text: string): { title: string; excerpt: string; content: string; tags: string[] } {
  let raw = text.trim();
  let title = "";
  let excerpt = "";
  let tags: string[] = [];

  // YAML frontmatter
  if (raw.startsWith("---")) {
    const end = raw.indexOf("---", 3);
    if (end !== -1) {
      const fm = raw.slice(3, end);
      title = stripQuotes(fm.match(/^title:\s*(.+?)\s*$/m)?.[1]?.trim() ?? "");
      excerpt = stripQuotes(fm.match(/^(?:excerpt|description):\s*(.+?)\s*$/m)?.[1]?.trim() ?? "");
      const tagsMatch = fm.match(/^tags:\s*\[(.+?)\]\s*$/m);
      if (tagsMatch) {
        tags = tagsMatch[1].split(",").map((t) => t.trim().replace(/["']/g, "")).filter(Boolean);
      }
      raw = raw.slice(end + 3).trim();
    }
  }

  // Title from first # heading
  if (!title) {
    const m = raw.match(/^#{1,2}\s+(.+)$/m);
    if (m) {
      title = m[1].trim();
      raw = raw.replace(/^#{1,2}\s+.+\n?/, "").trim();
    }
  }

  // Excerpt from first non-heading paragraph
  if (!excerpt) {
    const firstBlock = raw.split(/\n\n/)[0] ?? "";
    if (firstBlock && !firstBlock.startsWith("#")) {
      excerpt = firstBlock.replace(/\n/g, " ").trim().slice(0, 250);
    }
  }

  return { title, excerpt, content: raw, tags };
}

export default function NewPostPage() {
  const router = useRouter();
  const createPost = useMutation(api.posts.create);
  const allTags = useQuery(api.tags.list);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [tagIds, setTagIds] = useState<Id<"tags">[]>([]);
  const [coverImageId, setCoverImageId] = useState<Id<"_storage"> | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editorKey, setEditorKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-save indicator
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout>>(null);

  function scheduleAutoSave() {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      setLastSaved(new Date());
    }, 3000);
  }

  useEffect(() => {
    scheduleAutoSave();
  }, [title, content, excerpt]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleImportObsidian() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const parsed = parseObsidianMarkdown(text);
    if (!parsed.title) {
      toast.error("Impossible de trouver le titre dans ce fichier");
      return;
    }
    const html = await marked.parse(parsed.content);
    setTitle(parsed.title);
    setExcerpt(parsed.excerpt);
    setContent(html);
    setEditorKey((k) => k + 1);
    if (allTags && parsed.tags.length > 0) {
      const matched = allTags
        .filter((tag) => parsed.tags.some((name) => name.toLowerCase() === tag.name.toLowerCase()))
        .map((tag) => tag._id);
      setTagIds(matched);
    }
    toast.success("Article importé depuis Obsidian");
    e.target.value = "";
  }

  async function handleSave() {
    if (!title.trim()) {
      toast.error("Le titre est obligatoire");
      return;
    }
    setSaving(true);
    try {
      await createPost({
        title,
        content,
        excerpt: excerpt || undefined,
        tagIds: tagIds.length > 0 ? tagIds : undefined,
        coverImageId: coverImageId ?? undefined,
      });
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
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="gap-1.5 -ml-2">
              <ArrowLeft className="h-4 w-4" />
              Admin
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            {lastSaved && (
              <span className="text-xs text-muted-foreground hidden sm:block">
                Modifié à {lastSaved.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".md"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button onClick={handleImportObsidian} variant="outline" size="sm" className="gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              Importer Obsidian
            </Button>
            <Button onClick={handleSave} disabled={saving} size="sm" className="gap-1.5">
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Sauvegarder
            </Button>
          </div>
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
          <Label htmlFor="excerpt">Résumé <span className="text-muted-foreground font-normal">(optionnel)</span></Label>
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

        <div className="space-y-2">
          <Label>Contenu</Label>
          <Editor
            key={editorKey}
            content={content}
            onChange={setContent}
            placeholder="Commence à écrire ton article..."
          />
        </div>
      </main>
    </div>
  );
}
