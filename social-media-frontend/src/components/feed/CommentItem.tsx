"use client";

import { useState } from "react";
import { CommentResponse, LikeTargetType } from "@/lib/types";
import { toggleLike, addComment } from "@/lib/api";
import { timeAgo } from "@/lib/utils";
import Avatar from "@/components/ui/Avatar";
import LikersModal from "./LikersModal";

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
      onUpdated();
    } catch { /* keep text */ }
    finally { setSubmitting(false); }
  }

  return (
    <div className={depth > 0 ? "ml-10 mt-2" : ""}>
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
                <svg width="12" height="12" viewBox="0 0 19 19" fill="none">
                  <path fill="#FFCC4D" d="M9.5 19a9.5 9.5 0 100-19 9.5 9.5 0 000 19z" />
                  <path fill="#664500" d="M9.5 11.083c-1.912 0-3.181-.222-4.75-.527-.358-.07-1.056 0-1.056 1.055 0 2.111 2.425 4.75 5.806 4.75 3.38 0 5.805-2.639 5.805-4.75 0-1.055-.697-1.125-1.055-1.055-1.57.305-2.838.527-4.75.527z" />
                  <path fill="#fff" d="M4.75 11.611s1.583.528 4.75.528 4.75-.528 4.75-.528-1.056 2.111-4.75 2.111-4.75-2.11-4.75-2.11z" />
                  <path fill="#664500" d="M6.333 8.972c.729 0 1.32-.827 1.32-1.847s-.591-1.847-1.32-1.847c-.729 0-1.32.827-1.32 1.847s.591 1.847 1.32 1.847zM12.667 8.972c.729 0 1.32-.827 1.32-1.847s-.591-1.847-1.32-1.847c-.729 0-1.32.827-1.32 1.847s.591 1.847 1.32 1.847z" />
                </svg>
                {likeCount}
              </button>
            )}
            {depth === 0 && (
              <button
                onClick={() => setShowReply((v) => !v)}
                className="text-xs font-semibold transition-colors"
                style={{ color: "var(--color7)" }}
              >
                Reply
              </button>
            )}
            <span className="text-xs" style={{ color: "var(--bg4)" }}>
              {timeAgo(comment.createdAt)}
            </span>
          </div>

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

      {/* Nested replies */}
      {comment.replies?.length > 0 && (
        <div className="mt-2 space-y-2">
          {comment.replies.map((r) => (
            <CommentItem key={r.id} comment={r} postId={postId} onUpdated={onUpdated} depth={depth + 1} />
          ))}
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
