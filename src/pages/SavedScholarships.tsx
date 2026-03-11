import * as React from "react";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Bookmark, Search, Trash2, ArrowUpRight, GraduationCap, MapPin, DollarSign, Calendar, Filter } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Card, CardContent } from "@/src/components/ui/Card";
import { cn } from "@/src/lib/utils";

import { useFirebase } from "../contexts/FirebaseContext";
import { db } from "../firebase";
import { collection, query, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { getSavedScholarships, removeScholarshipFromLocal } from "../lib/savedScholarships";
import { getScholarshipApplyLink } from "../lib/scholarshipLinks";

const SavedScholarships: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [savedScholarships, setSavedScholarships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useFirebase();

  useEffect(() => {
    if (!user) return;

    if (user.isLocal) {
      setSavedScholarships(getSavedScholarships(user.uid));
      setLoading(false);
      return;
    }

    const q = query(collection(db, "users", user.uid, "saved"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const localData = getSavedScholarships<any>(user.uid);
      const merged = [...data, ...localData.filter((item) => !data.some((saved) => saved.id === item.id))];
      setSavedScholarships(merged);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching saved scholarships:", error);
      setSavedScholarships(getSavedScholarships(user.uid));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const removeScholarship = async (id: string) => {
    if (!user) return;
    try {
      if (!user.isLocal) {
        await deleteDoc(doc(db, "users", user.uid, "saved", id));
      }
      removeScholarshipFromLocal(user.uid, id);
      setSavedScholarships((current) => current.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error removing scholarship:", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="premium-surface premium-ring flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-[34px] p-6">
        <div>
          <h1 className="display-font text-4xl font-bold tracking-tight flex items-center gap-3">
            <Bookmark className="w-8 h-8 text-amber-300" />
            Saved Scholarships
          </h1>
          <p className="text-slate-400">Track and manage your scholarship applications.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-full">
            <Filter className="w-4 h-4 mr-2" />
            Sort By
          </Button>
          <Button size="sm" className="rounded-full">
            Export List
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
        <Input
          placeholder="Search your saved scholarships..."
          className="pl-12 h-12"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {savedScholarships.length > 0 ? (
          savedScholarships.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="group overflow-hidden transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="space-y-3 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.22em]",
                          s.status === "In Progress" ? "bg-amber-300/10 text-amber-100" : "bg-slate-500/10 text-slate-400"
                        )}>
                          {s.status}
                        </span>
                      </div>
                      <h3 className="display-font text-2xl font-bold group-hover:text-amber-100 transition-colors">{s.name}</h3>
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
                    </div>
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6 md:min-w-[220px]">
                      <div className="text-right shrink-0">
                        <div className="text-xs text-slate-500 uppercase tracking-[0.22em] font-bold">Deadline</div>
                        <div className="display-font text-lg font-bold text-slate-200">{s.deadline}</div>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Button variant="ghost" size="icon" className="rounded-2xl text-red-500 hover:bg-red-500/10 hover:text-red-400" onClick={() => removeScholarship(s.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <a
                          href={getScholarshipApplyLink(s)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button size="sm" className="rounded-full px-5">
                            Apply Now
                            <ArrowUpRight className="ml-2 w-4 h-4" />
                          </Button>
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-20 bg-white/5 rounded-[32px] border border-dashed border-white/10">
            <Bookmark className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <h3 className="display-font text-2xl font-bold mb-2">No saved scholarships yet</h3>
            <p className="text-slate-500 mb-6">Start browsing and bookmark the ones you're interested in.</p>
            <Button variant="primary" className="rounded-full px-5">Browse Scholarships</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedScholarships;
