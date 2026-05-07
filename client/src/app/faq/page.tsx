"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, ChevronDown, ChevronUp, Zap, Search, MessageCircle } from "lucide-react";
import PublicNavbar from "@/components/layout/PublicNavbar";
import MeshBackground from "@/components/ui/MeshBackground";
import SpotlightCard from "@/components/ui/SpotlightCard";

const faqs = [
  {
    category: "Memberships",
    questions: [
      { q: "How do I join APEX Sports Club?", a: "You can sign up directly through our website by clicking 'Get Started'. Once registered, you can choose a membership plan that fits your needs." },
      { q: "Can I switch between sports?", a: "Yes! While you select a primary sport during registration, our premium memberships allow access to multiple sports facilities." },
      { q: "What are the membership durations?", a: "We offer Monthly, Annual, and Lifetime memberships. Annual plans come with a 20% discount compared to monthly billing." }
    ]
  },
  {
    category: "Facilities",
    questions: [
      { q: "What are the club operating hours?", a: "We are open from 5:00 AM to 10:00 PM on weekdays, and 6:00 AM to 8:00 PM on weekends." },
      { q: "Do you provide sports equipment?", a: "Yes, we have a fully stocked inventory of professional-grade equipment for members to use or rent." },
      { q: "Are there locker rooms available?", a: "Our facility includes premium locker rooms with showers, steam rooms, and secure storage for all members." }
    ]
  },
  {
    category: "Payments",
    questions: [
      { q: "What payment methods do you accept?", a: "We accept all major credit/debit cards, bank transfers, and cash payments at the club front desk." },
      { q: "How do I view my payment history?", a: "Logged-in members can access their full payment history and download receipts directly from their dashboard." }
    ]
  }
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState(faqs[0].category);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100 selection:bg-brand-500/30">
      <MeshBackground />

      <PublicNavbar />

      <main className="relative z-10 pt-20 pb-32">
        <div className="max-w-4xl mx-auto px-6">
          
          {/* Header */}
          <div className="relative mb-20">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-full max-w-lg h-64 opacity-20 pointer-events-none">
              <img src="/faq_hero.png" alt="FAQ Hero" className="w-full h-full object-contain blur-xl" />
            </div>
            
            <div className="relative z-10 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-20 h-20 rounded-[2rem] bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-8"
              >
                <HelpCircle className="w-10 h-10 text-brand-400" />
              </motion.div>
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-[10px] font-bold mb-6 uppercase tracking-widest">
                Support Hub
              </div>
              
              <h1 className="text-4xl md:text-6xl font-black text-surface-50 mb-6 tracking-tight">
                Frequently Asked <span className="gradient-text">Questions</span>.
              </h1>
              <p className="text-surface-400 text-lg max-w-2xl mx-auto leading-relaxed">
                Everything you need to know about APEX Sports Club. Can&apos;t find the answer? <a href="/contact" className="text-brand-400 hover:underline">Contact our support team</a>.
              </p>
            </div>
          </div>

          {/* Search Placeholder */}
          <div className="relative mb-12">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
            <input 
              type="text" 
              placeholder="Search for a topic..." 
              className="w-full bg-surface-900/50 border border-surface-800 rounded-3xl py-6 pl-16 pr-8 text-surface-100 focus:outline-none focus:border-brand-500/50 transition-all text-lg"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {faqs.map((cat) => (
              <button
                key={cat.category}
                onClick={() => {
                  setActiveCategory(cat.category);
                  setOpenIndex(0);
                }}
                className={`px-8 py-3 rounded-2xl font-bold text-sm transition-all ${
                  activeCategory === cat.category 
                  ? "bg-brand-500 text-white shadow-xl shadow-brand-500/20" 
                  : "bg-surface-900 text-surface-400 hover:text-surface-200 border border-surface-800"
                }`}
              >
                {cat.category}
              </button>
            ))}
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {faqs.find(f => f.category === activeCategory)?.questions.map((item, i) => (
                  <div 
                    key={i}
                    className={`glass-card border-surface-800/40 overflow-hidden transition-all ${openIndex === i ? "border-brand-500/30" : ""}`}
                  >
                    <button
                      onClick={() => setOpenIndex(openIndex === i ? null : i)}
                      className="w-full px-8 py-6 flex items-center justify-between text-left group"
                    >
                      <span className={`text-lg font-bold transition-colors ${openIndex === i ? "text-brand-400" : "text-surface-100 group-hover:text-brand-400"}`}>
                        {item.q}
                      </span>
                      {openIndex === i ? <ChevronUp className="w-5 h-5 text-brand-400" /> : <ChevronDown className="w-5 h-5 text-surface-500" />}
                    </button>
                    
                    <AnimatePresence>
                      {openIndex === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                        >
                          <div className="px-8 pb-8 text-surface-400 leading-relaxed">
                            {item.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Support Decal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 p-12 rounded-[3rem] bg-gradient-to-br from-brand-600 to-brand-800 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
            <div className="relative z-10">
              <MessageCircle className="w-12 h-12 text-white/50 mx-auto mb-6" />
              <h3 className="text-3xl font-black text-white mb-4">Still have questions?</h3>
              <p className="text-brand-100 mb-8 max-w-lg mx-auto">We&apos;re always here to help you. Reach out to our 24/7 customer support team for any assistance.</p>
              <a href="/contact" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-brand-600 font-bold rounded-2xl hover:bg-brand-50 transition-all shadow-xl">
                Contact Support
              </a>
            </div>
          </motion.div>

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
