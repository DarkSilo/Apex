"use client";

import React from "react";
import Link from "next/link";
import { 
  Zap, 
  Users, 
  Package, 
  Calendar, 
  ArrowRight, 
  ChevronRight,
  Shield,
  Activity,
  BarChart3,
  Sparkles as SparklesIcon
} from "lucide-react";
import { motion, Variants } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import MeshBackground from "@/components/ui/MeshBackground";
import SpotlightCard from "@/components/ui/SpotlightCard";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: "easeOut" } 
  }
};

import PublicNavbar from "@/components/layout/PublicNavbar";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100 selection:bg-brand-500/30">
      <MeshBackground />

      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold mb-6 uppercase tracking-wider">
                <SparklesIcon className="w-3 h-3" /> Next-Gen Sports Management
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] mb-6 text-surface-50">
                Elevate Your <span className="gradient-text">Club Operations</span> to the Pro Level.
              </h1>
              <p className="text-lg text-surface-400 mb-10 max-w-xl leading-relaxed">
                The all-in-one platform for Sri Lankan sports clubs. Manage members, track inventory, schedule training, and handle finances with unprecedented ease.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href={isAuthenticated ? "/dashboard" : "/register"} className="btn-primary px-8 py-4 text-lg flex items-center gap-2 group">
                  {isAuthenticated ? "Dashboard" : "Start Free Trial"}
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <a href="#features" className="btn-secondary px-8 py-4 text-lg">
                  Explore Features
                </a>
              </div>
              
              <div className="mt-12 flex items-center gap-6 border-t border-surface-800 pt-8">
                <div>
                  <p className="text-2xl font-bold text-surface-100">50+</p>
                  <p className="text-xs text-surface-500 uppercase tracking-widest mt-1">Clubs Joined</p>
                </div>
                <div className="w-px h-10 bg-surface-800" />
                <div>
                  <p className="text-2xl font-bold text-surface-100">10k+</p>
                  <p className="text-xs text-surface-500 uppercase tracking-widest mt-1">Active Members</p>
                </div>
                <div className="w-px h-10 bg-surface-800" />
                <div>
                  <p className="text-2xl font-bold text-surface-100">99.9%</p>
                  <p className="text-xs text-surface-500 uppercase tracking-widest mt-1">Uptime</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-500 to-brand-600 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative glass-card overflow-hidden rounded-[2rem] border-surface-700/50 shadow-2xl">
                <img 
                  src="/images/hero.png" 
                  alt="Sports Action Hero" 
                  className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="glass-card p-4 flex items-center gap-4 border-surface-500/20 backdrop-blur-md">
                    <div className="w-10 h-10 rounded-full bg-success-500/20 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-success-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-surface-50">Live Analytics</p>
                      <p className="text-xs text-surface-400">Tracking club growth in real-time</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-surface-900/30 border-y border-surface-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-4 text-surface-50">Powerful Features for Modern Clubs</h2>
            <p className="text-surface-400 max-w-2xl mx-auto">Everything you need to run your sports club professionally, from administration to athlete performance.</p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              { 
                icon: Users, 
                title: "Member Management", 
                desc: "Complete digital records for all athletes. Track attendance, membership status, and performance metrics effortlessly.",
                color: "text-brand-400",
                bg: "bg-brand-500/10"
              },
              { 
                icon: Package, 
                title: "Inventory Tracking", 
                desc: "Real-time stock monitoring with low-stock alerts. Never run out of equipment or medical supplies during a session.",
                color: "text-warning-400",
                bg: "bg-warning-500/10"
              },
              { 
                icon: Calendar, 
                title: "Session Scheduling", 
                desc: "Intuitive training calendar for coaches and members. Manage facilities, assign coaches, and track participation.",
                color: "text-success-400",
                bg: "bg-success-500/10"
              },
              { 
                icon: BarChart3, 
                title: "Financial Reporting", 
                desc: "Automated payment tracking and revenue analytics. Generate monthly reports and monitor the club's financial health.",
                color: "text-brand-400",
                bg: "bg-brand-500/10"
              },
              { 
                icon: Shield, 
                title: "Role-Based Access", 
                desc: "Secure environments for Admins, Coaches, and Members. Ensure everyone has access to only the tools they need.",
                color: "text-info-400",
                bg: "bg-brand-600/10"
              },
              { 
                icon: Activity, 
                title: "Performance Insights", 
                desc: "Data-driven insights into athlete progress and session effectiveness. Optimize training based on historical attendance.",
                color: "text-danger-400",
                bg: "bg-danger-500/10"
              }
            ].map((f, i) => (
              <SpotlightCard key={i} className="glass-card p-8 group">
                <motion.div variants={itemVariants} className="relative z-10">
                  <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <f.icon className={`w-6 h-6 ${f.color}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-surface-50">{f.title}</h3>
                  <p className="text-sm text-surface-400 leading-relaxed">{f.desc}</p>
                </motion.div>
              </SpotlightCard>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Sports Section */}
      <section id="sports" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl lg:text-5xl font-bold mb-4 text-surface-50">Built for Diverse Sports</h2>
              <p className="text-surface-400 leading-relaxed">Whether it's the cricket field, the football pitch, or the badminton court, APEX adapts to the unique needs of every discipline.</p>
            </div>
            <div className="flex gap-2">
              <div className="w-12 h-1 bg-brand-500 rounded-full" />
              <div className="w-4 h-1 bg-surface-700 rounded-full" />
              <div className="w-4 h-1 bg-surface-700 rounded-full" />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Cricket", img: "/images/cricket.png", tag: "Precision" },
              { name: "Football", img: "/images/football.png", tag: "Power" },
              { name: "Badminton", img: "/images/badminton.png", tag: "Speed" },
            ].map((sport, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="relative h-[450px] rounded-[2rem] overflow-hidden group border border-surface-800"
              >
                <img 
                  src={sport.img} 
                  alt={sport.name} 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-surface-950/20 to-transparent" />
                <div className="absolute bottom-8 left-8">
                  <span className="px-3 py-1 rounded-full bg-brand-500/20 backdrop-blur-md border border-brand-500/30 text-brand-400 text-[10px] font-bold uppercase tracking-widest mb-3 inline-block">
                    {sport.tag}
                  </span>
                  <h3 className="text-3xl font-bold text-white">{sport.name}</h3>
                  <p className="text-surface-300 text-sm mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Dedicated management modules for {sport.name} clubs.
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative glass-card p-12 lg:p-20 overflow-hidden text-center"
          >
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-[100px]" />
            <div className="relative z-10">
              <h2 className="text-4xl lg:text-6xl font-bold mb-6 text-surface-50">Ready to <span className="gradient-text">Modernize</span> Your Club?</h2>
              <p className="text-lg text-surface-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                Join dozens of forward-thinking Sri Lankan sports clubs today. Get started for free and see the difference APEX makes.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href={isAuthenticated ? "/dashboard" : "/register"} className="btn-primary px-10 py-4 text-xl">
                  {isAuthenticated ? "Go to Dashboard" : "Create Account"}
                </Link>
                <Link href="/login" className="btn-secondary px-10 py-4 text-xl">
                  Sign In
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-surface-800 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-brand-500" />
              <span className="text-xl font-bold tracking-tight text-surface-50">APEX</span>
            </div>
            
            <div className="flex gap-8 text-sm text-surface-500">
              <a href="#" className="hover:text-brand-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-brand-400 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-brand-400 transition-colors">Contact Us</a>
            </div>

            <p className="text-sm text-surface-600">
              © {new Date().getFullYear()} APEX Sports Club Management. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
