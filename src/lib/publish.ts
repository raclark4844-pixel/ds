import { notFound } from "@tanstack/react-router";

/** Pages with enough real content to show publicly. */
export const published = {
  work: true,
  process: true,
} as const;

export type UnpublishedPage = keyof typeof published;

export function assertPublished(page: UnpublishedPage) {
  if (!published[page]) throw notFound();
}

export function isPlaceholder(value: string) {
  return /\[[A-Z]+\]/.test(value);
}
