/** @param {string | null} accept */
export const acceptsHtml = (accept) => !accept || accept.includes("text/html") || accept.includes("*/*");
/** @param {string} path */
export const isDocumentPath = (path) => !path.includes(".") && !path.startsWith("/api/");
/** @param {string} url */
export const isInstallQuery = (url) => new URL(url, "https://local.invalid").searchParams.get("install") === "1";

/** @param {string} template @param {{host:string,url:string}} values */
export function renderInstallPageHtml(template, values) {
  return template.replaceAll("{{HOST}}", values.host).replaceAll("{{URL}}", values.url);
}

/** @param {string} host */
export function renderWebManifest(host) {
  return JSON.stringify({ name: "Demore Technology Solutions", short_name: "Demore", start_url: `https://${host}/`, display: "standalone", background_color: "#050505", theme_color: "#050505", icons: [{ src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }] });
}

/** @param {{host:string,site:{title?:string,description?:string}}} options */
export function createHeadInjector(options) {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";
  let injected = false;
  const tags = `<meta property="og:site_name" content="${escapeHtml(options.site.title || "Demore Technology Solutions")}"><meta property="og:description" content="${escapeHtml(options.site.description || "")}"><meta property="og:url" content="https://${escapeHtml(options.host)}">`;
  return {
    /** @param {Uint8Array} chunk */
    push(chunk) {
      buffer += decoder.decode(chunk, { stream: true });
      if (!injected && buffer.includes("</head>")) { buffer = buffer.replace("</head>", `${tags}</head>`); injected = true; }
      if (buffer.length < 8192 && !injected) return [];
      const output = buffer; buffer = ""; return [encoder.encode(output)];
    },
    flush() { buffer += decoder.decode(); const output = buffer; buffer = ""; return output ? [encoder.encode(output)] : []; },
  };
}

/** @param {string} value */
function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
