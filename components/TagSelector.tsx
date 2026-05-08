"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";

interface TagSelectorProps {
  selectedIds: Id<"tags">[];
  onChange: (ids: Id<"tags">[]) => void;
}

export function TagSelector({ selectedIds, onChange }: TagSelectorProps) {
  const tags = useQuery(api.tags.list) ?? [];
  const createTag = useMutation(api.tags.create);
  const [newTag, setNewTag] = useState("");
  const [creating, setCreating] = useState(false);

  function toggle(id: Id<"tags">) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((t) => t !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  }

  async function handleCreate() {
    if (!newTag.trim()) return;
    setCreating(true);
    try {
      const id = await createTag({ name: newTag.trim() });
      onChange([...selectedIds, id]);
      setNewTag("");
    } catch {
      toast.error("Erreur lors de la création du tag");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const selected = selectedIds.includes(tag._id);
          return (
            <button
              key={tag._id}
              type="button"
              onClick={() => toggle(tag._id)}
              className="focus:outline-none"
            >
              <Badge
                variant={selected ? "default" : "outline"}
                className="cursor-pointer gap-1 hover:opacity-80 transition-opacity"
              >
                {tag.name}
                {selected && <X className="h-3 w-3" />}
              </Badge>
            </button>
          );
        })}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Nouveau tag..."
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); handleCreate(); }
          }}
          className="h-8 text-sm"
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleCreate}
          disabled={!newTag.trim() || creating}
          className="h-8 gap-1"
        >
          <Plus className="h-3.5 w-3.5" />
          Créer
        </Button>
      </div>
    </div>
  );
}
