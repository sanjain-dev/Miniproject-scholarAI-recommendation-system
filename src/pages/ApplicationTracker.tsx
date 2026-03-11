import * as React from "react";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { CheckCircle2, Clock, AlertCircle, ArrowRight, GraduationCap, MapPin, DollarSign, Calendar, Filter, Search, MoreVertical } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/Card";
import { cn } from "@/src/lib/utils";
import { useFirebase } from "../contexts/FirebaseContext";
import { db } from "../firebase";
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";

const ApplicationTracker: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useFirebase();

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "users", user.uid, "applications"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setApplications(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching applications:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const updateStatus = async (id: string, newStatus: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.uid, "applications", id), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error updating application status:", error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Applied": return <CheckCircle2 className="w-5 h-5 text-amber-300" />;
      case "In Progress": return <Clock className="w-5 h-5 text-yellow-200" />;
      case "Not Started": return <AlertCircle className="w-5 h-5 text-slate-500" />;
      default: return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-amber-300" />
            Application Tracker
          </h1>
          <p className="text-slate-400">Manage your active scholarship applications and tasks.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Sort By
          </Button>
          <Button size="sm">
            Add Application
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
        <Input
          placeholder="Search your applications..."
          className="pl-10 h-12 bg-slate-900/50 border-white/10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {applications.map((app, i) => (
          <motion.div
            key={app.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-white/5 bg-slate-900/40 backdrop-blur-md overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row">
                  {/* Left Side - Info */}
                  <div className="p-6 lg:p-8 flex-1 border-b lg:border-b-0 lg:border-r border-white/5 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(app.status)}
                        <span className={cn(
                          "text-xs font-bold uppercase tracking-wider",
                          app.status === "Applied" ? "text-amber-300" : app.status === "In Progress" ? "text-yellow-200" : "text-slate-500"
                        )}>
                          {app.status}
                        </span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold">{app.name}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                        <div className="flex items-center gap-1">
                          <GraduationCap className="w-4 h-4" />
                          {app.university}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {app.country}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Application Progress</span>
                        <span className="font-bold">{app.progress}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${app.progress}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className={cn(
                            "h-full rounded-full",
                            app.status === "Applied" ? "bg-amber-300" : "bg-yellow-300 shadow-[0_0_10px_rgba(245,201,118,0.4)]"
                          )}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Calendar className="w-4 h-4" />
                        Deadline: <span className="text-slate-200 font-medium">{app.deadline}</span>
                      </div>
                      <Button size="sm" variant="outline">View Details</Button>
                    </div>
                  </div>

                  {/* Right Side - Tasks */}
                  <div className="p-6 lg:p-8 w-full lg:w-80 bg-slate-950/30 space-y-6">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-slate-500">Tasks</h4>
                    <div className="space-y-3">
                      {app.tasks.map((task, i) => (
                        <div key={i} className="flex items-center gap-3 group cursor-pointer">
                          <div className={cn(
                            "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                            task.completed
                              ? "bg-amber-300 border-amber-300 text-stone-950"
                              : "bg-transparent border-white/10 group-hover:border-white/20"
                          )}>
                            {task.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </div>
                          <span className={cn(
                            "text-sm transition-colors",
                            task.completed ? "text-slate-400 line-through" : "text-slate-200 group-hover:text-white"
                          )}>
                            {task.name}
                          </span>
                        </div>
                      ))}
                    </div>
                    <Button variant="ghost" size="sm" className="w-full text-xs border border-dashed border-white/10 hover:border-white/20">
                      Add New Task
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ApplicationTracker;
