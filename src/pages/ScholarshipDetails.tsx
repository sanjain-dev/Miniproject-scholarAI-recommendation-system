import * as React from "react";
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import { GraduationCap, MapPin, DollarSign, Calendar, ArrowLeft, Bookmark, Share2, Globe, CheckCircle2, AlertCircle, Sparkles, Target, FileText, UserCheck, Mail, MessageCircle, Copy, Check } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/Card";
import { cn } from "@/src/lib/utils";

import { useFirebase } from "../contexts/FirebaseContext";
import { db } from "../firebase";
import { deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { GENERATED_SCHOLARSHIP_POOL, MOCK_SCHOLARSHIPS } from "../lib/seed";
import { scoreScholarship } from "../lib/recommendations";
import { isScholarshipSavedLocal, removeScholarshipFromLocal, saveScholarshipToLocal } from "../lib/savedScholarships";
import { getScholarshipApplyLink } from "../lib/scholarshipLinks";
import { deriveApplicationSteps, deriveEligibilityRequirements, deriveRequiredDocuments } from "../lib/scholarshipRequirements";

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

const ScholarshipDetails: React.FC = () => {
  const { id } = useParams();
  const [scholarship, setScholarship] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { user, profile } = useFirebase();
  const findFallbackScholarship = (scholarshipId: string) =>
    MOCK_SCHOLARSHIPS.find((item) => item.id === scholarshipId) ??
    GENERATED_SCHOLARSHIP_POOL.find((item) => item.id === scholarshipId);

  useEffect(() => {
    const fetchScholarship = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "scholarships", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setScholarship(scoreScholarship(profile, { id: docSnap.id, ...docSnap.data() } as any));
        } else {
          const fallbackScholarship = findFallbackScholarship(id);
          if (fallbackScholarship) {
            setScholarship(scoreScholarship(profile, fallbackScholarship));
          }
        }
      } catch (error) {
        console.error("Error fetching scholarship:", error);
        const fallbackScholarship = findFallbackScholarship(id);
        if (fallbackScholarship) {
          setScholarship(scoreScholarship(profile, fallbackScholarship));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchScholarship();
  }, [id, profile]);

  useEffect(() => {
    if (!user || !scholarship) {
      return;
    }

    setIsSaved(isScholarshipSavedLocal(user.uid, scholarship.id));
  }, [scholarship, user]);

  const applyLink = scholarship ? getScholarshipApplyLink(scholarship) : "#";
  const eligibilityItems =
    scholarship?.eligibility?.length > 0
      ? scholarship.eligibility
      : deriveEligibilityRequirements(scholarship || {});
  const documentItems =
    scholarship?.documents?.length > 0
      ? scholarship.documents
      : deriveRequiredDocuments(scholarship || {});
  const applicationSteps =
    scholarship?.steps?.length > 0
      ? scholarship.steps
      : deriveApplicationSteps(scholarship || {});
  const shareText = scholarship
    ? `Check out ${scholarship.name} on ScholarAI: ${applyLink}`
    : "";
  const daysLeft = scholarship?.deadline ? getDaysLeft(scholarship.deadline) : null;

  const explainEligibility = (item: string) => {
    const value = item.toLowerCase();

    if (value.includes("eligible to study")) {
      return "Student visa rules, nationality, and admission eligibility should allow you to study in this country.";
    }
    if (value.includes("12th / bachelor's")) {
      return "You should have completed the previous level of education needed to enter this program.";
    }
    if (value.includes("research interest")) {
      return "You may need past projects, publications, or a clear research topic to prove academic readiness.";
    }
    if (value.includes("academic background")) {
      return "Your previous course or specialization should match this scholarship's subject area.";
    }
    if (value.includes("cgpa")) {
      return "Your marks should meet or exceed the minimum academic cutoff expected by the scholarship.";
    }
    if (value.includes("english proficiency")) {
      return "You should keep a valid IELTS or TOEFL score report ready while applying.";
    }
    if (value.includes("government scholarship rules")) {
      return "Some government scholarships also check age, work experience, and return-to-home-country conditions.";
    }
    if (value.includes("research proposal")) {
      return "A strong proposal or topic statement helps them judge whether your academic plan is suitable.";
    }
    if (value.includes("leadership")) {
      return "Clubs, volunteering, internships, or impact activities can strengthen this part of your profile.";
    }

    return "This is one of the important conditions the applicant should satisfy before applying.";
  };

  const explainDocument = (item: string) => {
    const value = item.toLowerCase();

    if (value.includes("transcript")) {
      return "Official mark sheets or semester records are needed to verify academic performance.";
    }
    if (value.includes("passport") || value.includes("id proof")) {
      return "Identity proof is used to confirm your nationality, name, and basic eligibility.";
    }
    if (value.includes("statement of purpose")) {
      return "This explains your goals, why you chose the course, and why you deserve the scholarship.";
    }
    if (value.includes("research proposal")) {
      return "A short document describing your research topic, objectives, and academic plan.";
    }
    if (value.includes("recommendation")) {
      return "Teachers, professors, or employers usually write these to support your application.";
    }
    if (value.includes("ielts") || value.includes("toefl")) {
      return "Language score reports prove that you meet the English proficiency condition.";
    }
    if (value.includes("financial")) {
      return "Some scholarships ask for financial details to understand need-based support eligibility.";
    }

    return "Keep this document ready in the required format before starting the final application.";
  };

  const explainStep = (step: string) => {
    const value = step.toLowerCase();

    if (value.includes("check") && value.includes("eligibility")) {
      return "Begin on the official scholarship or university admissions page and confirm the degree level, nationality criteria, CGPA requirement, English test requirement, and application deadline before preparing the application.";
    }
    if (value.includes("prepare required documents")) {
      return "Collect all required documents in advance, including transcripts, passport, score reports, statement of purpose, CV, and recommendation letters where applicable. Keep them in clear PDF format for upload.";
    }
    if (value.includes("complete scholarship application form")) {
      return "Open the official application portal, create an account, and complete each section carefully. This usually includes personal details, academic background, essays, and document uploads.";
    }
    if (value.includes("research proposal")) {
      return "For research-based scholarships, prepare a clear proposal that explains your topic, objective, methodology, and expected outcome. Some institutions require this in the portal, while others request it by email.";
    }
    if (value.includes("track shortlisting")) {
      return "After submission, check your email inbox, spam folder, and application portal regularly. Shortlisting updates, interview invitations, and correction requests are usually shared there.";
    }
    if (value.includes("find a supervisor")) {
      return "Visit the university department website and identify faculty members whose research interests match your academic goals. Then send a concise email with your CV and a short research summary.";
    }
    if (value.includes("apply to daad")) {
      return "Use the official DAAD portal to create an account, select the appropriate programme, and upload all required forms, CV, proposal, and academic records before final submission.";
    }
    if (value.includes("interview")) {
      return "If you are shortlisted, prepare for questions about your motivation, academic goals, and reasons for choosing the programme and country. Practice clear and confident answers in advance.";
    }

    return "Complete this stage by following the instructions provided on the official scholarship page before moving to the next step.";
  };

  const handleSave = async () => {
    if (!user || !scholarship) {
      return;
    }

    const payload = {
      ...scholarship,
      savedAt: new Date().toISOString(),
      status: "Saved",
    };

    try {
      if (isSaved) {
        if (!user.isLocal) {
          await deleteDoc(doc(db, "users", user.uid, "saved", scholarship.id));
        }
        removeScholarshipFromLocal(user.uid, scholarship.id);
        setIsSaved(false);
        setSaveMessage("Removed from saved scholarships");
      } else {
        if (!user.isLocal) {
          await setDoc(doc(db, "users", user.uid, "saved", scholarship.id), payload);
        }
        saveScholarshipToLocal(user.uid, payload);
        setIsSaved(true);
        setSaveMessage("Saved to your profile");
      }
    } catch (error) {
      console.error("Error saving scholarship:", error);
      if (isSaved) {
        removeScholarshipFromLocal(user.uid, scholarship.id);
        setIsSaved(false);
        setSaveMessage("Removed from saved scholarships");
      } else {
        saveScholarshipToLocal(user.uid, payload);
        setIsSaved(true);
        setSaveMessage("Saved to your profile");
      }
    }

    window.setTimeout(() => setSaveMessage(""), 2500);
  };

  const shareOptions = [
    {
      label: "WhatsApp",
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
    },
    {
      label: "Email",
      icon: Mail,
      href: `mailto:?subject=${encodeURIComponent(scholarship?.name || "Scholarship")}&body=${encodeURIComponent(shareText)}`,
    },
    {
      label: "SMS",
      icon: MessageCircle,
      href: `sms:?body=${encodeURIComponent(shareText)}`,
    },
  ];

  const handleCopy = async () => {
    if (!applyLink || applyLink === "#") {
      return;
    }

    await navigator.clipboard.writeText(applyLink);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-300/30 border-t-amber-300 rounded-full animate-spin" />
      </div>
    );
  }

  if (!scholarship) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h2 className="text-2xl font-bold">Scholarship not found</h2>
        <Link to="/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <Link to="/dashboard" className="inline-flex items-center text-sm text-slate-400 hover:text-white transition-colors group">
        <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="premium-surface premium-ring rounded-[34px] p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-amber-300/10 text-amber-100 text-xs font-bold uppercase tracking-[0.22em] border border-amber-300/20">
                {scholarship.matchScore}% Match
              </span>
              <span className="px-3 py-1 rounded-full bg-orange-400/10 text-orange-300 text-xs font-bold uppercase tracking-[0.22em] border border-orange-400/20">
                {scholarship.difficulty} Difficulty
              </span>
            </div>
            <h1 className="display-font break-words text-4xl md:text-6xl font-bold tracking-tight">{scholarship.name}</h1>
            <div className="flex flex-wrap items-center gap-4 md:gap-6 text-slate-400">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-amber-300" />
                <span className="text-slate-200">{scholarship.university}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-yellow-300" />
                <span className="text-slate-200">{scholarship.country}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-200" />
                <span className="text-slate-200">{scholarship.amount}</span>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="display-font text-2xl">About this Scholarship</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 leading-8 text-base">
              {scholarship.description}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="display-font text-2xl font-bold flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-amber-300" />
                Eligibility Requirements
              </h3>
              <ul className="space-y-3">
                {eligibilityItems.map((item, i) => (
                  <li key={i} className="flex gap-3 rounded-[24px] border border-white/8 bg-white/[0.05] p-4">
                    <CheckCircle2 className="mt-0.5 w-5 h-5 text-amber-300 flex-shrink-0" />
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-slate-100">{item}</div>
                      <div className="text-xs leading-6 text-slate-400">{explainEligibility(item)}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="display-font text-2xl font-bold flex items-center gap-2">
                <FileText className="w-5 h-5 text-yellow-300" />
                Required Documents
              </h3>
              <ul className="space-y-3">
                {documentItems.map((item, i) => (
                  <li key={i} className="flex gap-3 rounded-[24px] border border-white/8 bg-white/[0.05] p-4">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-yellow-300/10 flex items-center justify-center flex-shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-300" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-slate-100">{item}</div>
                      <div className="text-xs leading-6 text-slate-400">{explainDocument(item)}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="display-font text-2xl font-bold flex items-center gap-2">
              <Target className="w-5 h-5 text-amber-300" />
              Application Steps
            </h3>
            <div className="space-y-4">
              {applicationSteps.map((step, i) => (
                <div key={i} className="flex gap-4 p-5 rounded-[24px] bg-white/[0.05] border border-white/8">
                  <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center font-bold text-slate-300 flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-100">{step}</p>
                    <p className="text-xs leading-6 text-slate-400">{explainStep(step)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="sticky top-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02)),rgba(7,14,28,0.92)]">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <div className="text-[11px] text-slate-500 uppercase font-bold tracking-[0.26em]">Application Deadline</div>
                <div className="flex items-center gap-3 text-3xl font-bold text-white">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-300/10">
                    <Calendar className="h-6 w-6 text-amber-300" />
                  </div>
                  <span className="display-font break-words leading-none">{scholarship.deadline}</span>
                </div>
                <div className="text-sm font-medium text-amber-300">
                  {daysLeft === null
                    ? "Deadline information unavailable"
                    : daysLeft < 0
                    ? "Application deadline has passed"
                    : `${daysLeft} days remaining`}
                </div>
              </div>

              <div className="space-y-4">
                <a
                  href={applyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full"
                >
                  <Button className="flex h-16 w-full items-center justify-center gap-3 rounded-full px-6 text-xl font-semibold">
                    <span className="leading-none">Apply Now</span>
                    <Globe className="h-6 w-6 shrink-0" />
                  </Button>
                </a>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Button variant="outline" className="flex h-14 w-full items-center justify-center gap-3 rounded-full px-5 text-base font-semibold" onClick={handleSave}>
                    <Bookmark className="h-5 w-5 shrink-0" />
                    <span className="leading-none">{isSaved ? "Saved" : "Save"}</span>
                  </Button>
                  <Button variant="outline" className="flex h-14 w-full items-center justify-center gap-3 rounded-full px-5 text-base font-semibold" onClick={() => setShareOpen((value) => !value)}>
                    <Share2 className="h-5 w-5 shrink-0" />
                    <span className="leading-none">Share</span>
                  </Button>
                </div>
                {saveMessage && <p className="text-sm text-amber-300">{saveMessage}</p>}
                {shareOpen && (
                  <div className="rounded-[24px] border border-white/10 bg-slate-950/80 p-4 space-y-3">
                    <p className="text-sm text-slate-300">Share via</p>
                    <div className="grid grid-cols-2 gap-3">
                      {shareOptions.map((option) => (
                        <a key={option.label} href={option.href} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" className="h-11 w-full justify-center gap-2 rounded-full">
                            <option.icon className="h-4 w-4" />
                            {option.label}
                          </Button>
                        </a>
                      ))}
                      <Button variant="outline" className="h-11 w-full justify-center gap-2 rounded-full" onClick={handleCopy}>
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {copied ? "Copied" : "Copy Link"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-white/8 space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  AI Insights
                </div>
                <div className="p-4 rounded-[22px] bg-amber-300/5 border border-amber-300/10 text-xs text-slate-400 leading-6">
                  {scholarship.reasons?.join(". ")}.
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-[22px] bg-red-500/5 border border-red-500/10 text-xs text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                High competition: Only 2% of applicants are selected.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ScholarshipDetails;
