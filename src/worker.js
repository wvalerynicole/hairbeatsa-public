// Hair Beat by Valery: Cloudflare Worker.
//
// Static files in ./public are served directly by Cloudflare. This Worker only handles /api/*:
//   GET /api/instagram            → latest @hair.beat photos as JSON (no token or Instagram URLs exposed)
//   GET /api/instagram/media/:id  → the photo itself, proxied from Instagram's CDN and cached
// A daily cron checks whether a legacy Instagram Login token needs renewal.
//
// Setup: add the Unified Login token as IG_UNIFIED_TOKEN (see README).
// Without it, these endpoints return no posts and the page keeps its built-in photos.

import { DurableObject } from "cloudflare:workers";

const DEFAULT_API = "https://graph.instagram.com";
const UNIFIED_API = "https://graph.facebook.com/v27.0";
const INSTAGRAM_ACCOUNT_ID = "17841422910143302";
const FEED_TTL_MS = 60 * 60 * 1000; // re-check Instagram at most once an hour
const RETRY_AFTER_ERROR_MS = 5 * 60 * 1000;
const REFRESH_EVERY_MS = 6 * 24 * 60 * 60 * 1000; // tokens last 60 days; renew weekly
const PAGE_SIZE = 6;
const MAX_POSTS = 24;
const MAX_GRAPH_PAGES = 8;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.method !== "GET" && request.method !== "HEAD") {
      return json({ error: "method not allowed" }, 405);
    }
    if (url.pathname === "/api/instagram") return feedResponse(env, url);

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

async function feedResponse(env, url) {
  const offset = Number(url.searchParams.get("offset") ?? "0");
  if (!Number.isInteger(offset) || offset < 0 || offset >= MAX_POSTS || offset % PAGE_SIZE) {
    return json({ error: "invalid offset" }, 400);
  }
  const { posts, status } = await feedStore(env).getFeed();
  const page = posts.slice(offset, offset + PAGE_SIZE);
  const body = {
    posts: page.map(({ id, permalink, alt }) => ({
      id,
      permalink,
      alt,
      src: `/api/instagram/media/${id}`,
    })),
    hasMore: offset + PAGE_SIZE < posts.length,
  };
  const response = json(body, 200, status === "ready" && posts.length ? "public, max-age=600" : "no-store");
  response.headers.set("x-instagram-feed-status", status);
  return response;
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
  return env.IG_API_BASE || (env.IG_UNIFIED_TOKEN ? UNIFIED_API : DEFAULT_API);
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
    return (await this.getFeed()).posts;
  }

  async getFeed() {
    const saved = await this.ctx.storage.get("feed");
    const source = this.env.IG_UNIFIED_TOKEN ? "unified" : "legacy";
    if (saved?.status && saved.source === source && Date.now() - saved.fetchedAt < FEED_TTL_MS) return saved;
    this.inflight ??= this.#reload(saved, source).finally(() => (this.inflight = null));
    return this.inflight;
  }

  async #reload(saved, source) {
    const token = this.env.IG_UNIFIED_TOKEN || await this.#token();
    if (!token) return { posts: saved?.posts ?? [], status: "unconfigured" };
    try {
      const account = source === "unified" ? INSTAGRAM_ACCOUNT_ID : "me";
      const posts = await fetchPosts(apiBase(this.env), account, token);
      const feed = { posts, source, status: "ready", fetchedAt: Date.now() };
      await this.ctx.storage.put("feed", feed);
      return feed;
    } catch (err) {
      console.error(`instagram feed fetch failed: ${err.message}`);
      // Keep serving the last good posts, and wait a few minutes before trying again.
      const posts = saved?.posts ?? [];
      const feed = { posts, source, status: "upstream-error", fetchedAt: Date.now() - FEED_TTL_MS + RETRY_AFTER_ERROR_MS };
      await this.ctx.storage.put("feed", feed);
      return feed;
    }
  }

  async refreshToken() {
    if (this.env.IG_UNIFIED_TOKEN) return "skipped (Unified Login token)";
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

async function fetchPosts(base, account, token) {
  const fields = "id,media_type,media_url,permalink,caption,timestamp";
  const url = new URL(`${base}/${account}/media`);
  url.search = new URLSearchParams({ fields, limit: "25" });
  const photos = new Map();

  for (let page = 0; page < MAX_GRAPH_PAGES; page++) {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json().catch(() => null);
    if (!res.ok || !Array.isArray(data?.data)) {
      throw new Error(`Graph API status ${res.status}, error code ${Number(data?.error?.code) || "unknown"}`);
    }

    for (const media of data.data) {
      const isPhoto = media.media_type === "IMAGE" || media.media_type === "CAROUSEL_ALBUM";
      if (!isPhoto || !media.media_url || !/^\d+$/.test(media.id) || !/^https:\/\/www\.instagram\.com\//.test(media.permalink ?? "")) continue;
      photos.set(media.id, {
        id: media.id,
        permalink: media.permalink,
        mediaUrl: media.media_url,
        alt: altText(media.caption),
      });
      if (photos.size === MAX_POSTS) return [...photos.values()];
    }

    const after = data.paging?.cursors?.after;
    if (!data.paging?.next || !after || after === url.searchParams.get("after")) break;
    url.searchParams.set("after", after);
  }

  return [...photos.values()];
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
