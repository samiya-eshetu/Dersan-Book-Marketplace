import React, { useState, useRef } from "react";
import Header from "./Header";
import Footer from "./Footer";

import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ImagePlus } from "lucide-react";

const SellBook = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    price: "",
    condition: "",
    category: "",
    location: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (selectedImages.length + files.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }
    const previews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setSelectedImages((prev) => [...prev, ...previews]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // validation
    if (
      !formData.title ||
      !formData.price ||
      !formData.condition ||
      !formData.category
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (selectedImages.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    setLoading(true);

    try {
      // use FormData (not JSON) because we're sending files
      const data = new FormData();

      // append all text fields
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      // append each image file
      selectedImages.forEach((img) => {
        data.append("images", img.file);
      });

      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/api/listings", {
        method: "POST",
        headers: {
          // NOTE: do NOT set Content-Type here
          // browser sets it automatically with the correct boundary for FormData
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Something went wrong");
        return;
      }

      toast.success("Listing created successfully!");
      navigate(`/listing/${result._id}`);
    } catch (error) {
      toast.error("Something went wrong. Try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Header />
      <div className="pt-24 px-4 md:px-16 pb-16 max-w-3xl mx-auto mb-24">
        <h2 className="text-3xl font-extrabold my-6">Create a Book Listing</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* image upload */}
          <div className="flex flex-col gap-2">
            <label className="text-zinc-300 text-sm font-medium">
              Book Images <span className="text-red-400">*</span>
            </label>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              multiple
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current.click()}
              className="border-2 border-dashed border-zinc-700 hover:border-blue-500 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors"
            >
              <ImagePlus className="w-8 h-8 text-zinc-500 mb-2" />
              <p className="text-zinc-400 text-sm">Click to upload images</p>
              <p className="text-zinc-600 text-xs mt-1">
                PNG, JPG — up to 5 images ({selectedImages.length}/5)
              </p>
            </div>

            {selectedImages.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-2">
                {selectedImages.map((img, i) => (
                  <div key={i} className="relative aspect-square">
                    <img
                      src={img.preview}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedImages(
                          selectedImages.filter((_, index) => index !== i),
                        )
                      }
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* title */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="title"
              className="text-zinc-300 text-sm font-medium"
            >
              Book Title <span className="text-red-400">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Fiker Eske Mekabir"
              className="bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* author */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="author"
              className="text-zinc-300 text-sm font-medium"
            >
              Author
            </label>
            <input
              id="author"
              name="author"
              type="text"
              value={formData.author}
              onChange={handleChange}
              placeholder="e.g. Hadis Alemayehu"
              className="bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* description */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="description"
              className="text-zinc-300 text-sm font-medium"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the book — condition details, why you're selling, etc."
              rows={4}
              className="bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          {/* price + condition side by side */}
          <div className="flex gap-4">
            <div className="flex flex-col gap-1 flex-1">
              <label
                htmlFor="price"
                className="text-zinc-300 text-sm font-medium"
              >
                Price (ETB) <span className="text-red-400">*</span>
              </label>
              <input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                placeholder="e.g. 150"
                className="bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1 flex-1">
              <label
                htmlFor="condition"
                className="text-zinc-300 text-sm font-medium"
              >
                Condition <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <select
                  id="condition"
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer w-full"
                >
                  <option value="">Select condition</option>
                  <option value="new">New</option>
                  <option value="like new">Like New</option>
                  <option value="good">Good</option>
                  <option value="worn">Worn</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                  ▾
                </div>
              </div>
            </div>
          </div>

          {/* category + location side by side */}
          <div className="flex gap-4">
            <div className="flex flex-col gap-1 flex-1">
              <label
                htmlFor="category"
                className="text-zinc-300 text-sm font-medium"
              >
                Category <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer w-full"
                >
                  <option value="">Select category</option>
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
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                  ▾
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1 flex-1">
              <label
                htmlFor="location"
                className="text-zinc-300 text-sm font-medium"
              >
                Location
              </label>
              <input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Addis Ababa"
                className="bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* submit */}
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 mt-2 transition-all shadow-lg shadow-blue-500/20"
          >
            {loading ? "Creating listing..." : "Post Listing"}
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default SellBook;
