/**
 * FILE   : redirect-worker/index.js   (repo: TrikalVaani)
 * VERSION: v1.0  DATE: 24 Nov 2026  OWNER: Rohiit Gupta
 * WHAT   : Cloudflare Worker "tv-redirects". Sends the extra domains to
 *          https://trikalvaani.com keeping path + query — same as vercel.json
 *          redirects + Vercel domain redirects did:
 *            trikaalvaani.in / trikalvaani.in / trikaalvaani.org  -> 308
 *            www.* of those three + www.trikalvaani.com          -> 301
 *          (www.trikalvaani.com had NO working redirect on Vercel — SSL error.)
 */
export default {
  fetch(request) {
    const u = new URL(request.url);
    const status = u.hostname.startsWith("www.") ? 301 : 308;
    return Response.redirect(`https://trikalvaani.com${u.pathname}${u.search}`, status);
  },
};
