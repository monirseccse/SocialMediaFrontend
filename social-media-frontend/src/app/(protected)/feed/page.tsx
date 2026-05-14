"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getFeed } from "@/lib/api";
import { PostResponse } from "@/lib/types";
import Navbar from "@/components/layout/Navbar";
import PostCard from "@/components/feed/PostCard";
import CreatePost from "@/components/feed/CreatePost";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

// ── Left sidebar explore links ─────────────────────────────────────────────────
const exploreLinks = [
  {
    label: "Learning",
    badge: "New",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
        <path fill="#666" d="M10 0c5.523 0 10 4.477 10 10s-4.477 10-10 10S0 15.523 0 10 4.477 0 10 0zm0 1.395a8.605 8.605 0 100 17.21 8.605 8.605 0 000-17.21zm-1.233 4.65l.104.01c.188.028.443.113.668.203 1.026.398 3.033 1.746 3.8 2.563l.223.239.08.092a1.16 1.16 0 01.025 1.405c-.04.053-.086.105-.19.215l-.269.28c-.812.794-2.57 1.971-3.569 2.391-.277.117-.675.25-.865.253a1.167 1.167 0 01-1.07-.629c-.053-.104-.12-.353-.171-.586l-.051-.262c-.093-.57-.143-1.437-.142-2.347l.001-.288c.01-.858.063-1.64.157-2.147.037-.207.12-.563.167-.678.104-.25.291-.45.523-.575a1.15 1.15 0 01.58-.14zm.14 1.467l-.027.126-.034.198c-.07.483-.112 1.233-.111 2.036l.001.279c.009.737.053 1.414.123 1.841l.048.235.192-.07c.883-.372 2.636-1.56 3.23-2.2l.08-.087-.212-.218c-.711-.682-2.38-1.79-3.167-2.095l-.124-.045z" />
      </svg>
    ),
  },
  {
    label: "Find friends",
    icon: (
      <svg width="22" height="24" fill="none" viewBox="0 0 22 24">
        <path fill="#666" d="M9.032 14.456l.297.002c4.404.041 6.907 1.03 6.907 3.678 0 2.586-2.383 3.573-6.615 3.654l-.589.005c-4.588 0-7.203-.972-7.203-3.68 0-2.704 2.604-3.659 7.203-3.659zm0 1.5l-.308.002c-3.645.038-5.523.764-5.523 2.157 0 1.44 1.99 2.18 5.831 2.18 3.847 0 5.832-.728 5.832-2.159 0-1.44-1.99-2.18-5.832-2.18zm8.53-8.037c.347 0 .634.282.679.648l.006.102v1.255h1.185c.38 0 .686.336.686.75 0 .38-.258.694-.593.743l-.093.007h-1.185v1.255c0 .414-.307.75-.686.75-.347 0-.634-.282-.68-.648l-.005-.102-.001-1.255h-1.183c-.379 0-.686-.336-.686-.75 0-.38.258-.694.593-.743l.093-.007h1.183V8.669c0-.414.308-.75.686-.75zM9.031 2c2.698 0 4.864 2.369 4.864 5.319 0 2.95-2.166 5.318-4.864 5.318-2.697 0-4.863-2.369-4.863-5.318C4.17 4.368 6.335 2 9.032 2zm0 1.5c-1.94 0-3.491 1.697-3.491 3.819 0 2.12 1.552 3.818 3.491 3.818 1.94 0 3.492-1.697 3.492-3.818 0-2.122-1.551-3.818-3.492-3.818z" />
      </svg>
    ),
  },
  {
    label: "Bookmarks",
    icon: (
      <svg width="22" height="24" fill="none" viewBox="0 0 22 24">
        <path fill="#666" d="M13.704 2c2.8 0 4.585 1.435 4.585 4.258V20.33c0 .443-.157.867-.436 1.18-.279.313-.658.489-1.063.489a1.456 1.456 0 01-.708-.203l-5.132-3.134-5.112 3.14c-.615.36-1.361.194-1.829-.405l-.09-.126-.085-.155a1.913 1.913 0 01-.176-.786V6.434C3.658 3.5 5.404 2 8.243 2h5.46z" />
      </svg>
    ),
  },
  {
    label: "Groups",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

function LeftSidebar() {
  return (
    <div className="space-y-4">
      {/* Explore */}
      <div
        className="bg-white rounded-[6px] pt-6 pb-2 px-6"
        style={{ boxShadow: "var(--shadow1)" }}
      >
        <h4 className="font-medium text-base mb-6" style={{ color: "var(--color1)" }}>
          Explore
        </h4>
        <ul className="space-y-1">
          {exploreLinks.map(({ label, icon, badge }) => (
            <li key={label}>
              <a
                href="#"
                className="flex items-center justify-between py-2 px-1 rounded-[6px] text-sm hover:bg-gray-50 transition-colors"
                style={{ color: "var(--color7)" }}
              >
                <span className="flex items-center gap-3">
                  {icon}
                  {label}
                </span>
                {badge && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: "#E8F4FF", color: "var(--color5)" }}
                  >
                    {badge}
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Suggested People */}
      <div
        className="bg-white rounded-[6px] pt-6 pb-3 px-6"
        style={{ boxShadow: "var(--shadow1)" }}
      >
        <div className="flex items-center justify-between mb-6">
          <h4 className="font-medium text-base" style={{ color: "var(--color1)" }}>
            Suggested People
          </h4>
          <a href="#" className="text-xs" style={{ color: "var(--color5)" }}>See All</a>
        </div>
        {["Steve Jobs", "Ryan Roslansky", "Dylan Field"].map((name) => (
          <div key={name} className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs text-white font-semibold flex-shrink-0"
                style={{ background: "var(--color5)" }}
              >
                {name[0]}
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--color1)" }}>{name}</p>
              </div>
            </div>
            <a
              href="#"
              className="text-xs font-medium px-3 py-1 rounded-[6px] border transition-colors hover:bg-blue-50"
              style={{ color: "var(--color5)", borderColor: "var(--color5)" }}
            >
              Connect
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Feed Page ─────────────────────────────────────────────────────────────
export default function FeedPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState("");
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Refs instead of state so loadPosts stays stable (no re-creation on cursor change)
  const cursorRef = useRef<string | undefined>(undefined);
  const hasMoreRef = useRef(false);
  const isFetchingRef = useRef(false);
  const scrollRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace("/login");
  }, [isAuthenticated, authLoading, router]);

  // Empty deps → stable reference → no cascade re-renders
  const loadPosts = useCallback(async (reset = false) => {
    if (isFetchingRef.current) return;
    if (!reset && !hasMoreRef.current) return;

    isFetchingRef.current = true;
    setLoading(true);
    setError("");
    try {
      const res = await getFeed(reset ? undefined : cursorRef.current);
      if (reset) {
        setPosts(res.data);
      } else {
        setPosts((prev) => {
          const ids = new Set(prev.map((p) => p.id));
          return [...prev, ...res.data.filter((p) => !ids.has(p.id))];
        });
      }
      cursorRef.current = res.nextCursor ?? undefined;
      hasMoreRef.current = res.hasNextPage;
      setHasMore(res.hasNextPage);
    } catch {
      setError("Failed to load posts. Please try again.");
    } finally {
      setLoading(false);
      setInitialLoad(false);
      isFetchingRef.current = false;
    }
  }, []); // stable — uses refs for cursor/fetching, state setters are always stable

  useEffect(() => {
    if (isAuthenticated) loadPosts(true);
  }, [isAuthenticated, loadPosts]);

  // Runs once (loadPosts is stable); observer callback reads refs, no stale closures
useEffect(() => {
  if (initialLoad) return;                     // ← wait for first fetch to finish
  const el = sentinelRef.current;
  const scrollEl = scrollRef.current;
  if (!el || !scrollEl) return;
  const obs = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && hasMoreRef.current && !isFetchingRef.current) {
        loadPosts(false);
      }
    },
    { root: scrollEl, rootMargin: "300px" }
  );
  obs.observe(el);
  return () => obs.disconnect();
}, [loadPosts, initialLoad]);                  // ← add initialLoad here

  function handlePostCreated() {
    cursorRef.current = undefined;
    hasMoreRef.current = true;
    loadPosts(true);
  }

  function handlePostUpdated(id: string, patch: Partial<PostResponse>) {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg1)" }}>
        <div className="w-10 h-10 border-4 border-blue-100 border-t-[var(--color5)] rounded-full animate-spin" />
      </div>
    );
  }
  if (!isAuthenticated) return null;

  return (
    <div className="h-screen overflow-hidden" style={{ background: "var(--bg1)" }}>
      <Navbar />

      {/* Three-column layout */}
      <div className="h-[calc(100vh-70px)] mt-[70px] overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-4 h-full">
          <div className="flex gap-4 h-full pt-3">
            {/* Left sidebar */}
            <aside className="w-[260px] flex-shrink-0 h-full overflow-y-auto hidden lg:block pb-6">
              <LeftSidebar />
            </aside>

            {/* Middle – feed */}
            <main
             ref={scrollRef} 
              className="flex-1 h-full overflow-y-auto pb-10"
              style={{ scrollbarWidth: "none" }}
            >
              <CreatePost onCreated={handlePostCreated} />

              {error && (
                <div
                  className="px-4 py-3 mb-4 rounded-[6px] text-sm flex items-center justify-between"
                  style={{ background: "#FFF1F0", border: "1px solid #FFCCC7", color: "#CF1322" }}
                >
                  {error}
                  <button onClick={() => loadPosts(false)} className="font-medium hover:underline ml-4">
                    Retry
                  </button>
                </div>
              )}

              {/* Skeleton */}
              {initialLoad ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-[6px] p-6 animate-pulse"
                      style={{ boxShadow: "var(--shadow1)" }}
                    >
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-gray-200 rounded w-1/3" />
                          <div className="h-3 bg-gray-200 rounded w-1/4" />
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        <div className="h-3 bg-gray-200 rounded" />
                        <div className="h-3 bg-gray-200 rounded w-4/5" />
                      </div>
                      <div className="mt-3 h-40 bg-gray-200 rounded" />
                    </div>
                  ))}
                </div>
              ) : posts.length === 0 ? (
                <div
                  className="bg-white rounded-[6px] p-12 text-center"
                  style={{ boxShadow: "var(--shadow1)" }}
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ background: "#E8F4FF" }}
                  >
                    <svg width="32" height="32" fill="none" viewBox="0 0 22 24">
                      <path fill="var(--color5)" d="M13.704 2c2.8 0 4.585 1.435 4.585 4.258V20.33c0 .443-.157.867-.436 1.18-.279.313-.658.489-1.063.489a1.456 1.456 0 01-.708-.203l-5.132-3.134-5.112 3.14c-.615.36-1.361.194-1.829-.405l-.09-.126-.085-.155a1.913 1.913 0 01-.176-.786V6.434C3.658 3.5 5.404 2 8.243 2h5.46z" />
                    </svg>
                  </div>
                  <p className="font-medium text-sm" style={{ color: "var(--color1)" }}>
                    No posts yet.
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--color7)" }}>
                    Be the first to share something!
                  </p>
                </div>
              ) : (
                posts.map((p) => (
                  <PostCard key={p.id} post={p} onPostUpdated={handlePostUpdated} />
                ))
              )}

              {/* Sentinel */}
              <div ref={sentinelRef} className="h-4" />

              {loading && !initialLoad && (
                <div className="flex justify-center py-6">
                  <div
                    className="w-7 h-7 border-4 border-blue-100 border-t-[var(--color5)] rounded-full animate-spin"
                  />
                </div>
              )}

              {!hasMore && posts.length > 0 && !loading && (
                <p className="text-center text-xs py-4" style={{ color: "var(--color7)" }}>
                  You&apos;ve seen all posts!
                </p>
              )}
            </main>

            {/* Right sidebar */}
            <aside className="w-[260px] flex-shrink-0 h-full overflow-y-auto hidden xl:block pb-6">
              <div
                className="bg-white rounded-[6px] pt-6 pb-4 px-6"
                style={{ boxShadow: "var(--shadow1)" }}
              >
                <h4 className="font-medium text-base mb-4" style={{ color: "var(--color1)" }}>
                  Who to follow
                </h4>
                {["Alice Chen", "Mark Rivera", "Emma Watson"].map((name) => (
                  <div key={name} className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs text-white font-semibold flex-shrink-0"
                        style={{ background: "#0ACF83" }}
                      >
                        {name[0]}
                      </div>
                      <span className="text-sm font-medium" style={{ color: "var(--color1)" }}>
                        {name}
                      </span>
                    </div>
                    <a
                      href="#"
                      className="text-xs font-medium px-3 py-1 rounded-[6px] text-white transition-colors hover:opacity-90"
                      style={{ background: "var(--color5)" }}
                    >
                      Follow
                    </a>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
