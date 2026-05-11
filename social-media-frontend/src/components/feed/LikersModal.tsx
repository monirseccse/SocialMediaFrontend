"use client";

import { useEffect, useState, useCallback } from "react";
import { getLikers } from "@/lib/api";
import { LikerResponse, LikeTargetType } from "@/lib/types";
import { timeAgo } from "@/lib/utils";
import Modal from "@/components/ui/Modal";
import Avatar from "@/components/ui/Avatar";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";

interface LikersModalProps {
  targetId: string;
  type: LikeTargetType;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export default function LikersModal({
  targetId,
  type,
  isOpen,
  onClose,
  title = "Liked by",
}: LikersModalProps) {
  const [likers, setLikers] = useState<LikerResponse[]>([]);
  const [cursor, setCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchLikers = useCallback(
    async (reset = false) => {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      try {
        const res = await getLikers(targetId, type, reset ? undefined : cursor);
        if (reset) {
          setLikers(res.data);
        } else {
          setLikers((prev) => [...prev, ...res.data]);
        }
        setCursor(res.nextCursor ?? undefined);
        setHasMore(res.hasNextPage);
      } catch {
        // silently ignore
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [targetId, type, cursor]
  );

  useEffect(() => {
    if (isOpen) {
      setLikers([]);
      setCursor(undefined);
      setHasMore(false);
      fetchLikers(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, targetId, type]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner size="md" />
        </div>
      ) : likers.length === 0 ? (
        <p className="text-center text-gray-400 py-8 text-sm">No likes yet.</p>
      ) : (
        <div className="space-y-3">
          {likers.map((liker) => (
            <div key={liker.userId} className="flex items-center gap-3">
              <Avatar name={liker.fullName} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{liker.fullName}</p>
                <p className="text-xs text-gray-400">{timeAgo(liker.likedAt)}</p>
              </div>
            </div>
          ))}
          {hasMore && (
            <div className="pt-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                loading={loadingMore}
                onClick={() => fetchLikers(false)}
              >
                Load more
              </Button>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
