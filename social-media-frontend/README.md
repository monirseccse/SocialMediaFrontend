# SocialFeed — Full-Stack Social Media Platform

A modern social media application with a .NET 8 backend API and a Next.js 15 frontend.

---

## Architecture

```
src/
├── SocialMedia/                  # .NET 8 backend (pre-existing)
│   ├── SocialMedia.Api           # ASP.NET Core Web API
│   ├── SocialMedia.Application   # Business logic & DTOs
│   ├── SocialMedia.Domain        # Domain entities & enums
│   └── SocialMedia.Infrastructure# EF Core, Auth, Cloudinary
└── social-media-frontend/        # Next.js 15 frontend
    └── src/
        ├── app/                  # Next.js App Router pages
        │   ├── (auth)/           # login & register (unguarded)
        │   └── (protected)/      # feed (JWT required)
        ├── components/           # React components
        │   ├── auth/             # LoginForm, RegisterForm
        │   ├── feed/             # PostCard, CreatePost, CommentSection, etc.
        │   ├── layout/           # Navbar
        │   └── ui/               # Avatar, Button, Input, Modal, Spinner
        ├── context/AuthContext   # Auth state (React Context)
        ├── lib/                  # api.ts, types.ts, utils.ts
        └── middleware.ts         # Edge route protection
```

### Backend Stack
- **Framework**: ASP.NET Core 8 Web API
- **Database**: PostgreSQL (with Read Replica)
- **Cache**: Redis (Upstash)
- **Auth**: JWT Bearer — 15-min access tokens + 7-day refresh tokens
- **Images**: Cloudinary (up to 10 MB — `.jpg`, `.png`, `.webp`)
- **ORM**: Entity Framework Core

### Frontend Stack
- **Framework**: Next.js 15 (App Router, TypeScript)
- **Styling**: Tailwind CSS 3
- **HTTP Client**: Axios with silent auto-refresh interceptor
- **Auth State**: React Context + localStorage + cookie flag
- **Route Guard**: Next.js Edge middleware (cookie-based)

---

## Features Implemented

### Authentication
- **Register** — first name, last name, email, password (min 8 chars, requires a letter + digit)
- **Login** — email + password; returns JWT pair with user's full name
- **Auto token refresh** — Axios interceptor silently refreshes on 401; queues concurrent requests and replays them after refresh
- **Logout** — atomically clears tokens from localStorage + cookie, redirects to `/login`
- **Route protection** — Next.js middleware redirects unauthenticated users away from `/feed`

### Feed
- **Infinite scroll** — `IntersectionObserver` triggers next page load when the bottom sentinel enters the viewport (rootMargin: 200px)
- **Cursor-based pagination** — uses ISO datetime cursors; no offset drift when new posts arrive
- **Newest first** — posts ordered by `createdAt DESC`
- **Loading skeletons** — animated placeholder cards while the first page loads
- **Deduplication** — prevents duplicate posts when cursor overlaps

### Posts
- **Create post** — textarea for content, photo picker with instant preview, Public / Private visibility toggle
- **Image upload** — sent as `multipart/form-data` to the API; hosted on Cloudinary
- **Visibility badges** — globe icon for Public, lock icon for Private
- **Like / Unlike** — optimistic toggle (UI updates instantly, reverts on failure)
- **Like count modal** — click the like count to see who liked the post, with paginated "Load more"
- **Comment section toggle** — click "Comment" to expand/collapse the comment area inline

### Comments & Replies
- **Add top-level comment** — inline input; submit with Enter or send button
- **Nested replies** — click "Reply" on any comment to open a reply input; replies are indented under their parent
- **Like comments/replies** — optimistic toggle per comment / reply
- **Comment likers modal** — click the like count on a comment to see who liked it
- **Cursor pagination** — "View more comments" loads the next cursor page

### Access Control
- **Private posts** — visible **only** to the post's author (enforced server-side; private posts from other users are filtered out before reaching the client)
- **Public posts** — visible to all authenticated users

---

## Getting Started

### Prerequisites
- Node.js 18+
- .NET 8 SDK

### 1 — Start the backend

```bash
cd src/SocialMedia
dotnet run --project SocialMedia.Api
# Listening on http://localhost:5033 and https://localhost:7091
```

Swagger UI is available at `http://localhost:5033/swagger`.

### 2 — Start the frontend

```bash
cd src/social-media-frontend
npm install        # first time only
npm run dev
# → http://localhost:3000
```

Open **http://localhost:3000** — you'll be redirected to `/login`.

> The API URL is configured via `.env.local`:
> ```
> NEXT_PUBLIC_API_URL=http://localhost:5033
> ```
> Update this value when deploying to production.

---

## API Reference (abridged)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/Auth/register` | Public | Create account |
| POST | `/api/Auth/login` | Public | Get JWT pair |
| POST | `/api/Auth/refresh` | Public | Refresh access token |
| GET | `/api/Feed` | Bearer | Paginated post feed |
| POST | `/api/Post` | Bearer | Create post (multipart) |
| POST | `/api/Feed/like` | Bearer | Toggle like on post or comment |
| POST | `/api/Feed/comment` | Bearer | Add comment or reply |
| GET | `/api/Feed/{postId}/comments` | Bearer | Paginated comments with nested replies |
| GET | `/api/Feed/{targetId}/likers` | Bearer | Who liked a post/comment |

Full Swagger spec available at `http://localhost:5033/swagger`.

---

## Key Design Decisions

### Cursor pagination at scale
Using an ISO datetime cursor instead of `OFFSET` means queries hit a `(createdAt, id)` index and remain O(log n) regardless of how many posts exist. No "page drift" when new content is inserted between pages.

### Optimistic UI for likes
The like state flips immediately on click. The API call runs in the background. If it fails (network error, server error), the state reverts. This keeps the UI responsive without sacrificing correctness.

### JWT token storage strategy
- **localStorage** — stores the actual tokens for persistence across refreshes
- **`sm_auth=1` cookie** (no token data, no expiry logic) — read by the Next.js edge middleware to gate `/feed` without needing localStorage access at the edge
- Both are cleared atomically on logout

### Silent token refresh
The Axios interceptor catches any 401, queues all in-flight requests, performs a single refresh call, then replays all queued requests with the new token. This prevents thundering-herd refresh calls when multiple requests expire simultaneously.

### CORS
`AllowFrontend` policy on the backend allows `http://localhost:3000` with credentials. Update `WithOrigins(...)` in `Program.cs` when deploying to production.

### Read replica + Redis
All feed/comment reads use a separate read-only `DbContext` pointing to the PostgreSQL replica. Hot data is cached in Redis via `ICacheService`, reducing replica load for repeated feed fetches.
