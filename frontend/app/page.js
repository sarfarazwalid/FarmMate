"use client";

import {
    ArrowRight,
    Calendar,
    CheckCircle,
    ChevronRight,
    Globe,
    Leaf,
    LineChart,
    List,
    Shield,
    Star,
    Store,
    TrendingUp,
    Users,
    Sprout,
    Search,
    Bell,
    BarChart3,
    Quote,
    Brain,
    AlertTriangle,
    Lightbulb,
} from 'lucide-react';
import Link from 'next/link';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { FeaturesModal, HowItWorksModal, AIModal, useHoverPreview, PreviewDropdown } from '@/app/components/NavbarModals';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
};


function Section({ children, className = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.section>
  );
}

function AnimatedStat({ value, label, suffix = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const num = parseInt(value.replace(/[^0-9]/g, ''));
    if (isNaN(num)) { setCount(value); return; }
    let start = 0;
    const duration = 1500;
    const step = Math.max(1, Math.floor(num / 30));
    const interval = setInterval(() => {
      start += step;
      if (start >= num) { setCount(value); clearInterval(interval); }
      else setCount(start + suffix);
    }, duration / 30);
    return () => clearInterval(interval);
  }, [isInView, value, suffix]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="text-center"
    >
      <div className="text-3xl sm:text-4xl font-bold text-white mb-1 tracking-tight">{count}</div>
      <div className="text-sm text-emerald-200/60">{label}</div>
    </motion.div>
  );
}

function NavLink({ href, children, className = '' }) {
  return (
    <Link href={href} className={`text-surface-300 hover:text-white transition-colors text-sm font-medium ${className}`}>
      {children}
    </Link>
  );
}

function DashboardPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
      className="relative"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="relative z-10 glass-card rounded-3xl p-6 border border-white/[0.08] shadow-glow-lg"
      >
        <div className="bg-gradient-to-br from-emerald-600/30 to-emerald-800/30 rounded-2xl p-5 mb-4 border border-emerald-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Smart Analytics</h3>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="space-y-3">
            {[
              { label: 'Crop Yield', value: '+24%', color: 'text-emerald-400' },
              { label: 'Water Efficiency', value: '+18%', color: 'text-teal-400' },
              { label: 'Cost Reduction', value: '−12%', color: 'text-amber-400' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-xs text-surface-300">{item.label}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${60 + i * 15}%` }}
                      transition={{ duration: 1, delay: 0.8 + i * 0.2 }}
                      className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
                    />
                  </div>
                  <span className={`text-xs font-bold ${item.color}`}>{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card-light rounded-2xl p-3">
            <div className="w-7 h-7 bg-emerald-500/15 rounded-lg flex items-center justify-center mb-2">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-xs font-semibold text-white">Planting Calendar</p>
            <p className="text-[10px] text-surface-400">AI-optimized</p>
          </div>
          <div className="glass-card-light rounded-2xl p-3">
            <div className="w-7 h-7 bg-teal-500/15 rounded-lg flex items-center justify-center mb-2">
              <BarChart3 className="w-3.5 h-3.5 text-teal-400" />
            </div>
            <p className="text-xs font-semibold text-white">Real-time Data</p>
            <p className="text-[10px] text-surface-400">Live monitoring</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, -12, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-3 -right-3 w-12 h-12 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-center justify-center backdrop-blur-sm z-20"
      >
        <Brain className="w-6 h-6 text-emerald-400" />
      </motion.div>
      <motion.div
        animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-2 -left-2 w-10 h-10 bg-amber-500/10 rounded-xl border border-amber-500/20 flex items-center justify-center backdrop-blur-sm z-20"
      >
        <Lightbulb className="w-5 h-5 text-amber-400" />
      </motion.div>
    </motion.div>
  );
}


const navFeatures = [
  { icon: Sprout, title: 'Smart Farm Management', desc: 'Manage crops, inventory, farm conditions, and operations.', color: 'from-emerald-500 to-emerald-600' },
  { icon: Brain, title: 'AI Farming Assistant', desc: 'AI crop suggestions, pest detection, task prioritization, and recommendations.', color: 'from-emerald-400 to-teal-500' },
  { icon: Store, title: 'Agricultural Marketplace', desc: 'Sell directly to buyers through the FarmMate marketplace.', color: 'from-amber-500 to-amber-600' },
  { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Track revenue, sales, productivity, and farm performance.', color: 'from-purple-500 to-purple-600' },
  { icon: Calendar, title: 'Planting Calendar', desc: 'Plan planting schedules and seasonal activities.', color: 'from-sky-500 to-sky-600' },
  { icon: Users, title: 'Community & Q&A', desc: 'Collaborate with farmers and share knowledge.', color: 'from-blue-500 to-blue-600' },
];

const navHow = [
  { icon: Users, title: 'Create Account', desc: 'Sign up as Farmer or Buyer.', color: 'from-emerald-400 to-emerald-600' },
  { icon: Shield, title: 'Setup Profile', desc: 'Configure farm information or buyer profile.', color: 'from-teal-400 to-teal-600' },
  { icon: Store, title: 'Buy & Sell', desc: 'Farmers list products. Buyers browse marketplace.', color: 'from-amber-400 to-amber-600' },
  { icon: Brain, title: 'Use AI Tools', desc: 'Get crop suggestions, pest detection, and recommendations.', color: 'from-purple-500 to-purple-600' },
  { icon: TrendingUp, title: 'Grow & Earn', desc: 'Increase productivity and marketplace success.', color: 'from-emerald-500 to-emerald-600' },
];

const navAi = [
  { icon: TrendingUp, title: 'Crop Recommendation Engine', desc: 'Intelligent crop recommendations by soil, weather and market.', color: 'from-emerald-400 to-teal-400' },
  { icon: Search, title: 'Pest Detection Assistant', desc: 'Identify potential pest problems through image analysis.', color: 'from-amber-400 to-orange-400' },
  { icon: Lightbulb, title: 'Smart Task Prioritization', desc: 'Automatically ranks tasks by urgency and impact.', color: 'from-sky-400 to-blue-400' },
  { icon: BarChart3, title: 'Product Image Generation', desc: 'Generates realistic product images for marketplace listings.', color: 'from-purple-500 to-purple-600' },
  { icon: TrendingUp, title: 'Farm Insights', desc: 'Provides actionable farming recommendations powered by AI.', color: 'from-teal-400 to-teal-600' },
];

function NavHoverButton({ label, onClick, items }) {
  return <DesktopNavHover label={label} onClick={onClick} items={items} />;
}

function DesktopNavHover({ label, onClick, items }) {
  const { open, openPreview, closePreview } = useHoverPreview();
  return (
    <div className="relative inline-block" onMouseEnter={openPreview} onMouseLeave={closePreview}>
      <button
        onClick={() => onClick()}
        className="text-surface-300 hover:text-white transition-colors text-sm font-medium"
      >
        {label}
      </button>
      <AnimatePresence>
        {open && <PreviewDropdown items={items} onOpen={onClick} />}
      </AnimatePresence>
    </div>
  );
}

/* ─── Feature Card ─── */
function FeatureCard({ icon: Icon, title, description, items, color = 'emerald' }) {
  const colorMap = {
    emerald: 'from-emerald-500 to-emerald-600',
    teal: 'from-teal-500 to-teal-600',
    sky: 'from-sky-500 to-sky-600',
    amber: 'from-amber-500 to-amber-600',
    purple: 'from-purple-500 to-purple-600',
    red: 'from-red-500 to-red-600',
  };
  const dotMap = {
    emerald: 'bg-emerald-400',
    teal: 'bg-teal-400',
    sky: 'bg-sky-400',
    amber: 'bg-amber-400',
    purple: 'bg-purple-400',
    red: 'bg-red-400',
  };
  return (
    <motion.div
      variants={staggerItem}
      className="group glass-card rounded-2xl p-6 sm:p-8 border border-white/[0.06] hover:border-white/[0.12] hover:-translate-y-1 transition-all duration-300"
    >
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${colorMap[color]} rounded-2xl flex items-center justify-center mb-4 sm:mb-5 shadow-lg`}
      >
        <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
      </motion.div>
      <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 tracking-tight">{title}</h3>
      <p className="text-sm text-surface-400 leading-relaxed mb-4 sm:mb-5">{description}</p>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2 text-xs sm:text-sm text-surface-400">
            <span className={`w-1.5 h-1.5 rounded-full ${dotMap[color]} shrink-0`} />
            {item}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="bg-surface-900 min-h-screen text-surface-50 overflow-x-hidden">
      {/* ─── HEADER ─── */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-surface-900/80 backdrop-blur-xl">
        <nav className="container mx-auto flex justify-between items-center p-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-glow-emerald"
            >
              <Leaf className="h-5 w-5 text-white" />
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent tracking-tight">
              FarmMate
            </span>
          </Link>
          <div className="hidden sm:flex items-center gap-6">
            <NavHoverButton label="Features" onClick={() => setFeaturesOpen(true)} items={navFeatures} />
            <NavHoverButton label="How It Works" onClick={() => setHowItWorksOpen(true)} items={navHow} />
            <NavHoverButton label="AI" onClick={() => setAiOpen(true)} items={navAi} />
            <Link href="/login" className="text-surface-300 hover:text-white transition-colors text-sm font-medium">
              Login
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-5 py-2.5 text-sm font-semibold shadow-sm hover:shadow-emerald-500/20 hover:brightness-110 transition-all duration-200"
            >
              Get Started
            </Link>
          </div>
          <div className="sm:hidden flex items-center gap-3">
            <Link href="/login" className="text-surface-300 hover:text-white text-sm font-medium">
              Login
            </Link>
            <Link href="/register" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-4 py-2 text-sm font-semibold hover:brightness-110 transition-all">
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* ─── HERO SECTION ─── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-20 pb-16 sm:pb-20">
        {/* Background decorations */}
        <div className="absolute inset-0 mesh-overlay pointer-events-none" />
        <motion.div
          className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, -30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/3 -right-40 w-80 h-80 bg-teal-500/8 rounded-full blur-3xl"
          animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-20 left-1/4 w-64 h-64 bg-amber-500/8 rounded-full blur-3xl"
          animate={{ x: [0, 15, 0], y: [0, -15, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative z-10 container mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            {/* Hero Left */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="space-y-6 sm:space-y-8"
            >
              <motion.div
                variants={fadeUp}
                custom={0}
                className="inline-flex items-center gap-2 bg-white/5 text-emerald-300 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium border border-emerald-500/20"
              >
                <Star className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Trusted by 10,000+ farmers worldwide</span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                custom={0.1}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-white tracking-tight"
              >
                <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  The Future of
                </span>
                <br />
                <span>Farming is Here</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                custom={0.2}
                className="text-base sm:text-lg text-surface-400 leading-relaxed max-w-xl"
              >
                AI-powered insights, smart crop management, and a thriving marketplace — all in one platform. 
                FarmMate revolutionizes agriculture for the modern era.
              </motion.p>

              <motion.div
                variants={fadeUp}
                custom={0.3}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4"
              >
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-6 py-3 text-base font-semibold shadow-sm hover:shadow-emerald-500/30 hover:brightness-110 transition-all duration-200 group"
                >
                  Start Free Trial
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/dashboard/buyer/marketplace"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 text-surface-300 px-6 py-3 text-base font-semibold hover:bg-white/5 hover:text-white hover:border-white/20 transition-all duration-200"
                >
                  View Marketplace
                </Link>
              </motion.div>

              <motion.div
                variants={fadeUp}
                custom={0.4}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 text-xs sm:text-sm text-surface-400"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                  No credit card required
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                  Free 30-day trial
                </div>
              </motion.div>
            </motion.div>

            {/* Hero Right */}
            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* ─── STATS SECTION ─── */}
      <Section className="py-16 sm:py-20 border-y border-white/[0.04]">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-12 text-center">
            <AnimatedStat value="10,000+" label="Active Farmers" />
            <AnimatedStat value="50+" label="Countries Worldwide" />
            <AnimatedStat value="2.5M" label="Revenue Generated" suffix="+" />
            <AnimatedStat value="98%" label="Satisfaction Rate" />
          </div>
        </div>
      </Section>

      {/* ─── FEATURES SECTION ─── */}
      <Section id="features" className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div variants={staggerItem} className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-3 sm:mb-4 tracking-tight">
              Everything You Need to Succeed
            </h2>
            <p className="text-base sm:text-lg text-surface-400 max-w-2xl mx-auto leading-relaxed">
              From AI-powered crop recommendations to a seamless marketplace, FarmMate provides every tool for modern agriculture.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
          >
            <FeatureCard
              icon={Calendar} color="emerald"
              title="AI Crop Recommendations"
              description="Receive AI-powered crop suggestions optimized for your farm's soil, climate, and market demand."
              items={['Weather-optimized schedules', 'Crop rotation planning', 'Multi-variety analysis']}
            />
            <FeatureCard
              icon={Store} color="amber"
              title="Smart Marketplace"
              description="Connect directly with buyers. List products, negotiate prices, and grow your business securely."
              items={['Direct buyer connections', 'Secure transactions', 'Quality assurance ratings']}
            />
            <FeatureCard
              icon={Search} color="red"
              title="Pest Detection AI"
              description="Upload a photo of your crops and our AI instantly detects pests and recommends treatments."
              items={['Instant AI diagnosis', 'Treatment recommendations', 'Detection history tracking']}
            />
            <FeatureCard
              icon={List} color="sky"
              title="Task Automation"
              description="AI-powered task prioritization with smart scheduling based on weather, season, and crop stage."
              items={['AI-prioritized tasks', 'Category-based tracking', 'Team assignment']}
            />
            <FeatureCard
              icon={BarChart3} color="purple"
              title="Agricultural Analytics"
              description="Track yields, monitor costs, analyze profits, and get data-driven insights to maximize ROI."
              items={['Yield predictions', 'Cost & profit tracking', 'Interactive charts']}
            />
            <FeatureCard
              icon={Bell} color="teal"
              title="Smart Notifications"
              description="Get real-time alerts for weather changes, pest risks, market opportunities, and task deadlines."
              items={['Weather alerts', 'Pest risk warnings', 'Market updates']}
            />
          </motion.div>
        </div>
      </Section>

      {/* ─── HOW IT WORKS ─── */}
      <Section id="how-it-works" className="py-16 sm:py-24 bg-surface-800/60">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div variants={staggerItem} className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-3 sm:mb-4 tracking-tight">
              How FarmMate Works
            </h2>
            <p className="text-base sm:text-lg text-surface-400 max-w-2xl mx-auto leading-relaxed">
              Get started in minutes with our simple three-step process
            </p>
          </motion.div>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-16 left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-emerald-500/30 via-teal-500/30 to-amber-500/30" />

            <motion.div
              variants={staggerContainer}
              className="grid md:grid-cols-3 gap-8 sm:gap-12 relative"
            >
              {[
                { num: '01', icon: Users, title: 'Create Your Profile', desc: 'Sign up and tell us about your farm. Our AI analyzes your location, soil, and climate for personalized recommendations.', color: 'from-emerald-400 to-emerald-600' },
                { num: '02', icon: TrendingUp, title: 'Get Smart Insights', desc: 'Receive AI-powered crop suggestions, weather alerts, and market analysis to optimize your farming decisions.', color: 'from-teal-400 to-teal-600' },
                { num: '03', icon: Store, title: 'Connect & Sell', desc: 'Join our marketplace to connect with buyers, sell your produce at competitive prices, and grow your business.', color: 'from-amber-400 to-amber-600' },
              ].map((step, i) => {
                const Icon = step.icon;
                return (
                  <motion.div key={i} variants={staggerItem} className="text-center relative">
                    <motion.div
                      whileHover={{ scale: 1.1, y: -4 }}
                      className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-4 sm:mb-5 shadow-lg relative z-10`}
                    >
                      <Icon className="w-7 h-7 sm:w-9 sm:h-9 text-white" />
                    </motion.div>
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold mb-3 border border-emerald-500/20">
                      {step.num}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 tracking-tight">{step.title}</h3>
                    <p className="text-sm text-surface-400 leading-relaxed max-w-xs mx-auto">{step.desc}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </Section>

      {/* ─── AI INTELLIGENCE SECTION ─── */}
      <Section id="ai-intelligence" className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div variants={staggerItem} className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 bg-emerald-500/5 text-emerald-300 px-3 py-1.5 rounded-full text-xs font-medium border border-emerald-500/20 mb-4">
              <Brain className="w-3.5 h-3.5" />
              Powered by Advanced AI
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-3 sm:mb-4 tracking-tight">
              Intelligence That Works for You
            </h2>
            <p className="text-base sm:text-lg text-surface-400 max-w-2xl mx-auto leading-relaxed">
              Our AI engine processes millions of data points to deliver actionable insights — from crop prediction to pest detection.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-5 sm:gap-6"
          >
            {[
              {
                icon: TrendingUp, title: 'Crop Yield Prediction',
                desc: 'AI forecasts your crop yields with high accuracy, helping you plan harvest, storage, and sales well in advance.',
                color: 'from-emerald-400 to-teal-400',
                bg: 'bg-emerald-500/5', border: 'border-emerald-500/20',
              },
              {
                icon: AlertTriangle, title: 'Pest Risk Detection',
                desc: 'Upload an image and our AI identifies pests with precision, suggesting organic and chemical treatments.',
                color: 'from-amber-400 to-orange-400',
                bg: 'bg-amber-500/5', border: 'border-amber-500/20',
              },
              {
                icon: Lightbulb, title: 'Smart Task Prioritization',
                desc: 'AI analyzes urgency, weather, and crop stages to prioritize your daily farming tasks intelligently.',
                color: 'from-sky-400 to-blue-400',
                bg: 'bg-sky-500/5', border: 'border-sky-500/20',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                whileHover={{ y: -4 }}
                className={`rounded-2xl ${item.bg} border ${item.border} p-6 sm:p-8 transition-all duration-300`}
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center mb-4`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 tracking-tight">{item.title}</h3>
                <p className="text-sm text-surface-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ─── DASHBOARD PREVIEW SECTION ─── */}
      <Section className="py-16 sm:py-24 bg-surface-800/60">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div variants={staggerItem} className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-3 sm:mb-4 tracking-tight">
              Built for Every Role
            </h2>
            <p className="text-base sm:text-lg text-surface-400 max-w-2xl mx-auto leading-relaxed">
              Whether you're a farmer managing crops, a buyer sourcing products, or an admin overseeing operations — FarmMate fits your workflow.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-5 sm:gap-6"
          >
            {[
              { title: 'Farmer Dashboard', desc: 'Manage crops, track tasks, view AI insights, and list products on the marketplace.', icon: Sprout, color: 'from-emerald-500/20 to-emerald-600/10', border: 'border-emerald-500/20', iconColor: 'text-emerald-400' },
              { title: 'Buyer Dashboard', desc: 'Browse farmers, order products, track shipments, and manage favorites seamlessly.', icon: Store, color: 'from-amber-500/20 to-amber-600/10', border: 'border-amber-500/20', iconColor: 'text-amber-400' },
              { title: 'Admin Panel', desc: 'Monitor platform analytics, manage users, oversee orders, and view system health.', icon: Shield, color: 'from-blue-500/20 to-blue-600/10', border: 'border-blue-500/20', iconColor: 'text-blue-400' },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                whileHover={{ y: -4 }}
                className={`rounded-2xl bg-gradient-to-br ${item.color} border ${item.border} p-6 sm:p-8 transition-all duration-300`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl bg-white/5 border ${item.border} flex items-center justify-center shrink-0`}>
                    <item.icon className={`w-5 h-5 ${item.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-surface-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ─── Modals ─── */}
      <FeaturesModal isOpen={featuresOpen} onClose={() => setFeaturesOpen(false)} />
      <HowItWorksModal isOpen={howItWorksOpen} onClose={() => setHowItWorksOpen(false)} />
      <AIModal isOpen={aiOpen} onClose={() => setAiOpen(false)} />

      {/* ─── CTA SECTION ─── */}
      <Section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            variants={staggerContainer}
            className="relative rounded-3xl p-8 sm:p-12 md:p-16 text-center overflow-hidden bg-gradient-to-br from-emerald-900/50 via-surface-800 to-teal-900/30 border border-emerald-500/20"
          >
            {/* Background blurs */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl" />
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" />
            <div className="absolute inset-0 mesh-overlay pointer-events-none" />

            <motion.h2
              variants={staggerItem}
              className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4 tracking-tight relative z-10"
            >
              Ready to Transform Your Farming?
            </motion.h2>
            <motion.p
              variants={staggerItem}
              className="text-base sm:text-lg text-surface-400 mb-6 sm:mb-8 max-w-xl mx-auto leading-relaxed relative z-10"
            >
              Join thousands of farmers who are already using FarmMate to increase yields, reduce costs, and grow their businesses.
            </motion.p>
            <motion.div
              variants={staggerItem}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center relative z-10"
            >
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-6 py-3 text-base font-semibold shadow-sm hover:shadow-emerald-500/30 hover:brightness-110 transition-all duration-200 group"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 text-surface-300 px-6 py-3 text-base font-semibold hover:bg-white/5 hover:text-white hover:border-white/20 transition-all duration-200"
              >
                Sign In
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </Section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-surface-800/80 text-white py-8 sm:py-12 border-t border-white/[0.04]">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Leaf className="w-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">FarmMate</span>
              </div>
              <p className="text-surface-400 text-sm leading-relaxed max-w-xs">
                Revolutionizing agriculture with AI-powered insights and smart farming solutions for the modern era.
              </p>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3">Product</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="text-sm text-surface-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="text-sm text-surface-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-sm text-surface-400 hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="text-sm text-surface-400 hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-surface-400 hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-sm text-surface-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-sm text-surface-400 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-sm text-surface-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-surface-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-sm text-surface-400 hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="text-sm text-surface-400 hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="text-sm text-surface-400 hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/[0.04] mt-8 sm:mt-10 pt-6 sm:pt-8 text-center">
            <p className="text-sm text-surface-500">&copy; 2025 FarmMate. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}