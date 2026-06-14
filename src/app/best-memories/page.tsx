"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, UploadCloud, X, Lock, CheckCircle, Calendar, Plus, Images, Maximize2 } from "lucide-react";
import { useBestMemoriesStore, BestMemory } from "@/store/useBestMemoriesStore";

export default function BestMemoriesPage() {
  const { memories, fetchAll, addMemory } = useBestMemoriesStore();
  const [mounted, setMounted] = useState(false);
  
  // Upload states
  const [isUploading, setIsUploading] = useState(false);
  const [submissionKey, setSubmissionKey] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gallery modal states
  const [selectedMemory, setSelectedMemory] = useState<BestMemory | null>(null);

  useEffect(() => {
    fetchAll();
    setMounted(true);
  }, [fetchAll]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Convert all selected files to base64 strings
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImages(prev => [...prev, result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      setErrorMsg("Please select at least one image.");
      return;
    }
    setErrorMsg("");
    
    // We only have the submissionKey, but studentName will be set by the API 
    // or we can pass a dummy one for now, but wait, the API doesn't know studentName
    // We should probably just pass the studentName from the client, or let the API fetch it.
    // For now, we will let the API populate the studentId, and we pass a dummy name, 
    // OR we can change the store to pass the required data.
    
    // Actually, we pass everything to addMemory.
    const newMemory = {
      studentId: "", // Will be overwritten by API
      studentName: "Student", // Will be overwritten by API ideally, but we pass dummy
      title: title.trim(),
      description: description.trim(),
      date: date.trim(),
      images: images,
    };

    try {
      await addMemory(newMemory, submissionKey);
      setSuccessMsg(true);
      setTitle("");
      setDescription("");
      setDate("");
      setImages([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setTimeout(() => {
        setSuccessMsg(false);
        setIsUploading(false);
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-transparent text-white pt-24 pb-12 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="text-center md:text-left space-y-2">
            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 neon-text-purple tracking-tight flex items-center justify-center md:justify-start gap-4">
              <Camera className="w-10 h-10 md:w-14 md:h-14 text-blue-400" />
              BEST MEMORIES
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 font-light tracking-widest">
              UNFORGETTABLE MOMENTS OF RYMEC
            </p>
          </div>

          <button
            onClick={() => setIsUploading(!isUploading)}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 font-bold hover:from-purple-500 hover:to-blue-500 transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)] flex items-center gap-2"
          >
            {isUploading ? <X size={20} /> : <Plus size={20} />}
            {isUploading ? "Cancel Upload" : "Upload Memory"}
          </button>
        </motion.div>

        {/* Upload Form */}
        <AnimatePresence>
          {isUploading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="glassmorphism p-8 rounded-3xl border border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.15)] mb-12">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 neon-text-blue">
                  <UploadCloud className="text-blue-400" />
                  Contribute Your Memory
                </h2>

                <form onSubmit={handleUploadSubmit} className="space-y-6">
                  {/* Submission Key */}
                  <div>
                    <label className="block text-zinc-400 text-sm mb-1 font-medium">Submission Key (Required to verify you are a student) *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                      <input
                        required
                        type="password"
                        value={submissionKey}
                        onChange={e => setSubmissionKey(e.target.value)}
                        placeholder="Enter your secret submission key"
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-blue-500 transition-colors font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      {/* Title */}
                      <div>
                        <label className="block text-zinc-400 text-sm mb-1 font-medium">Memory Title *</label>
                        <input
                          required
                          value={title}
                          onChange={e => setTitle(e.target.value)}
                          placeholder="e.g. Industrial Visit to Bangalore"
                          className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                      
                      {/* Date */}
                      <div>
                        <label className="block text-zinc-400 text-sm mb-1 font-medium">Date (Optional)</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                          <input
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            placeholder="e.g. 15 June 2026"
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 pl-10 text-white focus:outline-none focus:border-blue-500 transition-colors"
                          />
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-zinc-400 text-sm mb-1 font-medium">Description *</label>
                        <textarea
                          required
                          value={description}
                          onChange={e => setDescription(e.target.value)}
                          placeholder="What made this memory special?"
                          rows={4}
                          className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none custom-scrollbar"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="block text-zinc-400 text-sm font-medium">Photos (Select multiple) *</label>
                      
                      <div className="w-full h-32 border-2 border-dashed border-blue-500/40 rounded-2xl bg-blue-500/5 hover:bg-blue-500/10 transition-colors flex flex-col items-center justify-center cursor-pointer relative"
                           onClick={() => fileInputRef.current?.click()}
                      >
                        <Images size={32} className="text-blue-400 mb-2" />
                        <p className="text-sm text-zinc-300 font-medium">Click to upload photos</p>
                        <p className="text-xs text-zinc-500 mt-1">Unlimited images allowed</p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </div>

                      {/* Image Previews */}
                      {images.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4 max-h-48 overflow-y-auto custom-scrollbar p-1">
                          {images.map((img, idx) => (
                            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group">
                              <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => removeImage(idx)}
                                className="absolute top-1 right-1 p-1 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {errorMsg && (
                    <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">{errorMsg}</p>
                  )}
                  {successMsg && (
                    <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3">
                      <CheckCircle size={18} />
                      <span className="font-medium">Memory uploaded successfully!</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 font-bold hover:from-blue-500 hover:to-purple-500 transition-all shadow-[0_0_15px_rgba(59,130,246,0.4)] flex items-center justify-center gap-2 text-lg"
                  >
                    <UploadCloud size={22} /> Publish Memory Gallery
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gallery Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {memories.map((memory, idx) => (
            <motion.div 
              key={memory.id} 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * idx }}
              onClick={() => setSelectedMemory(memory)}
              className="glassmorphism rounded-2xl overflow-hidden cursor-pointer group border border-white/10 hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all flex flex-col h-80"
            >
              {/* Cover Image */}
              <div className="relative h-48 w-full overflow-hidden shrink-0">
                {memory.images && memory.images.length > 0 ? (
                  <img
                    src={memory.images[0]}
                    alt={memory.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                    <Images size={40} className="text-zinc-700" />
                  </div>
                )}
                {/* Image Count Badge */}
                {memory.images && memory.images.length > 1 && (
                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border border-white/10">
                    <Images size={12} /> {memory.images.length}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center bg-black/40 transition-opacity duration-300">
                  <Maximize2 size={32} className="text-white drop-shadow-lg" />
                </div>
              </div>
              
              {/* Content */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-xl mb-1 line-clamp-1">{memory.title}</h3>
                  <p className="text-xs text-blue-300 font-medium">
                    📸 Uploaded by Student ID: {memory.studentId.substring(0,6)}...
                  </p>
                </div>
                {memory.date && (
                  <p className="text-xs text-zinc-500 font-medium flex items-center gap-1">
                    <Calendar size={12} /> {memory.date}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
          
          {memories.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-24 text-zinc-500 space-y-4 glassmorphism rounded-3xl border border-white/5">
              <Images size={64} className="opacity-30" />
              <p className="text-xl">No memories uploaded yet. Be the first!</p>
            </div>
          )}
        </motion.div>

        {/* Modal Detail View (Google Photos Style) */}
        <AnimatePresence>
          {selectedMemory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex bg-black/95 backdrop-blur-xl"
            >
              <button
                onClick={() => setSelectedMemory(null)}
                className="absolute top-6 right-6 z-50 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <X size={24} />
              </button>

              <div className="flex flex-col lg:flex-row w-full h-full">
                {/* Left: Photos Carousel (Scrollable vertically for now, or just a grid) */}
                <div className="flex-1 h-full overflow-y-auto p-4 md:p-12 custom-scrollbar">
                  <div className="max-w-4xl mx-auto space-y-6 pb-20 lg:pb-0">
                    {selectedMemory.images.map((img, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * idx }}
                        className="rounded-2xl overflow-hidden shadow-2xl"
                      >
                        <img src={img} alt={`Memory ${idx}`} className="w-full h-auto object-contain bg-black" />
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Right: Info Sidebar */}
                <div className="w-full lg:w-96 bg-zinc-900/50 border-l border-white/10 p-8 h-1/3 lg:h-full overflow-y-auto custom-scrollbar flex flex-col gap-6 shrink-0 rounded-t-3xl lg:rounded-none">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">{selectedMemory.title}</h2>
                    <p className="text-blue-400 font-medium text-sm flex items-center gap-2">
                      <Camera size={16} /> Uploaded by Student ID: {selectedMemory.studentId.substring(0,6)}...
                    </p>
                    {selectedMemory.date && (
                      <p className="text-zinc-500 font-medium text-sm mt-2 flex items-center gap-2">
                        <Calendar size={16} /> {selectedMemory.date}
                      </p>
                    )}
                  </div>
                  
                  <div className="bg-black/40 p-5 rounded-2xl border border-white/5 flex-1">
                    <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
                      {selectedMemory.description}
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-xs text-zinc-600 font-mono text-center">
                      Memory ID: {selectedMemory.id}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
