"use client";

import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CoverImageUploadProps {
  value: Id<"_storage"> | null;
  previewUrl?: string | null;
  onChange: (id: Id<"_storage"> | null, url: string | null) => void;
}

export function CoverImageUpload({ value, previewUrl, onChange }: CoverImageUploadProps) {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Fichier non supporté — choisir une image");
      return;
    }
    setUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!res.ok) throw new Error("Échec de l'upload");
      const { storageId } = await res.json();
      const localUrl = URL.createObjectURL(file);
      onChange(storageId as Id<"_storage">, localUrl);
    } catch {
      toast.error("Erreur lors de l'upload de l'image");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  if (value && previewUrl) {
    return (
      <div className="relative rounded-lg overflow-hidden">
        <img
          src={previewUrl}
          alt="Image de couverture"
          className="w-full h-52 object-cover"
        />
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="absolute top-2 right-2 h-7 w-7 p-0"
          onClick={() => onChange(null, null)}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="w-full h-36 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-sm">Upload en cours...</span>
          </>
        ) : (
          <>
            <ImagePlus className="h-6 w-6" />
            <span className="text-sm">Ajouter une image de couverture</span>
            <span className="text-xs opacity-60">PNG, JPG, WebP</span>
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </>
  );
}
