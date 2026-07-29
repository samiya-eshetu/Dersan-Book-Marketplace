import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Send,
  MapPin,
  Tag,
  ArrowLeft,
} from "lucide-react";
import Header from "./Header";
import Footer from "./Footer";
import toast from "react-hot-toast";

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIndex, setImgIndex] = useState(0);

  // get logged in user from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetch(`https://dersan-book-marketplace.onrender.com/api/listings/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setListing(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch listing:", err);
        setLoading(false);
      });
  }, [id]);

  // ← handleSendMessage goes here, inside the component but outside JSX
  const handleSendMessage = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth");
      return;
    }

    // don't let sellers message themselves
    if (listing.seller?._id === user.id) {
      toast.error("This is your own listing");
      return;
    }

    try {
      const response = await fetch("https://dersan-book-marketplace.onrender.com/api/conversations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ listingId: listing._id }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "Something went wrong");
        return;
      }
      navigate(`/conversations/${data._id}`);
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <p className="text-zinc-400">Loading...</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <p className="text-zinc-400">Listing not found.</p>
      </div>
    );
  }

  const nextImage = () => {
    setImgIndex((prev) => (prev + 1) % listing.images.length);
  };

  const prevImage = () => {
    setImgIndex(
      (prev) => (prev - 1 + listing.images.length) % listing.images.length,
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Header />
      <div className="pt-24 px-4 md:px-16 pb-16 max-w-5xl mx-auto">

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex flex-col md:flex-row gap-10">

          {/* left — images */}
          <div className="w-full md:w-1/2">
            <div className="relative rounded-2xl overflow-hidden">
              <img
                src={listing.images[imgIndex]}
                alt={listing.title}
                className="w-full h-72 sm:h-96 object-cover"
              />

              {listing.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute top-1/2 left-2 -translate-y-1/2 bg-zinc-950/70 hover:bg-zinc-800 text-white rounded-full p-2 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute top-1/2 right-2 -translate-y-1/2 bg-zinc-950/70 hover:bg-zinc-800 text-white rounded-full p-2 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              <span className="absolute bottom-3 right-3 bg-zinc-950/80 text-white text-xs px-2 py-1 rounded-md">
                {imgIndex + 1} / {listing.images.length}
              </span>
            </div>

            {listing.images.length > 1 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {listing.images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    onClick={() => setImgIndex(i)}
                    className={`w-16 h-16 object-cover rounded-lg cursor-pointer transition-all ${
                      i === imgIndex
                        ? "border-2 border-blue-500 opacity-100"
                        : "border-2 border-transparent opacity-50 hover:opacity-80"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* right — details */}
          <div className="w-full md:w-1/2 flex flex-col gap-4">

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                {listing.title}
              </h1>
              {listing.author && (
                <p className="text-zinc-400 mt-1">by {listing.author}</p>
              )}
            </div>

            <p className="text-3xl font-extrabold text-blue-400">
              {Number(listing.price).toFixed(2)} ETB
            </p>

            <div className="flex flex-wrap gap-2">
              {listing.condition && (
                <span className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs px-3 py-1 rounded-full capitalize">
                  {listing.condition}
                </span>
              )}
              {listing.category && (
                <span className="bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs px-3 py-1 rounded-full capitalize flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {listing.category}
                </span>
              )}
              {listing.location && (
                <span className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs px-3 py-1 rounded-full flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {listing.location}
                </span>
              )}
            </div>

            {listing.description && (
              <div>
                <h3 className="text-sm font-semibold text-zinc-400 mb-1 uppercase tracking-wide">
                  Description
                </h3>
                <p className="text-zinc-300 text-sm leading-relaxed">
                  {listing.description}
                </p>
              </div>
            )}

            {/* seller card */}
            {listing.seller ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
                {listing.seller.profilePicture ? (
                  <img
                    src={listing.seller.profilePicture}
                    className="w-10 h-10 rounded-full object-cover"
                    alt={listing.seller.name}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                    {listing.seller.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-white text-sm font-medium">
                    {listing.seller.name}
                  </p>
                  <p className="text-zinc-500 text-xs">Seller</p>
                </div>
              </div>
            ) : (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <p className="text-zinc-500 text-sm">Seller info unavailable</p>
              </div>
            )}

            {/* ← updated button with onClick */}
            <button
              onClick={handleSendMessage}
              className="flex items-center justify-center gap-3 w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors shadow-lg shadow-blue-500/20"
            >
              <Send className="w-5 h-5" />
              Send a Message
            </button>

            <p className="text-zinc-600 text-xs text-center">
              Listed on{" "}
              {new Date(listing.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ListingDetail;