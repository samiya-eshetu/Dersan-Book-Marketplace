import React, { useState, useEffect, useRef } from "react";
import { ImagePlus, Heart, MessageCircle, Trash2, X, Share, ArrowLeft, ChevronLeft, ChevronRight, MoreHorizontal, Flag, Link2 } from "lucide-react";
import Header from "./Header";
import Footer from "./Footer";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

// ── helpers ───────────────────────────────────────────────────
const timeAgo = (dateStr) => {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "now";
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const days = Math.floor(hr / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// turns "#hashtags" blue inline, leaves everything else as plain text
function renderContent(text) {
  const parts = text.split(/(#[a-zA-Z0-9_]+)/g);
  return parts.map((part, i) =>
    part.startsWith("#") ? (
      <span key={i} className="text-sky-400 hover:underline cursor-pointer">
        {part}
      </span>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
}

function Avatar({ user, size = "w-10 h-10" }) {
  return user?.profilePicture ? (
    <img
      src={user.profilePicture}
      className={`${size} rounded-full object-cover shrink-0`}
      alt={user.name}
    />
  ) : (
    <div
      className={`${size} rounded-full bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center text-white font-bold shrink-0`}
    >
      {user?.name?.charAt(0).toUpperCase() || "?"}
    </div>
  );
}

// ── single post ───────────────────────────────────────────────
function PostCard({ post, currentUser, onDelete, onLike }) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const token = localStorage.getItem("token");

  const reportReasons = [
    { value: "spam", label: "Spam" },
    { value: "harassment", label: "Harassment or bullying" },
    { value: "inappropriate", label: "Inappropriate content" },
    { value: "misinformation", label: "False information" },
    { value: "other", label: "Other" },
  ];

  const handleReport = async (reason) => {
    if (!token) {
      toast.error("Please log in to report a post");
      return;
    }
    try {
      const response = await fetch("http://localhost:5000/api/reports", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId: post._id, reason }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "Failed to report post");
        return;
      }
      toast.success("Thanks — we'll take a look");
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setReportOpen(false);
      setMenuOpen(false);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/community#${post._id}`;
    navigator.clipboard?.writeText(url);
    toast.success("Link copied");
    setMenuOpen(false);
  };

  const isLiked = post.likes?.includes(currentUser?.id);
  const isOwner =
    post.author?._id === currentUser?.id || post.author?._id === currentUser?._id;

  const fetchComments = () => {
    setLoadingComments(true);
    fetch(`http://localhost:5000/api/posts/${post._id}/comments`)
      .then((res) => res.json())
      .then((data) => {
        setComments(data);
        setLoadingComments(false);
      })
      .catch(() => setLoadingComments(false));
  };

  const handleToggleComments = () => {
    if (!showComments) fetchComments();
    setShowComments(!showComments);
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    if (!token) {
      toast.error("Please log in to comment");
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:5000/api/posts/${post._id}/comments`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: commentText }),
        }
      );
      const newComment = await response.json();
      if (!response.ok) {
        toast.error(newComment.error);
        return;
      }
      setComments((prev) => [...prev, newComment]);
      setCommentText("");
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/community#${post._id}`;
    navigator.clipboard?.writeText(url);
    toast.success("Link copied");
  };

  const imgCount = post.images?.length || 0;
  const imgGridClass =
    imgCount === 1
      ? "grid-cols-1"
      : imgCount === 3
      ? "grid-cols-2 [&>*:first-child]:row-span-2"
      : "grid-cols-2";

  return (
    <article className="border-b border-zinc-800 px-4 py-3 hover:bg-white/[0.02] transition-colors">
      <div className="flex gap-3">
        <Link to={`/profile/${post.author?._id}`} className="shrink-0">
          <Avatar user={post.author} />
        </Link>

        <div className="min-w-0 flex-1">
          {/* header row */}
          <div className="flex items-center justify-between">
            <Link
              to={`/profile/${post.author?._id}`}
              className="flex items-center gap-1.5 min-w-0 text-[15px] hover:underline decoration-zinc-600"
            >
              <span className="font-bold text-white truncate">{post.author?.name}</span>
              <span className="text-zinc-600 no-underline">·</span>
              <span className="text-zinc-500 shrink-0 no-underline">{timeAgo(post.createdAt)}</span>
            </Link>

            <div className="flex items-center gap-0.5 shrink-0 relative">
              {isOwner && (
                <button
                  onClick={() => onDelete(post._id)}
                  className="text-zinc-600 hover:text-red-400 hover:bg-red-400/10 rounded-full p-1.5 transition-colors"
                  aria-label="Delete post"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="text-zinc-600 hover:text-white hover:bg-white/10 rounded-full p-1.5 transition-colors"
                aria-label="More options"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => { setMenuOpen(false); setReportOpen(false); }} />
                  <div className="absolute right-0 top-8 z-30 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl w-48 py-1 overflow-hidden">
                    {!reportOpen ? (
                      <>
                        <button
                          onClick={handleCopyLink}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800 transition-colors text-left"
                        >
                          <Link2 className="w-4 h-4" /> Copy link
                        </button>
                        {!isOwner && (
                          <button
                            onClick={() => setReportOpen(true)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-zinc-800 transition-colors text-left"
                          >
                            <Flag className="w-4 h-4" /> Report post
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="px-3 pt-1.5 pb-1 text-[11px] uppercase tracking-wide text-zinc-500 font-semibold">
                          Why are you reporting this?
                        </p>
                        {reportReasons.map((r) => (
                          <button
                            key={r.value}
                            onClick={() => handleReport(r.value)}
                            className="w-full px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800 transition-colors text-left"
                          >
                            {r.label}
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* content */}
          {post.content && (
            <p className="text-[15px] text-zinc-100 leading-normal whitespace-pre-wrap mt-0.5">
              {renderContent(post.content)}
            </p>
          )}

          {/* images */}
          {imgCount > 0 && (
            <div
              className={`grid gap-0.5 mt-3 rounded-2xl overflow-hidden border border-zinc-800 ${imgGridClass}`}
            >
              {post.images.slice(0, 4).map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setLightboxIndex(i)}
                  className="relative bg-zinc-900 cursor-zoom-in"
                >
                  <img
                    src={img}
                    className={`w-full h-full object-cover ${
                      imgCount === 1 ? "max-h-[420px]" : "h-48"
                    }`}
                    alt=""
                  />
                  {i === 3 && imgCount > 4 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <p className="text-white font-bold text-xl">+{imgCount - 4}</p>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {lightboxIndex !== null && (
            <div
              className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
              onClick={() => setLightboxIndex(null)}
            >
              <button
                onClick={() => setLightboxIndex(null)}
                className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>

              {post.images.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((i) => (i - 1 + post.images.length) % post.images.length);
                  }}
                  className="absolute left-4 text-white/80 hover:text-white p-2"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
              )}

              <img
                src={post.images[lightboxIndex]}
                onClick={(e) => e.stopPropagation()}
                className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
                alt=""
              />

              {post.images.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((i) => (i + 1) % post.images.length);
                  }}
                  className="absolute right-4 text-white/80 hover:text-white p-2"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              )}
            </div>
          )}

          {/* linked listing — quote-card style */}
          {post.listing && (
            <Link
              to={`/listing/${post.listing._id}`}
              className="mt-3 flex items-center gap-3 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 rounded-2xl p-3 transition-colors"
            >
              {post.listing.images?.[0] && (
                <img
                  src={post.listing.images[0]}
                  className="w-12 h-12 rounded-lg object-cover shrink-0"
                  alt={post.listing.title}
                />
              )}
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {post.listing.title}
                </p>
                <p className="text-sky-400 text-xs font-bold">
                  {post.listing.price ? `${Number(post.listing.price).toFixed(2)} ETB` : ""}
                </p>
              </div>
            </Link>
          )}

          {/* actions */}
          <div className="flex items-center gap-1 -ml-2 mt-2 max-w-xs">
            <button
              onClick={handleToggleComments}
              className="group flex items-center gap-1.5 text-zinc-500 hover:text-sky-400 transition-colors"
            >
              <span className="p-2 rounded-full group-hover:bg-sky-400/10 transition-colors">
                <MessageCircle className="w-[18px] h-[18px]" />
              </span>
              <span className="text-xs">{post.commentsCount || 0}</span>
            </button>

            <button
              onClick={() => onLike(post._id)}
              className={`group flex items-center gap-1.5 transition-colors ${
                isLiked ? "text-pink-500" : "text-zinc-500 hover:text-pink-500"
              }`}
            >
              <span className="p-2 rounded-full group-hover:bg-pink-500/10 transition-colors">
                <Heart className={`w-[18px] h-[18px] ${isLiked ? "fill-pink-500" : ""}`} />
              </span>
              <span className="text-xs">{post.likes?.length || 0}</span>
            </button>

            <button
              onClick={handleShare}
              className="group flex items-center gap-1.5 text-zinc-500 hover:text-emerald-400 transition-colors"
            >
              <span className="p-2 rounded-full group-hover:bg-emerald-400/10 transition-colors">
                <Share className="w-[16px] h-[16px]" />
              </span>
            </button>
          </div>

          {/* comments */}
          {showComments && (
            <div className="mt-2 pt-3 border-t border-zinc-800/80 flex flex-col gap-3">
              {loadingComments && (
                <p className="text-zinc-500 text-xs">Loading replies…</p>
              )}
              {!loadingComments && comments.length === 0 && (
                <p className="text-zinc-600 text-xs">No replies yet.</p>
              )}

              {comments.map((comment) => (
                <div key={comment._id} className="flex gap-2">
                  <Avatar user={comment.author} size="w-7 h-7" />
                  <div className="min-w-0">
                    <p className="text-xs">
                      <span className="text-white font-semibold">
                        {comment.author?.name}
                      </span>
                    </p>
                    <p className="text-zinc-300 text-xs mt-0.5">{comment.content}</p>
                  </div>
                </div>
              ))}

              {currentUser?.id && (
                <div className="flex gap-2 items-center mt-1">
                  <Avatar user={currentUser} size="w-7 h-7" />
                  <input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleComment()}
                    placeholder="Post your reply"
                    className="flex-1 bg-transparent border-b border-zinc-800 text-white placeholder-zinc-500 outline-none focus:border-sky-500 transition-colors text-sm py-1"
                  />
                  <button
                    onClick={handleComment}
                    disabled={!commentText.trim()}
                    className="text-sky-400 disabled:text-zinc-700 font-bold text-xs px-3 py-1.5 rounded-full hover:bg-sky-400/10 disabled:hover:bg-transparent transition-colors"
                  >
                    Reply
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

// ── composer ──────────────────────────────────────────────────
const MAX_LEN = 500;

function CreatePost({ currentUser, onPostCreated }) {
  const [content, setContent] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const token = localStorage.getItem("token");

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (selectedImages.length + files.length > 4) {
      toast.error("Maximum 4 images per post");
      return;
    }
    const previews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setSelectedImages((prev) => [...prev, ...previews]);
  };

  const handleSubmit = async () => {
    if (!content.trim() && selectedImages.length === 0) {
      toast.error("Write something or add an image");
      return;
    }
    if (!token) {
      toast.error("Please log in to post");
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append("content", content);
      selectedImages.forEach((img) => data.append("images", img.file));

      const response = await fetch("http://localhost:5000/api/posts", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });
      const newPost = await response.json();
      if (!response.ok) {
        toast.error(newPost.error);
        return;
      }

      onPostCreated(newPost);
      setContent("");
      setSelectedImages([]);
      toast.success("Posted!");
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser?.id) {
    return (
      <div className="border-b border-zinc-800 px-4 py-6 text-center">
        <p className="text-zinc-400 text-sm">
          <a href="/auth" className="text-sky-400 hover:underline font-semibold">
            Log in
          </a>{" "}
          to share what you're reading
        </p>
      </div>
    );
  }

  const pct = Math.min(content.length / MAX_LEN, 1);
  const circumference = 2 * Math.PI * 9;
  const nearLimit = content.length > MAX_LEN - 20;
  const overLimit = content.length > MAX_LEN;

  return (
    <div className="border-b border-zinc-800 px-4 py-3">
      <div className="flex gap-3">
        <Avatar user={currentUser} />

        <div className="flex-1 min-w-0">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What are you reading?"
            rows={2}
            className="w-full bg-transparent text-white placeholder-zinc-600 outline-none resize-none text-lg leading-snug"
          />

          {selectedImages.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mt-2">
              {selectedImages.map((img, i) => (
                <div key={i} className="relative aspect-square">
                  <img
                    src={img.preview}
                    className="w-full h-full object-cover rounded-xl"
                    alt=""
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedImages(selectedImages.filter((_, idx) => idx !== i))
                    }
                    className="absolute top-1 right-1 bg-black/70 text-white rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-800">
            <div className="flex items-center gap-1">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                multiple
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="text-sky-400 hover:bg-sky-400/10 rounded-full p-2 transition-colors"
                aria-label="Add images"
              >
                <ImagePlus className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              {content.length > 0 && (
                <svg width="22" height="22" viewBox="0 0 22 22">
                  <circle
                    cx="11"
                    cy="11"
                    r="9"
                    fill="none"
                    stroke="#3f3f46"
                    strokeWidth="2"
                  />
                  <circle
                    cx="11"
                    cy="11"
                    r="9"
                    fill="none"
                    stroke={overLimit ? "#f43f5e" : nearLimit ? "#eab308" : "#0ea5e9"}
                    strokeWidth="2"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - pct)}
                    strokeLinecap="round"
                    transform="rotate(-90 11 11)"
                  />
                </svg>
              )}

              <button
                onClick={handleSubmit}
                disabled={
                  loading ||
                  overLimit ||
                  (!content.trim() && selectedImages.length === 0)
                }
                className="bg-sky-500 hover:bg-sky-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold px-5 py-1.5 rounded-full transition-colors"
              >
                {loading ? "Posting…" : "Post"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── main page ─────────────────────────────────────────────────
const Community = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://localhost:5000/api/posts")
      .then((res) => res.json())
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleDelete = async (postId) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="font-medium text-zinc-900">Delete this post?</p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await fetch(`http://localhost:5000/api/posts/${postId}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  setPosts((prev) => prev.filter((p) => p._id !== postId));
                  toast.success("Post deleted");
                } catch (err) {
                  toast.error("Something went wrong");
                }
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium"
            >
              Delete
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="bg-zinc-200 hover:bg-zinc-300 text-zinc-800 px-4 py-1.5 rounded-lg text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  const handleLike = async (postId) => {
    if (!token) {
      toast.error("Please log in to like posts");
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:5000/api/posts/${postId}/like`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (!response.ok) return;

      setPosts((prev) =>
        prev.map((p) => {
          if (p._id !== postId) return p;
          return {
            ...p,
            likes: data.liked
              ? [...(p.likes || []), currentUser.id]
              : (p.likes || []).filter((id) => id !== currentUser.id),
          };
        })
      );
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="pt-24 pb-16 max-w-[600px] mx-auto border-x border-zinc-800 min-h-screen">
        <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-4">
          <Link to="/" className="text-zinc-400 hover:text-white transition-colors md:hidden">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-extrabold text-white">Community</h1>
        </div>

        <CreatePost currentUser={currentUser} onPostCreated={handlePostCreated} />

        <div>
          {loading &&
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border-b border-zinc-800 px-4 py-4 flex gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-zinc-800 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/3 bg-zinc-800 rounded" />
                  <div className="h-3 w-2/3 bg-zinc-800 rounded" />
                </div>
              </div>
            ))}

          {!loading && posts.length === 0 && (
            <div className="text-center py-20 px-6">
              <p className="text-white text-xl font-bold mb-2">
                No posts yet
              </p>
              <p className="text-zinc-500 text-sm">
                Be the first to talk about a book — try tagging it with a hashtag.
              </p>
            </div>
          )}

          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              currentUser={currentUser}
              onDelete={handleDelete}
              onLike={handleLike}
            />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Community;