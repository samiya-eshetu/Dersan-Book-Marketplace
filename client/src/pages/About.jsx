import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Users, Repeat } from "lucide-react";
import Header from "./Header";
import Footer from "./Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Header />

      <div className="pt-24 pb-16 px-4 md:px-8 max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-4">About Dersan</h1>
        <p className="text-zinc-400 text-lg leading-relaxed mb-12">
          Dersan is a marketplace and community built for people who love books.
          Buy and sell secondhand books directly with other readers, share what
          you're reading in the community feed, and get notified when a book
          in a category you care about gets listed.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <BookOpen className="w-6 h-6 text-sky-400 mb-3" />
            <h3 className="font-bold text-white mb-2">Buy & Sell</h3>
            <p className="text-zinc-400 text-sm">
              List books you're done with, browse what other readers are
              selling, and message sellers directly.
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <Users className="w-6 h-6 text-sky-400 mb-3" />
            <h3 className="font-bold text-white mb-2">Community</h3>
            <p className="text-zinc-400 text-sm">
              Post about what you're reading, tag it with hashtags, and see
              what other book lovers are talking about.
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <Repeat className="w-6 h-6 text-sky-400 mb-3" />
            <h3 className="font-bold text-white mb-2">Stay in the loop</h3>
            <p className="text-zinc-400 text-sm">
              Get notified when someone likes or comments on your posts, or
              when a book matching your interests gets listed.
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link
            to="/explore"
            className="inline-block bg-sky-500 hover:bg-sky-400 text-white font-bold px-6 py-3 rounded-xl transition-colors"
          >
            Start Exploring
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;