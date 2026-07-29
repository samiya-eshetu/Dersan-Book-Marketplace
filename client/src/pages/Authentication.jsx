import React from "react";
import Grainient from "../Components/Grainient";
import Footer from "./Footer";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

const Authentication = () => {
  const [isLogIn, setIsLogIn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validate = () => {
    // check empty fields
    if (!formData.email || !formData.password) {
      toast.error("Email and password are required");
      return false;
    }

    // check empty name fields on register
    if (!isLogIn && (!formData.firstName || !formData.lastName)) {
      toast.error("First and last name are required");
      return false;
    }

    // check password length
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // run validation first — if it fails, stop here
    if (!validate()) return;

    setLoading(true);

    const endpoint = isLogIn
      ? "https://dersan-book-market-place.onrender.com/api/users/login"
      : "https://dersan-book-market-place.onrender.com/api/users/register";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success(isLogIn ? "Welcome back!" : "Account created!");
      navigate("/");
    } catch (error) {
      toast.error("Something went wrong. Try again.");
      // log the actual error so we can see what's happening
      console.error("Auth error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="relative min-h-screen">
        <div className="absolute inset-0">
          <Grainient
            color1="#27699C"
            color2="#5487C4"
            color3="#193457"
            timeSpeed={0.25}
            colorBalance={0}
            warpStrength={1}
            warpFrequency={5}
            warpSpeed={2}
            warpAmplitude={50}
            blendAngle={0}
            blendSoftness={0.05}
            rotationAmount={500}
            noiseScale={2}
            grainAmount={0.1}
            grainScale={2}
            grainAnimated={false}
            contrast={1.5}
            gamma={1}
            saturation={1}
            centerX={0}
            centerY={0}
            zoom={0.9}
          />
        </div>

        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-10 w-full max-w-md shadow-2xl">
            <h1 className="text-white text-3xl font-extrabold mb-1">
              {isLogIn ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-zinc-300 text-sm mb-8">
              {isLogIn ? "Log in to continue" : "Sign up to get started"}
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {!isLogIn && (
                <div className="flex gap-3">
                  <div className="flex flex-col gap-1 w-1/2">
                    <label
                      className="text-zinc-300 text-sm font-medium"
                      htmlFor="firstName"
                    >
                      First Name
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="John"
                      className="bg-white/10 border border-white/20 text-white placeholder-zinc-400 rounded-xl px-4 py-2.5 outline-none focus:border-blue-400 transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1 w-1/2">
                    <label
                      className="text-zinc-300 text-sm font-medium"
                      htmlFor="lastName"
                    >
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Doe"
                      className="bg-white/10 border border-white/20 text-white placeholder-zinc-400 rounded-xl px-4 py-2.5 outline-none focus:border-blue-400 transition-colors"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label
                  className="text-zinc-300 text-sm font-medium"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="bg-white/10 border border-white/20 text-white placeholder-zinc-400 rounded-xl px-4 py-2.5 outline-none focus:border-blue-400 transition-colors"
                />
              </div>

              {/* password with show/hide toggle */}
              <div className="flex flex-col gap-1">
                <label
                  className="text-zinc-300 text-sm font-medium"
                  htmlFor="password"
                >
                  Password
                </label>
                {/* relative here so we can position the eye icon absolutely inside */}
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    // type switches between "password" (dots) and "text" (visible)
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="bg-white/10 border border-white/20 text-white placeholder-zinc-400 rounded-xl px-4 py-2.5 outline-none focus:border-blue-400 transition-colors w-full pr-12"
                  />
                  {/* eye button sits inside the input on the right */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                  >
                    {/* swap icon based on showPassword state */}
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {/* live feedback on password length */}
                {formData.password.length > 0 &&
                  formData.password.length < 8 && (
                    <p className="text-red-400 text-xs mt-1">
                      Password must be at least 8 characters (
                      {formData.password.length}/8)
                    </p>
                  )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 mt-2 transition-colors shadow-lg shadow-blue-500/20"
              >
                {loading
                  ? "Please wait..."
                  : isLogIn
                    ? "Continue"
                    : "Create Account"}
              </button>
            </form>

            <p className="text-zinc-400 text-sm text-center mt-6">
              {isLogIn ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => setIsLogIn(!isLogIn)}
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                {isLogIn ? "Sign up" : "Log in"}
              </button>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Authentication;
