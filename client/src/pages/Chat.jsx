import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Send, ArrowLeft, Heart, Reply, X } from "lucide-react";

const Chat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [pressTimer, setPressTimer] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const bottomRef = useRef(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) { navigate("/auth"); return; }

    fetch("http://localhost:5000/api/conversations", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const found = data.find((c) => c._id === id);
        setConversation(found || null);
      });

    fetch(`http://localhost:5000/api/conversations/${id}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setMessages(data);
        setLoading(false);
        if (data.length === 0) setText("Hi, is this still available?");

        // mark as read
        fetch(`http://localhost:5000/api/conversations/${id}/read`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        });
      })
      .catch(() => setLoading(false));
  }, [id]);

  // polling every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetch(`http://localhost:5000/api/conversations/${id}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setMessages(data))
        .catch(() => {});
    }, 3000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // close menu when clicking anywhere
  useEffect(() => {
    const close = () => setActiveMenu(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/conversations/${id}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
            replyTo: replyingTo?._id || null,
          }),
        }
      );
      const newMessage = await response.json();
      if (!response.ok) return;
      setMessages((prev) => [...prev, newMessage]);
      setText("");
      setReplyingTo(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleLike = async (msg) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/conversations/${id}/messages/${msg._id}/like`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (!response.ok) return;

      setMessages((prev) =>
        prev.map((m) => {
          if (m._id !== msg._id) return m;
          return {
            ...m,
            likes: data.liked
              ? [...(m.likes || []), user.id]
              : (m.likes || []).filter((lid) => lid !== user.id),
          };
        })
      );
    } catch (err) {
      console.error(err);
    }
    setActiveMenu(null);
  };

  // long press handlers
  const handlePressStart = (msg) => {
    const timer = setTimeout(() => {
      setActiveMenu(msg._id);
    }, 500); // 500ms long press
    setPressTimer(timer);
  };

  const handlePressEnd = () => {
    clearTimeout(pressTimer);
  };

  const isSeller = user.id === conversation?.seller?._id ||
                   user.id === conversation?.seller;
  const otherPerson = isSeller ? conversation?.buyer : conversation?.seller;
  const listing = conversation?.listing;

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-white">

      {/* top bar */}
      <div className="shrink-0">
        <div className="flex items-center gap-3 px-4 py-3 bg-zinc-900 border-b border-zinc-800">
          <button
            onClick={() => navigate("/conversations")}
            className="text-zinc-400 hover:text-white transition-colors mr-1"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 flex-1 min-w-0">
            {otherPerson?.profilePicture ? (
              <img
                src={otherPerson.profilePicture}
                className="w-9 h-9 rounded-full object-cover shrink-0"
                alt={otherPerson.name}
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                {otherPerson?.name?.charAt(0).toUpperCase() || "?"}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate">
                {otherPerson?.name || "User"}
              </p>
              <p className="text-zinc-400 text-xs truncate">
                {listing?.title || ""}
              </p>
            </div>
          </div>

          {listing?.images?.[0] && (
            <Link to={`/listing/${listing._id}`} className="shrink-0">
              <img
                src={listing.images[0]}
                className="w-10 h-10 rounded-lg object-cover border border-zinc-700 hover:border-blue-500 transition-colors"
                alt={listing.title}
              />
            </Link>
          )}
        </div>

        {listing && (
          <div className="px-4 py-2 bg-zinc-900/50 border-b border-zinc-800/50 flex items-center justify-between">
            <p className="text-zinc-400 text-xs truncate">{listing.title}</p>
            <p className="text-blue-400 text-xs font-bold shrink-0 ml-2">
              {listing.price ? `${Number(listing.price).toFixed(2)} ETB` : ""}
            </p>
          </div>
        )}
      </div>

      {/* messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {loading && (
          <p className="text-zinc-400 text-center text-sm">Loading...</p>
        )}

        {!loading && messages.length === 0 && (
          <p className="text-zinc-500 text-center text-sm mt-8">
            No messages yet. Say hello!
          </p>
        )}

        {messages.map((msg) => {
          const isMe = msg.sender === user.id || msg.sender?._id === user.id;
          const isLiked = (msg.likes || []).includes(user.id);
          const likeCount = msg.likes?.length || 0;
          const showMenu = activeMenu === msg._id;

          return (
            <div
              key={msg._id}
              className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
            >
              {/* reply preview */}
              {msg.replyTo && (
                <div className={`mb-1 px-3 py-1.5 rounded-xl border-l-2 border-blue-500 bg-zinc-800/60 max-w-[70%] ${
                  isMe ? "mr-2" : "ml-2"
                }`}>
                  <p className="text-zinc-400 text-xs line-clamp-1">
                    {msg.replyTo.text}
                  </p>
                </div>
              )}

              <div className="relative">
                {/* long press context menu */}
                {showMenu && (
                  <div className={`absolute bottom-full mb-1 flex gap-1 bg-zinc-800 border border-zinc-700 rounded-xl p-1 shadow-xl z-10 ${
                    isMe ? "right-0" : "left-0"
                  }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => {
                        setReplyingTo(msg);
                        setActiveMenu(null);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-zinc-700 rounded-lg text-zinc-300 text-xs transition-colors"
                    >
                      <Reply className="w-3.5 h-3.5" />
                      Reply
                    </button>
                    <button
                      onClick={() => handleLike(msg)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 hover:bg-zinc-700 rounded-lg text-xs transition-colors ${
                        isLiked ? "text-red-400" : "text-zinc-300"
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-red-400" : ""}`} />
                      {isLiked ? "Unlike" : "Like"}
                    </button>
                  </div>
                )}

                {/* message bubble */}
                <div
                  onMouseDown={() => handlePressStart(msg)}
                  onMouseUp={handlePressEnd}
                  onMouseLeave={handlePressEnd}
                  onTouchStart={() => handlePressStart(msg)}
                  onTouchEnd={handlePressEnd}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenu(showMenu ? null : msg._id);
                  }}
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm cursor-pointer select-none ${
                    isMe
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-zinc-800 text-zinc-100 rounded-bl-sm"
                  }`}
                >
                  <p>{msg.text}</p>
                  <p className={`text-xs mt-1 ${isMe ? "text-blue-200" : "text-zinc-500"}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {/* like count shown below message */}
                {likeCount > 0 && (
                  <div className={`flex items-center gap-0.5 mt-0.5 ${isMe ? "justify-end mr-1" : "ml-1"}`}>
                    <Heart className="w-3 h-3 fill-red-400 text-red-400" />
                    <span className="text-zinc-500 text-[10px]">{likeCount}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* reply preview bar */}
      {replyingTo && (
        <div className="shrink-0 px-4 py-2 bg-zinc-800 border-t border-zinc-700 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Reply className="w-4 h-4 text-blue-400 shrink-0" />
            <p className="text-zinc-300 text-xs truncate">{replyingTo.text}</p>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="text-zinc-500 hover:text-white transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* input */}
      <div className="shrink-0 px-4 py-3 bg-zinc-900 border-t border-zinc-800">
        <div className="flex items-end gap-3 max-w-3xl mx-auto">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-2xl px-4 py-2.5 outline-none focus:border-blue-500 transition-colors resize-none text-sm"
            style={{ maxHeight: "120px" }}
          />
          <button
            onClick={handleSend}
            disabled={sending || !text.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-full p-2.5 transition-colors shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-zinc-600 text-xs text-center mt-2 hidden sm:block">
          Press Enter to send · Shift+Enter for new line · Click message for options
        </p>
      </div>
    </div>
  );
};

export default Chat;