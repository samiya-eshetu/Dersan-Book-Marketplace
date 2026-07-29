import React from "react";
import { Link } from "react-router-dom";
import { Send } from "lucide-react";
import logo from "../assets/LOGO.png"

function Footer() {
  return (
    <footer className="bg-zinc-950 text-zinc-400 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">

        <div>
          <h3 className="text-white font-bold text-lg mb-3">Books</h3>
          <p className="text-sm leading-relaxed">
            Buy, sell, and talk about books with a community of readers —
            find your next favorite, list the ones you're done with, and
            connect with people who love them as much as you do.
          </p>
          <img className = "w-50 h-48" src={logo} alt="LOGO"></img>
        </div>

        <div>
          <h3 className="text-white font-bold text-lg mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
            <li><Link to="/explore" className="hover:text-white transition-colors">Explore</Link></li>
            <li><Link to="/community" className="hover:text-white transition-colors">Community</Link></li>
            <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-bold text-lg mb-3">Contact</h3>
          <p className="text-sm mb-2">Reach us anytime on Telegram:</p>
          <a
            href="https://t.me/Bint_Hawwaa"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sky-400 hover:text-sky-300 transition-colors text-sm font-medium"
          >
            <Send className="w-4 h-4" />
            @Bint_Hawwaa
          </a>
        </div>

      </div>

      <div className="border-t border-zinc-800 py-6 text-center text-xs text-zinc-600">
        © 2025-2026 Dersan. All rights reserved. | Made with ❤️
      </div>
    </footer>
  );
}

export default Footer;