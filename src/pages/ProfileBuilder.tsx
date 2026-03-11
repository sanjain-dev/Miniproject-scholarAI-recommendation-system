import * as React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { GraduationCap, Globe, BookOpen, Award, DollarSign, MapPin, ArrowRight, ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/Card";
import { cn } from "@/src/lib/utils";

import { useFirebase } from "../contexts/FirebaseContext";

const ProfileBuilder: React.FC = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user, saveProfile } = useFirebase();

  const [formData, setFormData] = useState({
    name: "",
    country: "",
    degree: "12th",
    field: "",
    gpa: "",
    ielts: "",
    toefl: "",
    budget: "",
    preferredCountries: "",
  });

  const nextStep = () => setStep((s) => Math.min(s + 1, 4));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      await saveProfile({
        ...formData,
        uid: user.uid,
        email: user.email,
        gpa: parseFloat(formData.gpa) || 0,
        budget: parseFloat(formData.budget) || 0,
        createdAt: new Date().toISOString(),
      });
      navigate("/dashboard");
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { title: "Personal Info", icon: GraduationCap },
    { title: "Academic Record", icon: BookOpen },
    { title: "Preferences", icon: MapPin },
    { title: "Review", icon: CheckCircle2 },
  ];

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="premium-surface premium-ring flex items-center justify-between mb-12 relative rounded-[30px] px-5 py-6">
          <div className="absolute top-1/2 left-5 right-5 h-0.5 bg-white/5 -translate-y-1/2 z-0" />
          <div
            className="absolute top-1/2 left-5 h-0.5 bg-[linear-gradient(90deg,rgba(82,168,255,0.95),rgba(109,94,252,0.95))] -translate-y-1/2 z-0 transition-all duration-500"
            style={{ width: `calc(${((step - 1) / (steps.length - 1)) * 100}% - 2.5rem)` }}
          />
          {steps.map((s, i) => (
            <div key={i} className="relative z-10 flex flex-col items-center gap-2">
              <div
                className={cn(
                  "w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                  step > i + 1
                    ? "bg-[linear-gradient(135deg,rgba(82,168,255,0.92),rgba(109,94,252,0.95))] border-transparent text-white"
                    : step === i + 1
                    ? "bg-slate-900 border-amber-300 text-amber-100 shadow-[0_0_20px_rgba(245,201,118,0.18)]"
                    : "bg-slate-950 border-white/10 text-slate-500"
                )}
              >
                {step > i + 1 ? <CheckCircle2 className="w-6 h-6" /> : <s.icon className="w-5 h-5" />}
              </div>
              <span className={cn(
                "text-[11px] font-medium uppercase tracking-[0.14em] transition-colors",
                step === i + 1 ? "text-amber-100" : "text-slate-500"
              )}>
                {s.title}
              </span>
            </div>
          ))}
        </div>

        <Card className="overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="p-8"
            >
              {step === 1 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="display-font text-3xl font-bold">Tell us about yourself</h2>
                    <p className="text-slate-400">Let's start with the basics to personalize your experience.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Full Name</label>
                      <Input
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Country of Residence</label>
                      <Input
                        placeholder="United States"
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Current Degree Level</label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {["10th", "12th", "Diploma", "Bachelor", "Master", "PhD"].map((d) => (
                        <button
                          key={d}
                          onClick={() => setFormData({ ...formData, degree: d })}
                          className={cn(
                            "px-4 py-3 rounded-2xl border text-sm font-medium transition-all",
                            formData.degree === d
                              ? "bg-amber-300/16 border-amber-300 text-amber-100 shadow-[0_0_16px_rgba(245,201,118,0.16)]"
                              : "bg-slate-950/50 border-white/5 text-slate-400 hover:border-white/10"
                          )}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="display-font text-3xl font-bold">Academic Achievement</h2>
                    <p className="text-slate-400">Your grades and test scores help us find the best matches.</p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Field of Study</label>
                      <Input
                        placeholder="Computer Science, Medicine, Arts..."
                        value={formData.field}
                        onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">CGPA (out of 10)</label>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="8.5"
                          value={formData.gpa}
                          onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">IELTS (out of 9)</label>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="7.5"
                          value={formData.ielts}
                          onChange={(e) => setFormData({ ...formData, ielts: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">TOEFL (out of 120)</label>
                        <Input
                          type="number"
                          placeholder="95"
                          value={formData.toefl}
                          onChange={(e) => setFormData({ ...formData, toefl: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="display-font text-3xl font-bold">Preferences & Budget</h2>
                    <p className="text-slate-400">Where do you want to go and what's your budget?</p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Preferred Countries</label>
                      <Input
                        placeholder="UK, Germany, Canada..."
                        value={formData.preferredCountries}
                        onChange={(e) => setFormData({ ...formData, preferredCountries: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Annual Budget (USD)</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                        <Input
                          type="number"
                          placeholder="10000"
                          className="pl-10"
                          value={formData.budget}
                          onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="display-font text-3xl font-bold">Review Your Profile</h2>
                    <p className="text-slate-400">Make sure everything is correct before we start searching.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: "Name", value: formData.name },
                      { label: "Country", value: formData.country },
                      { label: "Degree", value: formData.degree },
                      { label: "Field", value: formData.field },
                      { label: "CGPA", value: formData.gpa },
                      { label: "IELTS", value: formData.ielts },
                      { label: "TOEFL", value: formData.toefl },
                      { label: "Budget", value: `$${formData.budget}` },
                      { label: "Preferred", value: formData.preferredCountries },
                    ].map((item, i) => (
                      <div key={i} className="p-4 rounded-[22px] bg-white/5 border border-white/8">
                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.22em]">{item.label}</div>
                        <div className="text-slate-200 font-medium">{item.value || "Not specified"}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mt-12 pt-8 border-t border-white/8">
                <Button
                  variant="ghost"
                  onClick={prevStep}
                  disabled={step === 1 || isLoading}
                  className={step === 1 ? "invisible" : ""}
                >
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Back
                </Button>
                {step < 4 ? (
                  <Button onClick={nextStep} className="rounded-full px-5">
                    Continue
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={isLoading} className="rounded-full px-5">
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Find Scholarships
                        <Sparkles className="ml-2 w-4 h-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </Card>
      </div>
    </div>
  );
};

export default ProfileBuilder;
