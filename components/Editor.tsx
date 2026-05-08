"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Undo,
  Redo,
  Link as LinkIcon,
  FileDown,
} from "lucide-react";
import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { marked } from "marked";

interface EditorProps {
  content?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
}

export function Editor({ content = "", onChange, placeholder = "Commence à écrire..." }: EditorProps) {
  const [mdDialogOpen, setMdDialogOpen] = useState(false);
  const [mdInput, setMdInput] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: { openOnClick: false },
        codeBlock: { HTMLAttributes: { class: "not-prose" } },
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({ placeholder }),
      Typography,
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "prose prose-neutral dark:prose-invert max-w-none min-h-[400px] focus:outline-none px-1 py-2",
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    immediatelyRender: false,
  });

  const setLink = useCallback(() => {
    const url = window.prompt("URL du lien :");
    if (url === null) return;
    if (url === "") {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  }, [editor]);

  async function importMarkdown() {
    if (!mdInput.trim() || !editor) return;
    const html = await marked.parse(mdInput);
    editor.commands.setContent(html);
    onChange?.(editor.getHTML());
    setMdDialogOpen(false);
    setMdInput("");
  }

  if (!editor) return null;

  const wordCount = editor.getText().trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-0.5 p-2 border-b bg-muted/40">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
            title="Gras (⌘B)"
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
            title="Italique (⌘I)"
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive("strike")}
            title="Barré"
          >
            <Strikethrough className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive("code")}
            title="Code inline"
          >
            <Code className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={setLink}
            active={editor.isActive("link")}
            title="Lien"
          >
            <LinkIcon className="h-4 w-4" />
          </ToolbarButton>

          <Separator orientation="vertical" className="h-5 mx-1" />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive("heading", { level: 1 })}
            title="Titre 1"
          >
            <Heading1 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive("heading", { level: 2 })}
            title="Titre 2"
          >
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive("heading", { level: 3 })}
            title="Titre 3"
          >
            <Heading3 className="h-4 w-4" />
          </ToolbarButton>

          <Separator orientation="vertical" className="h-5 mx-1" />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
            title="Liste à puces"
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
            title="Liste numérotée"
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive("blockquote")}
            title="Citation"
          >
            <Quote className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Séparateur"
          >
            <Minus className="h-4 w-4" />
          </ToolbarButton>

          <Separator orientation="vertical" className="h-5 mx-1" />

          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Annuler (⌘Z)"
          >
            <Undo className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Rétablir (⌘⇧Z)"
          >
            <Redo className="h-4 w-4" />
          </ToolbarButton>

          <Separator orientation="vertical" className="h-5 mx-1" />

          <ToolbarButton
            onClick={() => setMdDialogOpen(true)}
            title="Importer du Markdown"
          >
            <FileDown className="h-4 w-4" />
          </ToolbarButton>
        </div>

        {/* Zone d'édition */}
        <div className="px-4 py-3">
          <EditorContent editor={editor} />
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-1.5 flex items-center gap-3 text-xs text-muted-foreground bg-muted/20">
          <span>{wordCount} mot{wordCount > 1 ? "s" : ""}</span>
          <span>·</span>
          <span>{readingTime} min de lecture</span>
          <span className="ml-auto opacity-50">
            Raccourcis : ## Titre · - Liste · &gt; Citation · **gras** · *italique*
          </span>
        </div>
      </div>

      {/* Dialog import Markdown */}
      <Dialog open={mdDialogOpen} onOpenChange={setMdDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Importer du Markdown</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Colle ton contenu Markdown ici..."
            value={mdInput}
            onChange={(e) => setMdInput(e.target.value)}
            rows={16}
            className="font-mono text-sm resize-none"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setMdDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={importMarkdown} disabled={!mdInput.trim()}>
              Importer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn("h-8 w-8 p-0", active && "bg-accent text-accent-foreground")}
    >
      {children}
    </Button>
  );
}
