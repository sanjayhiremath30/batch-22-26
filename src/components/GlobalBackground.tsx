"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  decay: number;
  size: number;

  constructor(x: number, y: number, color: string) {
    this.x = x;
    this.y = y;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 3 + 1.5;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.color = color;
    this.alpha = 1;
    this.decay = Math.random() * 0.02 + 0.015;
    this.size = Math.random() * 1.5 + 1;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.06; // slight gravity
    this.alpha -= this.decay;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 5;
    ctx.shadowColor = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class Firecracker {
  particles: Particle[];
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.particles = [];
    const colors = [
      "#ffd700", // gold
      "#ff2a6d", // hot pink
      "#05d9e8", // neon cyan
      "#a855f7", // purple
      "#39ff14", // neon green
      "#ffffff", // white
      "#ff9900"  // orange
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const count = Math.floor(Math.random() * 25) + 20; // 20 to 45 sparks
    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(x, y, color));
    }
  }

  update() {
    this.particles.forEach((p) => p.update());
    this.particles = this.particles.filter((p) => p.alpha > 0);
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.particles.forEach((p) => p.draw(ctx));
  }

  isDone() {
    return this.particles.length === 0;
  }
}

import FloatingQuotes from "./FloatingQuotes";

export default function GlobalBackground() {
  const pathname = usePathname();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || pathname === "/") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let firecrackers: Firecracker[] = [];
    let spawnTimer = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const renderLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw firecrackers
      firecrackers.forEach((fc) => {
        fc.update();
        fc.draw(ctx);
      });
      firecrackers = firecrackers.filter((fc) => !fc.isDone());

      // Randomly spawn firecrackers
      spawnTimer++;
      if (spawnTimer > (Math.random() * 90 + 60)) { // Spawn every 1 to 2.5 seconds
        const x = Math.random() * (canvas.width * 0.8) + (canvas.width * 0.1);
        const y = Math.random() * (canvas.height * 0.6) + (canvas.height * 0.15);
        firecrackers.push(new Firecracker(x, y));
        spawnTimer = 0;
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mounted, pathname]);

  if (!mounted) return null;

  return (
    <>
      <div className="fixed inset-0 z-[-40] bg-[#050510]" />
      {/* Background Graduation Cap Image with gold/dark overlay for visual depth */}
      <div 
        className={`fixed inset-0 z-[-30] bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${
          pathname === '/ending' || pathname === '/signatures' ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          backgroundImage: "url('/herobackground.png')",
        }}
      />
      {/* Gradient Dark Backdrop Overlay - adjusted so the background graphics are visible */}
      <div className="fixed inset-0 z-[-25] bg-black/20 pointer-events-none" />
      <div className="fixed inset-0 z-[-25] bg-gradient-to-b from-transparent via-black/40 to-black/80 pointer-events-none" />

      {pathname !== "/" && <FloatingQuotes />}

      {/* Firecrackers Canvas overlay (subtle and gorgeous) */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-[-20] opacity-90"
      />
    </>
  );
}
