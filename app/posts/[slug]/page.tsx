import type { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { PostContent } from "./PostContent";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://blog-keil-enzo.vercel.app";

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchQuery(api.posts.getBySlug, { slug });

  if (!post) return { title: "Article introuvable" };

  const description = post.excerpt ?? stripHtml(post.content);
  const url = `${SITE_URL}/posts/${slug}`;

  return {
    title: post.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description,
      url,
      siteName: "Blog Keil-Enzo",
      type: "article",
      publishedTime: post.publishedAt
        ? new Date(post.publishedAt).toISOString()
        : undefined,
      authors: post.author?.name ? [post.author.name] : ["Keil-Enzo"],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <PostContent slug={slug} />;
}
