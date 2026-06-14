"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PenTool, Trash2, Lock, ShieldAlert, Loader2 } from "lucide-react";

interface Signature {
  _id: string;
  studentId: string;
  studentName: string;
  message: string;
  createdAt: string;
}

const fonts = ["font-serif", "font-sans", "font-mono"];
const colors = [
  "neon-text-purple",
  "neon-text-blue",
  "neon-text-gold",
  "text-pink-400 drop-shadow-[0_0_8px_rgba(244,114,182,0.8)]",
  "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]",
];

// Stable visual properties seeded by studentId so they don't shuffle on refresh
function getVisualProps(studentId: string) {
  let hash = 0;
  for (let i = 0; i < studentId.length; i++) {
    hash = (hash * 31 + studentId.charCodeAt(i)) >>> 0;
  }
  const color = colors[hash % colors.length];
  const font = fonts[(hash >> 4) % fonts.length];
  const left = `${10 + (hash % 80)}%`;
  const top = `${10 + ((hash >> 8) % 80)}%`;
  return { color, font, left, top };
}

export default function SignatureWallPage() {
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [submissionKey, setSubmissionKey] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  const [adminKey, setAdminKey] = useState("");
  const [adminError, setAdminError] = useState("");

  // ─── Fetch from MongoDB ───────────────────────────────────────────────────
  const fetchSignatures = useCallback(async () => {
    try {
      const res = await fetch("/api/signatureWall");
      if (res.ok) {
        const data = await res.json();
        setSignatures(data);
      }
    } catch (err) {
      console.error("Failed to fetch signatures:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSignatures();
  }, [fetchSignatures]);

  // ─── Submit signature ─────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    if (!submissionKey.trim() || !newMessage.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/signatureWall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionKey, message: newMessage }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Something went wrong.");
        return;
      }

      // Refresh list to show the new/updated entry
      await fetchSignatures();
      setFormSuccess("Your signature has been posted! ✨");
      setTimeout(() => {
        setShowForm(false);
        setFormSuccess("");
        setSubmissionKey("");
        setNewMessage("");
      }, 1500);
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Admin login ──────────────────────────────────────────────────────────
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

  // ─── Delete (admin only) ──────────────────────────────────────────────────
  const deleteSignature = async (id: string) => {
    if (!window.confirm("Delete this signature?")) return;
    try {
      await fetch("/api/signatureWall", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": "Sanjay@04",
        },
        body: JSON.stringify({ id }),
      });
      await fetchSignatures();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="min-h-screen w-full bg-transparent overflow-hidden relative perspective-[1000px]">

      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "100px 50px",
        }}
      />

      {/* Loading state */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <Loader2 className="text-purple-400 animate-spin" size={48} />
        </div>
      )}

      {/* The 3D rotating wall */}
      {!loading && (
        <motion.div
          initial={{ rotateY: 10, scale: 0.9 }}
          animate={{ rotateY: [-5, 5, -5] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 transform-style-preserve-3d"
        >
          {signatures.map((sig) => {
            const { color, font, left, top } = getVisualProps(sig.studentId);
            return (
              <motion.div
                key={sig._id}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 text-center max-w-[300px] ${
                  isAdminMode ? "pointer-events-auto z-50" : "pointer-events-none"
                }`}
                style={{ left, top }}
              >
                {isAdminMode && (
                  <button
                    onClick={() => deleteSignature(sig._id)}
                    className="absolute -top-8 left-1/2 -translate-x-1/2 p-2 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-full transition-colors backdrop-blur-sm"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                <p className={`text-2xl md:text-4xl ${font} ${color} opacity-80 mix-blend-screen`}>
                  {sig.message}
                </p>
                <p className={`text-sm mt-2 text-white/50 italic ${font}`}>
                  — {sig.studentName}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Empty state */}
      {!loading && signatures.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-zinc-600 text-lg">
            No signatures yet. Be the first!
          </p>
        </div>
      )}

      {/* UI Controls */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4">
        <button
          onClick={() => setShowForm(true)}
          className="glassmorphism px-8 py-4 rounded-full text-white font-bold flex items-center gap-3 hover:bg-white/10 transition-colors shadow-[0_0_20px_rgba(168,85,247,0.4)]"
        >
          <PenTool size={20} />
          Leave a Signature
        </button>
        <button
          onClick={() =>
            isAdminMode ? setIsAdminMode(false) : setShowAdminPrompt(true)
          }
          className={`glassmorphism p-4 rounded-full transition-colors ${
            isAdminMode
              ? "bg-purple-500/30 text-purple-400"
              : "text-zinc-500 hover:text-white"
          }`}
          title="Admin Mode"
        >
          <ShieldAlert size={20} />
        </button>
      </div>

      {/* Add Signature Modal */}
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
              className="glassmorphism p-8 rounded-3xl w-full max-w-md"
            >
              <h2 className="text-2xl font-bold neon-text-purple mb-2 text-center">
                Sign the Wall
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
                    placeholder="Enter your personal key"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">
                    Message (keep it short!)
                  </label>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    maxLength={60}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 resize-none h-24"
                    placeholder="Something memorable..."
                    required
                  />
                  <p className="text-right text-xs text-zinc-500 mt-1">
                    {newMessage.length}/60
                  </p>
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
                      setNewMessage("");
                    }}
                    className="flex-1 py-3 rounded-xl border border-white/20 text-white hover:bg-white/5 transition-colors"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-purple-600 text-white hover:bg-purple-500 transition-colors shadow-[0_0_15px_rgba(168,85,247,0.5)] flex items-center justify-center gap-2"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : null}
                    {submitting ? "Posting..." : "Post"}
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
                <div className="p-3 rounded-full bg-purple-500/20 border border-purple-500/30">
                  <Lock size={24} className="text-purple-400" />
                </div>
              </div>
              <h2 className="text-xl font-bold neon-text-purple mb-6 text-center">
                Admin Access
              </h2>
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <input
                  type="password"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Admin password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-center focus:outline-none focus:border-purple-500"
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
                    className="flex-1 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-500 transition-colors"
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
