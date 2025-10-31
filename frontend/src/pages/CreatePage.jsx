// src/pages/CreatePage.jsx
import { ArrowLeftIcon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router";
import api from "../lib/axios";

const CreatePage = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error("All fields are required");
      return;
    }

    setLoading(true);
    try {
      // Using your axios instance with baseURL set to /api or http://localhost:5001/api
      const res = await api.post("/notes", {
        title: title.trim(),
        content: content.trim(),
      });

      toast.success("Note created successfully!");
      // Optional: clear form if you want
      setTitle("");
      setContent("");
      navigate("/");
    } catch (err) {
      // Defensive checks to avoid reading undefined properties
      console.error("Error creating note", err);

      const status = err?.response?.status;

      if (status === 429) {
        // Server responded with rate-limit
        toast.error("Slow down! You're creating notes too fast", {
          duration: 4000,
          icon: "💀",
        });
      } else if (!err.response && err.request) {
        // Request sent but no response received => likely CORS / network error
        toast.error("Network or CORS error: backend unreachable. Check server and CORS settings.");
        console.error("No response from server. Possible CORS/preflight or network error.", err.message);
      } else if (status) {
        // Other server-side error with a response (4xx/5xx)
        console.error("Server responded with status:", status, err.response?.data);
        toast.error("Failed to create note");
      } else {
        // Unknown error (setup, axios config, etc.)
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Link to={"/"} className="btn btn-ghost mb-6">
            <ArrowLeftIcon className="size-5" />
            Back to Notes
          </Link>

          <div className="card bg-base-100">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4">Create New Note</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Title</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Note Title"
                    className="input input-bordered"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Content</span>
                  </label>
                  <textarea
                    placeholder="Write your note here..."
                    className="textarea textarea-bordered h-32"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="card-actions justify-end">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "Creating..." : "Create Note"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CreatePage;
