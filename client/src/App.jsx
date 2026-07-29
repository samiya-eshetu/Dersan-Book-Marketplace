import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./pages/Header";
import Hero from "./pages/Hero";
import BestSeller from "./pages/BestSeller";
import Favorites from "./pages/Favorites";
import NewestBooks from "./pages/NewestBooks";
import Footer from "./pages/Footer";
import Authentication from "./pages/Authentication";
import Explore from "./pages/Explore";
import SellBook from "./pages/SellBook";
import ListingDetail from "./pages/ListingDetail";
import Conversations from "./pages/Conversations";
import Chat from "./pages/Chat";
import ProfileSettings from "./pages/ProfileSettings";
import Community from "./pages/Community";
import PublicProfile from "./pages/PublicProfile.jsx";
import { Toaster } from "react-hot-toast";
import Notifications from "./pages/Notifications";
import About from "./pages/About";
import AdminReports from "./pages/AdminReports.jsx";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/auth" />;
  return children;
}

function HomePage() {
  return (
    <>
      <Header />
      <Hero />
      <BestSeller />
      <Favorites />
      <NewestBooks />
      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{ style: { zIndex: 9999 } }}
      />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<Authentication />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/community" element={<Community />} />
        <Route path="/profile" element={<ProfileSettings />} />
        <Route path="/profile/:userId" element={<PublicProfile />} />
        <Route path="/conversations" element={<Conversations />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/conversations/:id" element={<Chat />} />
        <Route path="/about" element={<About />} />
        <Route
          path="/sell"
          element={
            <ProtectedRoute>
              <SellBook />
            </ProtectedRoute>
          }
        />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/listing/:id" element={<ListingDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
