import dayOneBody from "@/content/blog/you-dont-need-everything-on-day-one.md?raw";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  /** ISO 8601 with the America/New_York offset. */
  datePublished: string;
  dateModified: string;
  dateLabel: string;
  body: string;
};

export const blogPosts: readonly BlogPost[] = [
  {
    slug: "you-dont-need-everything-on-day-one",
    title: "You Don't Need Everything on Day One",
    description:
      "Starting a business? Learn what your first website needs on day one: a clear job, a way to be found, one next step, and follow-up, with room to grow.",
    datePublished: "2026-11-23T12:10:00-05:00",
    dateModified: "2026-11-23T12:20:00-05:00",
    dateLabel: "November 23, 2026",
    body: dayOneBody,
  },
];

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

export const BLOG_INDEX_TITLE = `Blog | ${SITE_NAME}`;
export const BLOG_INDEX_DESCRIPTION =
  "Practical tips on websites, AI tools, and lead follow-up for small businesses and startups, from Demore Technology Solutions in Mentor, Ohio.";

const organizationRef = { "@id": `${SITE_URL}/#organization` };

export function blogPostingJsonLd(post: BlogPost) {
  const url = `${SITE_URL}/blog/${post.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: post.title,
    description: post.description,
    url,
    mainEntityOfPage: url,
    datePublished: post.datePublished,
    dateModified: post.dateModified,
    author: organizationRef,
    publisher: organizationRef,
    isPartOf: { "@id": `${SITE_URL}/blog#blog` },
    inLanguage: "en-US",
  };
}

export function blogJsonLd() {
  const url = `${SITE_URL}/blog`;
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${url}#blog`,
    url,
    name: BLOG_INDEX_TITLE,
    description: BLOG_INDEX_DESCRIPTION,
    publisher: organizationRef,
    inLanguage: "en-US",
    blogPost: blogPosts.map((post) => ({
      "@id": `${SITE_URL}/blog/${post.slug}#article`,
    })),
  };
}

/** Article head: shared page head with Open Graph article fields. */
export function withArticleMeta<T extends { meta: Record<string, string | undefined>[] }>(
  head: T,
  post: BlogPost,
): T {
  return {
    ...head,
    meta: [
      ...head.meta.map((tag) =>
        tag.property === "og:type" ? { property: "og:type", content: "article" } : tag,
      ),
      { property: "article:published_time", content: post.datePublished },
      { property: "article:modified_time", content: post.dateModified },
    ],
  };
}

export type BodyBlock =
  { kind: "heading"; text: string } | { kind: "rule" } | { kind: "paragraph"; text: string };

/** Splits the approved Markdown copy into blocks without changing any wording. */
export function bodyBlocks(markdown: string): BodyBlock[] {
  return markdown
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block): BodyBlock => {
      if (block === "---") return { kind: "rule" };
      if (block.startsWith("## ")) return { kind: "heading", text: block.slice(3) };
      return { kind: "paragraph", text: block };
    });
}
