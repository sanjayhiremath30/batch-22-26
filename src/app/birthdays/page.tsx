"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, Gift } from "lucide-react";
import { useStudentStore } from "@/store/useStudentStore";

export default function BirthdaysPage() {
  const { students, fetchAll } = useStudentStore();
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<any[]>([]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (students.length > 0) {
      const today = new Date();
      const currentYear = today.getFullYear();
      const todayDateOnly = new Date(currentYear, today.getMonth(), today.getDate());
      
      const parsedBirthdays = students
        .filter(s => s.birthday)
        .map(s => {
          let bDate = new Date(s.birthday!);
          if (isNaN(bDate.getTime())) {
            bDate = new Date(`${s.birthday} ${currentYear}`);
          }
          
          if (!isNaN(bDate.getTime())) {
            let nextBirthday = new Date(currentYear, bDate.getMonth(), bDate.getDate());
            if (nextBirthday < todayDateOnly) {
              nextBirthday = new Date(currentYear + 1, bDate.getMonth(), bDate.getDate());
            }
            
            const diffTime = Math.abs(nextBirthday.getTime() - todayDateOnly.getTime());
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
            
            return {
              student: s,
              nextBirthday,
              diffDays,
              dateString: bDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long' })
            };
          }
          return null;
        })
        .filter(b => b !== null)
        .sort((a: any, b: any) => a.diffDays - b.diffDays);

      setUpcomingBirthdays(parsedBirthdays);
      console.log("Students loaded:", students.length);
      console.log("Birthday records:", parsedBirthdays.length);
    }
  }, [students]);

  return (
    <div className="min-h-screen bg-transparent text-white pt-24 pb-12 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-purple-900/20 to-transparent pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-pink-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-400 neon-text-purple tracking-tight flex items-center justify-center gap-4">
            <Gift className="w-12 h-12 md:w-16 md:h-16 text-pink-400" />
            BIRTHDAYS
            <Gift className="w-12 h-12 md:w-16 md:h-16 text-pink-400" />
          </h1>
          <p className="text-xl md:text-2xl text-zinc-400 font-light tracking-widest">
            NEVER MISS A CELEBRATION
          </p>
        </motion.div>

        {/* Birthday List Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {upcomingBirthdays.length > 0 ? (
            upcomingBirthdays.map((b, idx) => (
              <motion.div 
                key={b.student.id} 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * idx }}
                className="glassmorphism rounded-2xl p-6 flex items-center gap-6 border border-white/10 hover:border-pink-500/50 hover:bg-white/5 transition-all hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(236,72,153,0.2)]"
              >
                <div className="relative w-20 h-20 rounded-full overflow-hidden shrink-0 border-2 border-pink-500/50 shadow-lg shadow-pink-500/20">
                  <img
                    src={b.student.photoUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + b.student.id}
                    alt={b.student.name}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      e.currentTarget.src = "/default-avatar.png";
                    }}
                  />
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-1">{b.student.name}</h3>
                  <p className="text-pink-300 font-medium flex items-center gap-2">
                    <Calendar size={16} /> {b.dateString}
                  </p>
                  <p className="text-sm font-bold mt-2 px-3 py-1 bg-white/10 w-fit rounded-full text-zinc-300">
                    {b.diffDays === 0 ? "🎉 Today!" : `In ${b.diffDays} days`}
                  </p>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-zinc-500 space-y-4">
              <Calendar size={48} className="opacity-50" />
              <p className="text-xl">No birthdays recorded yet.</p>
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
}
