import { Fragment, type ReactNode } from "react";
import { bodyBlocks } from "@/lib/blog";

const inlinePattern = /(\*\*[^*]+\*\*|`[^`]+`|https:\/\/[^\s)]+)/g;

function renderInline(text: string): ReactNode[] {
  return text.split(inlinePattern).map((part, index) => {
    if (!part) return null;
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold text-fg">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={index} className="text-fg">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("https://")) {
      return (
        <a key={index} className="text-fg underline underline-offset-4 hover:text-volt" href={part}>
          {part}
        </a>
      );
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
}

export function BlogBody({ markdown }: { markdown: string }) {
  return (
    <div className="mt-12 space-y-6 text-lg leading-relaxed text-muted">
      {bodyBlocks(markdown).map((block, index) => {
        if (block.kind === "rule") return <hr key={index} className="my-10 border-line" />;
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
        return <p key={index}>{renderInline(block.text)}</p>;
      })}
    </div>
  );
}
