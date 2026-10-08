// Hair Beat by Valery: Cloudflare Worker.
//
// Static files in ./public are served directly by Cloudflare. This Worker only handles /api/*:
//   GET /api/instagram            → latest @hair.beat photos as JSON (no token or Instagram URLs exposed)
//   GET /api/instagram/media/:id  → the photo itself, proxied from Instagram's CDN and cached
// A daily cron renews the Instagram access token so it never hits its 60-day expiry.
//
// Setup: add the Instagram token as a Worker secret named IG_TOKEN (see README).
// Without it, these endpoints return no posts and the page keeps its built-in photos.

import { DurableObject } from "cloudflare:workers";

const DEFAULT_API = "https://graph.instagram.com";
const FEED_TTL_MS = 60 * 60 * 1000; // re-check Instagram at most once an hour
const RETRY_AFTER_ERROR_MS = 5 * 60 * 1000;
const REFRESH_EVERY_MS = 6 * 24 * 60 * 60 * 1000; // tokens last 60 days; renew weekly
const MAX_POSTS = 6;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.method !== "GET" && request.method !== "HEAD") {
      return json({ error: "method not allowed" }, 405);
    }
    if (url.pathname === "/api/instagram") return feedResponse(env);

    const media = url.pathname.match(/^\/api\/instagram\/media\/(\d{1,30})$/);
    if (media) return mediaResponse(request, env, ctx, media[1]);

    return json({ error: "not found" }, 404);
  },

  async scheduled(_controller, env, ctx) {
    ctx.waitUntil(
      feedStore(env)
        .refreshToken()
        .then((result) => console.log(`instagram token refresh: ${result}`))
        .catch((err) => console.error(`instagram token refresh failed: ${err.message}`)),
    );
  },
};

async function feedResponse(env) {
  const posts = await feedStore(env).getPosts();
  const body = {
    posts: posts.map(({ id, permalink, alt }) => ({
      id,
      permalink,
      alt,
      src: `/api/instagram/media/${id}`,
    })),
  };
  return json(body, 200, posts.length ? "public, max-age=600" : "no-store");
}

async function mediaResponse(request, env, ctx, id) {
  const cache = caches.default;
  const cached = await cache.match(request);
  if (cached) return cached;

  const post = (await feedStore(env).getPosts()).find((p) => p.id === id);
  if (!post || !isAllowedMediaUrl(post.mediaUrl, env)) return json({ error: "not found" }, 404);

  const upstream = await fetch(post.mediaUrl, { cf: { cacheEverything: true, cacheTtl: 86400 } });
  const type = upstream.headers.get("content-type") || "";
  if (!upstream.ok || !type.startsWith("image/")) return json({ error: "image unavailable" }, 502);

  const response = new Response(upstream.body, {
    headers: {
      "content-type": type,
      "cache-control": "public, max-age=86400",
      "x-content-type-options": "nosniff",
    },
  });
  ctx.waitUntil(cache.put(request, response.clone()));
  return response;
}

// Only proxy images from Instagram's CDN (or the configured API host, used for local testing).
function isAllowedMediaUrl(raw, env) {
  try {
    const url = new URL(raw);
    if (url.origin === new URL(apiBase(env)).origin) return true;
    return url.protocol === "https:" && /(^|\.)(cdninstagram\.com|fbcdn\.net)$/.test(url.hostname);
  } catch {
    return false;
  }
}

function feedStore(env) {
  return env.INSTAGRAM.get(env.INSTAGRAM.idFromName("hair.beat"));
}

function apiBase(env) {
  return env.IG_API_BASE || DEFAULT_API;
}

function json(body, status = 200, cacheControl = "no-store") {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": cacheControl,
      "x-content-type-options": "nosniff",
    },
  });
}

// One instance holds the current access token and the last good copy of the feed.
export class InstagramFeed extends DurableObject {
  inflight = null;

  async getPosts() {
    const saved = await this.ctx.storage.get("feed");
    if (saved && Date.now() - saved.fetchedAt < FEED_TTL_MS) return saved.posts;
    this.inflight ??= this.#reload(saved).finally(() => (this.inflight = null));
    return this.inflight;
  }

  async #reload(saved) {
    const token = await this.#token();
    if (!token) return saved?.posts ?? [];
    try {
      const posts = await fetchPosts(apiBase(this.env), token);
      await this.ctx.storage.put("feed", { posts, fetchedAt: Date.now() });
      return posts;
    } catch (err) {
      console.error(`instagram feed fetch failed: ${err.message}`);
      // Keep serving the last good posts, and wait a few minutes before trying again.
      const posts = saved?.posts ?? [];
      await this.ctx.storage.put("feed", { posts, fetchedAt: Date.now() - FEED_TTL_MS + RETRY_AFTER_ERROR_MS });
      return posts;
    }
  }

  async refreshToken() {
    const current = await this.#currentToken();
    if (!current) return "skipped (IG_TOKEN secret not set)";
    if (Date.now() - current.refreshedAt < REFRESH_EVERY_MS) return "skipped (renewed recently)";

    const url = `${apiBase(this.env)}/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(current.token)}`;
    const res = await fetch(url);
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.access_token) {
      throw new Error(`status ${res.status}: ${data?.error?.message ?? "no token in response"}`);
    }
    await this.ctx.storage.put("token", {
      token: data.access_token,
      seed: current.seed,
      refreshedAt: Date.now(),
      expiresAt: Date.now() + (Number(data.expires_in) || 0) * 1000,
    });
    return "renewed";
  }

  async #token() {
    return (await this.#currentToken())?.token ?? null;
  }

  // The saved (renewed) token wins, unless IG_TOKEN was replaced since. Then the new secret wins.
  async #currentToken() {
    const secret = this.env.IG_TOKEN;
    if (!secret) return null;
    const seed = await fingerprint(secret);
    const saved = await this.ctx.storage.get("token");
    if (saved?.seed === seed) return saved;
    return { token: secret, seed, refreshedAt: 0 };
  }
}

async function fetchPosts(base, token) {
  const fields = "id,media_type,media_url,permalink,caption,timestamp";
  const res = await fetch(`${base}/me/media?fields=${fields}&limit=25&access_token=${encodeURIComponent(token)}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`status ${res.status}: ${data?.error?.message ?? "bad response"}`);

  return (data.data ?? [])
    .filter((m) => (m.media_type === "IMAGE" || m.media_type === "CAROUSEL_ALBUM") && m.media_url)
    .filter((m) => /^\d+$/.test(m.id) && /^https:\/\/www\.instagram\.com\//.test(m.permalink ?? ""))
    .slice(0, MAX_POSTS)
    .map((m) => ({ id: m.id, permalink: m.permalink, mediaUrl: m.media_url, alt: altText(m.caption) }));
}

// First line of the caption without hashtags, mentions or emoji, for the image's alt text.
function altText(caption) {
  const line = (caption ?? "").split("\n")[0]
    .replace(/[#@][\p{L}\p{N}_.]+/gu, "")
    .replace(/\p{Extended_Pictographic}|️/gu, "")
    .replace(/\s+/g, " ")
    .trim();
  if (line.length < 3) return "Recent hair work by Valery at Hair Beat";
  return line.length > 120 ? `${line.slice(0, 117).replace(/\s+\S*$/, "")}…` : line;
}

async function fingerprint(text) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(digest).slice(0, 8)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
