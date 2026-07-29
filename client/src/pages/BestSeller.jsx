import { ShoppingCart, ChevronLeft, ChevronRight, Send } from "lucide-react";
import { useState, useRef, useEffect } from "react";

function BookCard({ book }) {
  const [imgIndex, setImgIndex] = useState(0);

  const nextImage = () => {
    setImgIndex((prev) => (prev + 1) % book.images.length);
  };

  const prevImage = () => {
    setImgIndex((prev) => (prev - 1 + book.images.length) % book.images.length);
  };

  return (
    <div className="flex flex-col h-full border border-zinc-800 bg-zinc-900 hover:border-zinc-600 transition-all shadow-lg hover:shadow-zinc-800/50 p-5 shrink-0 w-56 sm:w-64 md:w-72 rounded-xl">
      <div className="relative">
        <img
          src={book.images[imgIndex]}
          alt={book.title}
          className="w-full h-36 sm:h-40 md:h-48 object-cover rounded-lg"
        />
        <span className="absolute bottom-2 left-2 bg-zinc-950/80 backdrop-blur-sm text-white px-2 py-1 rounded-md text-sm font-bold">
          {book.price.toFixed(2)} ETB
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

      <h4 className="font-bold mt-3 text-base text-white line-clamp-1">
        {book.title}
      </h4>
      <p className="text-sm text-zinc-400 mb-2 line-clamp-1">
        {book.author || " "}
      </p>
      <p className="mt-1 text-xs sm:text-sm text-zinc-400 line-clamp-2 min-h-[2.5rem]">
        {book.description}
      </p>

      <button className="justify-center hover:bg-zinc-700 flex gap-2 items-center w-full py-2 rounded-lg bg-zinc-800 border border-zinc-700 mt-auto pt-3 transition-colors">
        <Send className="w-4 h-4 text-white" />
        <span className="text-white text-xs sm:text-sm font-medium hidden sm:block">
          Send a Message
        </span>
      </button>
    </div>
  );
}

function BestSeller() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [books, setBooks] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    fetch("https://dersan-book-marketplace.onrender.com/api/listings?sort=bestseller")
      .then((res) => res.json())
      .then((data) => setBooks(data))
      .catch((err) => console.error("Failed to fetch listings:", err));
  }, []);

  const handleScroll = () => {
    const scrollLeft = scrollRef.current.scrollLeft;
    const cardWidth = 288 + 24;
    const newIndex = Math.round(scrollLeft / cardWidth);
    setActiveIndex(newIndex);
  };

  return (
    <div className="bg-zinc-950 border-t border-zinc-800 px-6 py-12">
      <h2 className="text-center text-2xl font-bold text-white mb-8">
        Best Seller Books
      </h2>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex items-stretch overflow-x-auto shrink-0 gap-6 w-full mb-6 scrollbar-hide"
      >
        {books.map((book) => (
          <BookCard key={book._id} book={book} />
        ))}
      </div>

      <div className="flex gap-2 justify-center mt-2">
        {books.map((_, index) => (
          <div
            key={index}
            className={
              index === activeIndex
                ? "h-2.5 w-2.5 rounded-full bg-blue-500 transition-all"
                : "h-2 w-2 rounded-full bg-zinc-700 transition-all"
            }
          />
        ))}
      </div>
    </div>
  );
}

export default BestSeller;