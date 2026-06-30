"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import {
  Calendar,
  BarChart3,
  Store,
  Users,
  Search,
  Brain,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  Sprout,
  Shield,
  X,
} from 'lucide-react';

/* ─── Shared Animation Variants ─── */
export const modalFade = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } },
};

export const modalScale = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', damping: 26, stiffness: 300, mass: 0.8 },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

export const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
  },
};


export function NavbarModalWrapper({ isOpen, onClose, children }) {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement;

    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    const handleTab = (e) => {
      if (e.key !== 'Tab') return;
      const focusable = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleTab);
    document.addEventListener('mousedown', handleClickOutside);

    const firstFocusable = modalRef.current?.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    firstFocusable?.focus();

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleTab);
      document.removeEventListener('mousedown', handleClickOutside);
      previousFocusRef.current?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <motion.div
      variants={modalFade}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-24 px-4"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        ref={modalRef}
        variants={modalScale}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="relative w-full max-w-3xl max-h-[70vh] overflow-y-auto rounded-3xl border border-white/[0.08] bg-surface-800/90 backdrop-blur-2xl shadow-glow-lg"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-surface-300 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </motion.div>
    </motion.div>
  );
}

/* ─── Features Modal ─── */
const features = [
  {
    icon: Sprout,
    title: 'Smart Farm Management',
    desc: 'Manage crops, inventory, farm conditions, and farming operations.',
    color: 'from-emerald-500 to-emerald-600',
    bg: 'bg-emerald-500/5',
    border: 'border-emerald-500/20',
  },
  {
    icon: Brain,
    title: 'AI Farming Assistant',
    desc: 'AI crop suggestions, pest detection, task prioritization, and intelligent recommendations.',
    color: 'from-emerald-400 to-teal-500',
    bg: 'bg-teal-500/5',
    border: 'border-teal-500/20',
  },
  {
    icon: Store,
    title: 'Agricultural Marketplace',
    desc: 'Sell directly to buyers through the FarmMate marketplace.',
    color: 'from-amber-500 to-amber-600',
    bg: 'bg-amber-500/5',
    border: 'border-amber-500/20',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    desc: 'Track revenue, sales, productivity, and farm performance.',
    color: 'from-purple-500 to-purple-600',
    bg: 'bg-purple-500/5',
    border: 'border-purple-500/20',
  },
  {
    icon: Calendar,
    title: 'Planting Calendar',
    desc: 'Plan planting schedules and seasonal activities.',
    color: 'from-sky-500 to-sky-600',
    bg: 'bg-sky-500/5',
    border: 'border-sky-500/20',
  },
  {
    icon: Users,
    title: 'Community & Q&A',
    desc: 'Collaborate with farmers and share agricultural knowledge.',
    color: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-500/5',
    border: 'border-blue-500/20',
  },
];

export function FeaturesModal({ isOpen, onClose }) {
  return (
    <NavbarModalWrapper isOpen={isOpen} onClose={onClose}>
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="p-6 sm:p-8">
        <motion.h3 variants={staggerItem} className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">
          Everything You Need
        </motion.h3>
        <motion.p variants={staggerItem} className="text-surface-400 text-sm sm:text-base mb-6 sm:mb-8 max-w-xl">
          From AI-powered crop recommendations to a seamless marketplace, FarmMate provides every tool for modern agriculture.
        </motion.p>
        <motion.div variants={staggerContainer} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={i}
                variants={staggerItem}
                whileHover={{ y: -4 }}
                className={`group rounded-2xl ${f.bg} border ${f.border} p-5 transition-all duration-300`}
              >
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${f.color} rounded-xl flex items-center justify-center mb-3 shadow-lg`}
                >
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h4 className="text-sm sm:text-base font-bold text-white mb-1 tracking-tight">{f.title}</h4>
                <p className="text-xs sm:text-sm text-surface-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </NavbarModalWrapper>
  );
}

/* ─── How It Works Modal ─── */
const steps = [
  { num: '01', title: 'Create Account', desc: 'Sign up as Farmer or Buyer.' },
  { num: '02', title: 'Setup Profile', desc: 'Configure farm information or buyer profile.' },
  { num: '03', title: 'Buy & Sell', desc: 'Farmers list products. Buyers browse marketplace.' },
  { num: '04', title: 'Use AI Tools', desc: 'Get crop suggestions, pest detection, and smart recommendations.' },
  { num: '05', title: 'Grow & Earn', desc: 'Increase productivity and marketplace success.' },
];

export function HowItWorksModal({ isOpen, onClose }) {
  return (
    <NavbarModalWrapper isOpen={isOpen} onClose={onClose}>
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="p-6 sm:p-8">
        <motion.h3 variants={staggerItem} className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">
          How FarmMate Works
        </motion.h3>
        <motion.p variants={staggerItem} className="text-surface-400 text-sm sm:text-base mb-8 sm:mb-10 max-w-xl">
          Get started in minutes with our simple five-step process
        </motion.p>
        <div className="relative">
          <div className="absolute left-4 sm:left-5 top-3 bottom-3 w-px bg-gradient-to-b from-emerald-500/40 via-teal-500/40 to-amber-500/40" />
          <motion.div variants={staggerContainer} className="space-y-6 sm:space-y-8">
            {steps.map((step, i) => (
              <motion.div key={i} variants={staggerItem} className="relative flex items-start gap-4 sm:gap-6">
                <div className="z-10 flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-surface-900 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-bold shadow-glow-emerald">
                  {step.num}
                </div>
                <div className="flex-1 pt-1">
                  <h4 className="text-base sm:text-lg font-bold text-white tracking-tight">{step.title}</h4>
                  <p className="text-xs sm:text-sm text-surface-400 mt-1 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </NavbarModalWrapper>
  );
}

/* ─── AI Modal ─── */
const aiItems = [
  {
    icon: TrendingUp,
    title: 'Crop Recommendation Engine',
    desc: 'Provides intelligent crop recommendations based on soil, weather, and market data.',
    color: 'from-emerald-400 to-teal-400',
    glow: 'shadow-glow-emerald',
  },
  {
    icon: Search,
    title: 'Pest Detection Assistant',
    desc: 'Helps identify potential pest problems through image analysis.',
    color: 'from-amber-400 to-orange-400',
    glow: 'shadow-amber-500/20',
  },
  {
    icon: Lightbulb,
    title: 'Smart Task Prioritization',
    desc: 'Automatically ranks tasks by urgency and impact.',
    color: 'from-sky-400 to-blue-400',
    glow: 'shadow-sky-500/20',
  },
  {
    icon: BarChart3,
    title: 'Product Image Generation',
    desc: 'Generates realistic product images for marketplace listings.',
    color: 'from-purple-400 to-purple-600',
    glow: 'shadow-purple-500/20',
  },
  {
    icon: TrendingUp,
    title: 'Farm Insights',
    desc: 'Provides actionable farming recommendations powered by AI.',
    color: 'from-teal-400 to-teal-600',
    glow: 'shadow-teal-500/20',
  },
];

export function AIModal({ isOpen, onClose }) {
  return (
    <NavbarModalWrapper isOpen={isOpen} onClose={onClose}>
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="p-6 sm:p-8">
        <motion.h3 variants={staggerItem} className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">
          Powered by Advanced AI
        </motion.h3>
        <motion.p variants={staggerItem} className="text-surface-400 text-sm sm:text-base mb-6 sm:mb-8 max-w-xl">
          Our AI engine processes millions of data points to deliver actionable insights — from crop prediction to pest detection.
        </motion.p>
        <motion.div variants={staggerContainer} className="grid sm:grid-cols-2 gap-4">
          {aiItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                variants={staggerItem}
                whileHover={{ y: -3 }}
                className={`group relative overflow-hidden rounded-2xl bg-surface-700/40 border border-white/[0.08] p-5 transition-all duration-300`}
              >
                <div
                  className={`absolute -top-10 -right-10 h-24 w-24 rounded-full bg-gradient-to-br ${item.color} opacity-10 blur-2xl transition-opacity duration-500 group-hover:opacity-20`}
                />
                <div
                  className={`w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center mb-3 shadow-lg ${item.glow}`}
                >
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h4 className="text-sm sm:text-base font-bold text-white mb-1 tracking-tight">{item.title}</h4>
                <p className="text-xs sm:text-sm text-surface-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </NavbarModalWrapper>
  );
}

/* ─── Hover Preview Dropdown ─── */
export function PreviewDropdown({ items, onOpen }) {
  return (
    <motion.div
      variants={modalScale}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 rounded-2xl border border-white/[0.08] bg-surface-800/95 backdrop-blur-2xl p-4 shadow-glow-lg"
    >
      <div className="space-y-3">
        {items.map((item, i) => (
          <button
            key={i}
            onClick={onOpen}
            className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-white/5"
          >
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} shadow-md`}>
              <item.icon className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">{item.title}</p>
              <p className="text-[10px] text-surface-400 leading-snug">{item.desc?.slice(0, 50)}...</p>
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

export function useHoverPreview() {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef(null);

  const openPreview = () => {
    timeoutRef.current = setTimeout(() => setOpen(true), 150);
  };
  const closePreview = () => {
    clearTimeout(timeoutRef.current);
    setOpen(false);
  };

  return { open, openPreview, closePreview };
}
