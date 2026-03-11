import * as React from "react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Search, Filter, TrendingUp, DollarSign, Calendar, ArrowUpRight, Bookmark, Sparkles, MapPin, GraduationCap, MessageSquare, Bell, Check } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/Card";
import { cn } from "@/src/lib/utils";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

const data = [
  { name: "Jan", value: 400 },
  { name: "Feb", value: 300 },
  { name: "Mar", value: 600 },
  { name: "Apr", value: 800 },
  { name: "May", value: 500 },
  { name: "Jun", value: 900 },
];

const parseDeadline = (value: string) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getDaysLeft = (value: string) => {
  const deadline = parseDeadline(value);
  if (!deadline) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);

  const diff = deadline.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

import { useFirebase } from "../contexts/FirebaseContext";
import { db } from "../firebase";
import { collection, onSnapshot, query, limit } from "firebase/firestore";
import { GENERATED_SCHOLARSHIP_POOL, seedScholarships } from "../lib/seed";
import { getTopRecommendations, type RecommendationResult } from "../lib/recommendations";
import { getSavedScholarships, saveScholarshipToLocal } from "../lib/savedScholarships";

interface Scholarship {
  id: string;
  name: string;
  university: string;
  country: string;
  amount: string;
  deadline: string;
  matchScore?: number;
  difficulty: string;
  tags: string[];
  fields?: string[];
  targetDegrees?: string[];
  minGpa?: number;
  minIelts?: number;
  budgetSupport?: string;
}

const Dashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [totalScholarshipCount, setTotalScholarshipCount] = useState(GENERATED_SCHOLARSHIP_POOL.length);
  const [loading, setLoading] = useState(true);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [notifiedDeadline, setNotifiedDeadline] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("All Countries");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All Levels");
  const [selectedFunding, setSelectedFunding] = useState("All Funding");
  const [refreshCount, setRefreshCount] = useState(0);
  const { user, profile } = useFirebase();
  const isAdmin = profile?.role === "admin" || user?.email === "sanjain.dev@gmail.com";
  const userName =
    typeof profile?.name === "string" && profile.name.trim()
      ? profile.name
      : user?.displayName || user?.email?.split("@")[0] || "Scholar";

  useEffect(() => {
    if (!user) {
      return;
    }

    setSavedIds(getSavedScholarships<{ id: string }>(user.uid).map((item) => item.id));

    const q = query(collection(db, "scholarships"), limit(10));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Scholarship[];

        if (data.length > 0) {
          const merged = [...data, ...GENERATED_SCHOLARSHIP_POOL];
          setScholarships(merged);
          setTotalScholarshipCount(merged.length);
          setIsUsingFallback(true);
        } else {
          setScholarships(GENERATED_SCHOLARSHIP_POOL);
          setTotalScholarshipCount(GENERATED_SCHOLARSHIP_POOL.length);
          setIsUsingFallback(true);
        }

        setLoading(false);
      },
      (error) => {
        console.error("Error fetching scholarships:", error);
        setScholarships(GENERATED_SCHOLARSHIP_POOL);
        setTotalScholarshipCount(GENERATED_SCHOLARSHIP_POOL.length);
        setIsUsingFallback(true);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleSeed = async () => {
    await seedScholarships();
  };

  const handleSaveScholarship = (scholarship: RecommendationResult) => {
    if (!user) {
      return;
    }

    const payload = {
      ...scholarship,
      savedAt: new Date().toISOString(),
      status: "Saved",
    };

    saveScholarshipToLocal(user.uid, payload);
    setSavedIds((current) => (current.includes(scholarship.id) ? current : [...current, scholarship.id]));
  };

  const handleAiRefresh = () => {
    setRefreshCount((current) => current + 1);
  };

  const handleClearFilters = () => {
    setSelectedCountry("All Countries");
    setSelectedDifficulty("All Levels");
    setSelectedFunding("All Funding");
  };

  const countryOptions = ["All Countries", ...Array.from(new Set(scholarships.map((item) => item.country))).slice(0, 24)];

  const filteredScholarships = scholarships
    .filter((scholarship) => {
      const queryValue = searchQuery.trim().toLowerCase();
      if (!queryValue) {
        return true;
      }

      return [scholarship.name, scholarship.university, scholarship.country, scholarship.tags.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(queryValue);
    })
    .filter((scholarship) => {
      if (selectedCountry !== "All Countries" && scholarship.country !== selectedCountry) {
        return false;
      }

      if (selectedDifficulty !== "All Levels" && scholarship.difficulty !== selectedDifficulty) {
        return false;
      }

      if (selectedFunding === "Fully Funded" && !/fully funded/i.test(scholarship.amount)) {
        return false;
      }

      if (selectedFunding === "Stipend / Partial" && /fully funded/i.test(scholarship.amount)) {
        return false;
      }

      return true;
    });

  const filteredCount = filteredScholarships.length;
  const rotatedScholarships = React.useMemo(() => {
    if (filteredScholarships.length <= 1 || refreshCount === 0) {
      return filteredScholarships;
    }

    const offset = refreshCount % filteredScholarships.length;
    return [...filteredScholarships.slice(offset), ...filteredScholarships.slice(0, offset)];
  }, [filteredScholarships, refreshCount]);

  const topRecommendations = getTopRecommendations(profile, rotatedScholarships, 10);

  const totalFunding = topRecommendations.reduce((sum, scholarship) => {
    if (/fully funded/i.test(scholarship.amount)) {
      return sum + 50000;
    }

    const value = Number.parseInt(scholarship.amount.replace(/[^\d]/g, ""), 10);
    return sum + (Number.isNaN(value) ? 0 : value);
  }, 0);

  const deadlineItems = topRecommendations
    .map((scholarship) => {
      const days = getDaysLeft(scholarship.deadline);
      return {
        name: scholarship.name,
        date: scholarship.deadline,
        days,
      };
    })
    .filter((item): item is { name: string; date: string; days: number } => item.days !== null && item.days >= 0)
    .sort((a, b) => a.days - b.days)
    .slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="premium-surface premium-ring rounded-[34px] p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="min-w-0 flex-1">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-200/14 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.26em] text-amber-100">
            Personal Intelligence Layer
          </div>
          <h1 className="display-font text-4xl font-bold tracking-tight leading-[1.02] md:text-5xl">Welcome back, {userName}!</h1>
          <p className="mt-2 text-base text-slate-400">Here are your personalized scholarship recommendations.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          {isAdmin && (
            <Button variant="outline" size="sm" onClick={handleSeed}>
              Seed Data
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setShowFilters((current) => !current)}>
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button size="sm" onClick={handleAiRefresh}>
            <Sparkles className="w-4 h-4 mr-2" />
            AI Refresh
          </Button>
        </div>
      </div>
      </div>

      {showFilters && (
        <Card className="overflow-hidden">
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select
                className="h-12 rounded-2xl border border-white/12 bg-slate-950/65 px-4 text-sm text-slate-200 outline-none backdrop-blur-xl"
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
              >
                {countryOptions.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
              <select
                className="h-12 rounded-2xl border border-white/12 bg-slate-950/65 px-4 text-sm text-slate-200 outline-none backdrop-blur-xl"
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
              >
                {["All Levels", "High", "Medium"].map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <select
                className="h-12 rounded-2xl border border-white/12 bg-slate-950/65 px-4 text-sm text-slate-200 outline-none backdrop-blur-xl"
                value={selectedFunding}
                onChange={(e) => setSelectedFunding(e.target.value)}
              >
                {["All Funding", "Fully Funded", "Stipend / Partial"].map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-slate-400">
                {filteredCount.toLocaleString()} scholarships match the current filters.
              </div>
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Scholarships", value: totalScholarshipCount.toLocaleString(), icon: GraduationCap, color: "text-amber-300", bg: "bg-amber-300/10" },
          { label: "Matching Your Profile", value: filteredCount.toLocaleString(), icon: Sparkles, color: "text-yellow-300", bg: "bg-yellow-300/10" },
          { label: "Total Funding", value: `$${(totalFunding / 1000).toFixed(totalFunding >= 100000 ? 0 : 1)}K`, icon: DollarSign, color: "text-orange-300", bg: "bg-orange-300/10" },
          { label: "Top Match Score", value: `${topRecommendations[0]?.matchScore ?? 0}%`, icon: TrendingUp, color: "text-amber-200", bg: "bg-amber-200/10" },
        ].map((stat, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="flex items-center gap-4 p-5 md:p-6">
              <div className={cn("h-14 w-14 shrink-0 rounded-[20px] flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]", stat.bg)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] uppercase tracking-[0.16em] leading-4 text-slate-500 font-medium break-words">{stat.label}</div>
                <div className="display-font text-[2rem] leading-none font-bold md:text-3xl">{stat.value}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Scholarship List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
            <Input
              placeholder="Search scholarships by name, university, or country..."
              className="h-12 rounded-[24px] pl-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <h2 className="display-font text-2xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-300" />
              Top AI Recommendations
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {loading && (
                <Card className="border-white/5 bg-slate-900/40">
                  <CardContent className="p-10 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-amber-300/30 border-t-amber-300 rounded-full animate-spin" />
                  </CardContent>
                </Card>
              )}
              {!loading && topRecommendations.length === 0 && (
                <Card className="border-white/5 bg-slate-900/40">
                  <CardContent className="p-10 text-center space-y-3">
                    <h3 className="text-lg font-semibold">No recommendations found</h3>
                    <p className="text-sm text-slate-400">Try another search term or clear the filter.</p>
                  </CardContent>
                </Card>
              )}
              {!loading && topRecommendations.map((s: RecommendationResult, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_70px_rgba(2,8,23,0.5)]">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-full bg-amber-300/10 text-amber-100 text-[10px] font-bold uppercase tracking-[0.22em]">
                              {s.matchScore}% Match
                            </span>
                            <span className={cn(
                              "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.22em]",
                              s.difficulty === "High" ? "bg-orange-400/10 text-orange-300" : "bg-yellow-300/10 text-yellow-200"
                            )}>
                              {s.difficulty} Difficulty
                            </span>
                          </div>
                          <h3 className="display-font text-2xl font-bold group-hover:text-amber-100 transition-colors">{s.name}</h3>
                          <p className="text-sm text-slate-400">
                            {s.reasons[0]}
                          </p>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                            <div className="flex items-center gap-1">
                              <GraduationCap className="w-4 h-4" />
                              {s.university}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {s.country}
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              {s.amount}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {s.tags.map((tag, i) => (
                              <span key={i} className="text-[10px] px-2 py-1 rounded-full bg-slate-800 text-slate-400 border border-white/5">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6 md:min-w-[220px]">
                          <div className="text-right shrink-0">
                            <div className="text-[11px] text-slate-500 uppercase tracking-[0.24em] font-bold">Deadline</div>
                            <div className="display-font text-lg font-bold text-slate-100">{s.deadline}</div>
                          </div>
                          <div className="flex shrink-0 gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className={cn(
                                "rounded-2xl",
                                savedIds.includes(s.id) && "border-amber-300/40 bg-amber-300/10 text-amber-100"
                              )}
                              onClick={() => handleSaveScholarship(s)}
                            >
                              <Bookmark className={cn("w-4 h-4", savedIds.includes(s.id) && "fill-current")} />
                            </Button>
                            <Link to={`/scholarship/${s.id}`}>
                              <Button size="sm" className="rounded-full px-5">
                                View Details
                                <ArrowUpRight className="ml-2 w-4 h-4" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar - Stats & Trends */}
        <div className="space-y-8">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="display-font text-xl flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-300" />
                Funding Trends
              </CardTitle>
              <CardDescription>Global scholarship availability</CardDescription>
            </CardHeader>
            <CardContent className="h-[200px] w-full p-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f5c976" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f5c976" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#f5c976"
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="display-font text-xl flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-300" />
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {deadlineItems.map((item, i) => (
                <div key={i} className="rounded-[24px] bg-white/5 border border-white/8 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold break-words">{item.name}</div>
                      <div className="text-xs text-slate-500">{item.date}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-amber-300">{item.days} days</div>
                      <div className="text-[10px] text-slate-500 uppercase">Left</div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full rounded-full"
                    onClick={() => setNotifiedDeadline(item.name)}
                  >
                    {notifiedDeadline === item.name ? (
                      <>
                        <Check className="mr-2 h-4 w-4 text-amber-300" />
                        Reminder Set
                      </>
                    ) : (
                      <>
                        <Bell className="mr-2 h-4 w-4" />
                        Notify Me
                      </>
                    )}
                  </Button>
                </div>
              ))}
              {deadlineItems.length === 0 && (
                <div className="rounded-[24px] bg-white/5 border border-white/5 p-4 text-sm text-slate-400">
                  No upcoming scholarship deadlines are currently available.
                </div>
              )}
              <Link to="/deadlines">
                <Button variant="outline" className="w-full rounded-full text-xs">View Full Calendar</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-[linear-gradient(135deg,rgba(82,168,255,0.22),rgba(109,94,252,0.28),rgba(10,18,34,0.88))]">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <h3 className="display-font text-2xl font-bold">Need help with your application?</h3>
              <p className="text-sm text-slate-300">Our AI Assistant can help you write essays and check eligibility.</p>
              <Button className="w-full rounded-full bg-white text-slate-950 hover:bg-slate-100">Chat with AI</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
