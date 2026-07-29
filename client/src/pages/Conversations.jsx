import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";

const Conversations = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/auth"); return; }

    fetch("https://dersan-book-marketplace.onrender.com/api/conversations", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setConversations(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Header />
      <div className="pt-20 max-w-2xl mx-auto px-4 pb-16">
        <h1 className="text-2xl font-extrabold text-white my-6">Messages</h1>

        {loading && <p className="text-zinc-400">Loading...</p>}

        {!loading && conversations.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <p className="text-zinc-400">No conversations yet.</p>
            <button
              onClick={() => navigate("/explore")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors text-sm"
            >
              Browse Listings
            </button>
          </div>
        )}

        {!loading && conversations.length > 0 && (
          <div className="flex flex-col gap-2">
            {conversations.map((conv) => {
              const isSeller = conv.seller?._id === user.id ||
                               conv.seller === user.id;
              const otherPerson = isSeller ? conv.buyer : conv.seller;
              const unread = isSeller ? conv.unreadSeller : conv.unreadBuyer;
              const hasUnread = unread > 0;

              return (
                <button
                  key={conv._id}
                  onClick={() => navigate(`/conversations/${conv._id}`)}
                  className={`flex items-center gap-4 p-4 border rounded-xl transition-all text-left ${
                    hasUnread
                      ? "bg-zinc-800 border-blue-500/40 hover:border-blue-500"
                      : "bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800"
                  }`}
                >
                  {/* listing thumbnail */}
                  {conv.listing?.images?.[0] && (
                    <div className="relative shrink-0">
                      <img
                        src={conv.listing.images[0]}
                        alt={conv.listing.title}
                        className="w-14 h-14 rounded-xl object-cover"
                      />
                      {/* unread red dot on image */}
                      {hasUnread && (
                        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                          {unread > 9 ? "9+" : unread}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    {/* other person info */}
                    <div className="flex items-center gap-2 mb-0.5">
                      {otherPerson?.profilePicture ? (
                        <img
                          src={otherPerson.profilePicture}
                          className="w-4 h-4 rounded-full object-cover"
                          alt={otherPerson.name}
                        />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-white text-[8px] font-bold">
                          {otherPerson?.name?.charAt(0).toUpperCase() || "?"}
                        </div>
                      )}
                      <p className={`text-sm font-semibold truncate ${
                        hasUnread ? "text-white" : "text-zinc-300"
                      }`}>
                        {otherPerson?.name || "User"}
                      </p>
                    </div>

                    <p className="text-zinc-400 text-xs truncate">
                      {conv.listing?.title || "Listing"}
                    </p>

                    {/* last message preview */}
                    <p className={`text-xs mt-1 truncate ${
                      hasUnread ? "text-zinc-200 font-medium" : "text-zinc-500"
                    }`}>
                      {conv.lastMessage || "No messages yet"}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <p className="text-zinc-600 text-xs">
                      {conv.lastMessageAt
                        ? new Date(conv.lastMessageAt).toLocaleDateString()
                        : new Date(conv.createdAt).toLocaleDateString()}
                    </p>
                    {hasUnread && (
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Conversations;