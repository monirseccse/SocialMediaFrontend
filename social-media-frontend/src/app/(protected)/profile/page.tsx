"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getMyPosts } from "@/lib/api";
import { PostResponse, PostVisibility } from "@/lib/types";
import Navbar from "@/components/layout/Navbar";
import PostCard from "@/components/feed/PostCard";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Avatar from "@/components/ui/Avatar";

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState("");
  const sentinelRef = useRef<HTMLDivElement>(null);

  const cursorRef = useRef<string | undefined>(undefined);
  const hasMoreRef = useRef(false);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace("/login");
  }, [isAuthenticated, authLoading, router]);

  const loadPosts = useCallback(async (reset = false) => {
    if (isFetchingRef.current) return;
    if (!reset && !hasMoreRef.current) return;

    isFetchingRef.current = true;
    setLoading(true);
    setError("");
    try {
      const res = await getMyPosts(reset ? undefined : cursorRef.current);
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
  }, []);

  useEffect(() => {
    if (isAuthenticated) loadPosts(true);
  }, [isAuthenticated, loadPosts]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMoreRef.current && !isFetchingRef.current) {
          loadPosts(false);
        }
      },
      { rootMargin: "300px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadPosts]);

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

      <div className="h-[calc(100vh-70px)] mt-[70px] overflow-hidden">
        <div className="max-w-[680px] mx-auto px-4 h-full">
          <div className="h-full pt-3 overflow-y-auto pb-10" style={{ scrollbarWidth: "none" }}>

            {/* Profile header card */}
            <div
              className="bg-white rounded-[6px] px-6 py-5 mb-4 flex items-center gap-4"
              style={{ boxShadow: "var(--shadow1)" }}
            >
              <Avatar name={user?.name ?? ""} size="lg" />
              <div>
                <h1 className="text-lg font-semibold" style={{ color: "var(--color1)" }}>
                  {user?.name}
                </h1>
                <p className="text-sm mt-0.5" style={{ color: "var(--color7)" }}>
                  My posts
                </p>
              </div>
            </div>

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
                  Share something on the feed to see it here.
                </p>
              </div>
            ) : (
              posts.map((p) => (
                <PostCard
                  key={p.id}
                  post={p}
                  onPostUpdated={handlePostUpdated}
                  showPrivacyIcon={p.visibility === PostVisibility.Private}
                />
              ))
            )}

            <div ref={sentinelRef} className="h-4" />

            {loading && !initialLoad && (
              <div className="flex justify-center py-6">
                <div className="w-7 h-7 border-4 border-blue-100 border-t-[var(--color5)] rounded-full animate-spin" />
              </div>
            )}

            {!hasMore && posts.length > 0 && !loading && (
              <p className="text-center text-xs py-4" style={{ color: "var(--color7)" }}>
                You&apos;ve seen all your posts!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
