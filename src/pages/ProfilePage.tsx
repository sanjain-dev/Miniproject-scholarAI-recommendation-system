import * as React from "react";
import { Link } from "react-router-dom";
import { User, Mail, MapPin, GraduationCap, BookOpen, Award, Wallet, Globe, PencilLine } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { useFirebase } from "../contexts/FirebaseContext";

const ProfilePage: React.FC = () => {
  const { user, profile } = useFirebase();

  const profileItems = [
    { label: "Full Name", value: profile?.name || user?.displayName || "Not added", icon: User },
    { label: "Email", value: user?.email || "Not added", icon: Mail },
    { label: "Country", value: profile?.country || "Not added", icon: MapPin },
    { label: "Current Degree", value: profile?.degree || "Not added", icon: GraduationCap },
    { label: "Field of Study", value: profile?.field || "Not added", icon: BookOpen },
    { label: "CGPA", value: profile?.gpa ? `${profile.gpa} / 10` : "Not added", icon: Award },
    { label: "IELTS", value: profile?.ielts || "Not added", icon: Globe },
    { label: "TOEFL", value: profile?.toefl || "Not added", icon: Globe },
    { label: "Budget", value: profile?.budget ? `$${profile.budget}` : "Not added", icon: Wallet },
    { label: "Preferred Countries", value: profile?.preferredCountries || "Not added", icon: MapPin },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
      <div className="premium-surface premium-ring flex flex-col gap-4 rounded-[34px] p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="display-font text-4xl font-bold tracking-tight">Your Profile</h1>
          <p className="text-slate-400">Your scholarship preferences and academic details.</p>
        </div>
        <Link to="/profile-builder">
          <Button className="rounded-full px-5">
            <PencilLine className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="display-font text-3xl">Profile Summary</CardTitle>
          <CardDescription>These details are used to personalize scholarship recommendations.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {profileItems.map((item) => (
            <div key={item.label} className="rounded-[24px] border border-white/8 bg-white/5 p-4 min-w-0">
              <div className="mb-3 flex items-center gap-3 text-slate-400">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-300/10 text-amber-100">
                  <item.icon className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-medium uppercase tracking-[0.1em] leading-5 break-words">{item.label}</span>
              </div>
              <div className="text-base font-semibold text-white break-words">{item.value}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
