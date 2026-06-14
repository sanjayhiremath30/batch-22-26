"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Home, Users, Camera, Edit3, MessageSquare, BarChart, Lock, Trophy, Briefcase, Music, Music2, Gift, Heart } from "lucide-react";
import { useAudioStore } from "@/store/useAudioStore";

const navItems = [
  { name: "Welcome", path: "/", icon: <Home size={20} /> },
  { name: "Family", path: "/directory", icon: <Users size={20} /> },
  { name: "Signature Wall", path: "/signatures", icon: <Edit3 size={20} /> },
  { name: "Farewell Board", path: "/farewell", icon: <MessageSquare size={20} /> },
  { name: "Statistics", path: "/stats", icon: <BarChart size={20} /> },
  { name: "Capsules", path: "/capsules", icon: <Lock size={20} /> },
  { name: "Birthdays", path: "/birthdays", icon: <Gift size={20} /> },
  { name: "Batch Favorite", path: "/voting", icon: <Heart size={20} /> },
  { name: "Alumni Connect", path: "/alumni", icon: <Briefcase size={20} /> },
  { name: "Best Memories", path: "/best-memories", icon: <Camera size={20} /> },
  { name: "Admin Dashboard", path: "/admin", icon: <Lock size={20} /> },
  { name: "Signing Off 2026 🎓", path: "/ending", icon: <Camera size={20} /> },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { isPlaying, toggle } = useAudioStore();

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed top-6 right-6 z-40 p-3 rounded-full glassmorphism text-white hover:text-purple-400 transition-colors"
      >
        <Menu size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm"
          >
            <div className="w-full max-w-sm h-full bg-black border-l border-zinc-800 p-8 flex flex-col relative overflow-y-auto">
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-6 right-6 p-3 rounded-full bg-white/5 text-white hover:bg-white/10 transition-colors"
              >
                <X size={24} />
              </button>

              <h2 className="text-2xl font-bold neon-text-purple tracking-widest mt-12 mb-8">
                RYMEC
              </h2>

              <nav className="flex flex-col gap-4">
                {navItems.map((item, i) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                  >
                    <Link 
                      href={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-4 text-lg p-3 rounded-xl transition-all ${
                        pathname === item.path 
                          ? "bg-gradient-to-r from-purple-600/30 to-blue-600/30 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]" 
                          : "text-zinc-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {item.icon}
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="mt-auto pt-8 space-y-2">
                <button 
                  onClick={toggle}
                  className={`flex items-center gap-3 transition-colors p-3 w-full rounded-xl hover:bg-white/5 ${
                    isPlaying ? "text-purple-400" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {isPlaying ? <Music2 size={20} className="animate-pulse" /> : <Music size={20} />}
                  <span>{isPlaying ? "Music: ON" : "Music: OFF"}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
