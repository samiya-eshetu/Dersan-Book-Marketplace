import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  Trash2,
  CheckCircle,
  XCircle,
  Edit2,
  Package,
  Save,
  Heart,
  MessageCircle,
} from "lucide-react";
import Header from "./Header";
import Footer from "./Footer";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const ProfileSettings = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState("listings");
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingListing, setEditingListing] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/auth");
      return;
    }
    const parsed = JSON.parse(storedUser);
    if (!parsed?.id || !parsed?.name) {
      // stored session is incomplete/corrupted — force a clean re-login
      // instead of rendering a broken page
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      navigate("/auth");
      return;
    }
    setUser(parsed);
    setNewName(parsed.name);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("https://dersan-book-marketplace.onrender.com/api/listings/my-listings", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setListings(Array.isArray(data) ? data : []);
        setLoadingListings(false);
      })
      .catch((err) => {
        console.error(err);
        setLoadingListings(false);
      });
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;
    const parsed = JSON.parse(storedUser);
    fetch(`https://dersan-book-marketplace.onrender.com/api/posts/user/${parsed.id}`)
      .then((res) => res.json())
      .then((data) => {
        setPosts(Array.isArray(data) ? data : []);
        setLoadingPosts(false);
      })
      .catch((err) => {
        console.error(err);
        setLoadingPosts(false);
      });
  }, []);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingPhoto(true);
    const token = localStorage.getItem("token");
    const data = new FormData();
    data.append("profilePicture", file);
    try {
      const response = await fetch(
        "https://dersan-book-marketplace.onrender.com/api/users/update-profile",
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
          body: data,
        },
      );
      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error || "Failed to upload photo");
        return;
      }
      const updatedUser = { ...user, profilePicture: result.profilePicture };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      toast.success("Profile picture updated!");
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleNameUpdate = async () => {
    if (!newName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        "https://dersan-book-marketplace.onrender.com/api/users/update-profile",
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: newName }),
        },
      );
      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error || "Failed to update name");
        return;
      }
      if (!result.name) {
        toast.error("Unexpected response — name not updated");
        return;
      }
      const updatedUser = { ...user, name: result.name };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setEditingName(false);
      toast.success("Name updated!");
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  const handlePasswordChange = async () => {
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    setChangingPassword(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        "https://dersan-book-marketplace.onrender.com/api/users/change-password",
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword,
          }),
        },
      );
      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error || "Failed to change password");
        return;
      }
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast.success("Password changed successfully!");
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = () => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="font-medium text-zinc-900">
            Are you sure? This cannot be undone.
          </p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                const token = localStorage.getItem("token");
                try {
                  const response = await fetch(
                    "https://dersan-book-marketplace.onrender.com/api/users/delete-account",
                    {
                      method: "DELETE",
                      headers: { Authorization: `Bearer ${token}` },
                    },
                  );
                  if (!response.ok) {
                    toast.error("Failed to delete account");
                    return;
                  }
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  toast.success("Account deleted");
                  navigate("/");
                } catch (err) {
                  toast.error("Something went wrong");
                }
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              Yes, delete my account
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="bg-zinc-200 hover:bg-zinc-300 text-zinc-800 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: Infinity },
    );
  };

  const handleDelete = async (listingId) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="font-medium text-zinc-900">Delete this listing?</p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                const token = localStorage.getItem("token");
                try {
                  const response = await fetch(
                    `https://dersan-book-marketplace.onrender.com/api/listings/${listingId}`,
                    {
                      method: "DELETE",
                      headers: { Authorization: `Bearer ${token}` },
                    },
                  );
                  if (!response.ok) {
                    toast.error("Failed to delete listing");
                    return;
                  }
                  setListings(listings.filter((l) => l._id !== listingId));
                  toast.success("Listing deleted");
                } catch (err) {
                  toast.error("Something went wrong");
                }
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              Yes, delete
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="bg-zinc-200 hover:bg-zinc-300 text-zinc-800 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: Infinity },
    );
  };

  // toggle between available and sold
  const handleToggleStatus = async (listing) => {
    const newStatus = listing.status === "sold" ? "available" : "sold";
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `https://dersan-book-marketplace.onrender.com/api/listings/${listing._id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );
      if (!response.ok) {
        toast.error("Failed to update listing");
        return;
      }
      setListings(
        listings.map((l) =>
          l._id === listing._id ? { ...l, status: newStatus } : l,
        ),
      );
      toast.success(
        newStatus === "sold" ? "Marked as sold!" : "Marked as available!",
      );
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  // open edit form for a listing
  const handleEditOpen = (listing) => {
    setEditingListing(listing._id);
    setEditForm({
      title: listing.title || "",
      author: listing.author || "",
      description: listing.description || "",
      price: listing.price || "",
      condition: listing.condition || "",
      category: listing.category || "",
      location: listing.location || "",
    });
  };

  // save listing edits
  const handleEditSave = async (listingId) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `https://dersan-book-marketplace.onrender.com/api/listings/${listingId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editForm),
        },
      );
      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error || "Failed to update listing");
        return;
      }
      setListings(listings.map((l) => (l._id === listingId ? result : l)));
      setEditingListing(null);
      toast.success("Listing updated!");
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Header />
      <div className="pt-24 px-4 md:px-16 pb-16 max-w-5xl mx-auto">
        {/* profile header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-10">
          <div className="relative">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              accept="image/*"
              className="hidden"
            />
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover border-2 border-zinc-700"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold border-2 border-zinc-700">
                {user.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current.click()}
              disabled={uploadingPhoto}
              className="absolute bottom-0 right-0 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 rounded-full p-1.5 transition-colors"
            >
              <Camera className="w-4 h-4 text-zinc-300" />
            </button>
          </div>

          <div className="flex flex-col gap-2 text-center sm:text-left">
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="bg-zinc-900 border border-zinc-700 text-white rounded-lg px-3 py-1.5 outline-none focus:border-blue-500 text-lg font-bold"
                />
                <button
                  onClick={handleNameUpdate}
                  className="text-green-400 hover:text-green-300"
                >
                  <CheckCircle className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setEditingName(false)}
                  className="text-red-400 hover:text-red-300"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-white">
                  {user.name}
                </h1>
                <button
                  onClick={() => setEditingName(true)}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            )}
            <p className="text-zinc-400 text-sm">{user.email}</p>
            <Link
              to="/sell"
              className="mt-2 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors w-fit mx-auto sm:mx-0"
            >
              <Package className="w-4 h-4" />
              Post a New Listing
            </Link>
          </div>
        </div>

        {/* tabs */}
        <div className="flex gap-1 border-b border-zinc-800 mb-8">
          {["listings", "posts", "settings"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px capitalize ${
                activeTab === tab
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-zinc-400 hover:text-white"
              }`}
            >
              {tab === "listings"
                ? `My Listings (${listings.length})`
                : tab === "posts"
                ? `My Posts (${posts.length})`
                : "Settings"}
            </button>
          ))}
        </div>

        {/* listings tab */}
        {activeTab === "listings" && (
          <div>
            {loadingListings && (
              <p className="text-zinc-400">Loading your listings...</p>
            )}

            {!loadingListings && listings.length === 0 && (
              <div className="flex flex-col items-center justify-center h-48 gap-4">
                <p className="text-zinc-400">
                  You haven't posted any listings yet.
                </p>
                <Link
                  to="/sell"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors"
                >
                  Post Your First Listing
                </Link>
              </div>
            )}

            {!loadingListings && listings.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {listings.map((listing) => (
                  <div
                    key={listing._id}
                    className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden"
                  >
                    {/* image */}
                    <div className="relative">
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="w-full h-40 object-cover"
                      />
                      <span
                        className={`absolute top-2 left-2 text-xs px-2 py-1 rounded-full font-medium ${
                          listing.status === "sold"
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : listing.status === "pending"
                              ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                              : "bg-green-500/20 text-green-400 border border-green-500/30"
                        }`}
                      >
                        {listing.status}
                      </span>
                    </div>

                    {/* edit form — shows inline when editing */}
                    {editingListing === listing._id ? (
                      <div className="p-4 flex flex-col gap-2">
                        <input
                          value={editForm.title}
                          onChange={(e) =>
                            setEditForm({ ...editForm, title: e.target.value })
                          }
                          placeholder="Title"
                          className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                        />
                        <input
                          value={editForm.author}
                          onChange={(e) =>
                            setEditForm({ ...editForm, author: e.target.value })
                          }
                          placeholder="Author"
                          className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                        />
                        <textarea
                          value={editForm.description}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              description: e.target.value,
                            })
                          }
                          placeholder="Description"
                          rows={3}
                          className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-blue-500 resize-none"
                        />
                        <input
                          value={editForm.price}
                          onChange={(e) =>
                            setEditForm({ ...editForm, price: e.target.value })
                          }
                          placeholder="Price (ETB)"
                          type="number"
                          className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                        />
                        <input
                          value={editForm.location}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              location: e.target.value,
                            })
                          }
                          placeholder="Location"
                          className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                        />
                        <div className="flex gap-2 mt-1">
                          <button
                            onClick={() => handleEditSave(listing._id)}
                            className="flex-1 flex items-center justify-center gap-1 text-xs py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                          >
                            <Save className="w-3 h-3" /> Save
                          </button>
                          <button
                            onClick={() => setEditingListing(null)}
                            className="flex-1 text-xs py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4">
                        <h3 className="font-bold text-white text-sm mb-1 line-clamp-1">
                          {listing.title}
                        </h3>
                        <p className="text-blue-400 font-bold text-sm mb-3">
                          {Number(listing.price).toFixed(2)} ETB
                        </p>

                        <div className="flex gap-2 flex-wrap">
                          <Link
                            to={`/listing/${listing._id}`}
                            className="flex-1 flex items-center justify-center text-center text-xs py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                          >
                            View
                          </Link>

                          <button
                            onClick={() => handleEditOpen(listing)}
                            className="flex-1 text-xs py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleStatus(listing)}
                            className={`flex-1 text-xs py-1.5 rounded-lg border transition-colors ${
                              listing.status === "sold"
                                ? "bg-green-500/10 hover:bg-green-500/20 text-green-400 border-green-500/20"
                                : "bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border-yellow-500/20"
                            }`}
                          >
                            {listing.status === "sold"
                              ? "Mark Available"
                              : "Mark Sold"}
                          </button>
                          <button
                            onClick={() => handleDelete(listing._id)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* posts tab */}
        {activeTab === "posts" && (
          <div className="max-w-2xl">
            {loadingPosts && (
              <p className="text-zinc-400">Loading your posts...</p>
            )}

            {!loadingPosts && posts.length === 0 && (
              <div className="flex flex-col items-center justify-center h-48 gap-4">
                <p className="text-zinc-400">
                  You haven't posted in the community yet.
                </p>
                <Link
                  to="/community"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors"
                >
                  Go to Community
                </Link>
              </div>
            )}

            {!loadingPosts &&
              posts.map((post) => (
                <div
                  key={post._id}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-3"
                >
                  {post.content && (
                    <p className="text-zinc-100 text-sm whitespace-pre-wrap mb-2">
                      {post.content}
                    </p>
                  )}
                  {post.images?.length > 0 && (
                    <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden mb-2">
                      {post.images.slice(0, 4).map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          className="w-full h-28 object-cover"
                          alt=""
                        />
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-zinc-500 text-xs">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5" /> {post.likes?.length || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5" />{" "}
                      {post.commentsCount || 0}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* settings tab */}
        {activeTab === "settings" && (
          <div className="max-w-md flex flex-col gap-6">
            {/* account info */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="font-bold text-white mb-4">Account Info</h3>
              <div className="flex flex-col gap-3">
                <div>
                  <p className="text-zinc-500 text-xs mb-1">Full Name</p>
                  <p className="text-white text-sm">{user.name}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs mb-1">Email</p>
                  <p className="text-white text-sm">{user.email}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs mb-1">Member Since</p>
                  <p className="text-white text-sm">
                    {new Date(user.createdAt || Date.now()).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs mb-1">Total Listings</p>
                  <p className="text-white text-sm">{listings.length}</p>
                </div>
              </div>
            </div>

            {/* change password */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="font-bold text-white mb-4">Change Password</h3>
              <div className="flex flex-col gap-3">
                <input
                  type="password"
                  placeholder="Current password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value,
                    })
                  }
                  className="bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 transition-colors text-sm"
                />
                <input
                  type="password"
                  placeholder="New password (min 8 characters)"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                  className="bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 transition-colors text-sm"
                />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 transition-colors text-sm"
                />
                <button
                  onClick={handlePasswordChange}
                  disabled={changingPassword}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl py-2.5 transition-colors text-sm"
                >
                  {changingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>

            {/* danger zone */}
            <div className="bg-zinc-900 border border-red-500/20 rounded-xl p-6">
              <h3 className="font-bold text-red-400 mb-1">Danger Zone</h3>
              <p className="text-zinc-500 text-xs mb-4">
                Deleting your account is permanent and will remove all your
                listings.
              </p>
              <button
                onClick={handleDeleteAccount}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full"
              >
                Delete My Account
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ProfileSettings;