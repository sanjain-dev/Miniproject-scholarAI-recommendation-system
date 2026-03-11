import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, ChevronLeft, ChevronRight, Clock, Bell, ArrowUpRight } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays } from "date-fns";
import { collection, onSnapshot, query } from "firebase/firestore";

import { Button } from "@/src/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/Card";
import { cn } from "@/src/lib/utils";
import { useFirebase } from "../contexts/FirebaseContext";
import { db } from "../firebase";
import { GENERATED_SCHOLARSHIP_POOL } from "../lib/seed";
import { getTopRecommendations, type RecommendationResult } from "../lib/recommendations";

interface ScholarshipDeadline {
  id: string;
  name: string;
  country: string;
  university: string;
  amount: string;
  deadline: string;
  matchScore?: number;
  difficulty: string;
  tags: string[];
  date: Date | null;
}

const parseDeadline = (value: string) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getDaysLeft = (date: Date | null) => {
  if (!date) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadline = new Date(date);
  deadline.setHours(0, 0, 0, 0);

  const diff = deadline.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const DeadlineTracker: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [liveScholarships, setLiveScholarships] = useState<ScholarshipDeadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifiedId, setNotifiedId] = useState<string | null>(null);
  const { user, profile } = useFirebase();

  useEffect(() => {
    if (!user) {
      return;
    }

    const q = query(collection(db, "scholarships"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => {
          const value = doc.data();
          return {
            id: doc.id,
            name: String(value.name ?? ""),
            country: String(value.country ?? ""),
            university: String(value.university ?? ""),
            amount: String(value.amount ?? "Funding details available on provider page"),
            deadline: String(value.deadline ?? ""),
            matchScore: typeof value.matchScore === "number" ? value.matchScore : undefined,
            difficulty: String(value.difficulty ?? "Medium"),
            tags: Array.isArray(value.tags) ? value.tags.map((item) => String(item)) : [],
            date: parseDeadline(String(value.deadline ?? "")),
          };
        });

        setLiveScholarships(data);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching deadlines:", error);
        setLiveScholarships([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const upcomingDeadlines = useMemo(() => {
    const merged = [...liveScholarships, ...GENERATED_SCHOLARSHIP_POOL]
      .map((item) => ({
        ...item,
        date: "date" in item && item.date instanceof Date ? item.date : parseDeadline(item.deadline),
      }))
      .filter((item): item is ScholarshipDeadline & { date: Date } => item.date !== null)
      .filter((item) => {
        const days = getDaysLeft(item.date);
        return days !== null && days >= 0;
      });

    const topMatches = getTopRecommendations(profile, merged, 80);

    return topMatches
      .map((item) => ({
        ...item,
        date: parseDeadline(item.deadline),
      }))
      .filter((item): item is RecommendationResult & { date: Date } => item.date !== null)
      .filter((item) => {
        const days = getDaysLeft(item.date);
        return days !== null && days >= 0;
      })
      .sort((a, b) => {
        const dayDiff = a.date.getTime() - b.date.getTime();
        if (dayDiff !== 0) {
          return dayDiff;
        }

        return (b.matchScore ?? 0) - (a.matchScore ?? 0);
      });
  }, [liveScholarships, profile]);

  const selectedDateDeadlines = upcomingDeadlines.filter((item) => isSameDay(item.date, selectedDate));
  const featuredDeadlines = upcomingDeadlines.slice(0, 18);

  const renderHeader = () => (
    <div className="premium-surface premium-ring mb-8 flex flex-col gap-4 rounded-[34px] p-6 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-[20px] bg-amber-300/15 flex items-center justify-center">
          <Calendar className="text-amber-100 w-6 h-6" />
        </div>
        <div>
          <h1 className="display-font text-4xl font-bold tracking-tight">Full Deadline Calendar</h1>
          <p className="text-slate-400">See more upcoming scholarship deadlines matched to the candidate profile.</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" className="rounded-full" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div className="display-font text-xl font-bold min-w-[160px] text-center">
          {format(currentMonth, "MMMM yyyy")}
        </div>
        <Button variant="outline" size="icon" className="rounded-full" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  const renderDays = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return (
      <div className="grid grid-cols-7 mb-4">
        {days.map((day) => (
          <div key={day} className="text-center text-xs font-bold text-slate-500 uppercase tracking-[0.22em]">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i += 1) {
        const cloneDay = day;
        const deadlineCount = upcomingDeadlines.filter((item) => isSameDay(item.date, cloneDay)).length;

        days.push(
          <button
            key={day.toString()}
            type="button"
            className={cn(
              "h-24 p-2 border border-white/8 transition-all relative text-left",
              !isSameMonth(day, monthStart) ? "bg-slate-950/20 text-slate-700" : "bg-slate-900/40 text-slate-300",
              isSameDay(day, selectedDate) ? "bg-amber-300/10 border-amber-300/50" : "hover:bg-white/5"
            )}
            onClick={() => setSelectedDate(cloneDay)}
          >
            <span className={cn("text-sm font-medium", isSameDay(day, new Date()) ? "w-7 h-7 rounded-full bg-amber-300 text-stone-950 flex items-center justify-center" : "")}>
              {format(day, "d")}
            </span>
            {deadlineCount > 0 && (
              <div className="absolute bottom-2 left-2 right-2 space-y-1">
                <div className="w-full h-1.5 rounded-full bg-amber-300 shadow-[0_0_10px_rgba(245,201,118,0.35)]" />
                <div className="text-[10px] text-amber-100">{deadlineCount} upcoming</div>
              </div>
            )}
          </button>
        );

        day = addDays(day, 1);
      }

      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }

    return <div className="rounded-[30px] overflow-hidden border border-white/8">{rows}</div>;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {renderHeader()}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          {renderDays()}
          {renderCells()}

          <Card>
            <CardHeader>
              <CardTitle className="display-font text-2xl flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-300" />
                Upcoming Deadlines
              </CardTitle>
              <CardDescription>
                {featuredDeadlines.length > 0
                  ? `Showing ${featuredDeadlines.length} upcoming deadlines sorted by nearest date.`
                  : "No upcoming deadlines are available right now."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading && (
                <div className="p-6 text-sm text-slate-400">Loading upcoming deadlines...</div>
              )}
              {!loading && featuredDeadlines.map((item) => {
                const days = getDaysLeft(item.date) ?? 0;
                return (
                  <div key={item.id} className="rounded-[24px] border border-white/8 bg-white/5 p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                      <div className="display-font text-xl font-semibold">{item.name}</div>
                      <div className="text-sm text-slate-400">{item.university} • {item.country}</div>
                      <div className="text-xs text-slate-500">
                        Deadline: {item.deadline} • Match Score: {item.matchScore ?? 0}%
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 md:items-end">
                      <div className="text-right">
                        <div className="text-amber-300 font-bold">{days} days left</div>
                        <div className="text-xs text-slate-500">Upcoming application window</div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          onClick={() => setNotifiedId(item.id)}
                        >
                          <Bell className="mr-2 h-4 w-4" />
                          {notifiedId === item.id ? "Reminder Set" : "Notify Me"}
                        </Button>
                        <Link to={`/scholarship/${item.id}`}>
                          <Button size="sm" className="rounded-full px-5">
                            View Details
                            <ArrowUpRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="display-font text-2xl flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-300" />
                Selected Date
              </CardTitle>
              <CardDescription>{format(selectedDate, "MMMM d, yyyy")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedDateDeadlines.length > 0 ? (
                selectedDateDeadlines.map((item) => (
                  <div key={item.id} className="rounded-[24px] border border-amber-300/20 bg-amber-300/10 p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-bold">{item.name}</div>
                      <div className="text-xs text-amber-100">{item.matchScore ?? 0}% match</div>
                    </div>
                    <div className="text-sm text-slate-300">{item.university}</div>
                    <div className="text-xs text-slate-400">{item.country}</div>
                    <Link to={`/scholarship/${item.id}`}>
                      <Button size="sm" className="w-full rounded-full">View Details</Button>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="rounded-[24px] border border-white/8 bg-white/5 p-4 text-sm text-slate-400">
                  No upcoming deadlines on this date.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="display-font text-2xl">Quick Summary</CardTitle>
              <CardDescription>Upcoming deadlines only. Past dates are excluded automatically.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-300">
              <div className="rounded-[22px] border border-white/8 bg-white/5 p-3">
                Total upcoming matches: <span className="font-semibold text-white">{upcomingDeadlines.length}</span>
              </div>
              <div className="rounded-[22px] border border-white/8 bg-white/5 p-3">
                Nearest deadline: <span className="font-semibold text-white">{upcomingDeadlines[0]?.deadline ?? "Not available"}</span>
              </div>
              <div className="rounded-[22px] border border-white/8 bg-white/5 p-3">
                Selected date items: <span className="font-semibold text-white">{selectedDateDeadlines.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DeadlineTracker;
