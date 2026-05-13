export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  fullName?: string;
}

export enum PostVisibility {
  Public = 0,
  Private = 1,
}

export enum LikeTargetType {
  Post = 0,
  Comment = 1,
}

export interface PostResponse {
  id: string;
  authorId: number;
  authorName: string;
  content: string;
  imageUrl: string | null;
  visibility: PostVisibility;
  likeCount: number;
  commentCount: number;
  isLikedByMe: boolean;
  createdAt: string;
}

export interface CommentResponse {
  id: string;
  parentCommentId: string | null;
  authorName: string;
  content: string;
  likeCount: number;
  replyCount: number;
  isLikedByMe: boolean;
  isReply: boolean;
  createdAt: string;
  replies: CommentResponse[];
}

export interface LikerResponse {
  userId: number;
  fullName: string;
  likedAt: string;
}

export interface CursorPagedResponse<T> {
  data: T[];
  nextCursor: string | null;
  hasNextPage: boolean;
}

export interface LikeRequest {
  targetId: string;
  type: LikeTargetType;
}

export interface CreateCommentRequest {
  postId: string;
  parentCommentId?: string | null;
  content: string;
}
