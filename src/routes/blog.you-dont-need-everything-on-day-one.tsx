import { createFileRoute, Link } from "@tanstack/react-router";
import { BlogBody } from "@/components/blog-body";
import { JsonLd } from "@/components/json-ld";
import { blogPostingJsonLd, getBlogPost, withArticleMeta } from "@/lib/blog";
import { breadcrumbJsonLd, pageHead } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";

const post = getBlogPost("you-dont-need-everything-on-day-one")!;
const path = `/blog/${post.slug}`;

export const Route = createFileRoute("/blog/you-dont-need-everything-on-day-one")({
  head: () =>
    withArticleMeta(
      pageHead({
        title: `${post.title} | ${SITE_NAME}`,
        description: post.description,
        path,
      }),
      post,
    ),
  component: BlogPostPage,
});

function BlogPostPage() {
  return (
    <main id="main" className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: post.title, path },
        ])}
      />
      <JsonLd data={blogPostingJsonLd(post)} />
      <article>
        <header className="pt-10 sm:pt-16">
          <nav aria-label="Breadcrumb" className="text-sm text-muted">
            <ol className="flex flex-wrap items-center gap-2">
              <li className="flex items-center gap-2">
                <Link to="/" className="hover:text-fg">
                  Home
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <span aria-hidden="true" className="text-faint">
                  /
                </span>
                <Link to="/blog" className="hover:text-fg">
                  Blog
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <span aria-hidden="true" className="text-faint">
                  /
                </span>
                <span className="text-fg" aria-current="page">
                  {post.title}
                </span>
              </li>
            </ol>
          </nav>
          <p className="kicker mt-8">
            <time dateTime={post.datePublished}>{post.dateLabel}</time>
          </p>
          <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight">{post.title}</h1>
        </header>
        <BlogBody markdown={post.body} />
      </article>
    </main>
  );
}
