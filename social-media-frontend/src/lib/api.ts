import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import {
  AuthResponse,
  CursorPagedResponse,
  PostResponse,
  CommentResponse,
  LikerResponse,
  LikeRequest,
  CreateCommentRequest,
  LikeTargetType,
  PostVisibility,
  LoginRequest,
  RegisterRequest,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5033";

// ── Token store ────────────────────────────────────────────────────────────────

let _accessToken: string | null = null;
let _refreshToken: string | null = null;

export function initTokens(): void {
  if (typeof window === "undefined") return;
  _accessToken = localStorage.getItem("sm_access_token");
  _refreshToken = localStorage.getItem("sm_refresh_token");
}

export function saveTokens(access: string, refresh: string): void {
  _accessToken = access;
  _refreshToken = refresh;
  if (typeof window === "undefined") return;
  localStorage.setItem("sm_access_token", access);
  localStorage.setItem("sm_refresh_token", refresh);
  document.cookie = `sm_auth=1; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
}

export function removeTokens(): void {
  _accessToken = null;
  _refreshToken = null;
  if (typeof window === "undefined") return;
  localStorage.removeItem("sm_access_token");
  localStorage.removeItem("sm_refresh_token");
  document.cookie = "sm_auth=; path=/; max-age=0";
}

export function getAccessToken(): string | null {
  return _accessToken;
}

// ── Axios instance ─────────────────────────────────────────────────────────────

const client: AxiosInstance = axios.create({ baseURL: API_BASE });

client.interceptors.request.use((config) => {
  if (_accessToken) config.headers.Authorization = `Bearer ${_accessToken}`;
  return config;
});

// ── Token-refresh interceptor ──────────────────────────────────────────────────

type QueueItem = { resolve: (token: string) => void; reject: (e: unknown) => void };
let isRefreshing = false;
let queue: QueueItem[] = [];

function drainQueue(error: unknown, token: string | null = null): void {
  queue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token!)));
  queue = [];
}

client.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        queue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return client(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      if (!_accessToken || !_refreshToken) throw new Error("No refresh token");
      const { data } = await axios.post<AuthResponse>(`${API_BASE}/api/Auth/refresh`, {
        accessToken: _accessToken,
        refreshToken: _refreshToken,
      });
      saveTokens(data.accessToken, data.refreshToken);
      drainQueue(null, data.accessToken);
      original.headers.Authorization = `Bearer ${data.accessToken}`;
      return client(original);
    } catch (err) {
      drainQueue(err);
      removeTokens();
      if (typeof window !== "undefined") window.location.href = "/login";
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

// ── Auth ───────────────────────────────────────────────────────────────────────

export async function apiRegister(data: RegisterRequest): Promise<AuthResponse> {
  const res = await client.post<AuthResponse>("/api/Auth/register", data);
  return res.data;
}

export async function apiLogin(data: LoginRequest): Promise<AuthResponse> {
  const res = await client.post<AuthResponse>("/api/Auth/login", data);
  return res.data;
}

// ── Feed ───────────────────────────────────────────────────────────────────────

export async function getFeed(
  cursor?: string,
  limit = 20
): Promise<CursorPagedResponse<PostResponse>> {
  const params: Record<string, string | number> = { limit };
  if (cursor) params.cursor = cursor;
  const res = await client.get<CursorPagedResponse<PostResponse>>("/api/feed", { params });
  return res.data;
}

export async function getMyPosts(
  cursor?: string,
  limit = 20
): Promise<CursorPagedResponse<PostResponse>> {
  const params: Record<string, string | number> = { limit };
  if (cursor) params.cursor = cursor;
  const res = await client.get<CursorPagedResponse<PostResponse>>("/api/post", { params });
  return res.data;
}

export async function toggleLike(data: LikeRequest): Promise<void> {
  await client.post("/api/Feed/like", data);
}

export async function addComment(data: CreateCommentRequest): Promise<void> {
  await client.post("/api/Feed/comment", data);
}

export async function getComments(
  postId: string,
  cursor?: string,
  limit = 20
): Promise<CursorPagedResponse<CommentResponse>> {
  const params: Record<string, string | number> = { Limit: limit };
  if (cursor) params.Cursor = cursor;
  const res = await client.get<CursorPagedResponse<CommentResponse>>(
    `/api/Feed/${postId}/comments`,
    { params }
  );
  return res.data;
}

export async function getLikers(
  targetId: string,
  type: LikeTargetType,
  cursor?: string,
  limit = 20
): Promise<CursorPagedResponse<LikerResponse>> {
  const params: Record<string, string | number> = { type, Limit: limit };
  if (cursor) params.Cursor = cursor;
  const res = await client.get<CursorPagedResponse<LikerResponse>>(
    `/api/Feed/${targetId}/likers`,
    { params }
  );
  return res.data;
}

// ── Post ───────────────────────────────────────────────────────────────────────

export async function createPost(data: {
  content: string;
  image?: File;
  visibility: PostVisibility;
}): Promise<void> {
  const form = new FormData();
  form.append("Content", data.content);
  form.append("Visibility", String(data.visibility));
  if (data.image) form.append("Image", data.image);
  await client.post("/api/Post", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}
