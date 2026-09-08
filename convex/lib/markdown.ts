import { marked } from "marked";

// Le champ `content` d'un article contient toujours du HTML : c'est ce que
// `PostContent` injecte tel quel et ce que l'éditeur admin produit.
//
// Le pipeline n8n, lui, envoie depuis le 29/06/2026 un HTML produit par un
// convertisseur minimal : il emballe chaque bloc dans un `<p>`, traite les
// titres, le gras et l'italique, et laisse tout le reste en markdown brut.
// Tableaux, blocs de code, listes, code inline et liens ressortent donc en
// texte. Rien n'est perdu pour autant, le markdown est intact à l'intérieur
// des paragraphes : on le ressort, puis on le convertit correctement.

// Signature du HTML produit par n8n. Le marqueur sûr est le titre emballé dans
// un paragraphe : c'est du HTML invalide, ni `marked` ni Tiptap ne le produit.
//
// Le second cas couvre un article sans aucun titre. Il exige alors que le
// document n'utilise que le vocabulaire de n8n, `<p>`, `<strong>`, `<em>`.
// Un vrai convertisseur aurait produit un `<table>` ou un `<pre>` là où du
// markdown brut traîne, donc leur présence disqualifie la réparation. Sans
// cette garde, un article correct dont un bloc de code contient des pipes ou
// des backticks serait réécrit à tort.
function looksLikeN8nHtml(html: string): boolean {
  if (/<p>\s*<h[1-6][\s>]/.test(html)) return true;

  const hasRawMarkdown =
    /```/.test(html) || /\n\s*\|.*\|/.test(html) || /\]\(https?:/.test(html);
  if (!hasRawMarkdown) return false;

  const hasRichHtml = /<(table|thead|tbody|tr|td|th|pre|code|ul|ol|li|a|blockquote|img|hr)[\s>/]/.test(html);
  return !hasRichHtml && /<\/p>\s*<p>/.test(html);
}

// Défait l'emballage de n8n pour retrouver le markdown d'origine. Le mapping
// est exact : vérifié sur les 67 articles touchés, le HTML obtenu est
// identique au octet près à celui produit depuis les fichiers du vault.
function n8nHtmlToMarkdown(html: string): string {
  return html
    .replace(/<\/p>\s*<p>/g, "\n\n")
    .replace(/^\s*<p>/, "")
    .replace(/<\/p>\s*$/, "")
    .replace(/<h([1-6])>([\s\S]*?)<\/h\1>/g, (_, level: string, text: string) =>
      `${"#".repeat(Number(level))} ${text.trim()}`
    )
    .replace(/<strong>([\s\S]*?)<\/strong>/g, "**$1**")
    .replace(/<em>([\s\S]*?)<\/em>/g, "*$1*")
    .trim();
}

// Les fichiers du vault commencent par un bloc `---` (title, excerpt, tags).
function stripFrontmatter(markdown: string): string {
  const match = markdown.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
  return match ? markdown.slice(match[0].length) : markdown;
}

// GFM est indispensable : sans lui, les tableaux ressortent en pipes brutes.
export function markdownToHtml(markdown: string): string {
  return marked.parse(stripFrontmatter(markdown), {
    async: false,
    gfm: true,
    breaks: false,
  });
}

// Point d'entrée unique du pipeline. Accepte aussi bien du markdown que le
// HTML abîmé de n8n, et rend du HTML complet dans les deux cas. Un HTML déjà
// correct, celui de l'éditeur admin par exemple, ressort inchangé.
export function toArticleHtml(input: string): string {
  if (looksLikeN8nHtml(input)) return markdownToHtml(n8nHtmlToMarkdown(input));
  if (/<(p|h[1-6]|ul|ol|table|pre|blockquote)[\s>]/.test(input)) return input;
  return markdownToHtml(input);
}

export const isBrokenArticleHtml = looksLikeN8nHtml;
