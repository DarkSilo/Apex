"use client";

import React from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, Zap } from "lucide-react";
import PublicNavbar from "@/components/layout/PublicNavbar";
import MeshBackground from "@/components/ui/MeshBackground";
import SpotlightCard from "@/components/ui/SpotlightCard";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-surface-950 text-surface-100 selection:bg-brand-500/30">
      <MeshBackground />

      <PublicNavbar />

      <main className="relative z-10 pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            
            {/* Left Column: Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold mb-6 uppercase tracking-wider">
                <MessageSquare className="w-3 h-3" /> Get in Touch
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] mb-6 text-surface-50">
                We&apos;re Here to <span className="gradient-text">Support You</span>.
              </h1>
              <p className="text-lg text-surface-400 mb-12 max-w-xl leading-relaxed">
                Have questions about memberships, facilities, or coaching? Our team is available to help you find the perfect path for your athletic journey.
              </p>

              <div className="space-y-8">
                {[
                  { icon: Mail, label: "Email Us", value: "hello@apexsports.lk", sub: "Response within 24 hours" },
                  { icon: Phone, label: "Call Us", value: "+94 11 234 5678", sub: "Mon - Sat, 8am - 8pm" },
                  { icon: MapPin, label: "Visit Us", value: "45 Sports Complex Ave, Colombo 07", sub: "Sri Lanka" }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 group">
                    <div className="w-14 h-14 rounded-2xl bg-surface-900 border border-surface-800 flex items-center justify-center group-hover:border-brand-500/50 transition-colors">
                      <item.icon className="w-6 h-6 text-brand-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-surface-500 font-bold uppercase tracking-widest mb-1">{item.label}</p>
                      <p className="text-xl font-bold text-surface-50">{item.value}</p>
                      <p className="text-sm text-surface-500 mt-1">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-16 p-8 rounded-3xl bg-surface-900/50 border border-surface-800 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Clock className="w-32 h-32 text-white" />
                </div>
                <h3 className="text-lg font-bold text-surface-50 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-brand-400" />
                  Operating Hours
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-surface-500 uppercase font-bold tracking-widest">Weekdays</p>
                    <p className="text-surface-200 font-medium mt-1">05:00 AM - 10:00 PM</p>
                  </div>
                  <div>
                    <p className="text-xs text-surface-500 uppercase font-bold tracking-widest">Weekends</p>
                    <p className="text-surface-200 font-medium mt-1">06:00 AM - 08:00 PM</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <SpotlightCard className="glass-card p-10 border-surface-800/40 relative z-10">
                <h3 className="text-2xl font-bold text-surface-50 mb-8">Send a Message</h3>
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-surface-500 uppercase tracking-widest">Your Name</label>
                      <input type="text" placeholder="John Doe" className="input-field" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-surface-500 uppercase tracking-widest">Email Address</label>
                      <input type="email" placeholder="john@example.com" className="input-field" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-surface-500 uppercase tracking-widest">Subject</label>
                    <input type="text" placeholder="How can we help?" className="input-field" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-surface-500 uppercase tracking-widest">Message</label>
                    <textarea rows={5} placeholder="Tell us more about your inquiry..." className="input-field resize-none py-4"></textarea>
                  </div>
                  <button type="submit" className="btn-primary w-full py-4 flex items-center justify-center gap-2 group">
                    Send Message
                    <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
                </form>
              </SpotlightCard>

              {/* Background Image Decal */}
              <div className="mt-12 rounded-[2.5rem] overflow-hidden border border-surface-800 shadow-2xl relative group">
                <div className="absolute inset-0 bg-brand-500/10 group-hover:bg-transparent transition-colors z-10" />
                <img 
                  src="/contact_hero.png" 
                  alt="Contact APEX" 
                  className="w-full h-64 object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                />
              </div>
            </motion.div>

          </div>
        </div>
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
