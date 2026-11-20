import { createFileRoute } from "@tanstack/react-router";
import { JsonLd } from "@/components/json-ld";
import { BLOG_INDEX_DESCRIPTION, BLOG_INDEX_TITLE, blogJsonLd, blogPosts } from "@/lib/blog";
import { breadcrumbJsonLd, pageHead } from "@/lib/seo";

export const Route = createFileRoute("/blog/")({
  head: () =>
    pageHead({
      title: BLOG_INDEX_TITLE,
      description: BLOG_INDEX_DESCRIPTION,
      path: "/blog",
    }),
  component: BlogIndex,
});

function BlogIndex() {
  return (
    <main id="main" className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
        ])}
      />
      <JsonLd data={blogJsonLd()} />
      <header className="pt-10 sm:pt-16">
        <p className="kicker">Blog</p>
        <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight">Blog</h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{BLOG_INDEX_DESCRIPTION}</p>
      </header>
      <section className="mt-14 grid gap-4">
        {blogPosts.map((post) => (
          <a
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="rounded-xl border border-line bg-surface p-6 no-underline transition-colors hover:border-fg/30"
          >
            <p className="kicker">
              <time dateTime={post.datePublished}>{post.dateLabel}</time>
            </p>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight">
              {post.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{post.description}</p>
            <span className="mt-5 inline-block text-sm text-volt">Read the post →</span>
          </a>
        ))}
      </section>
    </main>
  );
}
