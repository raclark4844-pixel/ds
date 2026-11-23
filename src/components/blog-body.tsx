// src/lib/blog.ts — add alongside bodyBlocks; preserve existing metadata and JSON-LD.
// MERGE BLOCKED until the complete blog.ts and article diffs are reviewed,
// a linked PR/ticket approval is recorded, and the ds Vercel preview is READY
// with its deployment URL verified. Commit-message approval is not authorization.
// Review the article for raw HTML, scripts, and embedded secrets; verify -05:00
// ISO dates and existing JSON-LD exclusions. Confirm no incidental llms.txt,
// site-footer.tsx, contact.tsx edits or logic/state copied from other projects.

export type InlineNode =
  | { kind: "text" | "bold" | "code"; text: string }
  | { kind: "internalLink"; text: string; href: string }
  | { kind: "externalLink"; text: string; href: string };

const inlinePattern =
  /(\[[^\]]+\]\(\/[a-z0-9-]+\)|\*\*[^*]+\*\*|`[^`]+`|https:\/\/[^\s)]+)/g;

export const internalLinkPattern = /^\[([^\]]+)\]\((\/[a-z0-9-]+)\)$/;

export function isSafeExternalUrl(value: string): boolean {
  if (/["'<>\\\u0000-\u0020\u007f-\u009f]/.test(value)) return false;

  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      Boolean(url.hostname) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

// Parsing produces data only; React rendering stays in blog-body.tsx.
export function parseInline(text: string): InlineNode[] {
  return text
    .split(inlinePattern)
    .filter((part) => part.length > 0)
    .map((part): InlineNode => {
      const internal = internalLinkPattern.exec(part);
      if (internal) {
        return {
          kind: "internalLink",
          text: internal[1],
          href: internal[2],
        };
      }

      if (part.startsWith("**") && part.endsWith("**")) {
        return { kind: "bold", text: part.slice(2, -2) };
      }

      if (part.startsWith("`") && part.endsWith("`")) {
        return { kind: "code", text: part.slice(1, -1) };
      }

      if (part.startsWith("https://") && isSafeExternalUrl(part)) {
        return { kind: "externalLink", text: part, href: part };
      }

      return { kind: "text", text: part };
    });
}

// src/components/blog-body.tsx — replace file.
import { Link } from "@tanstack/react-router";
import { Fragment } from "react";
import { bodyBlocks, parseInline, type InlineNode } from "@/lib/blog";

function InlineContent({ nodes }: { nodes: InlineNode[] }) {
  return (
    <>
      {nodes.map((node, index) => {
        switch (node.kind) {
          case "internalLink":
            return (
              <Link
                key={index}
                to={node.href}
                preload="intent"
                className="text-fg underline underline-offset-4 hover:text-volt"
              >
                {node.text}
              </Link>
            );
          case "externalLink":
            return (
              <a
                key={index}
                href={node.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-fg underline underline-offset-4 hover:text-volt"
              >
                {node.text}
              </a>
            );
          case "bold":
            return (
              <strong key={index} className="font-semibold text-fg">
                {node.text}
              </strong>
            );
          case "code":
            return (
              <code key={index} className="text-fg">
                {node.text}
              </code>
            );
          case "text":
            return <Fragment key={index}>{node.text}</Fragment>;
        }
      })}
    </>
  );
}

export function BlogBody({ markdown }: { markdown: string }) {
  return (
    <div className="mt-12 space-y-6 text-lg leading-relaxed text-muted">
      {bodyBlocks(markdown).map((block, index) => {
        if (block.kind === "rule") {
          return <hr key={index} className="my-10 border-line" />;
        }

        if (block.kind === "heading") {
          return (
            <h2
              key={index}
              className="pt-6 font-display text-3xl font-semibold tracking-tight text-fg"
            >
              {block.text}
            </h2>
          );
        }

        return (
          <p key={index}>
            <InlineContent nodes={parseInline(block.text)} />
          </p>
        );
      })}
    </div>
  );
}

// src/components/blog-body.test.tsx — Vitest regression tests.
// Generate and review the article snapshot before merge; tests are not claimed run.
import { describe, expect, it, vi } from "vitest";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  internalLinkPattern,
  isSafeExternalUrl,
  parseInline,
} from "@/lib/blog";
import article from "@/content/blog/you-dont-need-everything-on-day-one.md?raw";
import { BlogBody } from "./blog-body";

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    to,
    preload,
    children,
    className,
  }: {
    to: string;
    preload?: string;
    children: ReactNode;
    className?: string;
  }) =>
    createElement(
      "a",
      { href: to, className, "data-preload": preload },
      children,
    ),
}));

describe("isSafeExternalUrl", () => {
  it.each([
    ["https://example.com", true],
    ["https://example.com/UPPERCASE", true],
    ["https://example.com/a%20b", true],
    ["https://example.com/%2Fpath", true],
    ["//evil.com", false],
    ["/services", false],
    ["http://example.com", false],
    ["javascript:alert(1)", false],
    ["https://user:password@example.com", false],
    [" https://example.com", false],
    ["https://example.com ", false],
    ["https://example.com\n", false],
    ["https://example.com\\evil", false],
    ['https://example.com/"', false],
    ["https://example.com/<script>", false],
    ["https://", false],
  ])("%j => %s", (value, expected) => {
    expect(isSafeExternalUrl(value)).toBe(expected);
  });
});

describe("internalLinkPattern", () => {
  it.each([
    ["[Services](/services)", true],
    ["[Day one](/day-one)", true],
    ["[Services](/Services)", false],
    ["[External](//evil.com)", false],
    ["[Encoded](/serv%69ces)", false],
    ["[Encoded](/%2F%2Fevil.com)", false],
    ["[Services]( /services)", false],
    ["[Services](/services )", false],
    [" [Services](/services)", false],
    ["[Services](/services) ", false],
    ["[Nested](/blog/post)", false],
  ])("%j => %s", (value, expected) => {
    expect(internalLinkPattern.test(value)).toBe(expected);
  });

  it("leaves unsupported link syntax as escaped text", () => {
    const markdown =
      "[Upper](/Services) [External](//evil.com) [Encoded](/serv%69ces)";
    expect(parseInline(markdown)).toEqual([
      { kind: "text", text: markdown },
    ]);
  });

  it("preserves whitespace around valid inline links", () => {
    expect(parseInline(" [Services](/services) ")).toEqual([
      { kind: "text", text: " " },
      { kind: "internalLink", text: "Services", href: "/services" },
      { kind: "text", text: " " },
    ]);
  });
});

describe("BlogBody", () => {
  it("preloads internal links and secures external links", () => {
    const html = renderToStaticMarkup(
      <BlogBody markdown="[Services](/services) https://example.com" />,
    );
    expect(html).toContain('href="/services"');
    expect(html).toContain('data-preload="intent"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it("escapes authored HTML instead of rendering it", () => {
    const html = renderToStaticMarkup(
      <BlogBody markdown={'<script>alert("test")</script>'} />,
    );
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("matches the reviewed article rendering", () => {
    expect(
      renderToStaticMarkup(<BlogBody markdown={article} />),
    ).toMatchSnapshot();
  });
});