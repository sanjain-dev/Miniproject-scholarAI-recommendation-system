import * as React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Sparkles, GraduationCap, MapPin, DollarSign, ArrowUpRight, UserRound, Globe2, BookOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { GENERATED_SCHOLARSHIP_POOL } from "../lib/seed";
import { getTopRecommendations, type UserProfileInput } from "../lib/recommendations";

const SKILL_SUGGESTIONS = [
  "Python",
  "Java",
  "JavaScript",
  "TypeScript",
  "C",
  "C++",
  "C#",
  "Go",
  "Rust",
  "SQL",
  "MongoDB",
  "PostgreSQL",
  "Firebase",
  "React",
  "Next.js",
  "Node.js",
  "Express.js",
  "Tailwind CSS",
  "HTML",
  "CSS",
  "UI/UX",
  "Figma",
  "Adobe XD",
  "Canva",
  "Graphic Design",
  "Video Editing",
  "Photography",
  "Animation",
  "Leadership",
  "Public Speaking",
  "Teamwork",
  "Mentoring",
  "Negotiation",
  "Networking",
  "Event Management",
  "Research",
  "Data Analysis",
  "Machine Learning",
  "AI",
  "Deep Learning",
  "Prompt Engineering",
  "NLP",
  "Computer Vision",
  "Statistics",
  "Excel",
  "Power BI",
  "Tableau",
  "Cybersecurity",
  "Cloud Computing",
  "AWS",
  "Azure",
  "Google Cloud",
  "DevOps",
  "Docker",
  "Kubernetes",
  "Linux",
  "Communication",
  "Project Management",
  "Robotics",
  "Problem Solving",
  "Critical Thinking",
  "Time Management",
  "Adaptability",
  "Creativity",
  "Content Writing",
  "Technical Writing",
  "Copywriting",
  "Digital Marketing",
  "SEO",
  "Social Media Management",
  "Sales",
  "Customer Service",
  "Business Analysis",
  "Entrepreneurship",
  "Finance",
  "Accounting",
  "Economics",
  "Teaching",
  "Tutoring",
  "Curriculum Design",
  "Biology",
  "Chemistry",
  "Physics",
  "Mathematics",
  "Medicine",
  "Nursing",
  "Public Health",
  "Biotechnology",
  "Mechanical Engineering",
  "Electrical Engineering",
  "Civil Engineering",
  "Architecture",
  "Law",
  "Psychology",
  "Counseling",
  "Human Resources",
  "Operations Management",
  "Supply Chain",
  "International Relations",
  "Policy Analysis",
  "GIS",
  "Environmental Science",
  "Sustainability",
  "Language Translation",
  "Tamil",
  "English",
  "Hindi",
];

