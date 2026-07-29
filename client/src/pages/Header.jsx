import React, { useState, useEffect } from "react";
import { MessagesSquare, Bell, Menu, X, LogOut } from "lucide-react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import logo from "../assets/LOGO.png";
import toast from "react-hot-toast";

function ConversationBadge() {
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (!token) return;

    const fetchUnread = () => {
      fetch("https://dersan-book-marketplace.onrender.com/api/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (!Array.isArray(data)) return;
          // count total unread across all conversations
          const total = data.reduce((sum, conv) => {
            const isSeller =
              conv.seller?._id === user.id || conv.seller === user.id;
            const unread = isSeller ? conv.unreadSeller : conv.unreadBuyer;
            return sum + (unread || 0);
          }, 0);
          setUnreadCount(total);
        })
        .catch(() => {});
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, [token]);

  return (
    <button
      onClick={() => navigate("/conversations")}
      className="relative p-2 hover:text-white transition-colors"
    >
      <MessagesSquare className="w-5 h-5 md:w-6 md:h-6" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
}

function NotificationBadge() {
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    const fetchUnread = () => {
      fetch("https://dersan-book-marketplace.onrender.com/api/notifications/unread-count", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setUnreadCount(data.count || 0))
        .catch(() => {});
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, [token]);

  return (
    <button
      onClick={() => navigate("/notifications")}
      className="relative p-2 hover:text-white transition-colors"
    >
      <Bell className="w-5 h-5 md:w-6 md:h-6" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
}

function Header() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // when header loads, check if someone is logged in
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleLogout = () => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="font-medium text-zinc-900">
            Are you sure you want to log out?
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                setUser(null);
                toast.dismiss(t.id); // close the toast
                navigate("/");
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              Yes, log out
            </button>
            <button
              onClick={() => toast.dismiss(t.id)} // user cancelled — just close it
              className="bg-zinc-200 hover:bg-zinc-300 text-zinc-800 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
      },
    );
  };

  return (
    <header className="absolute top-0 left-0 z-50 w-full px-4 py-5 bg-zinc-950/60 backdrop-blur-md md:px-10 text-zinc-200 border-b border-zinc-800">
      <div className="flex items-center justify-between">
        <div
          className="flex items-center gap-2 md:gap-3 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img
            className="h-10 w-10 md:h-9 md:w-9 object-contain"
            src={logo}
            alt="LOGO"
          />
          <h2 className="text-base md:text-2xl font-bold text-white">
            Dersan Book Marketplace
          </h2>
        </div>

        {/* desktop nav */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-10 text-sm font-medium tracking-wide">
          <Link
            to="/"
            className={
              location.pathname === "/"
                ? "text-blue-400 border-b-2 border-blue-400 pb-1"
                : "hover:text-white transition-colors"
            }
          >
            HOME
          </Link>
          <Link
            to="/explore"
            className={
              location.pathname === "/explore"
                ? "text-blue-400 border-b-2 border-blue-400 pb-1"
                : "hover:text-white transition-colors"
            }
          >
            EXPLORE
          </Link>
          <a className="hover:text-white transition-colors" href="/community">
            COMMUNITY
          </a>
          <a className="hover:text-white transition-colors" href="/sell">
            SELL YOUR BOOK
          </a>

          {/* notifications icon */}
          {user && <NotificationBadge />}

          {/* messages icon */}
          <ConversationBadge />

          {/* logged in — show avatar */}
          {user ? (
            <div className="flex items-center gap-3">
              {/* avatar circle — click goes to profile */}
              <div
                onClick={() => navigate("/profile")}
                className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold cursor-pointer hover:bg-blue-500 transition-colors"
                title={user.name}
              >
                {user.name?.charAt(0).toUpperCase() || "?"}
              </div>
              {/* logout button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-zinc-400 hover:text-red-400 transition-colors text-sm"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            // logged out — show sign in button
            <button
              onClick={() => navigate("/auth")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
            >
              Sign In
            </button>
          )}
        </nav>

        {/* mobile: notifications + avatar/sign in + hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          {user && <NotificationBadge />}
          {user ? (
            <div
              onClick={() => navigate("/profile")}
              className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold cursor-pointer"
            >
              {user.name?.charAt(0).toUpperCase() || "?"}
            </div>
          ) : (
            <button
              onClick={() => navigate("/auth")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            >
              Sign In
            </button>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:text-white transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* mobile dropdown */}
      {isOpen && (
        <nav className="md:hidden mt-4 pb-4 border-t border-zinc-800 flex flex-col gap-4 pt-4 text-sm font-medium">
          <a
            href="/"
            onClick={() => setIsOpen(false)}
            className="text-blue-400"
          >
            HOME
          </a>
          <a
            href="/explore"
            onClick={() => setIsOpen(false)}
            className="hover:text-white transition-colors"
          >
            EXPLORE
          </a>
          <a
            href="/community"
            onClick={() => setIsOpen(false)}
            className="hover:text-white transition-colors"
          >
            COMMUNITY
          </a>
          <a
            href="/sell"
            onClick={() => setIsOpen(false)}
            className="hover:text-white transition-colors"
          >
            SELL YOUR BOOK
          </a>
          {user && (
            <a
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="hover:text-white transition-colors"
            >
              NOTIFICATIONS
            </a>
          )}
          {user && (
            <button
              onClick={handleLogout}
              className="text-left text-red-400 hover:text-red-300 transition-colors"
            >
              Logout
            </button>
          )}
        </nav>
      )}
    </header>
  );
}

export default Header;
