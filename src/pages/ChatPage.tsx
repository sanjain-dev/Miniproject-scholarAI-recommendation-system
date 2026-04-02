import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Bot, User, Sparkles, GraduationCap, Globe, BookOpen, Target, ArrowRight } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Card, CardContent } from "@/src/components/ui/Card";
import { cn } from "@/src/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const INITIAL_MESSAGE: Message = {
  id: "1",
  role: "assistant",
  content: "Hello! I'm your International ScholarAI assistant. I can help you find scholarships, explain eligibility requirements, or suggest application strategies. How can I help you today?",
  timestamp: new Date(),
};

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const replyTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => () => {
    if (replyTimeoutRef.current) {
      window.clearTimeout(replyTimeoutRef.current);
    }
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response
    replyTimeoutRef.current = window.setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Based on your profile, you are highly eligible for the Chevening Scholarship. It's a fully-funded master's degree scholarship in the UK. Would you like me to explain the application process or help you brainstorm your leadership essay?",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
      replyTimeoutRef.current = null;
    }, 1500);
  };

  const handleClearChat = () => {
    if (replyTimeoutRef.current) {
      window.clearTimeout(replyTimeoutRef.current);
      replyTimeoutRef.current = null;
    }

    setMessages([
      {
        ...INITIAL_MESSAGE,
        timestamp: new Date(),
      },
    ]);
    setInput("");
    setIsLoading(false);
  };

  const suggestions = [
    { text: "Find fully funded scholarships in Germany", icon: Globe },
    { text: "Explain Chevening eligibility", icon: GraduationCap },
    { text: "How to write a winning personal statement?", icon: BookOpen },
    { text: "Scholarships for Computer Science", icon: Target },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 h-[calc(100vh-160px)] flex flex-col">
      <div className="premium-surface premium-ring mb-6 flex items-center justify-between rounded-[30px] px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-amber-300/15">
            <Bot className="text-amber-100 w-6 h-6" />
          </div>
          <div>
            <h1 className="display-font text-2xl font-bold tracking-tight">AI Assistant</h1>
            <div className="flex items-center gap-1.5 text-xs text-amber-300 font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
              Online & Ready to Help
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" className="hidden rounded-full sm:flex" onClick={handleClearChat}>
          Clear Chat
        </Button>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-800"
        >
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-4 max-w-[85%]",
                message.role === "user" ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "w-9 h-9 rounded-2xl flex-shrink-0 flex items-center justify-center",
                message.role === "assistant" ? "bg-amber-300/15 text-amber-100" : "bg-slate-800 text-slate-300"
              )}>
                {message.role === "assistant" ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </div>
              <div className={cn(
                "p-4 rounded-[24px] text-sm leading-7",
                message.role === "assistant"
                  ? "bg-white/5 border border-white/8 text-slate-200"
                  : "bg-[linear-gradient(135deg,rgba(245,201,118,0.92),rgba(210,154,57,0.95))] text-stone-950 shadow-[0_18px_38px_rgba(210,154,57,0.24)]"
              )}>
                {message.content}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex gap-4 max-w-[85%]">
              <div className="w-9 h-9 rounded-2xl bg-amber-300/15 text-amber-100 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div className="p-4 rounded-[24px] bg-white/5 border border-white/8 flex gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" />
                <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
        </div>

        {messages.length === 1 && (
          <div className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => setInput(s.text)}
                className="flex items-center gap-3 rounded-[22px] border border-white/8 bg-white/5 p-3 text-left text-xs text-slate-400 transition-all hover:bg-white/10 hover:border-white/12 group"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center group-hover:bg-amber-300/20 group-hover:text-amber-100 transition-colors">
                  <s.icon className="w-4 h-4" />
                </div>
                {s.text}
              </button>
            ))}
          </div>
        )}

        <div className="p-6 border-t border-white/8 bg-slate-950/50">
          <form onSubmit={handleSend} className="flex gap-3">
            <Input
              placeholder="Ask anything about scholarships..."
              className="flex-1 h-12"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <Button type="submit" size="icon" className="h-12 w-12 rounded-2xl" disabled={isLoading || !input.trim()}>
              <Send className="w-5 h-5" />
            </Button>
          </form>
          <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-slate-500 uppercase font-bold tracking-widest">
            <Sparkles className="w-3 h-3" />
            Powered by International ScholarAI Intelligence
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ChatPage;
