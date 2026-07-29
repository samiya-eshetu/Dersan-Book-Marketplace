import React from "react";
import logo from "../assets/LOGO.png"

function Footer() {
  return (
    <footer className="bg-zinc-950 text-zinc-400 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        <div>
          <h3 className="text-white font-bold text-lg mb-3">Books</h3>
          <p className="text-sm leading-relaxed">
            Books Delivered. Imagination Unlimited.
          </p>
          <img className = "w-50 h-48" src={logo} alt="LOGO"></img>
        </div>

        <div>
          <h3 className="text-white font-bold text-lg mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white transition-colors">Home</a></li>
            <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-bold text-lg mb-3">Contact</h3>
          <ul className="space-y-2 text-sm">
            <li>Email: mssonukr@gmail.com</li>
            <li>Phone: +91 7061543815</li>
            <li>MMEC, Mullana - 133207</li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-bold text-lg mb-3">We Accept</h3>
          <div className="flex gap-3 mt-2">
            <span className="px-3 py-1 bg-zinc-800 text-white text-sm font-bold rounded-md border border-zinc-700">
              VISA
            </span>
            <span className="px-3 py-1 bg-zinc-800 text-white text-sm font-bold rounded-md border border-zinc-700">
              MC
            </span>
            <span className="px-3 py-1 bg-zinc-800 text-white text-sm font-bold rounded-md border border-zinc-700">
              AMEX
            </span>
          </div>
        </div>

      </div>

      <div className="border-t border-zinc-800 py-6 text-center text-xs text-zinc-600">
        © 2025 Books. All rights reserved. | Made with ❤️
      </div>
    </footer>
  );
}

export default Footer;