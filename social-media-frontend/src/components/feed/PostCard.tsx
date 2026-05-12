"use client";

import { useState } from "react";
import Image from "next/image";
import { PostResponse, PostVisibility, LikeTargetType } from "@/lib/types";
import { toggleLike } from "@/lib/api";
import { timeAgo } from "@/lib/utils";
import Avatar from "@/components/ui/Avatar";
import CommentSection from "./CommentSection";
import LikersModal from "./LikersModal";

interface PostCardProps {
  post: PostResponse;
  onPostUpdated?: (id: string, patch: Partial<PostResponse>) => void;
  showPrivacyIcon?: boolean;
}

export default function PostCard({ post, onPostUpdated, showPrivacyIcon }: PostCardProps) {
  const [liked, setLiked] = useState(post.isLikedByMe);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [commentCount] = useState(post.commentCount);
  const [showComments, setShowComments] = useState(false);
  const [showLikers, setShowLikers] = useState(false);

  async function handleLike() {
    const prev = liked;
    setLiked(!prev);
    setLikeCount((n) => (prev ? n - 1 : n + 1));
    try {
      await toggleLike({ targetId: post.id, type: LikeTargetType.Post });
      onPostUpdated?.(post.id, { isLikedByMe: !prev, likeCount: prev ? likeCount - 1 : likeCount + 1 });
    } catch {
      setLiked(prev);
      setLikeCount((n) => (prev ? n + 1 : n - 1));
    }
  }

  const isPrivate = post.visibility === PostVisibility.Private;

  return (
    <>
      <article
        className="bg-white rounded-[6px] mb-4 overflow-hidden"
        style={{ boxShadow: "var(--shadow1)" }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar name={post.authorName} size="md" />
            <div>
              <h4 className="font-semibold text-sm" style={{ color: "var(--color1)" }}>
                {post.authorName}
              </h4>
              <p className="text-xs flex items-center gap-1" style={{ color: "var(--color7)" }}>
                {timeAgo(post.createdAt)} ·{" "}
                <a href="#" className="flex items-center gap-1" style={{ color: "var(--color5)" }}>
                  {showPrivacyIcon && isPrivate && (
                    <svg width="11" height="13" fill="none" viewBox="0 0 11 13" aria-label="Private">
                      <rect x="1" y="5.5" width="9" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                      <path d="M3 5.5V3.5a2.5 2.5 0 015 0v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                      <circle cx="5.5" cy="9" r="1" fill="currentColor" />
                    </svg>
                  )}
                  {isPrivate ? "Private" : "Public"}
                </a>
              </p>
            </div>
          </div>
          {/* three-dot placeholder */}
          <button className="flex items-center justify-center w-7 h-7 rounded hover:bg-gray-100 transition-colors">
            <svg width="4" height="17" fill="none" viewBox="0 0 4 17">
              <circle cx="2" cy="2" r="2" fill="#C4C4C4" />
              <circle cx="2" cy="8" r="2" fill="#C4C4C4" />
              <circle cx="2" cy="15" r="2" fill="#C4C4C4" />
            </svg>
          </button>
        </div>

        {/* Content text */}
        {post.content && (
          <div className="px-6 pb-4">
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words" style={{ color: "var(--color1)" }}>
              {post.content}
            </p>
          </div>
        )}

        {/* Post image */}
        {post.imageUrl && (
          <div className="relative w-full aspect-video bg-gray-100">
            <Image
              src={post.imageUrl}
              alt="Post image"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 600px"
            />
          </div>
        )}

        {/* Reaction counts row */}
        {(likeCount > 0 || commentCount > 0) && (
          <div className="px-6 pt-4 pb-3 flex items-center justify-between">
            {likeCount > 0 ? (
              <button
                onClick={() => setShowLikers(true)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                {/* Emoji reaction avatar stack */}
                <div className="flex -space-x-1">
                  {liked ? (
                    /* active smiley */
                    <span className="w-[26px] h-[26px] rounded-full bg-yellow-400 flex items-center justify-center text-sm border-2 border-white">
                      <svg width="16" height="16" fill="none" viewBox="0 0 19 19">
                        <path fill="#FFCC4D" d="M9.5 19a9.5 9.5 0 100-19 9.5 9.5 0 000 19z" />
                        <path fill="#664500" d="M9.5 11.083c-1.912 0-3.181-.222-4.75-.527-.358-.07-1.056 0-1.056 1.055 0 2.111 2.425 4.75 5.806 4.75 3.38 0 5.805-2.639 5.805-4.75 0-1.055-.697-1.125-1.055-1.055-1.57.305-2.838.527-4.75.527z" />
                        <path fill="#fff" d="M4.75 11.611s1.583.528 4.75.528 4.75-.528 4.75-.528-1.056 2.111-4.75 2.111-4.75-2.11-4.75-2.11z" />
                        <path fill="#664500" d="M6.333 8.972c.729 0 1.32-.827 1.32-1.847s-.591-1.847-1.32-1.847c-.729 0-1.32.827-1.32 1.847s.591 1.847 1.32 1.847zM12.667 8.972c.729 0 1.32-.827 1.32-1.847s-.591-1.847-1.32-1.847c-.729 0-1.32.827-1.32 1.847s.591 1.847 1.32 1.847z" />
                      </svg>
                    </span>
                  ) : (
                    <span
                      className="w-[26px] h-[26px] rounded-full flex items-center justify-center border-2 border-white"
                      style={{ background: "var(--color5)" }}
                    >
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </span>
                  )}
                </div>
                <span className="text-xs" style={{ color: "var(--color7)" }}>{likeCount}</span>
              </button>
            ) : <span />}

            {commentCount > 0 && (
              <button
                onClick={() => setShowComments((v) => !v)}
                className="text-xs hover:underline transition-colors"
                style={{ color: "var(--color7)" }}
              >
                <span className="font-medium" style={{ color: "var(--color1)" }}>{commentCount}</span>{" "}
                {commentCount === 1 ? "Comment" : "Comments"}
              </button>
            )}
          </div>
        )}

        {/* Divider */}
        <hr style={{ borderColor: "var(--bg4)", marginLeft: 24, marginRight: 24 }} />

        {/* Action buttons – matching original: Emoji-Like, Comment, Share */}
        <div className="flex px-2 py-1">
          {/* Like / Reaction */}
          <button
            onClick={handleLike}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-[6px] text-sm font-medium hover:bg-gray-50 transition-colors"
            style={{ color: liked ? "var(--color5)" : "var(--color7)" }}
          >
            {liked ? (
              /* active: emoji smiley */
              <>
                <svg width="19" height="19" fill="none" viewBox="0 0 19 19">
                  <path fill="#FFCC4D" d="M9.5 19a9.5 9.5 0 100-19 9.5 9.5 0 000 19z" />
                  <path fill="#664500" d="M9.5 11.083c-1.912 0-3.181-.222-4.75-.527-.358-.07-1.056 0-1.056 1.055 0 2.111 2.425 4.75 5.806 4.75 3.38 0 5.805-2.639 5.805-4.75 0-1.055-.697-1.125-1.055-1.055-1.57.305-2.838.527-4.75.527z" />
                  <path fill="#fff" d="M4.75 11.611s1.583.528 4.75.528 4.75-.528 4.75-.528-1.056 2.111-4.75 2.111-4.75-2.11-4.75-2.11z" />
                  <path fill="#664500" d="M6.333 8.972c.729 0 1.32-.827 1.32-1.847s-.591-1.847-1.32-1.847c-.729 0-1.32.827-1.32 1.847s.591 1.847 1.32 1.847zM12.667 8.972c.729 0 1.32-.827 1.32-1.847s-.591-1.847-1.32-1.847c-.729 0-1.32.827-1.32 1.847s.591 1.847 1.32 1.847z" />
                </svg>
                Haha
              </>
            ) : (
              /* default: thumbs up / reaction */
              <>
                <svg width="19" height="19" fill="none" viewBox="0 0 19 19">
                  <circle cx="9.5" cy="9.5" r="9" stroke="var(--color7)" strokeWidth="1" />
                  <path stroke="var(--color7)" strokeLinecap="round" d="M6.5 11.5c0 0 1 1.5 3 1.5s3-1.5 3-1.5" />
                  <circle cx="7" cy="8" r="1" fill="var(--color7)" />
                  <circle cx="12" cy="8" r="1" fill="var(--color7)" />
                </svg>
                Like
              </>
            )}
          </button>

          {/* Comment */}
          <button
            onClick={() => setShowComments((v) => !v)}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-[6px] text-sm font-medium hover:bg-gray-50 transition-colors"
            style={{ color: showComments ? "var(--color5)" : "var(--color7)" }}
          >
            <svg width="21" height="21" fill="none" viewBox="0 0 21 21">
              <path stroke="currentColor" d="M1 10.5c0-.464 0-.696.009-.893A9 9 0 019.607 1.01C9.804 1 10.036 1 10.5 1v0c.464 0 .696 0 .893.009a9 9 0 018.598 8.598c.009.197.009.429.009.893v6.046c0 1.36 0 2.041-.317 2.535a2 2 0 01-.602.602c-.494.317-1.174.317-2.535.317H10.5c-.464 0-.696 0-.893-.009a9 9 0 01-8.598-8.598C1 11.196 1 10.964 1 10.5v0z" />
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M6.938 9.313h7.125M10.5 14.063h3.563" />
            </svg>
            Comment
          </button>

          {/* Share */}
          <button
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-[6px] text-sm font-medium hover:bg-gray-50 transition-colors"
            style={{ color: "var(--color7)" }}
          >
            <svg width="24" height="21" fill="none" viewBox="0 0 24 21">
              <path stroke="currentColor" strokeLinejoin="round" d="M23 10.5L12.917 1v5.429C3.267 6.429 1 13.258 1 20c2.785-3.52 5.248-5.429 11.917-5.429V20L23 10.5z" />
            </svg>
            Share
          </button>
        </div>

        {/* Comments section */}
        {showComments && (
          <div className="px-6 pb-5 pt-2 border-t" style={{ borderColor: "var(--bg4)" }}>
            <CommentSection postId={post.id} isVisible={showComments} />
          </div>
        )}
      </article>

      <LikersModal
        targetId={post.id}
        type={LikeTargetType.Post}
        isOpen={showLikers}
        onClose={() => setShowLikers(false)}
        title="People who reacted"
      />
    </>
  );
}
