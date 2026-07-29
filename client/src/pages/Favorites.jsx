import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import animationData from "../assets/Favs.json";
import { useNavigate } from "react-router-dom";

function Favorites() {
  return (
    <div className="bg-zinc-950 border-t border-zinc-800 px-4 md:px-8 py-12 md:py-20">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-16">
        {/* animation container — responsive width, fixed aspect ratio */}
        <div className="w-full md:w-1/2 flex justify-center">
          {/* aspect-square keeps it a consistent shape regardless of screen size */}
          <div className="w-full max-w-xs sm:max-w-sm md:max-w-md aspect-square">
            <DotLottieReact
              data={animationData}
              loop
              autoplay
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </div>

        {/* text content */}
        <div className="flex flex-col w-full md:w-1/2">
          <h2 className="font-extrabold text-3xl sm:text-4xl lg:text-5xl leading-tight text-white mb-6">
            Find Your Next Favorite,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              Book Here!
            </span>
          </h2>

          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed mb-8">
            Browse, discover, and fall in love with your next book. Curated by
            readers, for readers. Whether you're chasing a thrilling mystery, a
            cozy weekend read, or your next favorite author, our shelves are
            stocked with stories worth staying up late for. No algorithms
            guessing what you like — just real recommendations from people who
            actually love to read.
          </p>

          {/* stats — gap shrinks on mobile so they don't overflow */}
          <div className="flex gap-6 md:gap-10 mb-8">
            <div>
              <p className="text-white font-extrabold text-2xl md:text-3xl">
                800+
              </p>
              <p className="text-zinc-500 text-xs md:text-sm mt-1">
                Book Listings
              </p>
            </div>
            <div>
              <p className="text-white font-extrabold text-2xl md:text-3xl">
                550+
              </p>
              <p className="text-zinc-500 text-xs md:text-sm mt-1">
                Registered Users
              </p>
            </div>
            <div>
              <p className="text-white font-extrabold text-2xl md:text-3xl">
                1,200+
              </p>
              <p className="text-zinc-500 text-xs md:text-sm mt-1">
                Books Sold
              </p>
            </div>
          </div>

          <button onClick={() => navigate("/explore")} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl px-6 md:px-8 py-3 font-semibold transition-all shadow-lg shadow-blue-500/20 w-fit">
            Explore Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default Favorites;
