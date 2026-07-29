import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, CheckCircle, XCircle, ShieldAlert } from "lucide-react";
import Header from "./Header";
import Footer from "./Footer";
import toast from "react-hot-toast";

const reasonLabels = {
  spam: "Spam",
  harassment: "Harassment or bullying",
  inappropriate: "Inappropriate content",
  misinformation: "False information",
  other: "Other",
};

const AdminReports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (!token || !currentUser.isAdmin) {
      navigate("/");
      return;
    }
    fetchReports();
  }, []);

  const fetchReports = () => {
    setLoading(true);
    fetch("https://dersan-book-market-place.onrender.com/api/reports", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setReports(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleResolve = async (reportId, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/reports/${reportId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        toast.error("Failed to update report");
        return;
      }
      setReports((prev) =>
        prev.map((r) => (r._id === reportId ? { ...r, status } : r))
      );
      toast.success(status === "resolved" ? "Marked resolved" : "Dismissed");
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  const handleDeletePost = async (reportId) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="font-medium text-zinc-900">Delete the reported post?</p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  const response = await fetch(
                    `http://localhost:5000/api/reports/${reportId}/post`,
                    {
                      method: "DELETE",
                      headers: { Authorization: `Bearer ${token}` },
                    }
                  );
                  if (!response.ok) {
                    toast.error("Failed to delete post");
                    return;
                  }
                  setReports((prev) =>
                    prev.map((r) =>
                      r._id === reportId ? { ...r, status: "resolved" } : r
                    )
                  );
                  toast.success("Post deleted");
                } catch (err) {
                  toast.error("Something went wrong");
                }
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium"
            >
              Delete post
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="bg-zinc-200 hover:bg-zinc-300 text-zinc-800 px-4 py-1.5 rounded-lg text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  const filteredReports = reports.filter((r) =>
    filter === "all" ? true : r.status === filter
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Header />
      <div className="pt-24 pb-16 px-4 md:px-16 max-w-5xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <ShieldAlert className="w-6 h-6 text-red-400" />
          <h1 className="text-2xl font-extrabold text-white">Reported Posts</h1>
        </div>

        <div className="flex gap-1 border-b border-zinc-800 mb-6">
          {["pending", "resolved", "dismissed", "all"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px capitalize ${
                filter === f
                  ? "border-red-500 text-red-400"
                  : "border-transparent text-zinc-400 hover:text-white"
              }`}
            >
              {f} {f !== "all" && `(${reports.filter((r) => r.status === f).length})`}
            </button>
          ))}
        </div>

        {loading && <p className="text-zinc-400">Loading reports...</p>}

        {!loading && filteredReports.length === 0 && (
          <p className="text-zinc-500 text-center py-16">No reports here.</p>
        )}

        <div className="flex flex-col gap-3">
          {filteredReports.map((report) => (
            <div
              key={report._id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <span className="inline-block bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold px-2 py-0.5 rounded-full mb-2">
                    {reasonLabels[report.reason] || report.reason}
                  </span>
                  <p className="text-zinc-400 text-xs">
                    Reported by{" "}
                    <span className="text-zinc-300">{report.reporter?.name}</span> (
                    {report.reporter?.email})
                  </p>
                  <p className="text-zinc-600 text-xs mt-0.5">
                    {new Date(report.createdAt).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize shrink-0 ${
                    report.status === "pending"
                      ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                      : report.status === "resolved"
                      ? "bg-green-500/10 text-green-400 border border-green-500/20"
                      : "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20"
                  }`}
                >
                  {report.status}
                </span>
              </div>

              {report.post ? (
                <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 mb-3">
                  <p className="text-zinc-500 text-xs mb-1">
                    Post by{" "}
                    <span className="text-zinc-300">{report.post.author?.name}</span> (
                    {report.post.author?.email})
                  </p>
                  {report.post.content && (
                    <p className="text-zinc-200 text-sm whitespace-pre-wrap">
                      {report.post.content}
                    </p>
                  )}
                  {report.post.images?.length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {report.post.images.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          className="w-16 h-16 rounded-lg object-cover"
                          alt=""
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-zinc-600 text-xs italic mb-3">
                  This post has already been deleted.
                </p>
              )}

              {report.status === "pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleResolve(report._id, "dismissed")}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Dismiss
                  </button>
                  <button
                    onClick={() => handleResolve(report._id, "resolved")}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Mark resolved
                  </button>
                  {report.post && (
                    <button
                      onClick={() => handleDeletePost(report._id)}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete post
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminReports;