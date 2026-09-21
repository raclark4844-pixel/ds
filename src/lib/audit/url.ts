export function normalizeWebsite(input: string) {
  if (typeof input !== "string" || input.length > 2048) {
    throw new Error("Enter a public website address.");
  }
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(input.trim()) ? input.trim() : `https://${input.trim()}`);
  } catch {
    throw new Error("Enter a valid website address, such as example.com.");
  }
  if (
    !["https:", "http:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.port ||
    !url.hostname.includes(".")
  ) {
    throw new Error("Use a public HTTP or HTTPS website without a login or custom port.");
  }
  url.hash = "";
  url.search = "";
  return url.href;
}
