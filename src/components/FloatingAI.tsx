import * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, X, Send, Bot } from "lucide-react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";

const FloatingAI: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-4 w-80 sm:w-96"
          >
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between bg-[linear-gradient(135deg,rgba(245,201,118,0.26),rgba(210,154,57,0.3),rgba(2,6,23,0.86))] p-4">
                <div className="flex items-center gap-3 text-white">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="display-font text-base font-bold">ScholarAI Assistant</CardTitle>
                    <div className="text-[11px] uppercase tracking-[0.24em] text-amber-100/70">Quick Support</div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full text-white hover:bg-white/10"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-80 overflow-y-auto space-y-4 bg-slate-950/35 p-4">
                  <div className="flex gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-300/10 text-amber-100">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="rounded-[22px] border border-white/8 bg-white/[0.04] p-4 text-xs leading-relaxed text-slate-300">
                      Hi! I'm your quick assistant. Ask me anything about scholarships or your profile.
                    </div>
                  </div>
                </div>
                <div className="border-t border-white/8 bg-slate-950/50 p-4">
                  <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                    <Input
                      placeholder="Type a message..."
                      className="h-11 text-xs"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                    />
                    <Button size="icon" className="h-11 w-11 rounded-2xl">
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={
          isOpen
            ? "flex h-14 w-14 items-center justify-center rounded-[22px] bg-slate-900 text-white shadow-[0_18px_45px_rgba(2,8,23,0.45)] transition-all duration-300"
            : "premium-ring animate-pulse-glow flex h-14 w-14 items-center justify-center rounded-[22px] bg-[linear-gradient(135deg,rgba(245,201,118,0.95),rgba(210,154,57,0.92))] text-stone-950 shadow-[0_22px_48px_rgba(210,154,57,0.34)] transition-all duration-300"
        }
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        {!isOpen && (
          <div className="absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-slate-950 bg-amber-300 animate-pulse" />
        )}
      </motion.button>
    </div>
  );
};

export default FloatingAI;
