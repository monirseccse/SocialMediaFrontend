"use client";

import { useState, useEffect, useCallback } from "react";
import { getComments, addComment } from "@/lib/api";
import { CommentResponse } from "@/lib/types";
import CommentItem from "./CommentItem";
import Avatar from "@/components/ui/Avatar";
import { useAuth } from "@/context/AuthContext";

interface CommentSectionProps {
  postId: string;
  isVisible: boolean;
}

export default function CommentSection({ postId, isVisible }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [cursor, setCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const fetchComments = useCallback(
    async (reset = false) => {
      if (reset) setLoading(true); else setLoadingMore(true);
      try {
        const res = await getComments(postId, reset ? undefined : cursor, 10);
        if (reset) setComments(res.data);
        else setComments((prev) => [...prev, ...res.data]);
        setCursor(res.nextCursor ?? undefined);
        setHasMore(res.hasNextPage);
        setInitialized(true);
      } catch { /* ignore */ }
      finally { setLoading(false); setLoadingMore(false); }
    },
    [postId, cursor] // intentionally omit fetchComments from deps
  );

  useEffect(() => {
    if (isVisible && !initialized) fetchComments(true);
  }, [isVisible, initialized, fetchComments]);

  async function handlePost() {
    const text = commentText.trim();
    if (!text || submitting) return;
    setSubmitting(true);
    try {
      await addComment({ postId, content: text });
      setCommentText("");
      setInitialized(false);
      setCursor(undefined);
      await fetchComments(true);
    } catch { /* keep text */ }
    finally { setSubmitting(false); }
  }

  if (!isVisible) return null;

  return (
    <div className="space-y-3">
      {/* Comment input */}
      <div className="flex gap-3 items-center">
        {user && <Avatar name={user.name} size="sm" />}
        <div
          className="flex-1 flex items-center rounded-full border px-3 py-1.5 gap-2 transition-colors"
          style={{ background: "var(--bg3)", borderColor: "var(--bg3)" }}
        >
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handlePost(); }
            }}
            placeholder="Write a comment…"
            className="flex-1 text-sm bg-transparent outline-none placeholder-gray-400"
            style={{ color: "var(--color)" }}
            disabled={submitting}
          />
          <button
            onClick={handlePost}
            disabled={!commentText.trim() || submitting}
            className="w-7 h-7 flex items-center justify-center rounded-full flex-shrink-0 text-white disabled:opacity-40 transition-opacity"
            style={{ background: "var(--color5)" }}
          >
            {submitting ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg width="12" height="12" fill="none" viewBox="0 0 14 13">
                <path fill="#fff" fillRule="evenodd" d="M6.37 7.879l2.438 3.955a.335.335 0 00.34.162c.068-.01.23-.05.289-.247l3.049-10.297a.348.348 0 00-.09-.35.341.341 0 00-.34-.088L1.75 4.03a.34.34 0 00-.247.289.343.343 0 00.16.347L5.666 7.17 9.2 3.597a.5.5 0 01.712.703L6.37 7.88z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Comments */}
      {loading ? (
        <div className="py-3 flex justify-center">
          <div className="w-5 h-5 border-2 border-blue-100 border-t-[var(--color5)] rounded-full animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-center py-2" style={{ color: "var(--color7)" }}>
          No comments yet. Be the first!
        </p>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              postId={postId}
              onUpdated={() => {
                setInitialized(false);
                setCursor(undefined);
                fetchComments(true);
              }}
            />
          ))}
          {hasMore && (
            <button
              onClick={() => fetchComments(false)}
              disabled={loadingMore}
              className="text-xs font-medium hover:underline transition-colors disabled:opacity-50"
              style={{ color: "var(--color5)" }}
            >
              {loadingMore ? "Loading…" : "View more comments"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
