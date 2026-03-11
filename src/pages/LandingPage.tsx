import * as React from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ArrowRight, Globe, ShieldCheck, Sparkles, Target, Zap } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Card, CardContent } from "@/src/components/ui/Card";

import { cn } from "@/src/lib/utils";

const featureCards = [
  {
    title: "Hyper-Personal Matching",
    desc: "Every recommendation feels handpicked from a global scholarship universe tuned to your academic trajectory.",
    icon: Sparkles,
    color: "text-amber-100",
    bg: "bg-amber-300/10",
  },
  {
    title: "Deadline Intelligence",
    desc: "Premium timeline views, reminders, and live prioritization help you move before opportunities expire.",
    icon: Target,
    color: "text-yellow-200",
    bg: "bg-yellow-300/10",
  },
  {
    title: "Verified Opportunity Layer",
    desc: "Scholarships, documents, and application steps are presented in a polished system built for serious applicants.",
    icon: ShieldCheck,
    color: "text-orange-200",
    bg: "bg-orange-300/10",
  },
];

const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center overflow-hidden">
      <section className="relative w-full max-w-7xl px-4 pb-28 pt-16 md:pt-24">
        <div className="grid items-center gap-16 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-amber-200/18 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-amber-100 shadow-[0_12px_40px_rgba(210,154,57,0.12)]"
            >
              <Sparkles className="h-4 w-4" />
              AI-Powered Scholarship Discovery
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.05 }}
              className="display-font max-w-4xl text-5xl font-bold leading-[0.94] text-white md:text-7xl xl:text-[5.6rem]"
            >
              The premium scholarship cockpit for
              <span className="bg-[linear-gradient(135deg,#fff8ee_10%,#f5c976_50%,#d29a39_100%)] bg-clip-text text-transparent"> ambitious students worldwide.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="mt-8 max-w-2xl text-lg leading-8 text-slate-300 md:text-xl"
            >
              ScholarAI blends elegant interfaces, dynamic guidance, and deeply personalized matching so every search feels premium from the first click.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.16 }}
              className="mt-10 flex flex-col gap-4 sm:flex-row"
            >
              <Link to="/signup">
                <Button size="lg" className="w-full rounded-full px-8 sm:w-auto">
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/search">
                <Button variant="outline" size="lg" className="w-full rounded-full px-8 sm:w-auto">
                  Explore Scholarship Search
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.24 }}
              className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3"
            >
              {[
                ["120K+", "Scholarship records"],
                ["195", "Countries covered"],
                ["24/7", "AI-guided support"],
              ].map(([value, label]) => (
                <div key={label} className="premium-surface premium-ring rounded-[26px] px-5 py-5">
                  <div className="display-font text-3xl font-bold text-white">{value}</div>
                  <div className="mt-1 text-sm text-slate-400">{label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.18 }}
            className="relative"
          >
            <div className="premium-ring soft-shimmer relative overflow-hidden rounded-[34px] border border-white/12 bg-[radial-gradient(circle_at_top_left,rgba(245,201,118,0.18),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02)),rgba(7,14,28,0.92)] p-6 shadow-[0_30px_100px_rgba(2,8,23,0.5)]">
              <div className="mb-6 flex items-center justify-between rounded-[24px] border border-white/10 bg-white/[0.04] px-4 py-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.28em] text-slate-500">ScholarAI Preview</div>
                  <div className="display-font mt-1 text-xl font-bold">Global Match Board</div>
                </div>
                <div className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-semibold text-amber-100">
                  Live Insights
                </div>
              </div>

              <div className="space-y-4">
                {[
                  ["Chevening Scholarship", "United Kingdom", "98% match"],
                  ["Gates Cambridge", "United Kingdom", "96% match"],
                  ["Erasmus Mundus", "Europe", "94% match"],
                ].map(([title, place, score], index) => (
                  <motion.div
                    key={title}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.45 }}
                    className="premium-surface rounded-[26px] p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="display-font text-lg font-bold">{title}</div>
                        <div className="mt-1 text-sm text-slate-400">{place}</div>
                      </div>
                      <div className="rounded-full bg-amber-300/10 px-3 py-1 text-xs font-semibold text-amber-100">
                        {score}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="premium-surface rounded-[24px] p-4">
                  <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Funding Index</div>
                  <div className="display-font mt-3 text-3xl font-bold text-white">$2.4M</div>
                  <div className="mt-1 text-sm text-slate-400">Visible support pool</div>
                </div>
                <div className="premium-surface rounded-[24px] p-4">
                  <div className="text-xs uppercase tracking-[0.28em] text-slate-500">Open Windows</div>
                  <div className="display-font mt-3 text-3xl font-bold text-white">42</div>
                  <div className="mt-1 text-sm text-slate-400">Relevant deadlines now</div>
                </div>
              </div>
            </div>

            <div className="absolute -left-8 top-10 hidden rounded-[24px] border border-white/12 bg-slate-950/70 p-4 shadow-[0_18px_50px_rgba(2,8,23,0.45)] backdrop-blur-xl lg:block animate-float-slow">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-300/12">
                  <Globe className="h-5 w-5 text-amber-100" />
                </div>
                <div>
                  <div className="display-font text-lg font-bold">195 countries</div>
                  <div className="text-xs text-slate-400">Global reach</div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-8 right-4 hidden rounded-[24px] border border-white/12 bg-slate-950/70 p-4 shadow-[0_18px_50px_rgba(2,8,23,0.45)] backdrop-blur-xl lg:block animate-float-slow [animation-delay:1.2s]">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-300/12">
                  <Zap className="h-5 w-5 text-yellow-200" />
                </div>
                <div>
                  <div className="display-font text-lg font-bold">Instant scoring</div>
                  <div className="text-xs text-slate-400">AI-tuned shortlist</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="w-full max-w-7xl px-4 py-24">
        <div className="mb-14 text-center">
          <div className="text-xs uppercase tracking-[0.34em] text-slate-500">Why ScholarAI</div>
          <h2 className="display-font mt-4 text-4xl font-bold md:text-5xl">Crafted to feel fast, sharp, and high-trust.</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {featureCards.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
            >
              <Card className="h-full">
                <CardContent className="p-8">
                  <div className={cn("mb-6 flex h-14 w-14 items-center justify-center rounded-2xl", feature.bg)}>
                    <feature.icon className={cn("h-6 w-6", feature.color)} />
                  </div>
                  <h3 className="display-font text-2xl font-bold">{feature.title}</h3>
                  <p className="mt-4 text-base leading-7 text-slate-400">{feature.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="w-full px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <Card className="overflow-hidden bg-[linear-gradient(135deg,rgba(245,201,118,0.18),rgba(210,154,57,0.22),rgba(2,6,23,0.92))]">
            <CardContent className="relative p-10 text-center md:p-16">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_40%)]" />
              <div className="relative">
                <div className="text-xs uppercase tracking-[0.34em] text-amber-100/80">Move with confidence</div>
                <h2 className="display-font mt-4 text-4xl font-bold text-white md:text-5xl">
                  Premium scholarship discovery starts here.
                </h2>
                <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-200/85">
                  Keep every workflow you already built. Just enjoy a cleaner, richer, more premium interface across the entire experience.
                </p>
                <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
                  <Link to="/signup">
                    <Button size="lg" variant="secondary" className="rounded-full bg-white text-slate-950 hover:bg-slate-100">
                      Create Your Profile
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button size="lg" variant="outline" className="rounded-full border-white/20 text-white hover:bg-white/10">
                      Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
