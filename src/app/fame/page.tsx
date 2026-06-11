"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Plus, X, Lock, ShieldAlert, Trash2, Loader2 } from "lucide-react";
import { useStudentStore } from "@/store/useStudentStore";
import Image from "next/image";

interface FamePost {
  _id: string;
  nominatorId: string;
  nominatorName: string;
  nomineeId: string;
  nomineeName: string;
  nomineePhotoUrl: string;
  title: string;
  createdAt: string;
}

const COLORS = [
  "from-blue-400 to-cyan-400",
  "from-yellow-400 to-orange-400",
  "from-pink-400 to-rose-400",
  "from-purple-400 to-fuchsia-400",
  "from-green-400 to-emerald-400",
  "from-slate-400 to-zinc-400",
  "from-indigo-400 to-blue-600",
  "from-rose-400 to-red-500",
];

function getColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return COLORS[hash % COLORS.length];
}

export default function HallOfFamePage() {
  const { students, init } = useStudentStore();
  const [posts, setPosts] = useState<FamePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [submissionKey, setSubmissionKey] = useState("");
  const [nomineeId, setNomineeId] = useState("");
  const [title, setTitle] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  const [adminKey, setAdminKey] = useState("");
  const [adminError, setAdminError] = useState("");

  // ─── Fetch from MongoDB ───────────────────────────────────────────────────
  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch("/api/hallOfFame");
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error("Failed to fetch Hall of Fame:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    init(); // load students for the nominee dropdown
    fetchPosts();
  }, [init, fetchPosts]);

  // ─── Submit nomination ────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!submissionKey.trim() || !nomineeId || !title.trim()) {
      setFormError("Please fill out all fields.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/hallOfFame", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionKey, nomineeId, title }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Something went wrong.");
        return;
      }

      await fetchPosts();
      setFormSuccess("Nomination posted! 🏆");
      setTimeout(() => {
        setShowForm(false);
        setFormSuccess("");
        setSubmissionKey("");
        setNomineeId("");
        setTitle("");
      }, 1500);
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Admin ────────────────────────────────────────────────────────────────
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminKey === "Sanjay@04") {
      setIsAdminMode(true);
      setShowAdminPrompt(false);
      setAdminError("");
      setAdminKey("");
    } else {
      setAdminError("Incorrect admin password.");
    }
  };

  const deletePost = async (id: string) => {
    if (!window.confirm("Delete this Hall of Fame post?")) return;
    try {
      await fetch("/api/hallOfFame", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": "Sanjay@04",
        },
        body: JSON.stringify({ id }),
      });
      await fetchPosts();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="min-h-screen w-full bg-transparent text-white px-4 py-20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-purple-900/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/2 h-full bg-blue-900/10 blur-[150px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16 relative z-10"
      >
        <h1 className="text-4xl md:text-6xl font-black neon-text-gold tracking-wider mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600 flex items-center justify-center gap-4">
          <Trophy className="text-yellow-400" size={48} />
          HALL OF FAME
        </h1>
        <p className="text-xl text-zinc-400 font-light mb-8">
          Honor the legends of our batch
        </p>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-bold hover:from-yellow-500 hover:to-orange-500 transition-all shadow-[0_0_20px_rgba(234,179,8,0.4)]"
          >
            <Plus size={20} /> Nominate Someone
          </button>
          <button
            onClick={() =>
              isAdminMode ? setIsAdminMode(false) : setShowAdminPrompt(true)
            }
            className={`glassmorphism p-4 rounded-full transition-colors ${
              isAdminMode
                ? "bg-yellow-500/30 text-yellow-400"
                : "text-zinc-500 hover:text-white"
            }`}
            title="Admin Mode"
          >
            <ShieldAlert size={20} />
          </button>
        </div>
      </motion.div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 className="text-yellow-400 animate-spin" size={48} />
        </div>
      )}

      {/* Grid */}
      {!loading && (
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
          <AnimatePresence>
            {posts.map((post, index) => {
              const color = getColor(post._id);
              return (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -10 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group relative"
                >
                  <div
                    className={`absolute -inset-0.5 bg-gradient-to-br ${color} rounded-3xl blur opacity-30 group-hover:opacity-70 transition duration-500`}
                  />

                  <div className="relative glassmorphism rounded-3xl p-6 h-full flex flex-col items-center text-center">
                    {isAdminMode && (
                      <button
                        onClick={() => deletePost(post._id)}
                        className="absolute -top-3 -right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg z-20"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}

                    <div className="relative w-32 h-32 rounded-full overflow-hidden mb-6 border-4 border-white/10 group-hover:border-white/30 transition-colors">
                      {post.nomineePhotoUrl &&
                      post.nomineePhotoUrl.startsWith("data:") ? (
                        <img
                          src={post.nomineePhotoUrl}
                          alt={post.nomineeName}
                          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <Image
                          src={post.nomineePhotoUrl || "/college.jpg"}
                          alt={post.nomineeName}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      )}
                    </div>

                    <h3
                      className={`text-sm tracking-[0.2em] uppercase font-bold text-transparent bg-clip-text bg-gradient-to-r ${color} mb-2`}
                    >
                      {post.title}
                    </h3>
                    <p className="text-2xl font-bold text-white drop-shadow-md mb-6">
                      {post.nomineeName}
                    </p>

                    <div className="mt-auto pt-4 border-t border-white/10 w-full">
                      <p className="text-xs text-zinc-500 italic">
                        Nominated by:{" "}
                        <span className="font-semibold text-zinc-400">
                          {post.nominatorName}
                        </span>
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {posts.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <p className="text-zinc-500 text-lg">
                No one has been nominated yet. Be the first!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Add Nomination Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glassmorphism p-8 rounded-3xl w-full max-w-md relative"
            >
              <button
                onClick={() => setShowForm(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>

              <h2 className="text-2xl font-bold mb-2 text-center text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                Create a Nomination
              </h2>
              <p className="text-zinc-500 text-sm text-center mb-6">
                Enter your secret key — your name is filled in automatically.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">
                    Your Secret Key
                  </label>
                  <input
                    type="password"
                    value={submissionKey}
                    onChange={(e) => setSubmissionKey(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-yellow-500"
                    placeholder="Enter your personal key"
                    required
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 text-sm mb-2">
                    Who are you nominating?
                  </label>
                  <select
                    value={nomineeId}
                    onChange={(e) => setNomineeId(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-yellow-500"
                    required
                  >
                    <option value="" disabled>
                      Select a person...
                    </option>
                    {students.map((student) => (
                      <option
                        key={student.id || student._id}
                        value={student.id || student._id}
                      >
                        {student.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 text-sm mb-2">
                    What are they best at?
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-yellow-500"
                    placeholder="e.g. Best Programmer, Silent Killer..."
                    maxLength={30}
                    required
                  />
                </div>

                {formError && (
                  <p className="text-red-400 text-sm text-center">{formError}</p>
                )}
                {formSuccess && (
                  <p className="text-emerald-400 text-sm text-center">
                    {formSuccess}
                  </p>
                )}

                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setFormError("");
                      setSubmissionKey("");
                    }}
                    className="flex-1 py-3 rounded-xl border border-white/20 text-white hover:bg-white/5 transition-colors"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-yellow-600 to-orange-600 font-bold hover:from-yellow-500 hover:to-orange-500 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(234,179,8,0.5)] text-white"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trophy size={16} />
                    )}
                    {submitting ? "Posting..." : "Nominate"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Auth Modal */}
      <AnimatePresence>
        {showAdminPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glassmorphism p-8 rounded-3xl w-full max-w-sm"
            >
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-yellow-500/20 border border-yellow-500/30">
                  <Lock size={24} className="text-yellow-400" />
                </div>
              </div>
              <h2 className="text-xl font-bold neon-text-gold mb-6 text-center text-yellow-500">
                Admin Access
              </h2>
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <input
                  type="password"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Admin password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-center focus:outline-none focus:border-yellow-500"
                  required
                />
                {adminError && (
                  <p className="text-red-400 text-xs text-center">{adminError}</p>
                )}
                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAdminPrompt(false);
                      setAdminError("");
                      setAdminKey("");
                    }}
                    className="flex-1 py-2 rounded-xl border border-white/20 text-zinc-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-yellow-600 text-white hover:bg-yellow-500 transition-colors"
                  >
                    Unlock
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
