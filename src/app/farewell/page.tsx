"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, X, ShieldAlert, Lock, Trash2, Loader2 } from "lucide-react";

interface FarewellMessage {
  id: string;
  studentId: string;
  name: string;
  message: string;
  color: string;
  timestamp: string;
  createdAt: string;
}

const COLORS = [
  "from-purple-500 to-blue-500",
  "from-pink-500 to-rose-500",
  "from-yellow-400 to-orange-500",
  "from-green-400 to-emerald-500",
  "from-cyan-400 to-blue-500",
  "from-indigo-400 to-purple-600",
];

export default function FarewellBoardPage() {
  const [messages, setMessages] = useState<FarewellMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [submissionKey, setSubmissionKey] = useState("");
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  const [adminKey, setAdminKey] = useState("");
  const [adminError, setAdminError] = useState("");

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch("/api/farewellMessages");
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error("Failed to fetch farewell messages:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    if (!submissionKey.trim() || !message.trim()) return;

    setSubmitting(true);
    try {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const res = await fetch("/api/farewellMessages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionKey, message: message.trim(), color }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Something went wrong.");
        return;
      }

      await fetchMessages();
      setFormSuccess("Farewell posted successfully! 💜");
      setTimeout(() => {
        setShowForm(false);
        setFormSuccess("");
        setSubmissionKey("");
        setMessage("");
      }, 1500);
    } catch (err) {
      setFormError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

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

  const deleteMessage = async (id: string) => {
    if (!window.confirm("Delete this farewell message?")) return;
    try {
      await fetch("/api/farewellMessages", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": "Sanjay@04",
        },
        body: JSON.stringify({ id }),
      });
      await fetchMessages();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="min-h-screen w-full bg-transparent text-white px-4 py-20 md:px-12 lg:px-24 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-900/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-900/20 rounded-full blur-[150px] pointer-events-none" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16 relative z-10"
      >
        <h1 className="text-4xl md:text-6xl font-black neon-text-purple tracking-wider mb-4">
          FAREWELL BOARD
        </h1>
        <p className="text-xl text-zinc-400 font-light">
          Leave your heartfelt farewell to the 2022–2026 batch
        </p>
      </motion.div>

      {/* Post Button */}
      <div className="flex justify-center mb-12 relative z-10 gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)}
          className="flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold hover:from-purple-500 hover:to-blue-500 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)]"
        >
          <MessageSquare size={20} />
          Post a Farewell
        </motion.button>
        <button
          onClick={() => isAdminMode ? setIsAdminMode(false) : setShowAdminPrompt(true)}
          className={`glassmorphism p-4 rounded-full transition-colors ${isAdminMode ? 'bg-purple-500/30 text-purple-400' : 'text-zinc-500 hover:text-white'}`}
          title="Admin Mode"
        >
          <ShieldAlert size={20} />
        </button>
      </div>

      {loading && (
        <div className="flex justify-center py-20 relative z-10">
          <Loader2 className="text-purple-400 animate-spin" size={48} />
        </div>
      )}

      {/* Messages Grid */}
      {!loading && (
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: i * 0.06 }}
              className="group relative"
            >
              <div className={`absolute -inset-0.5 bg-gradient-to-br ${msg.color} rounded-2xl blur opacity-20 group-hover:opacity-50 transition duration-500`} />
              <div className="relative glassmorphism rounded-2xl p-6 h-full flex flex-col">
                {isAdminMode && (
                  <button 
                    onClick={() => deleteMessage(msg.id)}
                    className="absolute -top-3 -right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg z-20"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                <p className="text-zinc-200 text-lg leading-relaxed italic flex-1 mb-4">
                  &ldquo;{msg.message}&rdquo;
                </p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
                  <span className={`font-bold text-transparent bg-clip-text bg-gradient-to-r ${msg.color}`}>
                    — {msg.name}
                  </span>
                  <span className="text-sm text-zinc-500">{msg.timestamp}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
          {messages.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <p className="text-zinc-500 text-lg">
                No farewell messages yet. Be the first!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Post Farewell Modal */}
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

              <h2 className="text-2xl font-bold neon-text-purple mb-6 text-center">Your Farewell ❤️</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Submission Key</label>
                  <input
                    type="password"
                    value={submissionKey}
                    onChange={(e) => setSubmissionKey(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500"
                    placeholder="Enter your personal key"
                    required
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Your Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 resize-none h-28"
                    placeholder="Write your heartfelt farewell..."
                    maxLength={200}
                    required
                  />
                  <p className="text-right text-xs text-zinc-500 mt-1">{message.length}/200</p>
                </div>

                {formError && (
                  <p className="text-red-400 text-sm text-center">{formError}</p>
                )}
                {formSuccess && (
                  <p className="text-emerald-400 text-sm text-center">{formSuccess}</p>
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
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 font-bold hover:from-purple-500 hover:to-blue-500 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                    disabled={submitting}
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} 
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
              <h2 className="text-xl font-bold neon-text-purple mb-6 text-center">Admin Access</h2>
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <input 
                  type="password" 
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Admin password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-center focus:outline-none focus:border-purple-500"
                  required
                />
                {adminError && <p className="text-red-400 text-xs text-center">{adminError}</p>}
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
