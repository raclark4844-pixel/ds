import { notFound } from "@tanstack/react-router";

/**
 * Flip a flag to true when that page has enough real content to show.
 * Unpublished routes 404 and stay out of nav, sitemap, and robots.
 */
export const published = {
  work: false,
  industries: false,
  process: false,
} as const;

export type UnpublishedPage = keyof typeof published;

export function assertPublished(page: UnpublishedPage) {
  if (!published[page]) throw notFound();
}

export function isPlaceholder(value: string) {
  return /\[[A-Z]+\]/.test(value);
}
