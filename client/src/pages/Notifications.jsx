import React, { useState, useEffect } from "react";
import { Heart, MessageCircle, BookOpen } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

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

const truncate = (text, max = 60) =>
  text && text.length > max ? `${text.slice(0, max)}...` : text;

function Avatar({ user }) {
  return user?.profilePicture ? (
    <img
      src={user.profilePicture}
      className="w-11 h-11 rounded-full object-cover shrink-0"
      alt={user.name}
    />
  ) : (
    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center text-white font-bold shrink-0">
      {user?.name?.charAt(0).toUpperCase() || "?"}
    </div>
  );
}

function NotificationRow({ notification, onClick }) {
  const { sender, type, commentText, post, listing, read, createdAt } = notification;

  let icon = <Heart className="w-3.5 h-3.5 text-white fill-white" />;
  let iconBg = "bg-pink-500";
  let text;

  if (type === "like") {
    text = (
      <>
        <span className="font-semibold text-white">{sender?.name}</span>{" "}
        <span className="text-zinc-400">liked your post</span>
      </>
    );
  } else if (type === "comment") {
    icon = <MessageCircle className="w-3.5 h-3.5 text-white fill-white" />;
    iconBg = "bg-sky-500";
    text = (
      <>
        <span className="font-semibold text-white">{sender?.name}</span>{" "}
        <span className="text-zinc-400">commented: </span>
        <span className="text-zinc-300">"{truncate(commentText)}"</span>
      </>
    );
  } else if (type === "interest") {
    icon = <BookOpen className="w-3.5 h-3.5 text-white" />;
    iconBg = "bg-emerald-500";
    text = (
      <>
        <span className="text-zinc-400">A new </span>
        <span className="font-semibold text-white">{listing?.category}</span>{" "}
        <span className="text-zinc-400">book was listed: </span>
        <span className="font-semibold text-white">{listing?.title}</span>
      </>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-zinc-800 hover:bg-white/[0.02] transition-colors ${
        !read ? "bg-sky-500/[0.04]" : ""
      }`}
    >
      <div className="relative shrink-0">
        <Avatar user={sender} />
        <div
          className={`absolute -bottom-1 -right-1 ${iconBg} rounded-full w-5 h-5 flex items-center justify-center border-2 border-black`}
        >
          {icon}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm leading-snug">{text}</p>
        <p className="text-zinc-600 text-xs mt-0.5">{timeAgo(createdAt)}</p>
      </div>

      {listing?.images?.[0] && (
        <img
          src={listing.images[0]}
          className="w-11 h-11 rounded-lg object-cover shrink-0"
          alt=""
        />
      )}

      {!read && <div className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />}
    </button>
  );
}

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    fetch("http://localhost:5000/api/notifications", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setNotifications(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // mark everything read once the page has been opened
    fetch("http://localhost:5000/api/notifications/read-all", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }, [token]);

  const handleRowClick = (notification) => {
    if (notification.type === "interest" && notification.listing) {
      navigate(`/listing/${notification.listing._id}`);
    } else if (notification.post) {
      navigate(`/community#${notification.post._id}`);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <div className="pt-24 pb-16 max-w-[600px] mx-auto border-x border-zinc-800 min-h-screen">
        <div className="px-4 py-3 border-b border-zinc-800">
          <h1 className="text-xl font-extrabold text-white">Notifications</h1>
        </div>

        {!token && (
          <div className="text-center py-20 px-6">
            <p className="text-white text-xl font-bold mb-2">Log in to see your notifications</p>
            <Link to="/auth" className="text-sky-400 hover:underline font-semibold text-sm">
              Log in
            </Link>
          </div>
        )}

        {token && loading && (
          <div>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="border-b border-zinc-800 px-4 py-4 flex gap-3 animate-pulse">
                <div className="w-11 h-11 rounded-full bg-zinc-800 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-2/3 bg-zinc-800 rounded" />
                  <div className="h-3 w-1/4 bg-zinc-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {token && !loading && notifications.length === 0 && (
          <div className="text-center py-20 px-6">
            <p className="text-white text-xl font-bold mb-2">No notifications yet</p>
            <p className="text-zinc-500 text-sm">
              Likes, comments, and books matching your interests will show up here.
            </p>
          </div>
        )}

        {token &&
          !loading &&
          notifications.map((n) => (
            <NotificationRow key={n._id} notification={n} onClick={() => handleRowClick(n)} />
          ))}
      </div>

      <Footer />
    </div>
  );
};

export default Notifications;