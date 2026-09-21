import { lookup } from "node:dns/promises";
import http from "node:http";
import https from "node:https";
import { isIP } from "node:net";
import { normalizeWebsite } from "./url";

export function isPublicAddress(address: string) {
  const version = isIP(address);
  if (version === 4) {
    const [a, b] = address.split(".").map(Number);
    if (a === 0 || a === 10 || a === 127 || a >= 224) return false;
    if (a === 169 && b === 254) return false;
    if (a === 192 && b === 168) return false;
    if (a === 172 && b >= 16 && b <= 31) return false;
    if (a === 100 && b >= 64 && b <= 127) return false;
    return true;
  }
  if (version === 6) {
    const lower = address.toLowerCase();
    if (lower === "::1" || lower === "::") return false;
    const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isPublicAddress(mapped[1]);
    const first = Number.parseInt(lower.split(":")[0] || "0", 16);
    if ((first & 0xfe00) === 0xfc00) return false;
    if ((first & 0xffc0) === 0xfe80) return false;
    if ((first & 0xff00) === 0xff00) return false;
    return true;
  }
  return false;
}

export async function fetchPublicPage(input: string, signal?: AbortSignal) {
  let current = normalizeWebsite(input);
  for (let hop = 0; hop < 4; hop++) {
    signal?.throwIfAborted();
    const url = new URL(current);
    const addresses = await Promise.race([
      lookup(url.hostname, { all: true }),
      new Promise<never>((_, reject) => {
        const timer = setTimeout(() => reject(new Error("DNS lookup timed out.")), 4000);
        timer.unref?.();
      }),
    ]);
    if (!addresses.length || addresses.some((a) => !isPublicAddress(a.address))) {
      throw new Error("Only public websites can be reviewed.");
    }
    const chosen = addresses[0];
    const result = await new Promise<{ html: string; url: string } | { redirect: string }>(
      (resolve, reject) => {
        const req = (url.protocol === "https:" ? https : http).get(
          url,
          {
            agent: false,
            signal,
            lookup: (_host, options, callback) => {
              const cb = callback as (
                err: Error | null,
                address: string | typeof addresses,
                family?: number,
              ) => void;
              if (options && "all" in options && options.all) cb(null, [chosen]);
              else cb(null, chosen.address, chosen.family);
            },
            headers: {
              "User-Agent": "DemoreWebsiteReview/1.0",
              Accept: "text/html",
              "Accept-Encoding": "identity",
            },
          },
          (res) => {
            if ([301, 302, 303, 307, 308].includes(res.statusCode || 0)) {
              res.resume();
              resolve({ redirect: res.headers.location || "" });
              return;
            }
            if ((res.statusCode || 0) < 200 || (res.statusCode || 0) >= 300) {
              res.resume();
              reject(new Error("The website blocked the review or returned an error."));
              return;
            }
            if (!/text\/html|application\/xhtml\+xml/i.test(res.headers["content-type"] || "")) {
              res.resume();
              reject(new Error("This address is not a web page."));
              return;
            }
            const chunks: Buffer[] = [];
            let bytes = 0;
            res.on("data", (chunk: Buffer) => {
              bytes += chunk.length;
              if (bytes > 2_000_000) req.destroy(new Error("This page is too large for the quick review."));
              else chunks.push(chunk);
            });
            res.on("end", () => resolve({ html: Buffer.concat(chunks).toString("utf8"), url: current }));
            res.on("error", reject);
          },
        );
        const deadline = setTimeout(() => req.destroy(new Error("The website took too long to respond.")), 8000);
        req.on("close", () => clearTimeout(deadline));
        req.on("error", reject);
      },
    );
    if (!("redirect" in result)) return result;
    if (!result.redirect) throw new Error("The website redirected without a destination.");
    current = normalizeWebsite(new URL(result.redirect, current).href);
  }
  throw new Error("The website redirects too many times. Try its final address.");
}
