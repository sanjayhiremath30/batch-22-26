"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Trophy, Medal, Lock, Search } from "lucide-react";
import { useStudentStore } from "@/store/useStudentStore";
import { Student } from "@/data/students";

const CATEGORY_ID = "batch-favorite";

export default function BatchFavoriteVotingPage() {
  const { students, fetchAll } = useStudentStore();
  
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Student | null>(null);
  const [submissionKey, setSubmissionKey] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchAll();
    fetchLeaderboard();
    
    // Auto refresh every 5 seconds for live updates
    const interval = setInterval(fetchLeaderboard, 5000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`/api/votes?awardId=${CATEGORY_ID}`);
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data);
      }
    } catch (err) {
      console.error("Failed to fetch leaderboard", err);
    }
  };

  const handleVoteClick = (student: Student) => {
    setSelectedCandidate(student);
    setIsModalOpen(true);
    setError("");
    setSuccess(false);
    setSubmissionKey("");
  };

  const submitVote = async () => {
    if (!submissionKey.trim()) {
      setError("Please enter your submission key.");
      return;
    }
    
    setIsSubmitting(true);
    setError("");
    
    try {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          awardId: CATEGORY_ID,
          candidateId: selectedCandidate?.id,
          submissionKey
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setSuccess(true);
        fetchLeaderboard(); // Immediately update the leaderboard and podium
        setTimeout(() => {
          setIsModalOpen(false);
        }, 2000);
      } else {
        setError(data.error || "Failed to submit vote.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get Top 3 students
  const getTopStudent = (rank: number) => {
    if (leaderboard.length < rank) return null;
    const item = leaderboard[rank - 1];
    const student = students.find(s => s.id === item.candidateId);
    return student ? { student, votes: item.count } : null;
  };

  const top1 = getTopStudent(1);
  const top2 = getTopStudent(2);
  const top3 = getTopStudent(3);

  const renderPodiumItem = (data: { student: any, votes: number } | null, rank: 1 | 2 | 3) => {
    if (!data) return (
      <div className={`flex flex-col items-center justify-end ${rank === 1 ? 'h-64' : rank === 2 ? 'h-48' : 'h-40'} opacity-30`}>
        <div className={`w-24 ${rank === 1 ? 'h-32' : rank === 2 ? 'h-24' : 'h-20'} glassmorphism rounded-t-xl`} />
      </div>
    );
    
    const { student, votes } = data;
    
    const heightClass = rank === 1 ? "h-32 md:h-40" : rank === 2 ? "h-24 md:h-28" : "h-20 md:h-24";
    const crownColor = rank === 1 ? "text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" 
                      : rank === 2 ? "text-slate-300 drop-shadow-[0_0_10px_rgba(203,213,225,0.8)]" 
                      : "text-amber-600 drop-shadow-[0_0_10px_rgba(217,119,6,0.8)]";
    
    return (
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: rank * 0.2 }}
        className={`flex flex-col items-center justify-end ${rank === 1 ? 'order-2 z-20' : rank === 2 ? 'order-1 z-10' : 'order-3 z-10'}`}
      >
        <div className="relative mb-4 flex flex-col items-center">
          {rank === 1 ? <Trophy className={`w-8 h-8 md:w-10 md:h-10 mb-2 ${crownColor}`} /> : <Medal className={`w-6 h-6 md:w-8 md:h-8 mb-2 ${crownColor}`} />}
          <div className={`relative ${rank === 1 ? 'w-24 h-24 md:w-32 md:h-32 border-yellow-400' : 'w-20 h-20 md:w-24 md:h-24 border-white/20'} rounded-full overflow-hidden border-4 shadow-xl`}>
            <Image
              src={student.photoUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + student.id}
              alt={student.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="mt-4 text-center glassmorphism px-4 py-2 rounded-xl">
            <p className="font-bold text-sm md:text-lg whitespace-nowrap text-white">{student.name.split(' ')[0]}</p>
            <p className="text-pink-400 text-xs md:text-sm font-bold flex items-center justify-center gap-1 mt-1">
              <Heart className="w-3 h-3 md:w-4 md:h-4 fill-pink-400" /> {votes} Votes
            </p>
          </div>
        </div>
        <div className={`w-24 md:w-32 ${heightClass} bg-gradient-to-t ${rank === 1 ? 'from-yellow-900/80 to-yellow-600/50 border-yellow-500/50' : rank === 2 ? 'from-slate-900/80 to-slate-600/50 border-slate-500/50' : 'from-amber-900/80 to-amber-700/50 border-amber-600/50'} rounded-t-xl border-t border-l border-r flex items-start justify-center pt-2 md:pt-4`}>
          <span className="text-3xl md:text-5xl font-black text-white/50">{rank}</span>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-transparent text-white pt-24 pb-12 px-4 relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-pink-900/20 to-transparent pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-pink-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-16 relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-400 neon-text-purple tracking-tight flex items-center justify-center gap-4">
            <Heart className="w-12 h-12 md:w-16 md:h-16 text-pink-400 fill-pink-400" />
            BATCH FAVORITE
            <Heart className="w-12 h-12 md:w-16 md:h-16 text-pink-400 fill-pink-400" />
          </h1>
          <p className="text-xl md:text-2xl text-zinc-400 font-light tracking-widest">
            VOTE FOR YOUR FAVORITE BATCHMATE
          </p>
        </motion.div>

        {/* Podium Section */}
        {leaderboard.length > 0 && (
          <div className="flex justify-center items-end gap-4 md:gap-12 pt-12 pb-8">
            {renderPodiumItem(top2, 2)}
            {renderPodiumItem(top1, 1)}
            {renderPodiumItem(top3, 3)}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8 border-t border-white/10">
          
          {/* Leaderboard Column */}
          <div className="lg:col-span-1 glassmorphism rounded-3xl p-6 md:p-8 h-fit border border-white/5 shadow-[0_0_30px_rgba(236,72,153,0.1)]">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-pink-300 border-b border-white/10 pb-4">
              <Trophy size={28} className="text-pink-400" /> Live Leaderboard
            </h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {leaderboard.length > 0 ? (
                leaderboard.map((item, index) => {
                  const s = students.find(stu => stu.id === item.candidateId);
                  if (!s) return null;
                  return (
                    <div key={item.candidateId} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className={`font-black w-6 text-center ${index < 3 ? 'text-pink-400 text-lg' : 'text-zinc-500'}`}>
                          #{index + 1}
                        </span>
                        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/10 shrink-0">
                          <Image src={s.photoUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + s.id} alt={s.name} fill className="object-cover" />
                        </div>
                        <span className="font-medium text-sm md:text-base truncate max-w-[100px] md:max-w-[140px]">{s.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-pink-400 font-bold bg-pink-500/10 px-3 py-1 rounded-full text-sm">
                        {item.count} <Heart className="w-3 h-3 fill-pink-400" />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 space-y-4">
                  <Trophy size={48} className="mx-auto text-zinc-700" />
                  <p className="text-zinc-500">No votes cast yet. Be the first!</p>
                </div>
              )}
            </div>
          </div>

          {/* Voting Grid Column */}
          <div className="lg:col-span-2 glassmorphism rounded-3xl p-6 md:p-8 border border-white/5 shadow-[0_0_30px_rgba(236,72,153,0.1)]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-white/10 pb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Heart size={28} className="text-pink-400 fill-pink-400/20" /> Cast Your Vote
              </h2>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-pink-500 transition-colors"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredStudents.map((student) => (
                <div key={student.id} className="flex flex-col p-4 rounded-3xl bg-white/5 border border-white/5 hover:border-pink-500/50 hover:bg-white/10 transition-all group">
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-4 border border-white/10 group-hover:border-pink-500/30 transition-colors shadow-lg">
                    <Image 
                      src={student.photoUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + student.id} 
                      alt={student.name} 
                      fill 
                      className="object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  
                  <div className="flex flex-col flex-1 text-center justify-between">
                    <span className="font-bold text-sm md:text-base mb-4 line-clamp-2 leading-tight">{student.name}</span>
                    
                    <button 
                      onClick={() => handleVoteClick(student)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-pink-500/20 text-pink-300 font-bold hover:bg-pink-500 hover:text-white transition-all hover:shadow-[0_0_15px_rgba(236,72,153,0.5)]"
                    >
                      <Heart className="w-4 h-4" /> Vote
                    </button>
                  </div>
                </div>
              ))}
              
              {filteredStudents.length === 0 && (
                <p className="col-span-full text-center py-20 text-zinc-500 text-xl">No students found matching your search.</p>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Voting Modal */}
      <AnimatePresence>
        {isModalOpen && selectedCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glassmorphism w-full max-w-md p-8 rounded-3xl border border-white/10 shadow-2xl relative"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white"
              >
                ✕
              </button>
              
              <div className="text-center space-y-6">
                <h3 className="text-2xl font-bold">Confirm Your Vote</h3>
                
                <div className="flex flex-col items-center gap-3">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-pink-500/50 shadow-[0_0_30px_rgba(236,72,153,0.3)]">
                    <Image 
                      src={selectedCandidate.photoUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + selectedCandidate.id} 
                      alt={selectedCandidate.name} 
                      fill 
                      className="object-cover" 
                    />
                  </div>
                  <p className="text-2xl font-bold mt-2">{selectedCandidate.name}</p>
                  <p className="text-pink-400 font-bold uppercase tracking-widest text-sm">Batch Favorite 2026</p>
                </div>

                {success ? (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-4 bg-green-500/20 text-green-400 rounded-xl font-medium border border-green-500/30 text-lg"
                  >
                    Vote recorded! 🎉
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                      <input 
                        type="password" 
                        value={submissionKey}
                        onChange={(e) => setSubmissionKey(e.target.value)}
                        placeholder="Enter your Submission Key"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-pink-500 transition-colors text-lg"
                      />
                    </div>
                    
                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                    
                    <button 
                      onClick={submitVote}
                      disabled={isSubmitting}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 font-bold text-white hover:from-pink-500 hover:to-purple-500 transition-all disabled:opacity-50 text-lg flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? "Submitting..." : <><Heart className="w-5 h-5 fill-white" /> Submit Vote</>}
                    </button>
                    <p className="text-sm text-zinc-500 text-center">
                      Only 1 vote allowed per student. You cannot vote for yourself.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(236, 72, 153, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(236, 72, 153, 0.4);
        }
      `}</style>
    </div>
  );
}
