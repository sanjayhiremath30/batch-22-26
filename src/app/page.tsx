"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAudioStore } from "@/store/useAudioStore";
import FloatingQuotes from "@/components/FloatingQuotes";

export default function Home() {
  const [step, setStep] = useState(0);
  const router = useRouter();
  const { play } = useAudioStore();

  const handleNext = () => {
    setStep(1);
  };

  const handleEnterJourney = () => {
    play(); // Starts the global YouTube player
    router.push("/directory");
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-transparent flex items-center justify-center">

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="welcome-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            {/* Background Image with slow zoom */}
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: 1.15 }}
              transition={{ duration: 20, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
              className="absolute inset-0 z-0"
            >
              <Image
                src="/college.jpg"
                alt="College Background"
                fill
                className="object-cover opacity-70"
                priority
              />
              <div className="absolute inset-0 bg-black/30" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            </motion.div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center text-center px-4">
              <motion.h1
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-wider neon-text-gold drop-shadow-2xl"
              >
                RAO BAHADUR Y. MAHABALESWARAPPA<br />ENGINEERING COLLEGE
              </motion.h1>
              
              <motion.h2
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="text-2xl md:text-4xl text-zinc-300 tracking-[0.2em] mb-12 font-light"
              >
                2022–2026 BATCH
              </motion.h2>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                className="glassmorphism px-8 py-3 rounded-full text-white text-lg font-medium hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                Next <span className="text-xl">→</span>
              </motion.button>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="signing-off-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black"
          >
            {/* Background Image with shading */}
            <div className="absolute inset-0 z-0">
              <Image
                src="/herobackground.png"
                alt="Hero Background"
                fill
                className="object-cover opacity-60"
                priority
              />
              <div className="absolute inset-0 bg-black/40" />
            </div>

            <FloatingQuotes />

            {/* Dynamic floating particles effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 flex justify-center items-center">
              <div className="w-[800px] h-[800px] bg-purple-900/20 rounded-full blur-[120px] animate-pulse" />
              <div className="absolute w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[100px] animate-pulse delay-1000" />
            </div>

            <div className="relative z-10 flex flex-col items-center text-center space-y-12 px-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0, filter: "blur(20px)" }}
                animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                transition={{ duration: 2, ease: "easeOut" }}
              >
                <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-purple-400 via-blue-400 to-white neon-text-purple tracking-tighter mb-2">
                  SIGNING OFF
                </h1>
                <p className="text-2xl md:text-3xl text-zinc-400 tracking-[0.3em] font-light">
                  2022–2026 BATCH
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="space-y-4 text-xl md:text-2xl text-zinc-300 font-serif italic"
              >
                <p>"Four Years.</p>
                <p>Countless Memories.</p>
                <p>One Family."</p>
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.5, duration: 1 }}
                whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(168, 85, 247, 0.5)" }}
                whileTap={{ scale: 0.95 }}
                onClick={handleEnterJourney}
                className="px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xl font-bold hover:from-purple-500 hover:to-blue-500 transition-all shadow-[0_0_15px_rgba(168,85,247,0.5)] flex items-center gap-2"
              >
                Enter Our Journey ❤️
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
