"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setDebouncedQuery("");
    }
  }, [open]);

  const results = useQuery(
    api.posts.search,
    debouncedQuery.trim().length >= 2 ? { query: debouncedQuery } : "skip"
  );

  function handleSelect(slug: string) {
    router.push(`/posts/${slug}`);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden" showCloseButton={false}>
        <div className="flex items-center gap-2 px-4 py-3 border-b">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un article..."
            className="border-0 shadow-none focus-visible:ring-0 h-8 px-0"
            autoFocus
          />
        </div>

        <div className="max-h-72 overflow-y-auto">
          {debouncedQuery.trim().length < 2 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Tape au moins 2 caractères...
            </p>
          )}

          {debouncedQuery.trim().length >= 2 && results === undefined && (
            <p className="py-8 text-center text-sm text-muted-foreground">Recherche...</p>
          )}

          {results?.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Aucun résultat pour &quot;{debouncedQuery}&quot;
            </p>
          )}

          {results && results.length > 0 && (
            <div className="py-2">
              {results.map((post: any) => (
                <button
                  key={post._id}
                  className="w-full text-left px-4 py-3 hover:bg-muted transition-colors"
                  onClick={() => handleSelect(post.slug)}
                >
                  <p className="text-sm font-medium">{post.title}</p>
                  {post.excerpt && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {post.excerpt}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
