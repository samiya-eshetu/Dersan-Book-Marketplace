import React from "react";
import { useNavigate } from "react-router-dom";
import Prism from "../Components/Prism";

const Hero = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleGetStarted = () => {
    navigate(token ? "/community" : "/auth");
  };

  return (
    // overflow-x-hidden on the outermost div kills any horizontal overflow
    <div className="min-h-screen bg-zinc-950 text-white overflow-x-hidden">
      <div className="relative w-full min-h-screen flex items-center justify-center">
        {/* background prism — fills entire parent */}
        <div className="absolute inset-0 w-full h-full z-0">
          <Prism
            animationType="rotate"
            timeScale={0.5}
            height={3.5}
            baseWidth={5.5}
            scale={3.6}
            hueShift={0}
            colorFrequency={1}
            noise={0}
            glow={1}
          />
        </div>

        {/* content */}
        <div className="relative z-10 w-full max-w-4xl px-4 md:px-8 text-center py-32 md:py-0">
          {/* text-4xl on mobile, text-6xl on tablet, text-7xl on desktop */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight">
            Welcome To{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
              Dersan Book Marketplace
            </span>
          </h1>

          {/* text size steps up on larger screens */}
          <p className="max-w-xl mx-auto mt-6 text-base sm:text-lg md:text-xl text-zinc-400">
            Find and read more you'll love, and keep track of the books you want
            to read. Be part of the world's largest community of book lovers on
            Goodreads.
          </p>

          {/* stacked on mobile, side by side on md+ */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 mt-10">
            <button
              onClick={handleGetStarted}
              className="w-full sm:w-auto px-8 py-3 font-medium transition bg-white text-zinc-950 rounded-xl hover:bg-zinc-200"
            >
              Get Started
            </button>
            <button
              onClick={() => navigate("/explore")}
              className="w-full sm:w-auto px-8 py-3 font-medium border transition border-zinc-700 backdrop-blur-sm rounded-xl hover:bg-zinc-900/50"
            >
              Explore Books
            </button>
          </div>
        </div>

        {/* bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none bg-gradient-to-t from-zinc-950 to-transparent" />
      </div>
    </div>
  );
};

export default Hero;