"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, AtSign, Heart, Star, Users, Edit3, CheckCircle, Lock, Unlock } from "lucide-react";
import { useStudentStore } from "@/store/useStudentStore";
import { Student } from "@/data/students";

export default function ProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { students, init, update } = useStudentStore();
  const [student, setStudent] = useState<Student | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  // Authentication states
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [submissionKeyInput, setSubmissionKeyInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [verifiedKey, setVerifiedKey] = useState("");

  // Form states
  const [messageToBatch, setMessageToBatch] = useState("");
  const [favouriteMemory, setFavouriteMemory] = useState("");
  const [bestFriend, setBestFriend] = useState("");

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (!students.length) return;
    const found = students.find(s => s.id === id);
    if (found) {
      setStudent(found);
      setMessageToBatch(found.messageToBatch);
      setFavouriteMemory(found.favouriteMemory);
      setBestFriend(found.bestFriend);
    }
  }, [students, id]);

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || !verifiedKey) return;

    try {
      const res = await fetch(`/api/students/${student.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionKey: verifiedKey,
          messageToBatch,
          favouriteMemory,
          bestFriend,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        alert(errData.error || "Failed to update profile");
        return;
      }

      // Re-fetch to update local state from DB
      await init();
      setIsEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Network error. Please try again.");
    }
  };

  if (!student) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400">Loading profile…</p>
        </div>
      </div>
    );
  }

  const handleEditClick = () => {
    setShowPasswordPrompt(true);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submissionKeyInput.trim() === "") {
      setAuthError("Please enter your secret key");
      return;
    }
    setVerifiedKey(submissionKeyInput);
    setIsEditing(true);
    setShowPasswordPrompt(false);
    setAuthError("");
    setSubmissionKeyInput("");
  };

  const needsDetails = !student.messageToBatch && !student.favouriteMemory && !student.bestFriend;

  return (
    <div className="min-h-screen w-full bg-black text-white px-4 py-8 md:px-12 lg:px-24">
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => router.back()}
        className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8"
      >
        <ArrowLeft size={20} /> Back to Directory
      </motion.button>

      {/* Success toast */}
      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-full shadow-lg font-medium"
          >
            <CheckCircle size={18} /> Profile saved successfully!
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-16">
        {/* Left: Photo */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="md:col-span-5 lg:col-span-4"
        >
          <div className="relative aspect-[3/4] rounded-3xl overflow-hidden neon-glow-box">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={student.photoUrl}
              alt={student.name}
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />

            {/* Mobile name overlay */}
            <div className="absolute bottom-6 left-6 md:hidden">
              <h1 className="text-4xl font-black neon-text-purple tracking-tight">{student.name}</h1>
              <p className="text-purple-300 font-medium tracking-widest uppercase text-sm mt-1">{student.branch}</p>
            </div>
          </div>
        </motion.div>

        {/* Right: Details */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="md:col-span-7 lg:col-span-8 flex flex-col justify-center"
        >
          {/* Desktop name */}
          <div className="hidden md:block mb-10">
            <h1 className="text-5xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-blue-500 pb-4 mb-2">
              {student.name}
            </h1>
            <p className="text-xl lg:text-2xl text-zinc-300 font-light tracking-[0.2em] uppercase">
              {student.branch}
            </p>
          </div>

          <div className="glassmorphism rounded-3xl p-6 md:p-10 space-y-8">
            {/* Instagram */}
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/5 rounded-full text-pink-500 shrink-0">
                <AtSign size={24} />
              </div>
              <div>
                <p className="text-zinc-500 text-sm uppercase tracking-wider font-bold mb-1">Instagram</p>
                <a
                  href={`https://instagram.com/${student.instagramId.replace("@", "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xl text-white hover:text-pink-400 transition-colors"
                >
                  {student.instagramId}
                </a>
              </div>
            </div>

            {/* ── Needs Details → show prompt ── */}
            {needsDetails && !isEditing && !showPasswordPrompt && (
              <div className="border border-purple-500/30 bg-purple-500/10 rounded-2xl p-6 text-center">
                <p className="text-zinc-300 mb-4">
                  Are you <span className="font-bold text-white">{student.name}</span>? Add your personal memories!
                </p>
                <button
                  onClick={handleEditClick}
                  className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 font-bold hover:from-purple-500 hover:to-blue-500 transition-all flex items-center justify-center gap-2 mx-auto shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                >
                  <Edit3 size={18} /> Fill My Details
                </button>
              </div>
            )}

            {/* ── Password Prompt ── */}
            {showPasswordPrompt && (
              <div className="border border-purple-500/30 bg-purple-500/10 rounded-2xl p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-purple-500/20 border border-purple-500/30">
                    <Lock size={24} className="text-purple-400" />
                  </div>
                </div>
                <h3 className="text-xl font-bold neon-text-purple mb-2">Verify Identity</h3>
                <p className="text-zinc-300 mb-4 text-sm">Enter the password provided by the admin.</p>
                
                <form onSubmit={handlePasswordSubmit} className="max-w-sm mx-auto">
                  <input
                    type="password"
                    required
                    value={submissionKeyInput}
                    onChange={e => setSubmissionKeyInput(e.target.value)}
                    placeholder="Enter your personal secret key"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 text-center mb-3 transition-colors"
                  />
                  {authError && (
                    <p className="text-red-400 text-xs mb-3">{authError}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordPrompt(false);
                        setAuthError("");
                        setSubmissionKeyInput("");
                      }}
                      className="flex-1 py-2 rounded-xl border border-white/20 text-white hover:bg-white/5 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold transition-all shadow-[0_0_10px_rgba(168,85,247,0.4)] text-sm flex items-center justify-center gap-2"
                    >
                      <Unlock size={14} /> Verify
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ── Editing form ── */}
            {isEditing && (
              <form onSubmit={handleClaimSubmit} className="space-y-4 border-t border-white/10 pt-6">
                <h3 className="text-xl font-bold neon-text-purple">Complete Your Profile</h3>

                <div>
                  <label className="block text-zinc-400 text-sm mb-1">Message to Batch</label>
                  <textarea
                    required
                    value={messageToBatch}
                    onChange={e => setMessageToBatch(e.target.value)}
                    placeholder="What do you want to tell your batch?"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 resize-none h-20 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-sm mb-1">Favourite Memory</label>
                  <input
                    required
                    value={favouriteMemory}
                    onChange={e => setFavouriteMemory(e.target.value)}
                    placeholder="Your most unforgettable moment…"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-sm mb-1">Best Friend(s)</label>
                  <input
                    required
                    value={bestFriend}
                    onChange={e => setBestFriend(e.target.value)}
                    placeholder="Who'll you miss the most?"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-3 rounded-xl border border-white/20 hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 font-bold hover:from-purple-500 hover:to-blue-500 transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                  >
                    Save Details
                  </button>
                </div>
              </form>
            )}

            {/* ── Filled details ── */}
            {!needsDetails && !isEditing && (
              <>
                {/* Message to Batch */}
                <div className="flex gap-4">
                  <div className="p-3 bg-white/5 rounded-full text-purple-400 h-fit shrink-0">
                    <Heart size={24} />
                  </div>
                  <div>
                    <p className="text-zinc-500 text-sm uppercase tracking-wider font-bold mb-1">Message to Batch</p>
                    <p className="text-lg md:text-xl text-zinc-200 italic font-serif leading-relaxed">
                      &ldquo;{student.messageToBatch}&rdquo;
                    </p>
                  </div>
                </div>

                {/* Favourite Memory */}
                <div className="flex gap-4">
                  <div className="p-3 bg-white/5 rounded-full text-yellow-400 h-fit shrink-0">
                    <Star size={24} />
                  </div>
                  <div>
                    <p className="text-zinc-500 text-sm uppercase tracking-wider font-bold mb-1">Favourite Memory</p>
                    <p className="text-lg text-zinc-200">{student.favouriteMemory}</p>
                  </div>
                </div>

                {/* Best Friend */}
                <div className="flex gap-4">
                  <div className="p-3 bg-white/5 rounded-full text-blue-400 h-fit shrink-0">
                    <Users size={24} />
                  </div>
                  <div>
                    <p className="text-zinc-500 text-sm uppercase tracking-wider font-bold mb-1">Best Friend(s)</p>
                    <p className="text-lg text-zinc-200">{student.bestFriend}</p>
                  </div>
                </div>

                {/* Edit button */}
                <button
                  onClick={handleEditClick}
                  className="flex items-center gap-2 text-sm text-zinc-500 hover:text-purple-400 transition-colors"
                >
                  <Edit3 size={14} /> Edit my details
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
