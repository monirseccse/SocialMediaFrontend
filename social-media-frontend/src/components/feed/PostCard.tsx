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
                    /* active thumbs up */
                    <span
                      className="w-[26px] h-[26px] rounded-full flex items-center justify-center border-2 border-white"
                      style={{ background: "var(--color5)" }}
                    >
                      <svg width="14" height="14" fill="white" viewBox="0 0 24 24">
                        <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
                      </svg>
                    </span>
                  ) : (
                    <span
                      className="w-[26px] h-[26px] rounded-full flex items-center justify-center border-2 border-white"
                      style={{ background: "var(--color5)" }}
                    >
                      <svg width="14" height="14" fill="white" viewBox="0 0 24 24">
                        <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
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
              /* active: filled thumbs up */
              <>
                <svg width="19" height="19" fill="none" viewBox="0 0 24 24">
                  <path fill="var(--color5)" d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
                </svg>
                Like
              </>
            ) : (
              /* default: outline thumbs up */
              <>
                <svg width="19" height="19" fill="none" viewBox="0 0 24 24">
                  <path stroke="var(--color7)" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
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
