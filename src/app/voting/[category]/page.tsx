"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Heart, Lock, Search } from "lucide-react";
import { useStudentStore } from "@/store/useStudentStore";
import { AWARD_CATEGORIES } from "@/types/voting";
import { Student } from "@/data/students";

export default function VotingCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.category as string;
  
  const { students, fetchAll } = useStudentStore();
  
  const [award] = useState(AWARD_CATEGORIES.find(a => a.id === categoryId));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Student | null>(null);
  const [submissionKey, setSubmissionKey] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  if (!award) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">Award not found.</div>;
  }

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
          awardId: categoryId,
          candidateId: selectedCandidate?.id,
          submissionKey
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          setIsModalOpen(false);
          router.push('/voting');
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

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4 relative overflow-hidden">
      
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-8">
        
        <button onClick={() => router.back()} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft size={20} /> Back to Voting Dashboard
        </button>

        <div className="text-center space-y-4">
          <motion.h1 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 uppercase tracking-widest"
          >
            {award.title}
          </motion.h1>
          <p className="text-xl text-zinc-400">Select a student to cast your vote</p>
        </div>

        <div className="glassmorphism rounded-2xl p-6 border border-white/5 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
            <input 
              type="text" 
              placeholder="Search student by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors text-lg"
            />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar pb-10">
            {filteredStudents.map((student) => (
              <div key={student.id} className="flex flex-col p-4 rounded-3xl bg-white/5 border border-white/5 hover:border-blue-500/50 hover:bg-white/10 transition-all group">
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-4 border-2 border-white/10 group-hover:border-blue-500/30 transition-colors shadow-lg">
                  <img 
                    src={student.photoUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + student.id} 
                    alt={student.name} 
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" 
                    onError={(e) => { e.currentTarget.src = "/default-avatar.png"; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <div className="flex flex-col flex-1 text-center justify-between">
                  <span className="font-bold text-lg mb-4 line-clamp-2">{student.name}</span>
                  
                  <button 
                    onClick={() => handleVoteClick(student)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-500/20 text-blue-300 font-bold hover:bg-blue-500 hover:text-white transition-all hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]"
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
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                    <img 
                      src={selectedCandidate.photoUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + selectedCandidate.id} 
                      alt={selectedCandidate.name} 
                      className="object-cover w-full h-full" 
                      onError={(e) => { e.currentTarget.src = "/default-avatar.png"; }}
                    />
                  </div>
                  <p className="text-xl font-medium">{selectedCandidate.name}</p>
                  <p className="text-blue-400 font-bold uppercase tracking-widest text-sm">For {award.title}</p>
                </div>

                {success ? (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-4 bg-green-500/20 text-green-400 rounded-xl font-medium border border-green-500/30"
                  >
                    Vote submitted successfully! 🎉
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
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                    
                    {error && <p className="text-red-400 text-sm text-left">{error}</p>}
                    
                    <button 
                      onClick={submitVote}
                      disabled={isSubmitting}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 font-bold text-white hover:from-blue-500 hover:to-purple-500 transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Vote ❤️"}
                    </button>
                    <p className="text-xs text-zinc-500 text-center">
                      Only 1 vote allowed per category. You cannot vote for yourself.
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
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.5);
        }
      `}</style>
    </div>
  );
}
