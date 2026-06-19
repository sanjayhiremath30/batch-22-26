"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, ExternalLink, Globe, MapPin, Plus, Loader2, X, Trash2, ShieldAlert, Lock } from "lucide-react";
import Image from "next/image";

interface AlumniRecord {
  _id: string;
  studentId: string;
  name: string;
  photoUrl: string;
  role: string;
  company: string;
  location: string;
  linkedin: string;
  website: string;
}

export default function AlumniConnectPage() {
  const [alumni, setAlumni] = useState<AlumniRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [submissionKey, setSubmissionKey] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [website, setWebsite] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  const [adminKey, setAdminKey] = useState("");
  const [adminError, setAdminError] = useState("");

  // ─── Fetch from MongoDB ───────────────────────────────────────────────────
  const fetchAlumni = useCallback(async () => {
    try {
      const res = await fetch("/api/alumni");
      if (res.ok) {
        const data = await res.json();
        setAlumni(data);
      }
    } catch (err) {
      console.error("Failed to fetch alumni:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlumni();
  }, [fetchAlumni]);

  // ─── Submit alumni record ──────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    if (!submissionKey.trim() || !role.trim() || !company.trim() || !location.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/alumni", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionKey, role, company, location, linkedin, website }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Something went wrong.");
        return;
      }

      await fetchAlumni();
      setFormSuccess("Profile updated! 🚀");
      setTimeout(() => {
        setShowForm(false);
        setFormSuccess("");
        setSubmissionKey("");
        setRole("");
        setCompany("");
        setLocation("");
        setLinkedin("");
        setWebsite("");
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

  const deleteAlumni = async (id: string) => {
    if (!window.confirm("Delete this alumni record?")) return;
    try {
      await fetch("/api/alumni", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": "Sanjay@04",
        },
        body: JSON.stringify({ id }),
      });
      await fetchAlumni();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="min-h-screen w-full bg-transparent text-white px-4 py-20 md:px-12 lg:px-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-900/15 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-900/15 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 relative z-10"
      >
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-full bg-blue-500/10 border border-blue-500/30">
            <Briefcase size={40} className="text-blue-400" />
          </div>
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-wider mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          ALUMNI CONNECT
        </h1>
        <p className="text-xl text-zinc-400 font-light">
          Where the 2022–2026 batch lands — building the future, one role at a time
        </p>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex justify-center mb-12 relative z-10 gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)}
          className="flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 font-bold hover:from-blue-500 hover:to-purple-500 transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)]"
        >
          <Plus size={20} /> Update Profile
        </motion.button>
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

      {loading && (
        <div className="flex justify-center py-20 relative z-10">
          <Loader2 className="text-blue-400 animate-spin" size={48} />
        </div>
      )}

      {/* Alumni Grid */}
      {!loading && (
        <div className="max-w-6xl mx-auto relative z-10">
          {alumni.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {alumni.map((alum, i) => (
                  <motion.div
                    key={alum._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="group relative"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
                    <div className="relative glassmorphism rounded-2xl p-6 flex flex-col h-full">
                      {isAdminMode && (
                        <button
                          onClick={() => deleteAlumni(alum._id)}
                          className="absolute -top-3 -right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg z-20"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="relative w-14 h-14 rounded-full overflow-hidden border border-white/20 shrink-0">
                          {alum.photoUrl ? (
                            <Image
                              src={alum.photoUrl}
                              alt={alum.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl font-black shrink-0">
                              {alum.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{alum.name}</h3>
                          <p className="text-blue-400 text-sm font-medium">{alum.role}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 text-zinc-300">
                          <Briefcase size={14} className="text-purple-400" />
                          <span className="text-sm">{alum.company}</span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-300">
                          <MapPin size={14} className="text-purple-400" />
                          <span className="text-sm">{alum.location}</span>
                        </div>
                      </div>

                      {(alum.linkedin || alum.website) && (
                        <div className="flex gap-3 mt-6 pt-4 border-t border-white/10">
                          {alum.linkedin && (
                            <a
                              href={alum.linkedin}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 px-3 py-1.5 rounded-full"
                            >
                              LinkedIn <ExternalLink size={12} />
                            </a>
                          )}
                          {alum.website && (
                            <a
                              href={alum.website}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors bg-purple-500/10 px-3 py-1.5 rounded-full"
                            >
                              Portfolio <Globe size={12} />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="max-w-2xl mx-auto glassmorphism rounded-3xl p-8 text-center mb-16 border border-blue-500/20"
            >
              <div className="text-5xl mb-4">🚀</div>
              <h2 className="text-2xl font-bold text-blue-400 mb-3">This page unlocks after graduation!</h2>
              <p className="text-zinc-400 leading-relaxed">
                Once the batch officially signs off, alumni will be able to update their profiles with where they&apos;ve landed —
                job, company, city, and more.
              </p>
            </motion.div>
          )}
        </div>
      )}

      {/* Update Profile Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glassmorphism p-8 rounded-3xl w-full max-w-md relative my-8"
            >
              <button
                onClick={() => setShowForm(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
              <h2 className="text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Update Alumni Profile
              </h2>
              <p className="text-zinc-500 text-sm mb-6">
                Enter your secret key. Your name and photo will be synced automatically.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Secret Key *</label>
                  <input
                    type="password"
                    value={submissionKey}
                    onChange={(e) => setSubmissionKey(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                    placeholder="Enter your personal key"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Role / Title *</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                    placeholder="e.g. Software Engineer"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Company / Institution *</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                    placeholder="e.g. Google, XYZ Startup, or Masters Student"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Location *</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                    placeholder="e.g. Bengaluru, India"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">LinkedIn URL (Optional)</label>
                  <input
                    type="url"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-sm mb-2">Portfolio / Website (Optional)</label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
                    placeholder="https://..."
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

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setFormError("");
                    }}
                    className="flex-1 py-3 rounded-xl border border-white/20 hover:bg-white/5 transition-colors"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 font-bold hover:from-blue-500 hover:to-purple-500 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Briefcase size={16} />
                    )}
                    {submitting ? "Saving..." : "Save Profile"}
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
