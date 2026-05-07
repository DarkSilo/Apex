"use client";

import React from "react";
import { motion } from "framer-motion";
import { Shield, Target, Users, Zap, Award, Globe } from "lucide-react";
import PublicNavbar from "@/components/layout/PublicNavbar";
import MeshBackground from "@/components/ui/MeshBackground";
import SpotlightCard from "@/components/ui/SpotlightCard";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-surface-950 text-surface-100 selection:bg-brand-500/30">
      <MeshBackground />

      <PublicNavbar />

      <main className="relative z-10">
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
                  <Shield className="w-3 h-3" /> Our Legacy & Vision
                </div>
                <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] mb-6 text-surface-50">
                  Redefining <span className="gradient-text">Athletic Excellence</span> in <br /> Sri Lanka.
                </h1>
                <p className="text-lg text-surface-400 mb-10 max-w-xl leading-relaxed">
                  Founded with a passion for sports and a commitment to community, APEX Sports Club has grown into a premier destination for athletes of all levels. We combine world-class facilities with cutting-edge management to help you reach your peak.
                </p>
                <div className="flex items-center gap-8">
                  <div>
                    <p className="text-3xl font-black text-surface-50">15+</p>
                    <p className="text-xs text-surface-500 font-bold uppercase tracking-widest mt-1">Years Experience</p>
                  </div>
                  <div className="w-px h-10 bg-surface-800" />
                  <div>
                    <p className="text-3xl font-black text-surface-50">2k+</p>
                    <p className="text-xs text-surface-500 font-bold uppercase tracking-widest mt-1">Active Members</p>
                  </div>
                  <div className="w-px h-10 bg-surface-800" />
                  <div>
                    <p className="text-3xl font-black text-surface-50">50+</p>
                    <p className="text-xs text-surface-500 font-bold uppercase tracking-widest mt-1">Pro Coaches</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-brand-500/20 to-transparent rounded-[2.5rem] -rotate-3" />
                <img 
                  src="/about_hero.png" 
                  alt="About APEX" 
                  className="relative rounded-[2.5rem] shadow-2xl border border-surface-800 rotate-2 hover:rotate-0 transition-transform duration-700"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Mission & Values */}
        <section className="py-32 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-bold text-surface-50 mb-4">Driven by Purpose</h2>
              <p className="text-surface-400 max-w-2xl mx-auto">Our values are the heartbeat of everything we do at APEX.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { 
                  icon: Target, 
                  title: "Focused Innovation", 
                  desc: "We leverage technology to provide the most efficient club management experience in the region.",
                  color: "text-brand-400",
                  bg: "bg-brand-500/10"
                },
                { 
                  icon: Users, 
                  title: "Community First", 
                  desc: "Building a supportive environment where athletes can grow together and celebrate each other&apos;s success.",
                  color: "text-success-400",
                  bg: "bg-success-500/10"
                },
                { 
                  icon: Award, 
                  title: "Global Standards", 
                  desc: "Bringing international training methodologies and facility standards to local Sri Lankan sports.",
                  color: "text-warning-400",
                  bg: "bg-warning-500/10"
                }
              ].map((value, i) => (
                <SpotlightCard key={i} className="glass-card p-10 group">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="relative z-10"
                  >
                    <div className={`w-14 h-14 rounded-2xl ${value.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <value.icon className={`w-7 h-7 ${value.color}`} />
                    </div>
                    <h3 className="text-xl font-bold text-surface-50 mb-4">{value.title}</h3>
                    <p className="text-surface-400 leading-relaxed text-sm">{value.desc}</p>
                  </motion.div>
                </SpotlightCard>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-32 bg-brand-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
          <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-8">Ready to join the elite?</h2>
            <p className="text-brand-100 mb-10 max-w-2xl mx-auto text-lg">Experience the next generation of sports club management and athletic training.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="/register" className="px-10 py-4 bg-white text-brand-600 font-bold rounded-2xl hover:bg-brand-50 transition-all shadow-xl shadow-black/10">Become a Member</a>
              <a href="/contact" className="px-10 py-4 border-2 border-white/30 text-white font-bold rounded-2xl hover:bg-white/10 transition-all">Talk to Us</a>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-20 border-t border-surface-800/50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Zap className="w-6 h-6 text-brand-500" />
            <span className="text-2xl font-bold text-surface-50">APEX</span>
          </div>
          <p className="text-surface-500 text-sm">© 2026 APEX Sports Club Management. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
