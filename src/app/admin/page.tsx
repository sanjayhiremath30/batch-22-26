"use client";

import { useState, useEffect, useRef } from "react";
import { useStudentStore } from "@/store/useStudentStore";
import { useMemoryTunnelStore } from "@/store/useMemoryTunnelStore";
import { useBestMemoriesStore } from "@/store/useBestMemoriesStore";
import { Student } from "@/data/students";
import { Trash2, Plus, UploadCloud, CheckCircle, Lock, Unlock, GraduationCap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FlyingCaps = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[-10] overflow-hidden">
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            y: "110vh", 
            x: Math.random() * 100 + "vw",
            rotate: Math.random() * 360,
            opacity: 0.1 + Math.random() * 0.3
          }}
          animate={{ 
            y: "-10vh",
            rotate: Math.random() * 360,
            opacity: [0, 0.4, 0]
          }}
          transition={{ 
            duration: 10 + Math.random() * 15, 
            repeat: Infinity, 
            delay: Math.random() * 5,
            ease: "linear"
          }}
          className="absolute text-purple-400/30"
        >
          <GraduationCap size={40 + Math.random() * 40} />
        </motion.div>
      ))}
    </div>
  );
};

export default function AdminPage() {
  const { students, init, add, delete: deleteStudent } = useStudentStore();
  const { memories: tunnelMemories, init: initTunnel, addMemory, deleteMemory } = useMemoryTunnelStore();
  const { memories: bestMemories, init: initMemories, deleteMemory: deleteBestMemory } = useBestMemoriesStore();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"students" | "tunnel" | "memories" | "votes">("students");

  const [votesLeaderboard, setVotesLeaderboard] = useState<any[]>([]);

  const fetchVotesLeaderboard = async () => {
    try {
      const res = await fetch(`/api/votes?awardId=batch-favorite`);
      if (res.ok) {
        const data = await res.json();
        setVotesLeaderboard(data);
      }
    } catch (err) {
      console.error("Failed to fetch leaderboard", err);
    }
  };

  useEffect(() => {
    if (activeTab === "votes") {
      fetchVotesLeaderboard();
    }
  }, [activeTab]);

  const decrementVote = async (candidateId: string) => {
    if (!window.confirm("Are you sure you want to remove 1 vote from this candidate?")) return;
    try {
      const key = process.env.NEXT_PUBLIC_SECRET_KEY || "SanjayCSE";
      const res = await fetch(`/api/votes?candidateId=${candidateId}&awardId=batch-favorite`, {
        method: "DELETE",
        headers: {
          "x-secret-key": key
        }
      });
      if (res.ok) {
        fetchVotesLeaderboard();
      } else {
        alert("Failed to delete vote.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Form states
  const [name, setName] = useState("");
  const [branch, setBranch] = useState("");
  const [instagramId, setInstagramId] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [submissionKey, setSubmissionKey] = useState("");
  const [birthday, setBirthday] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoDataUrl, setPhotoDataUrl] = useState<string>("/college.jpg");
  const [successMsg, setSuccessMsg] = useState(false);

  // Memory Tunnel Form states
  const [tunnelYear, setTunnelYear] = useState("");
  const [tunnelText, setTunnelText] = useState("");
  const [tunnelPreview, setTunnelPreview] = useState<string | null>(null);
  const [tunnelDataUrl, setTunnelDataUrl] = useState<string>("/college.jpg");
  const [tunnelSuccessMsg, setTunnelSuccessMsg] = useState(false);
  const tunnelFileInputRef = useRef<HTMLInputElement>(null);

  // Admin Auth States
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [adminPassInput, setAdminPassInput] = useState("");
  const [adminAuthError, setAdminAuthError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    init();
    initTunnel();
    initMemories();
    setMounted(true);
  }, [init, initTunnel, initMemories]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPhotoPreview(result);
      setPhotoDataUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    const newStudent: Student = {
      id: Date.now().toString(),
      name: name.trim(),
      branch: branch.trim(),
      instagramId: instagramId.trim(),
      messageToBatch: "",
      favouriteMemory: "",
      bestFriend: "",
      photoUrl: photoDataUrl,
      editPassword: editPassword.trim(),
      submissionKey: submissionKey.trim(),
      birthday: birthday.trim(),
    };

    await add(newStudent);

    // Reset form
    setName("");
    setBranch("");
    setInstagramId("");
    setEditPassword("");
    setSubmissionKey("");
    setBirthday("");
    setPhotoPreview(null);
    setPhotoDataUrl("/college.jpg");
    if (fileInputRef.current) fileInputRef.current.value = "";

    // Show success flash
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  const handleTunnelImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setTunnelPreview(result);
      setTunnelDataUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    const newMemory = {
      id: Date.now().toString(),
      year: tunnelYear.trim(),
      text: tunnelText.trim(),
      url: tunnelDataUrl,
    };
    addMemory(newMemory, adminPassInput);

    // Reset form
    setTunnelYear("");
    setTunnelText("");
    setTunnelPreview(null);
    setTunnelDataUrl("/college.jpg");
    if (tunnelFileInputRef.current) tunnelFileInputRef.current.value = "";

    // Show success flash
    setTunnelSuccessMsg(true);
    setTimeout(() => setTunnelSuccessMsg(false), 3000);
  };

  if (!mounted) return null;

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassInput === "Sanjay@04") {
      setIsAdminAuth(true);
      setAdminAuthError("");
    } else {
      setAdminAuthError("Incorrect password");
    }
  };

  if (!isAdminAuth) {
    return (
      <div className="min-h-screen bg-transparent text-white flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glassmorphism p-8 rounded-3xl w-full max-w-md"
        >
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-purple-500/10 border border-purple-500/30">
              <Lock size={40} className="text-purple-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center mb-2 neon-text-purple">Admin Access</h2>
          <p className="text-zinc-400 text-center text-sm mb-6">Enter password to manage students</p>
          
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <input
                type="password"
                required
                value={adminPassInput}
                onChange={e => setAdminPassInput(e.target.value)}
                placeholder="Admin Password"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 text-center"
              />
              {adminAuthError && (
                <p className="text-red-400 text-xs mt-2 text-center">{adminAuthError}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 font-bold hover:from-purple-500 hover:to-blue-500 transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)] flex items-center justify-center gap-2"
            >
              <Unlock size={18} /> Login
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-white px-4 py-20 md:px-12 lg:px-24 relative overflow-hidden">
      <FlyingCaps />
      
      <div className="relative z-10">
        <h1 className="text-4xl md:text-5xl font-black neon-text-purple tracking-wider mb-8">
          ADMIN DASHBOARD
        </h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-10 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab("students")}
          className={`px-6 py-2.5 rounded-xl text-lg font-bold transition-all duration-300 ${
            activeTab === "students"
              ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]"
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          }`}
        >
          Student Batch Directory
        </button>
        <button
          onClick={() => setActiveTab("tunnel")}
          className={`px-6 py-2.5 rounded-xl text-lg font-bold transition-all duration-300 ${
            activeTab === "tunnel"
              ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]"
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          }`}
        >
          Memory Tunnel Timeline
        </button>
        <button
          onClick={() => setActiveTab("memories")}
          className={`px-6 py-2.5 rounded-xl text-lg font-bold transition-all duration-300 ${
            activeTab === "memories"
              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]"
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          }`}
        >
          Best Memories
        </button>
        <button
          onClick={() => setActiveTab("votes")}
          className={`px-6 py-2.5 rounded-xl text-lg font-bold transition-all duration-300 ${
            activeTab === "votes"
              ? "bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.3)]"
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          }`}
        >
          Manage Votes
        </button>
      </div>

      {activeTab === "students" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-fadeIn">
          {/* ─── Left: Add Student Form ─── */}
          <div className="glassmorphism p-8 rounded-3xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Plus className="text-purple-400" />
              Add New Student Shell
            </h2>

            <form onSubmit={handleAddStudent} className="space-y-5">
              {/* Photo Upload */}
              <div className="space-y-2">
                <label className="block text-zinc-400 text-sm">Student Photo</label>

                {/* Preview — object-contain keeps full face visible */}
                <div className="relative w-full h-64 rounded-2xl overflow-hidden border border-white/10 bg-zinc-900 flex items-center justify-center">
                  {photoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-zinc-500">
                      <UploadCloud size={40} className="mb-2 opacity-40" />
                      <p className="text-sm">No photo selected</p>
                      <p className="text-xs text-zinc-600 mt-1">Click below to upload</p>
                    </div>
                  )}
                </div>

                {/* Upload Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-purple-500/50 text-purple-400 hover:border-purple-400 hover:bg-purple-500/10 transition-all font-medium"
                >
                  <UploadCloud size={20} />
                  {photoPreview ? "Change Photo" : "Upload Photo"}
                </button>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              {/* Name & Branch */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 text-sm mb-1">Full Name *</label>
                  <input
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Ravi Kumar"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-sm mb-1">Branch *</label>
                  <input
                    required
                    value={branch}
                    onChange={e => setBranch(e.target.value)}
                    placeholder="e.g. CSE"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Instagram */}
                <div>
                  <label className="block text-zinc-400 text-sm mb-1">Instagram ID *</label>
                  <input
                    required
                    value={instagramId}
                    onChange={e => setInstagramId(e.target.value)}
                    placeholder="@username"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                {/* Individual Password */}
                <div>
                  <label className="block text-zinc-400 text-sm mb-1">Student Password *</label>
                  <input
                    required
                    value={editPassword}
                    onChange={e => setEditPassword(e.target.value)}
                    placeholder="Set secret password"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Submission Key */}
                <div>
                  <label className="block text-zinc-400 text-sm mb-1">
                    Submission Key *
                    <span className="ml-2 text-xs text-purple-400">(used by student)</span>
                  </label>
                  <input
                    required
                    value={submissionKey}
                    onChange={e => setSubmissionKey(e.target.value)}
                    placeholder="e.g. RaviCSE2026"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 transition-colors font-mono"
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-zinc-400 text-sm mb-1">
                    Date of Birth
                  </label>
                  <input
                    value={birthday}
                    onChange={e => setBirthday(e.target.value)}
                    placeholder="e.g. 15 June"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 font-bold hover:from-purple-500 hover:to-blue-500 transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)] mt-2 flex items-center justify-center gap-2"
              >
                <Plus size={20} /> Add to Family
              </button>

              {/* Success message */}
              <AnimatePresence>
                {successMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3"
                  >
                    <CheckCircle size={18} />
                    <span className="font-medium">Student added! Now visible in the Family directory.</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>

          {/* ─── Right: Student List ─── */}
          <div className="glassmorphism p-8 rounded-3xl flex flex-col h-[650px]">
            <h2 className="text-2xl font-bold mb-6">
              Manage Students&nbsp;
              <span className="text-purple-400">({students.length}/75)</span>
            </h2>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              <AnimatePresence>
                {students.map((student, i) => (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5 hover:border-purple-500/30 transition-colors"
                  >
                    <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 border border-white/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={student.photoUrl}
                        alt={student.name}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg truncate">{student.name}</h3>
                      <p className="text-sm text-zinc-400 truncate">{student.branch}</p>
                      <p className="text-xs text-zinc-600 truncate">{student.instagramId}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          student.messageToBatch
                            ? "bg-emerald-400"
                            : "bg-zinc-600"
                        }`}
                        title={student.messageToBatch ? "Profile filled" : "Awaiting self-fill"}
                      />
                      <button
                         onClick={async () => {
                           if (window.confirm(`Delete ${student.name} from the batch?`)) {
                             // Use the mapped string id for deletion
                             const delId = student.id;
                             if (!delId) {
                               alert('Unable to delete: missing student ID');
                               return;
                             }
                             await deleteStudent(delId);
                           }
                         }}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-400 hover:text-white hover:bg-red-500 rounded-xl transition-all font-medium border border-red-500/30 hover:border-red-500 shrink-0"
                      >
                        <Trash2 size={15} /> Delete
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {students.length === 0 && (
                <div className="text-center text-zinc-500 py-16">
                  <UploadCloud size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No students yet. Add your first batch member!</p>
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 pt-4 mt-4 border-t border-white/10 text-xs text-zinc-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                Profile filled
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-zinc-600 inline-block" />
                Awaiting self-fill
              </span>
            </div>
          </div>
        </div>
      )}

      {activeTab === "tunnel" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-fadeIn">
          {/* ─── Left: Add Memory Event Form ─── */}
          <div className="glassmorphism p-8 rounded-3xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Plus className="text-purple-400" />
              Add New Memory Event
            </h2>

            <form onSubmit={handleAddMemory} className="space-y-5">
              {/* Photo Upload */}
              <div className="space-y-2">
                <label className="block text-zinc-400 text-sm">Event Photo</label>

                {/* Preview */}
                <div className="relative w-full h-64 rounded-2xl overflow-hidden border border-white/10 bg-zinc-900 flex items-center justify-center">
                  {tunnelPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={tunnelPreview}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-zinc-500">
                      <UploadCloud size={40} className="mb-2 opacity-40" />
                      <p className="text-sm">No photo selected</p>
                      <p className="text-xs text-zinc-600 mt-1">Click below to upload</p>
                    </div>
                  )}
                </div>

                {/* Upload Button */}
                <button
                  type="button"
                  onClick={() => tunnelFileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-purple-500/50 text-purple-400 hover:border-purple-400 hover:bg-purple-500/10 transition-all font-medium"
                >
                  <UploadCloud size={20} />
                  {tunnelPreview ? "Change Photo" : "Upload Photo"}
                </button>

                {/* Hidden file input */}
                <input
                  ref={tunnelFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleTunnelImageChange}
                  className="hidden"
                />
              </div>

              {/* Year & Text */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-zinc-400 text-sm mb-1">Event Year *</label>
                  <input
                    required
                    value={tunnelYear}
                    onChange={e => setTunnelYear(e.target.value)}
                    placeholder="e.g. 2022"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-zinc-400 text-sm mb-1">Event Detail *</label>
                  <input
                    required
                    value={tunnelText}
                    onChange={e => setTunnelText(e.target.value)}
                    placeholder="e.g. Freshers Party / First Day of College"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 font-bold hover:from-purple-500 hover:to-blue-500 transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)] mt-2 flex items-center justify-center gap-2"
              >
                <Plus size={20} /> Add to Memory Tunnel
              </button>

              {/* Success message */}
              <AnimatePresence>
                {tunnelSuccessMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3"
                  >
                    <CheckCircle size={18} />
                    <span className="font-medium">Memory added! Go check it out in the Memory Tunnel.</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>

          {/* ─── Right: Manage Memory Events List ─── */}
          <div className="glassmorphism p-8 rounded-3xl flex flex-col h-[650px]">
            <h2 className="text-2xl font-bold mb-6 flex items-center justify-between">
              <span>Timeline Events</span>
              <span className="text-purple-400 text-base font-normal">({tunnelMemories.length} total)</span>
            </h2>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              <AnimatePresence>
                {tunnelMemories.map((mem, i) => (
                  <motion.div
                    key={mem.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5 hover:border-purple-500/30 transition-colors"
                  >
                    <div className="relative w-16 h-12 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-zinc-900 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={mem.url}
                        alt={mem.text}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs px-2.5 py-0.5 rounded-full font-bold">
                          {mem.year}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-300 font-medium truncate mt-1">{mem.text}</p>
                    </div>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete "${mem.year} - ${mem.text}" from the timeline?`)) {
                          deleteMemory(mem.id, adminPassInput);
                        }
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-400 hover:text-white hover:bg-red-500 rounded-xl transition-all font-medium border border-red-500/30 hover:border-red-500 shrink-0"
                    >
                      <Trash2 size={15} /> Delete
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {tunnelMemories.length === 0 && (
                <div className="text-center text-zinc-500 py-16">
                  <UploadCloud size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No events in the timeline yet. Add some memories!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "memories" && (
        <div className="glassmorphism p-8 rounded-3xl flex flex-col h-[650px] animate-fadeIn">
          <h2 className="text-2xl font-bold mb-6 flex items-center justify-between">
            <span>Manage Best Memories</span>
            <span className="text-purple-400 text-base font-normal">({bestMemories.length} total)</span>
          </h2>
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            <AnimatePresence>
              {bestMemories.map((mem, i) => (
                <motion.div
                  key={mem.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5 hover:border-blue-500/30 transition-colors"
                >
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-zinc-900 flex items-center justify-center">
                    {mem.images && mem.images.length > 0 ? (
                      <img src={mem.images[0]} alt={mem.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-zinc-500">No Image</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg truncate">{mem.title}</h3>
                    <p className="text-sm text-zinc-400 truncate">Uploaded by ID: {mem.studentId.substring(0, 8)}...</p>
                    <p className="text-xs text-zinc-500">{mem.images?.length || 0} Images</p>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete "${mem.title}" memory gallery?`)) {
                        deleteBestMemory(mem.id);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-400 hover:text-white hover:bg-red-500 rounded-xl transition-all font-medium border border-red-500/30 hover:border-red-500 shrink-0"
                  >
                    <Trash2 size={15} /> Delete
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            {bestMemories.length === 0 && (
              <div className="text-center text-zinc-500 py-16">
                <p>No Best Memories uploaded yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "votes" && (
        <div className="glassmorphism p-8 rounded-3xl flex flex-col h-[650px] animate-fadeIn">
          <h2 className="text-2xl font-bold mb-6 flex items-center justify-between">
            <span>Manage Batch Favorite Votes</span>
          </h2>
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            <AnimatePresence>
              {votesLeaderboard.map((item, i) => {
                const s = students.find(stu => stu.id === item.candidateId);
                if (!s) return null;
                return (
                  <motion.div
                    key={item.candidateId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-pink-500/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-bold w-6 text-zinc-400">#{i + 1}</span>
                      <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-white/10">
                        <img src={s.photoUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + s.id} alt={s.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold">{s.name}</p>
                        <p className="text-sm text-pink-400 font-bold">{item.count} Votes</p>
                      </div>
                    </div>
                    <button
                      onClick={() => decrementVote(item.candidateId)}
                      className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-400 hover:text-white hover:bg-red-500 rounded-xl transition-all font-medium border border-red-500/30 hover:border-red-500 shrink-0"
                    >
                      <Trash2 size={15} /> -1 Vote
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {votesLeaderboard.length === 0 && (
              <div className="text-center text-zinc-500 py-16">
                <p>No votes cast yet.</p>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
