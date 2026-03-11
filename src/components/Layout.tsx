import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { GraduationCap, LayoutDashboard, Bookmark, Calendar, MessageSquare, User, LogOut, Search } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Button } from "./ui/Button";

import FloatingAI from "./FloatingAI";

import { useFirebase } from "../contexts/FirebaseContext";

interface LayoutProps {
  children: React.ReactNode;
  user?: any; // To be replaced with actual user type
}

const Layout: React.FC<LayoutProps> = ({ children, user }) => {
  const location = useLocation();
  const { logout } = useFirebase();
  const isLanding = location.pathname === "/";

  const navItems = [
    { name: "Overview", path: "/dashboard", icon: LayoutDashboard },
    { name: "Search", path: "/search", icon: Search },
    { name: "Saved", path: "/saved", icon: Bookmark },
    { name: "Deadlines", path: "/deadlines", icon: Calendar },
    { name: "AI Assistant", path: "/chat", icon: MessageSquare },
    { name: "Profile", path: "/profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-300/25">
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-8%] h-[34rem] w-[34rem] rounded-full bg-amber-300/10 blur-[140px] animate-float-slow" />
        <div className="absolute right-[-12%] top-[12%] h-[30rem] w-[30rem] rounded-full bg-yellow-700/12 blur-[150px] animate-float-slow [animation-delay:1.5s]" />
        <div className="absolute bottom-[-16%] left-[20%] h-[28rem] w-[28rem] rounded-full bg-orange-500/8 blur-[130px] animate-float-slow [animation-delay:3s]" />
      </div>

      {/* Navigation */}
      <nav className={cn(
        "fixed left-0 right-0 top-0 z-50 border-b border-white/8 bg-slate-950/50 backdrop-blur-2xl transition-all",
        isLanding ? "h-24" : "h-[4.5rem]"
      )}>
        <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between gap-6">
          <Link to="/" className="group flex items-center gap-3">
            <div className="premium-ring relative flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(245,201,118,0.95),rgba(210,154,57,0.9))] shadow-[0_18px_45px_rgba(210,154,57,0.32)] transition-transform duration-300 group-hover:scale-105">
              <GraduationCap className="text-white w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="display-font text-xl font-bold tracking-tight bg-gradient-to-r from-white via-amber-100 to-stone-400 bg-clip-text text-transparent">
                ScholarAI
              </span>
              <span className="hidden text-[10px] uppercase tracking-[0.36em] text-slate-500 md:block">
                Global Scholarship Intelligence
              </span>
            </div>
          </Link>

          <div className="hidden rounded-full border border-white/10 bg-white/[0.03] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] md:flex md:items-center md:gap-1">
            {!isLanding && navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "relative flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-200",
                  location.pathname === item.path
                    ? "bg-white/[0.08] text-white shadow-[0_8px_28px_rgba(2,8,23,0.3)]"
                    : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/profile"
                  className="premium-ring animate-pulse-glow flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,rgba(245,201,118,0.16),rgba(210,154,57,0.24))] text-sm font-bold text-amber-100 shadow-[0_10px_35px_rgba(210,154,57,0.18)] hover:scale-105"
                  aria-label="Open profile"
                >
                  {user.displayName?.[0] || user.email?.[0]?.toUpperCase() || "U"}
                </Link>
                <Button variant="ghost" size="sm" className="hidden rounded-full px-4 sm:flex" onClick={logout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="rounded-full px-4">Login</Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary" size="sm" className="rounded-full px-5">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className={cn("relative z-10", isLanding ? "pt-24" : "pt-[4.5rem]")}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(8px)" }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="min-h-[calc(100vh-72px)]"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <FloatingAI />

      {/* Footer */}
      <footer className="relative z-10 mt-24 border-t border-white/8 bg-slate-950/40 py-14 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="mb-4 flex items-center gap-3">
              <div className="premium-ring flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(245,201,118,0.95),rgba(210,154,57,0.9))] shadow-[0_18px_45px_rgba(210,154,57,0.28)]">
                <GraduationCap className="text-white w-6 h-6" />
              </div>
              <div>
                <span className="display-font text-xl font-bold">ScholarAI</span>
                <div className="text-[10px] uppercase tracking-[0.32em] text-slate-500">Precision Scholarship Discovery</div>
              </div>
            </div>
            <p className="max-w-md text-sm leading-7 text-slate-400">
              Empowering students worldwide to find and win international scholarships through AI-driven personalization and expert guidance.
            </p>
          </div>
          <div>
            <h4 className="display-font mb-4 text-sm font-bold uppercase tracking-[0.24em] text-slate-300">Product</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link to="/search" className="hover:text-amber-200 transition-colors">Scholarship Search</Link></li>
              <li><Link to="/chat" className="hover:text-amber-200 transition-colors">AI Assistant</Link></li>
              <li><Link to="/deadlines" className="hover:text-amber-200 transition-colors">Deadline Tracker</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="display-font mb-4 text-sm font-bold uppercase tracking-[0.24em] text-slate-300">Company</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><a href="#" className="hover:text-amber-200 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-amber-200 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-amber-200 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 border-t border-white/8 px-4 pt-8 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} ScholarAI. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
