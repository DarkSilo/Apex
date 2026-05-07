"use client";

import React from "react";
import Link from "next/link";
import { Zap, ArrowRight, Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export default function PublicNavbar() {
  const { isAuthenticated, loading } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-surface-950/80 backdrop-blur-xl border-b border-surface-800/50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-surface-50">APEX</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/#features" className="text-sm font-medium text-surface-400 hover:text-brand-400 transition-colors">Features</Link>
          <Link href="/about" className="text-sm font-medium text-surface-400 hover:text-brand-400 transition-colors">About</Link>
          <Link href="/faq" className="text-sm font-medium text-surface-400 hover:text-brand-400 transition-colors">FAQ</Link>
          <Link href="/contact" className="text-sm font-medium text-surface-400 hover:text-brand-400 transition-colors">Contact</Link>
        </div>

        <div className="flex items-center gap-4">
          {!loading && (
            isAuthenticated ? (
              <Link href="/dashboard" className="btn-primary flex items-center gap-2 px-5 py-2.5">
                Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link href="/login" className="hidden sm:block text-sm font-medium text-surface-300 hover:text-white transition-colors">Sign In</Link>
                <Link href="/register" className="btn-primary px-5 py-2.5">Get Started</Link>
              </>
            )
          )}
          
          <button 
            className="md:hidden p-2 text-surface-400 hover:text-white transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-surface-900 border-b border-surface-800 overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              <Link href="/#features" onClick={() => setIsOpen(false)} className="text-lg font-medium text-surface-300">Features</Link>
              <Link href="/about" onClick={() => setIsOpen(false)} className="text-lg font-medium text-surface-300">About</Link>
              <Link href="/faq" onClick={() => setIsOpen(false)} className="text-lg font-medium text-surface-300">FAQ</Link>
              <Link href="/contact" onClick={() => setIsOpen(false)} className="text-lg font-medium text-surface-300">Contact</Link>
              {!isAuthenticated && (
                <div className="pt-4 border-t border-surface-800 flex flex-col gap-4">
                  <Link href="/login" onClick={() => setIsOpen(false)} className="text-center text-surface-300 py-3 rounded-xl bg-surface-800">Sign In</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
