import crypto from "node:crypto";
import type { Request, Response } from "express";
import { ENV } from "./_core/env";

const X_TOKEN_COOKIE = "x_access_token";
const X_STATE_COOKIE = "x_oauth_state";
const X_API = "https://api.x.com/2";

type XUser = { id: string; name: string; username: string; profile_image_url?: string };
type XToken = { access_token: string; refresh_token?: string; expires_at?: number };
type XPost = { id: string; text: string; created_at?: string; referenced_tweets?: Array<{ type: string; id: string }> };

function key() { return crypto.createHash("sha256").update(ENV.cookieSecret || "development-only-change-me").digest(); }
function seal(value: string) {
  const iv = crypto.randomBytes(12); const cipher = crypto.createCipheriv("aes-256-gcm", key(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return `${iv.toString("base64url")}.${cipher.getAuthTag().toString("base64url")}.${encrypted.toString("base64url")}`;
}
function unseal(value?: string) {
  if (!value) return undefined;
  try { const [ivText, tagText, dataText] = value.split("."); const decipher = crypto.createDecipheriv("aes-256-gcm", key(), Buffer.from(ivText, "base64url")); decipher.setAuthTag(Buffer.from(tagText, "base64url")); return Buffer.concat([decipher.update(Buffer.from(dataText, "base64url")), decipher.final()]).toString("utf8"); } catch { return undefined; }
}
function cookie(req: Request, name: string) { return req.headers.cookie?.split(";").map((item) => item.trim()).find((item) => item.startsWith(`${name}=`))?.slice(name.length + 1); }
function setCookie(res: Response, name: string, value: string, maxAge = 60 * 60 * 24 * 30) { res.cookie(name, value, { httpOnly: true, secure: ENV.isProduction, sameSite: "lax", path: "/", maxAge }); }
function clearCookie(res: Response, name: string) { res.clearCookie(name, { httpOnly: true, secure: ENV.isProduction, sameSite: "lax", path: "/" }); }
function configured() { return Boolean(ENV.xClientId && ENV.xRedirectUri); }
function requireToken(req: Request) { const raw = unseal(cookie(req, X_TOKEN_COOKIE)); if (!raw) throw new Error("X hesabı bağlı değil"); return JSON.parse(raw) as XToken; }
async function xFetch<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${X_API}${path}`, { ...init, headers: { authorization: `Bearer ${token}`, "content-type": "application/json", ...(init?.headers ?? {}) } });
  if (!response.ok) throw new Error(`X API ${response.status}: ${await response.text()}`);
  return response.json() as Promise<T>;
}
async function fetchAllPosts(token: string, userId: string) {
  const posts: XPost[] = []; let paginationToken = "";
  do {
    const params = new URLSearchParams({ max_results: "100", "tweet.fields": "created_at,referenced_tweets", ...(paginationToken ? { pagination_token: paginationToken } : {}) });
    const result = await xFetch<{ data?: XPost[]; meta?: { next_token?: string } }>(`/users/${userId}/tweets?${params}`, token);
    posts.push(...(result.data ?? [])); paginationToken = result.meta?.next_token ?? "";
  } while (paginationToken && posts.length < 10000);
  return posts;
}

export function xStatus(req: Request) {
  const raw = unseal(cookie(req, X_TOKEN_COOKIE));
  if (!raw) return { configured: configured(), connected: false, user: null };
  try { const token = JSON.parse(raw) as XToken; return { configured: configured(), connected: Boolean(token.access_token), user: null }; } catch { return { configured: configured(), connected: false, user: null }; }
}

export function xLogin(req: Request, res: Response) {
  if (!configured()) throw new Error("أضف X_CLIENT_ID و X_REDIRECT_URI في Secrets أولًا");
  const state = crypto.randomBytes(24).toString("base64url"); const verifier = crypto.randomBytes(32).toString("base64url"); const challenge = crypto.createHash("sha256").update(verifier).digest("base64url");
  setCookie(res, X_STATE_COOKIE, seal(JSON.stringify({ state, verifier })), 600);
  const params = new URLSearchParams({ response_type: "code", client_id: ENV.xClientId, redirect_uri: ENV.xRedirectUri, scope: "tweet.read tweet.write like.read like.write users.read offline.access", state, code_challenge: challenge, code_challenge_method: "S256" });
  res.redirect(`https://x.com/i/oauth2/authorize?${params}`);
}

export async function xCallback(req: Request, res: Response) {
  const saved = unseal(cookie(req, X_STATE_COOKIE)); const state = saved ? JSON.parse(saved) as { state: string; verifier: string } : null;
  if (!state || state.state !== req.query.state || typeof req.query.code !== "string") return res.status(400).send("OAuth state غير صالح");
  const body = new URLSearchParams({ code: req.query.code, grant_type: "authorization_code", client_id: ENV.xClientId, redirect_uri: ENV.xRedirectUri, code_verifier: state.verifier });
  const tokenResponse = await fetch("https://api.x.com/2/oauth2/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body });
  if (!tokenResponse.ok) return res.status(502).send(`تعذر إكمال تسجيل الدخول إلى X: ${await tokenResponse.text()}`);
  const token = await tokenResponse.json() as { access_token: string; refresh_token?: string; expires_in?: number };
  setCookie(res, X_TOKEN_COOKIE, seal(JSON.stringify({ access_token: token.access_token, refresh_token: token.refresh_token, expires_at: token.expires_in ? Date.now() + token.expires_in * 1000 : undefined })), token.expires_in ?? 60 * 60 * 24 * 30);
  clearCookie(res, X_STATE_COOKIE); res.redirect("/");
}

export async function xDisconnect(req: Request, res: Response) { clearCookie(res, X_TOKEN_COOKIE); res.json({ success: true }); }

export async function xScan(req: Request) {
  const token = requireToken(req); const me = await xFetch<{ data: XUser }>("/users/me?user.fields=profile_image_url", token.access_token); const posts = await fetchAllPosts(token.access_token, me.data.id);
  let likedPosts: XPost[] = []; try { const likes = await xFetch<{ data?: XPost[] }>(`/users/${me.data.id}/liked_tweets?max_results=100&tweet.fields=created_at`, token.access_token); likedPosts = likes.data ?? []; } catch { /* like.read may not be enabled */ }
  const mapPost = (post: XPost) => ({ id: post.id, text: post.text, createdAt: post.created_at, isReply: post.referenced_tweets?.some((item) => item.type === "replied_to") ?? false });
  return { user: me.data, posts: posts.map(mapPost), likedPosts: likedPosts.map(mapPost), counts: { posts: posts.length, replies: posts.filter((post) => post.referenced_tweets?.some((item) => item.type === "replied_to")).length, likes: likedPosts.length } };
}

export async function xDelete(req: Request) {
  const token = requireToken(req); const ids = Array.isArray(req.body?.ids) ? req.body.ids.filter((id: unknown): id is string => typeof id === "string" && /^\d+$/.test(id)).slice(0, 1000) : [];
  if (!ids.length) throw new Error("لم يتم تحديد أي منشور");
  const results = []; for (const id of ids) { const response = await fetch(`${X_API}/tweets/${id}`, { method: "DELETE", headers: { authorization: `Bearer ${token.access_token}` } }); results.push({ id, ok: response.ok, status: response.status }); }
  return { results, deleted: results.filter((item) => item.ok).length, failed: results.filter((item) => !item.ok).length };
}

export async function xUnlike(req: Request) {
  const token = requireToken(req); const me = await xFetch<{ data: XUser }>("/users/me", token.access_token); const ids = Array.isArray(req.body?.ids) ? req.body.ids.filter((id: unknown): id is string => typeof id === "string" && /^\d+$/.test(id)).slice(0, 1000) : [];
  if (!ids.length) throw new Error("لم يتم تحديد أي إعجاب");
  const results = []; for (const id of ids) { const response = await fetch(`${X_API}/users/${me.data.id}/likes/${id}`, { method: "DELETE", headers: { authorization: `Bearer ${token.access_token}` } }); results.push({ id, ok: response.ok, status: response.status }); }
  return { results, deleted: results.filter((item) => item.ok).length, failed: results.filter((item) => !item.ok).length };
}