const SearchPage: React.FC = () => {
  const [candidate, setCandidate] = useState<UserProfileInput>({
    name: "",
    country: "",
    degree: "12th",
    field: "",
    skills: "",
    gpa: 0,
    ielts: "",
    toefl: "",
    budget: 0,
    preferredCountries: "",
  });

  const typedSkills = (candidate.skills || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const currentSkillToken = candidate.skills?.split(",").pop()?.trim().toLowerCase() || "";
  const filteredSkillSuggestions = SKILL_SUGGESTIONS.filter((skill) => {
    const alreadySelected = typedSkills.some((item) => item.toLowerCase() === skill.toLowerCase());
    if (alreadySelected) {
      return false;
    }

    return currentSkillToken ? skill.toLowerCase().includes(currentSkillToken) : true;
  }).slice(0, 8);

  const handleSkillSelect = (skill: string) => {
    const nextSkills = [...typedSkills, skill];
    setCandidate({ ...candidate, skills: `${nextSkills.join(", ")}, ` });
  };

  const recommendations = getTopRecommendations(candidate, GENERATED_SCHOLARSHIP_POOL, 10);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
      <div className="premium-surface premium-ring rounded-[34px] p-6 md:p-8 space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/15 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.26em] text-amber-100">
          Candidate Match Lab
        </div>
        <h1 className="display-font text-4xl font-bold tracking-tight md:text-5xl">Scholarship Search</h1>
        <p className="max-w-2xl text-slate-400">Build a candidate profile, simulate eligibility, and preview a premium shortlist instantly.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[420px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="display-font text-3xl flex items-center gap-2">
              <UserRound className="h-6 w-6 text-amber-300" />
              Candidate Details
            </CardTitle>
            <CardDescription className="text-base">Enter student or friend details to check scholarship availability.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Candidate Name"
              value={candidate.name}
              onChange={(e) => setCandidate({ ...candidate, name: e.target.value })}
            />
            <Input
              placeholder="Current Country"
              value={candidate.country}
              onChange={(e) => setCandidate({ ...candidate, country: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {["10th", "12th", "Diploma", "Bachelor", "Master", "PhD"].map((degree) => (
                <Button
                  key={degree}
                  variant={candidate.degree === degree ? "primary" : "outline"}
                  onClick={() => setCandidate({ ...candidate, degree })}
                  className="rounded-2xl"
                >
                  {degree}
                </Button>
              ))}
            </div>
            <Input
              placeholder="Field of Study"
              value={candidate.field}
              onChange={(e) => setCandidate({ ...candidate, field: e.target.value })}
            />
            <Input
              placeholder="Skills (comma separated)"
              value={candidate.skills || ""}
              onChange={(e) => setCandidate({ ...candidate, skills: e.target.value })}
            />
            {filteredSkillSuggestions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {filteredSkillSuggestions.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleSkillSelect(skill)}
                    className="rounded-full border border-amber-200/16 bg-amber-300/10 px-3 py-1.5 text-xs font-semibold text-amber-100 transition hover:border-amber-200/35 hover:bg-amber-300/18"
                  >
                    {skill}
                  </button>
                ))}
              </div>
            )}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Input
                type="number"
                step="0.1"
                placeholder="CGPA (out of 10)"
                value={candidate.gpa || ""}
                onChange={(e) => setCandidate({ ...candidate, gpa: Number(e.target.value) })}
              />
              <Input
                type="number"
                step="0.1"
                placeholder="IELTS (out of 9)"
                value={candidate.ielts || ""}
                onChange={(e) => setCandidate({ ...candidate, ielts: e.target.value })}
              />
              <Input
                type="number"
                placeholder="TOEFL (out of 120)"
                value={candidate.toefl || ""}
                onChange={(e) => setCandidate({ ...candidate, toefl: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <a href="https://ielts.org/take-a-test/book-a-test" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full rounded-full">
                  Apply IELTS
                </Button>
              </a>
              <a href="https://www.ets.org/toefl/test-takers/ibt/register.html" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full rounded-full">
                  Apply TOEFL
                </Button>
              </a>
            </div>
            <Input
              type="number"
              placeholder="Budget (USD)"
              value={candidate.budget || ""}
              onChange={(e) => setCandidate({ ...candidate, budget: Number(e.target.value) })}
            />
            <Input
              placeholder="Preferred Countries"
              value={candidate.preferredCountries}
              onChange={(e) => setCandidate({ ...candidate, preferredCountries: e.target.value })}
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { label: "Dataset Size", value: GENERATED_SCHOLARSHIP_POOL.length.toLocaleString(), icon: Search },
              { label: "Top Matches", value: recommendations.length.toString(), icon: Sparkles },
              { label: "Best Score", value: `${recommendations[0]?.matchScore ?? 0}%`, icon: GraduationCap },
            ].map((item) => (
              <Card key={item.label}>
                <CardContent className="flex min-h-[152px] items-center gap-4 p-6">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-amber-300/10 text-amber-100">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-center">
                    <div className="text-[11px] uppercase tracking-[0.16em] leading-4 text-slate-500 break-words">{item.label}</div>
                    <div className="display-font mt-2 text-3xl leading-none font-bold">{item.value}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-4">
            <h2 className="display-font text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-300" />
              Top 10 Matches
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {recommendations.map((item, index) => (
                <Card key={item.id} className="overflow-hidden transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0 flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-amber-300/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-amber-100">
                            Rank #{index + 1}
                          </span>
                          <span className="rounded-full bg-yellow-300/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-yellow-200">
                            {item.matchScore}% Match
                          </span>
                        </div>
                        <div className="display-font text-3xl font-bold">{item.name}</div>
                        <div className="text-sm text-slate-400">{item.reasons.join(" • ")}</div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            {item.university}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {item.country}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {item.amount}
                          </div>
                          <div className="flex items-center gap-1">
                            <Globe2 className="h-4 w-4" />
                            {item.deadline}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {item.tags.map((tag) => (
                            <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-300">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Link to={`/scholarship/${item.id}`} className="shrink-0">
                        <Button className="rounded-full px-5">
                          View Details
                          <ArrowUpRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
