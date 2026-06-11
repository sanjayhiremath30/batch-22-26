"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function GrandEndingPage() {
  const [showFireworks, setShowFireworks] = useState(false);
  const [showFinalMessage, setShowFinalMessage] = useState(false);

  useEffect(() => {
    // Sequence the animations
    const t1 = setTimeout(() => setShowFireworks(true), 1500);
    const t2 = setTimeout(() => setShowFinalMessage(true), 5000);
    
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center overflow-hidden relative">
      
      {/* Background Image with slow cinematic zoom out */}
      <motion.div
        initial={{ scale: 1.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.4 }}
        transition={{ duration: 15, ease: "easeOut" }}
        className="absolute inset-0 z-0"
      >
        <Image
          src="/college.jpg"
          alt="Batch Photo"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
      </motion.div>

      {/* CSS Fireworks / Particles */}
      <AnimatePresence>
        {showFireworks && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-10 pointer-events-none"
          >
            {/* Simple CSS-based particles mimicking fireworks */}
            {Array.from({ length: 50 }).map((_, i) => (
              <motion.div
                key={`firework-${i}`}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  backgroundColor: ['#a855f7', '#3b82f6', '#fbbf24', '#f472b6'][Math.floor(Math.random() * 4)],
                  left: "50%",
                  top: "50%",
                }}
                initial={{ x: 0, y: 0, scale: 0 }}
                animate={{ 
                  x: (Math.random() - 0.5) * window.innerWidth, 
                  y: (Math.random() - 0.5) * window.innerHeight,
                  scale: [0, 1, 0],
                  opacity: [1, 1, 0]
                }}
                transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, repeatDelay: Math.random() }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Messages */}
      <div className="relative z-20 text-center px-4 flex flex-col items-center justify-center h-full space-y-16">
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2, delay: 1 }}
        >
          <h2 className="text-3xl md:text-5xl font-light text-zinc-300 tracking-[0.3em] mb-4">
            2022–2026
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 3, delay: 2.5 }}
          className="space-y-4"
        >
          <p className="text-2xl md:text-4xl text-white font-serif italic">
            "We came as strangers."
          </p>
          <p className="text-2xl md:text-4xl text-white font-serif italic">
            "We leave as family."
          </p>
        </motion.div>

        <AnimatePresence>
          {showFinalMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 3 }}
              className="mt-12 space-y-8 flex flex-col items-center"
            >
              <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-600 neon-text-gold drop-shadow-2xl px-4 text-center">
                THANK YOU FOR THE MEMORIES ❤️
              </h1>
              <p className="text-xl md:text-3xl neon-text-purple font-bold tracking-[0.2em] text-purple-300 mb-8">
                FOREVER RYMEC 2022 - 2026 batch
              </p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2, duration: 2 }}
                className="relative w-full max-w-4xl aspect-[4/3] rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.2)] border border-white/10"
              >
                <Image
                  src="/memories.jpg"
                  alt="Best of Greatest College Memories"
                  fill
                  className="object-contain bg-black/50"
                />
              </motion.div>
              {/* Copyright Credit */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 4, duration: 2 }}
                className="mt-8 text-center"
              >
                <p className="text-sm md:text-base text-zinc-500 tracking-widest">
                  © 2026 Sanjay M. All Rights Reserved.
                </p>
              </motion.div>

            </motion.div>
          )}
        </AnimatePresence>
        
      </div>
    </div>
  );
}
