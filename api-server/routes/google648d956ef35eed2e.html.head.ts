export default function googleSiteVerificationHead() {
  return new Response(null, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate",
      "content-length": "54",
    },
  });
}
