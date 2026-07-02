/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface ConfettiProps {
  active: boolean;
  duration?: number; // duration of active burst in ms
  onComplete?: () => void;
}

interface Particle {
  id: number;
  x: number; // initial percentage from left (0 to 100)
  y: number; // initial percentage from top (usually 100 to shoot up, or -10 to drop down)
  targetX: number; // horizontal drift offset
  targetY: number; // vertical drop
  scale: number;
  color: string;
  shape: "circle" | "square" | "triangle" | "heart";
  rotateStart: number;
  rotateEnd: number;
  duration: number;
  delay: number;
}

const PALETTE = [
  "#f43f5e", // Rose 500
  "#ec4899", // Pink 500
  "#f59e0b", // Amber 500
  "#10b981", // Emerald 500
  "#8b5cf6", // Violet 500
  "#fb7185", // Rose 400
  "#fcd34d", // Amber 300
  "#d946ef", // Fuchsia 500
  "#c5a880", // Premium Gold
];

const SHAPES: ("circle" | "square" | "triangle" | "heart")[] = [
  "circle",
  "square",
  "triangle",
  "heart",
];

export default function Confetti({ active, duration = 6000, onComplete }: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    // Generate a beautiful, dense set of confetti particles
    const newParticles: Particle[] = [];
    const count = 120; // Perfect dense amount without lagging

    for (let i = 0; i < count; i++) {
      const isLeftLauncher = i % 2 === 0;
      
      // Start from the bottom corners or bottom center to create a majestic "blast" effect
      const startX = isLeftLauncher ? -5 : 105;
      const startY = 80; // Shoot up from the bottom-ish sides
      
      // Target locations across the screen
      const targetX = isLeftLauncher
        ? Math.random() * 80 + 10 // Blast rightwards
        : Math.random() * 80 - 10; // Blast leftwards
      const targetY = Math.random() * 90 + 5; // Land somewhere vertically

      newParticles.push({
        id: i,
        x: startX,
        y: startY,
        targetX,
        targetY,
        scale: Math.random() * 0.7 + 0.5,
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
        rotateStart: Math.random() * 360,
        rotateEnd: Math.random() * 1080 + 360,
        duration: Math.random() * 2.5 + 2.0, // seconds
        delay: Math.random() * 0.4, // stagger launch
      });
    }

    setParticles(newParticles);

    // Automatically call complete after duration
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, duration);

    return () => clearTimeout(timer);
  }, [active, duration, onComplete]);

  if (!active) return null;

  return (
    <div id="confetti-container" className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {particles.map((p) => {
          // Render based on shape
          return (
            <motion.div
              key={p.id}
              initial={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                scale: 0,
                rotate: p.rotateStart,
                opacity: 0,
              }}
              animate={{
                left: `${p.targetX}%`,
                top: [`${p.y - 45}%`, `${p.targetY}%`], // elegant parabola arch
                scale: p.scale,
                rotate: p.rotateEnd,
                opacity: [0, 1, 1, 0.8, 0], // fades out near the end
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                ease: "easeOut",
              }}
              className="absolute pointer-events-none"
              style={{
                width: p.shape === "heart" ? "16px" : "12px",
                height: p.shape === "heart" ? "16px" : "12px",
              }}
            >
              {p.shape === "circle" && (
                <div
                  className="w-full h-full rounded-full"
                  style={{ backgroundColor: p.color }}
                />
              )}
              {p.shape === "square" && (
                <div
                  className="w-full h-full transform"
                  style={{ backgroundColor: p.color }}
                />
              )}
              {p.shape === "triangle" && (
                <div
                  className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[12px]"
                  style={{ borderBottomColor: p.color }}
                />
              )}
              {p.shape === "heart" && (
                <svg
                  viewBox="0 0 24 24"
                  fill={p.color}
                  className="w-full h-full"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
