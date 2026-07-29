import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Heart, MessageCircle } from "lucide-react";
import Header from "./Header";
import Footer from "./Footer";

function Avatar({ user, size = "w-20 h-20" }) {
  return user?.profilePicture ? (
    <img
      src={user.profilePicture}
      className={`${size} rounded-full object-cover border-2 border-zinc-700`}
      alt={user.name}
    />
  ) : (
    <div
      className={`${size} rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold border-2 border-zinc-700`}
    >
      {user?.name?.charAt(0).toUpperCase() || "?"}
    </div>
  );
}

const PublicProfile = () => {
  const { userId } = useParams();
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [listings, setListings] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`https://dersan-book-marketplace.onrender.com/api/users/${userId}`).then((r) => r.json()),
      fetch(`https://dersan-book-marketplace.onrender.com/api/posts/user/${userId}`).then((r) => r.json()),
      fetch(`https://dersan-book-marketplace.onrender.com/api/listings/user/${userId}`).then((r) => r.json()),
    ])
      .then(([userData, postsData, listingsData]) => {
        setProfileUser(userData);
        setPosts(Array.isArray(postsData) ? postsData : []);
        setListings(Array.isArray(listingsData) ? listingsData : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="pt-24 pb-16 max-w-2xl mx-auto px-4">
          <p className="text-zinc-500">Loading profile…</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!profileUser || profileUser.error) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <div className="pt-24 pb-16 max-w-2xl mx-auto px-4 text-center">
          <p className="text-white text-xl font-bold">User not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="pt-24 pb-16 max-w-2xl mx-auto px-4">
        {/* profile header */}
        <div className="flex items-center gap-5 mb-6">
          <Avatar user={profileUser} />
          <div>
            <h1 className="text-2xl font-extrabold text-white">{profileUser.name}</h1>
            <p className="text-zinc-500 text-sm">
              Joined{" "}
              {new Date(profileUser.createdAt).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* tabs */}
        <div className="flex gap-1 border-b border-zinc-800 mb-4">
          {["posts", "listings"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px capitalize ${
                activeTab === tab
                  ? "border-sky-500 text-sky-400"
                  : "border-transparent text-zinc-400 hover:text-white"
              }`}
            >
              {tab === "posts" ? `Posts (${posts.length})` : `Listings (${listings.length})`}
            </button>
          ))}
        </div>

        {/* posts tab */}
        {activeTab === "posts" && (
          <div>
            {posts.length === 0 && (
              <p className="text-zinc-500 text-sm py-8 text-center">No posts yet.</p>
            )}
            <div className="flex flex-col">
              {posts.map((post) => (
                <div key={post._id} className="border-b border-zinc-800 py-4">
                  {post.content && (
                    <p className="text-zinc-100 text-sm whitespace-pre-wrap mb-2">
                      {post.content}
                    </p>
                  )}
                  {post.images?.length > 0 && (
                    <div className="grid grid-cols-2 gap-1 rounded-xl overflow-hidden mb-2">
                      {post.images.slice(0, 4).map((img, i) => (
                        <img key={i} src={img} className="w-full h-32 object-cover" alt="" />
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-zinc-500 text-xs">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5" /> {post.likes?.length || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5" /> {post.commentsCount || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* listings tab */}
        {activeTab === "listings" && (
          <div>
            {listings.length === 0 && (
              <p className="text-zinc-500 text-sm py-8 text-center">No listings yet.</p>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {listings.map((listing) => (
                <Link
                  key={listing._id}
                  to={`/listing/${listing._id}`}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors"
                >
                  <img
                    src={listing.images?.[0]}
                    className="w-full h-28 object-cover"
                    alt={listing.title}
                  />
                  <div className="p-2.5">
                    <p className="text-white text-xs font-medium truncate">{listing.title}</p>
                    <p className="text-sky-400 text-xs font-bold">
                      {Number(listing.price).toFixed(2)} ETB
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default PublicProfile;