import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Send } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

// ── card component ──────────────────────────────────────────
function ExploreCard({ book }) {
  const [imgIndex, setImgIndex] = useState(0);

  const nextImage = () => {
    setImgIndex((prev) => (prev + 1) % book.images.length);
  };

  const prevImage = () => {
    setImgIndex((prev) => (prev - 1 + book.images.length) % book.images.length);
  };

  return (
    <Link to={`/listing/${book._id}`}>
    <div className="border border-zinc-800 bg-zinc-900 hover:border-zinc-600 transition-all shadow-lg p-2 sm:p-4 w-full rounded-xl">
      <div className="relative">
        <img
          src={book.images[imgIndex]}
          alt={book.title}
          className="w-full h-32 sm:h-48 md:h-56 lg:h-64 object-cover rounded-lg"
        />
        <span className="absolute bottom-2 left-2 bg-zinc-950/80 backdrop-blur-sm text-white px-1.5 py-0.5 rounded-md text-xs sm:text-sm font-bold">
          {book.price ? `${Number(book.price).toFixed(2)} ETB` : ""}
        </span>

        {book.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute top-1/2 left-1 -translate-y-1/2 bg-zinc-950/70 hover:bg-zinc-800 text-white rounded-full p-1 shadow transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextImage}
              className="absolute top-1/2 right-1 -translate-y-1/2 bg-zinc-950/70 hover:bg-zinc-800 text-white rounded-full p-1 shadow transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="absolute bottom-2 right-2 flex gap-1">
              {book.images.map((_, i) => (
                <div
                  key={i}
                  className={
                    i === imgIndex
                      ? "h-1.5 w-1.5 rounded-full bg-white"
                      : "h-1.5 w-1.5 rounded-full bg-white/30"
                  }
                />
              ))}
            </div>
          </>
        )}
      </div>

      <h4 className="font-bold mt-2 text-xs sm:text-base text-white">
        {book.title}
      </h4>
      <p className="text-xs sm:text-sm text-zinc-400 mb-1">{book.author}</p>
<p className="mt-1 text-xs sm:text-sm text-zinc-400 line-clamp-2 min-h-[2.5rem]">
  {book.description}
</p>

      <button className="justify-center hover:bg-zinc-700 flex gap-2 items-center w-full py-2 rounded-lg bg-zinc-800 border border-zinc-700 mt-3 transition-colors">
        <Send className="w-4 h-4 text-white" />
        <span className="text-white text-xs sm:text-sm font-medium hidden sm:block">
          Send a Message
        </span>
      </button>
    </div>
    </Link>
  );
}

// ── main explore page ────────────────────────────────────────
const Explore = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("");

 
useEffect(() => {
  setLoading(true);
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (category) params.append("category", category);
  if (sort) params.append("sort", sort);

  fetch(`https://dersan-book-marketplace.onrender.com/api/listings?${params.toString()}`)
    .then((res) => res.json())
    .then((data) => {
      setBooks(data);
      setLoading(false);
    })
    .catch((err) => {
      console.error("Failed to fetch listings:", err);
      setLoading(false);
    });
}, [search, category, sort]);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-zinc-950 text-white pt-24 px-4 md:px-10 pb-16">
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-8">
          Explore Books
        </h1>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
  {/* search input */}
  <input
    type="text"
    placeholder="Search books..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="flex-1 bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 transition-colors"
  />

  {/* category filter */}
  <select
    value={category}
    onChange={(e) => setCategory(e.target.value)}
    className="bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 transition-colors"
  >
    <option value="">All Categories</option>
    <option value="fiction">Fiction</option>
    <option value="manga">Manga</option>
    <option value="textbook">Textbook</option>
    <option value="biography">Biography</option>
    <option value="self-help">Self Help</option>
    <option value="science">Science</option>
    <option value="history">History</option>
    <option value="children">Children</option>
    <option value="poetry">Poetry</option>
    <option value="other">Other</option>
  </select>

  {/* sort */}
  <select
    value={sort}
    onChange={(e) => setSort(e.target.value)}
    className="bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 transition-colors"
  >
    <option value="">Sort By</option>
    <option value="newest">Newest</option>
    <option value="bestseller">Most Popular</option>
  </select>
</div>

        {/* loading state */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <p className="text-zinc-400">Loading listings...</p>
          </div>
        )}

        {/* empty state */}
        {!loading && books.length === 0 && (
          <div className="flex justify-center items-center h-64">
            <p className="text-zinc-400">No listings found.</p>
          </div>
        )}

        {/* grid of cards */}
        {!loading && books.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
            {books.map((book) => (
              <ExploreCard key={book._id} book={book} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Explore;
