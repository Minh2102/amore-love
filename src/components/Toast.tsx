/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, X, Sparkles } from "lucide-react";

interface ToastProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ isOpen, message, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [isOpen, duration, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="toast-portal-wrapper" className="fixed bottom-6 right-6 z-[100] max-w-sm w-full pointer-events-none p-4 sm:p-0">
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="pointer-events-auto w-full bg-white dark:bg-stone-900 border border-emerald-100 dark:border-emerald-950/50 shadow-[0_10px_30px_rgba(16,185,129,0.12)] rounded-2xl overflow-hidden flex items-stretch"
          >
            {/* Visual accent left bar */}
            <div className="bg-emerald-500 w-2 shrink-0" />
            
            <div className="p-4 flex-1 flex items-start gap-3.5">
              <div className="p-2 bg-emerald-50 text-emerald-500 rounded-xl shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-stone-800 text-sm">Gửi RSVP thành công!</span>
                  <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                </div>
                <p className="text-stone-500 text-xs leading-relaxed">
                  {message}
                </p>
              </div>

              <button
                onClick={onClose}
                className="p-1 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-50 transition-all shrink-0"
                title="Đóng thông báo"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
