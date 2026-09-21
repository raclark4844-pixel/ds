const MAX_INPUT = 2048;

export function normalizeWebsite(input: string) {
  if (typeof input !== "string" || !input.trim() || input.length > MAX_INPUT) {
    throw new Error("Enter a public website address.");
  }
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(input.trim()) ? input.trim() : `https://${input.trim()}`);
  } catch {
    throw new Error("Enter a valid website address, such as example.com.");
  }
  if (!["https:", "http:"].includes(url.protocol) || url.username || url.password || url.port || !url.hostname.includes(".")) {
    throw new Error("Use a public HTTP or HTTPS website without a login or custom port.");
  }
  const host = url.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) {
    throw new Error("Only public websites can be reviewed.");
  }
  url.hash = "";
  url.search = "";
  url.username = "";
  url.password = "";
  return url.href;
}

export function websiteFromMessage(text: string) {
  const match = String(text).match(
    /https?:\/\/[^\s<>]+|\b(?:www\.)?[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9-]+)*\.[a-z]{2,}(?:\/[^\s<>]*)?/i,
  );
  if (!match || match.index === undefined || (match.index > 0 && text[match.index - 1] === "@")) return null;
  try {
    return normalizeWebsite(match[0].replace(/[.,!?)\]]+$/, ""));
  } catch {
    return null;
  }
}
