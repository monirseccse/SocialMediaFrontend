"use client";

import { useState } from "react";
import { CommentResponse, LikeTargetType } from "@/lib/types";
import { toggleLike, addComment, getCommentReplies } from "@/lib/api";
import { timeAgo } from "@/lib/utils";
import Avatar from "@/components/ui/Avatar";
import LikersModal from "./LikersModal";

const MAX_INDENT_DEPTH = 4;

interface CommentItemProps {
  comment: CommentResponse;
  postId: string;
  onUpdated: () => void;
  depth?: number;
}

export default function CommentItem({ comment, postId, onUpdated, depth = 0 }: CommentItemProps) {
  const [liked, setLiked] = useState(comment.isLikedByMe);
  const [likeCount, setLikeCount] = useState(comment.likeCount);
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showLikers, setShowLikers] = useState(false);

  const [localReplyCount, setLocalReplyCount] = useState(comment.replyCount ?? 0);
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<CommentResponse[]>([]);
  const [repliesCursor, setRepliesCursor] = useState<string | null>(null);
  const [repliesHasMore, setRepliesHasMore] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [loadingMoreReplies, setLoadingMoreReplies] = useState(false);
  const [repliesError, setRepliesError] = useState<string | null>(null);

  async function fetchReplies(reset = false) {
    if (reset) setLoadingReplies(true);
    else setLoadingMoreReplies(true);
    setRepliesError(null);

    try {
      const cursor = reset ? undefined : (repliesCursor ?? undefined);
      const res = await getCommentReplies(comment.id, cursor, 10);
      setReplies((prev) => (reset ? res.data : [...prev, ...res.data]));
      setRepliesCursor(res.nextCursor);
      setRepliesHasMore(res.hasNextPage);
    } catch {
      setRepliesError("Couldn't load replies, tap to retry");
    } finally {
      setLoadingReplies(false);
      setLoadingMoreReplies(false);
    }
  }

  async function handleToggleReplies() {
    if (showReplies) {
      setShowReplies(false);
      return;
    }
    setShowReplies(true);
    if (replies.length === 0 && !loadingReplies) {
      await fetchReplies(true);
    }
  }

  async function handleLike() {
    const prev = liked;
    setLiked(!prev);
    setLikeCount((n) => (prev ? n - 1 : n + 1));
    try {
      await toggleLike({ targetId: comment.id, type: LikeTargetType.Comment });
    } catch {
      setLiked(prev);
      setLikeCount((n) => (prev ? n + 1 : n - 1));
    }
  }

  async function handleReply() {
    const text = replyText.trim();
    if (!text || submitting) return;
    setSubmitting(true);
    try {
      await addComment({ postId, parentCommentId: comment.id, content: text });
      setReplyText("");
      setShowReply(false);
      setLocalReplyCount((n) => n + 1);
      if (showReplies) {
        await fetchReplies(true);
      }
    } catch { /* keep text so user can retry */ }
    finally { setSubmitting(false); }
  }

  const outerClass = [
    depth > 0 && depth <= MAX_INDENT_DEPTH ? "ml-10" : "",
    depth > 0 ? "mt-2" : "",
  ].filter(Boolean).join(" ");

  const replyLabel = localReplyCount === 1 ? "1 reply" : `${localReplyCount} replies`;

  return (
    <div className={outerClass}>
      <div className="flex gap-2">
        <Avatar name={comment.authorName} size="sm" />
        <div className="flex-1 min-w-0">
          {/* Bubble */}
          <div
            className="rounded-[6px] px-3 py-2 inline-block max-w-full"
            style={{ background: "var(--bg3)" }}
          >
            <p className="text-xs font-semibold" style={{ color: "var(--color1)" }}>
              {comment.authorName}
            </p>
            <p className="text-sm mt-0.5 break-words" style={{ color: "var(--color)" }}>
              {comment.content}
            </p>
          </div>

          {/* Actions row */}
          <div className="flex items-center gap-3 mt-1 pl-1">
            <button
              onClick={handleLike}
              className="text-xs font-semibold transition-colors"
              style={{ color: liked ? "var(--color5)" : "var(--color7)" }}
            >
              Like
            </button>
            {likeCount > 0 && (
              <button
                onClick={() => setShowLikers(true)}
                className="flex items-center gap-1 text-xs transition-colors"
                style={{ color: "var(--color7)" }}
              >
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24">
                  <path fill="var(--color5)" d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
                </svg>
                {likeCount}
              </button>
            )}
            <button
              onClick={() => setShowReply((v) => !v)}
              className="text-xs font-semibold transition-colors"
              style={{ color: "var(--color7)" }}
            >
              Reply
            </button>
            <span className="text-xs" style={{ color: "var(--bg4)" }}>
              {timeAgo(comment.createdAt)}
            </span>
          </div>

          {/* View / hide replies toggle */}
          {localReplyCount > 0 && (
            <div className="mt-1 pl-1">
              <button
                onClick={handleToggleReplies}
                className="text-xs font-semibold transition-colors"
                style={{ color: "var(--color5)" }}
              >
                {showReplies ? "Hide replies" : `View ${replyLabel}`}
              </button>
            </div>
          )}

          {/* Reply input */}
          {showReply && (
            <div className="mt-2 flex items-center gap-2">
              <input
                autoFocus
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleReply(); }
                  if (e.key === "Escape") setShowReply(false);
                }}
                placeholder={`Reply to ${comment.authorName}…`}
                className="flex-1 text-sm px-3 py-1.5 rounded-full border transition-colors"
                style={{
                  background: "var(--bg3)",
                  borderColor: "var(--bg3)",
                  color: "var(--color)",
                }}
                disabled={submitting}
              />
              <button
                onClick={handleReply}
                disabled={!replyText.trim() || submitting}
                className="w-8 h-8 flex items-center justify-center rounded-full text-white disabled:opacity-40 transition-opacity"
                style={{ background: "var(--color5)" }}
              >
                <svg width="14" height="13" fill="none" viewBox="0 0 14 13">
                  <path fill="#fff" fillRule="evenodd" d="M6.37 7.879l2.438 3.955a.335.335 0 00.34.162c.068-.01.23-.05.289-.247l3.049-10.297a.348.348 0 00-.09-.35.341.341 0 00-.34-.088L1.75 4.03a.34.34 0 00-.247.289.343.343 0 00.16.347L5.666 7.17 9.2 3.597a.5.5 0 01.712.703L6.37 7.88z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* On-demand reply list */}
      {showReplies && (
        <div className="mt-2 space-y-2">
          {loadingReplies && (
            <p className="text-xs pl-1" style={{ color: "var(--color7)" }}>
              Loading replies…
            </p>
          )}

          {repliesError && !loadingReplies && (
            <button
              onClick={() => fetchReplies(replies.length === 0)}
              className="text-xs pl-1 text-left transition-colors"
              style={{ color: "var(--color5)" }}
            >
              {repliesError}
            </button>
          )}

          {replies.map((r) => (
            <CommentItem
              key={r.id}
              comment={r}
              postId={postId}
              onUpdated={onUpdated}
              depth={depth + 1}
            />
          ))}

          {repliesHasMore && !loadingMoreReplies && !repliesError && (
            <button
              onClick={() => fetchReplies(false)}
              className="text-xs font-semibold pl-1 transition-colors"
              style={{ color: "var(--color5)" }}
            >
              Load more replies
            </button>
          )}

          {loadingMoreReplies && (
            <p className="text-xs pl-1" style={{ color: "var(--color7)" }}>
              Loading…
            </p>
          )}
        </div>
      )}

      <LikersModal
        targetId={comment.id}
        type={LikeTargetType.Comment}
        isOpen={showLikers}
        onClose={() => setShowLikers(false)}
        title="Liked this comment"
      />
    </div>
  );
}
