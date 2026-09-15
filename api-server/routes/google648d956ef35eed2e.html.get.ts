export default function googleSiteVerification() {
  return new Response("google-site-verification: google648d956ef35eed2e.html\n", {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate",
      "x-robots-tag": "noindex",
    },
  });
}
