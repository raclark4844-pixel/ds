import { lookup } from "node:dns/promises";
import http from "node:http";
import https from "node:https";
import { isIP } from "node:net";
import { isPublicUnicast } from "./public-ip.ts";
import { normalizeWebsite } from "./url.ts";

const MAX_BYTES = 2_000_000;
const MAX_HOPS = 4;
const DNS_MS = 4000;
const FETCH_MS = 8000;
const PAGE_TYPE = /text\/html|application\/xhtml\+xml/i;
const FILE_TYPE = /text\/|application\/(xml|json|xhtml\+xml|rss\+xml)|[/+]xml/i;

async function resolvePublic(hostname: string) {
  if (isIP(hostname)) {
    if (!isPublicUnicast(hostname)) throw new Error("Only public websites can be reviewed.");
    return { address: hostname, family: isIP(hostname) === 6 ? 6 : 4 };
  }
  const addresses = await Promise.race([
    lookup(hostname, { all: true }),
    new Promise<never>((_, reject) => {
      const timer = setTimeout(() => reject(new Error("DNS lookup timed out.")), DNS_MS);
      timer.unref?.();
    }),
  ]);
  if (!addresses.length || addresses.some((entry) => !isPublicUnicast(entry.address))) {
    throw new Error("Only public websites can be reviewed.");
  }
  return addresses[0];
}

function requestPage(url: URL, pinned: { address: string; family: number }, signal: AbortSignal | undefined, mode: "page" | "file") {
  return new Promise<{ html?: string; url?: string; redirect?: string }>((resolve, reject) => {
    const lib = url.protocol === "https:" ? https : http;
    const req = lib.get(
      url,
      {
        agent: false,
        signal,
        lookup: ((_host, options, callback) => {
          if (options && "all" in options && options.all) {
            (callback as (err: NodeJS.ErrnoException | null, addresses: Array<{ address: string; family: number }>) => void)(null, [pinned]);
            return;
          }
          (callback as (err: NodeJS.ErrnoException | null, address: string, family: number) => void)(null, pinned.address, pinned.family);
        }) as http.RequestOptions["lookup"],
        headers: {
          "User-Agent": "DemoreWebsiteReview/1.0",
          Accept: mode === "page" ? "text/html" : "text/plain, text/html, application/xml, text/xml, */*",
          "Accept-Encoding": "identity",
        },
      },
      (res) => {
        if ([301, 302, 303, 307, 308].includes(res.statusCode || 0)) {
          res.resume();
          resolve({ redirect: res.headers.location });
          return;
        }
        if ((res.statusCode || 0) < 200 || (res.statusCode || 0) >= 300) {
          res.resume();
          reject(new Error("The website blocked the review or returned an error."));
          return;
        }
        const type = res.headers["content-type"] || "";
        const allowed = mode === "page" ? PAGE_TYPE.test(type) : !type || FILE_TYPE.test(type);
        if (!allowed) {
          res.resume();
          reject(new Error(mode === "page" ? "This address is not a web page." : "This address is not a public text file."));
          return;
        }
        const chunks: Buffer[] = [];
        let bytes = 0;
        res.on("data", (chunk) => {
          bytes += chunk.length;
          if (bytes > MAX_BYTES) {
            req.destroy(new Error("This page is too large for the quick review."));
            return;
          }
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });
        res.on("end", () => resolve({ html: Buffer.concat(chunks).toString("utf8"), url: url.href }));
        res.on("error", reject);
      },
    );
    const deadline = setTimeout(() => req.destroy(new Error("The website took too long to respond.")), FETCH_MS);
    req.on("close", () => clearTimeout(deadline));
    req.on("error", reject);
  });
}

async function fetchPublic(input: string, signal: AbortSignal | undefined, mode: "page" | "file") {
  let current = normalizeWebsite(input);
  for (let hop = 0; hop < MAX_HOPS; hop += 1) {
    signal?.throwIfAborted();
    const url = new URL(current);
    if (url.port) throw new Error("Use a public HTTP or HTTPS website without a login or custom port.");
    if (url.username || url.password) throw new Error("Use a public HTTP or HTTPS website without a login or custom port.");
    const pinned = await resolvePublic(url.hostname);
    const result = await requestPage(url, pinned, signal, mode);
    if (!result.redirect) {
      if (!result.html || !result.url) throw new Error("The website blocked the review or returned an error.");
      return { html: result.html, url: result.url };
    }
    current = normalizeWebsite(new URL(result.redirect, current).href);
  }
  throw new Error("The website redirects too many times. Try its final address.");
}

export async function fetchPublicPage(input: string, signal?: AbortSignal) {
  return fetchPublic(input, signal, "page");
}

export async function fetchPublicFile(input: string, signal?: AbortSignal) {
  return fetchPublic(input, signal, "file");
}

export const REFERENCE_URL = "https://demoreexteriorsolutions.com/";
