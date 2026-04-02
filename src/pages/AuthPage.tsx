import * as React from "react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { GraduationCap, Mail, Lock, User, ArrowRight, Github, Chrome } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/Card";

import { useFirebase } from "../contexts/FirebaseContext";

interface AuthPageProps {
  mode: "login" | "signup";
}

const AuthPage: React.FC<AuthPageProps> = ({ mode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const { signInWithEmail, signInWithGoogle, signInWithGithub, signUpWithEmail, user, profile, loading } = useFirebase();

  useEffect(() => {
    if (!loading && user) {
      navigate(profile ? "/dashboard" : "/profile-builder");
    }
  }, [loading, navigate, profile, user]);

  const getErrorMessage = (value: unknown) => {
    if (!(value instanceof Error)) {
      return "Authentication failed. Please try again.";
    }

    if ("code" in value && typeof value.code === "string") {
      switch (value.code) {
        case "auth/email-already-in-use":
          return "This email is already in use. Please sign in instead.";
        case "auth/invalid-email":
          return "Please enter a valid email address.";
        case "auth/weak-password":
          return "Password should be at least 6 characters.";
        case "auth/invalid-credential":
        case "auth/wrong-password":
        case "auth/user-not-found":
          return "Incorrect email or password.";
        case "auth/popup-closed-by-user":
          return "The sign-in popup was closed before completion.";
        case "auth/operation-not-allowed":
          return "This sign-in method is disabled in Firebase for this project.";
        case "auth/account-exists-with-different-credential":
          return "An account already exists with the same email using a different sign-in method.";
        default:
          return value.message;
      }
    }

    return value.message;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (mode === "signup") {
        await signUpWithEmail(formData.email, formData.password, formData.name);
        return;
      }

      await signInWithEmail(formData.email, formData.password);
    } catch (error) {
      console.error(`Error during ${mode}:`, error);
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");

    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Error signing in with Google:", error);
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    setIsLoading(true);
    setError("");

    try {
      await signInWithGithub();
    } catch (error) {
      console.error("Error signing in with GitHub:", error);
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[8%] top-[10%] h-56 w-56 rounded-full bg-amber-300/10 blur-[110px]" />
        <div className="absolute bottom-[8%] right-[8%] h-72 w-72 rounded-full bg-yellow-700/12 blur-[130px]" />
      </div>
      <div className="mx-auto grid min-h-[calc(100vh-96px)] max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden lg:block"
        >
          <div className="max-w-xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-200/15 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-amber-100">
              Premium Access Layer
            </div>
            <h1 className="display-font text-6xl font-bold leading-[0.95] text-white">
              Enter the
              <span className="bg-[linear-gradient(135deg,#f8fbff_10%,#8bdeff_45%,#7a67ff_100%)] bg-clip-text text-transparent"> next-generation</span>
              <br />
              scholarship platform.
            </h1>
            <p className="mt-7 max-w-lg text-lg leading-8 text-slate-300">
              A more refined scholarship experience with immersive visuals, intelligent discovery, and premium workflow clarity.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                ["120K+", "Scholarships"],
                ["195", "Countries"],
                ["10", "Top matches"],
              ].map(([value, label]) => (
                <div key={label} className="premium-surface premium-ring rounded-[26px] px-5 py-5">
                  <div className="display-font text-3xl font-bold text-white">{value}</div>
                  <div className="mt-1 text-sm text-slate-400">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="overflow-hidden border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02)),rgba(7,14,28,0.88)] shadow-[0_30px_90px_rgba(2,8,23,0.55)]">
          <CardHeader className="space-y-2 border-b border-white/8 bg-[radial-gradient(circle_at_top,rgba(82,168,255,0.22),transparent_58%)] text-center">
            <div className="flex justify-center mb-4">
              <div className="premium-ring flex h-14 w-14 items-center justify-center rounded-[20px] bg-[linear-gradient(135deg,rgba(245,201,118,0.95),rgba(210,154,57,0.9))] shadow-[0_18px_45px_rgba(210,154,57,0.28)]">
                <GraduationCap className="text-white w-7 h-7" />
              </div>
            </div>
            <div className="text-[11px] uppercase tracking-[0.32em] text-slate-500">
              {mode === "login" ? "Secure Sign In" : "Create Premium Access"}
            </div>
            <CardTitle className="text-4xl font-bold tracking-tight">
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </CardTitle>
            <CardDescription className="mx-auto max-w-sm text-base">
              {mode === "login"
                ? "Enter your credentials to access your account"
                : "Join International ScholarAI to start your global scholarship journey"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div className="space-y-2">
                  <div className="relative">
                    <User className="absolute left-4 top-4 w-4 h-4 text-slate-500" />
                    <Input
                      placeholder="Full Name"
                      className="pl-11"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-4 top-4 w-4 h-4 text-slate-500" />
                  <Input
                    type="email"
                    placeholder="Email Address"
                    className="pl-11"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-4 top-4 w-4 h-4 text-slate-500" />
                  <Input
                    type="password"
                    placeholder="Password"
                    className="pl-11"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
              </div>
              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full rounded-[20px]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {mode === "login" ? "Sign In" : "Sign Up"}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/8" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-950 px-3 text-slate-500 tracking-[0.24em]">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="w-full rounded-[20px]" onClick={handleGoogleSignIn} disabled={isLoading}>
                <Chrome className="w-4 h-4 mr-2" />
                Google
              </Button>
              <Button variant="outline" className="w-full rounded-[20px]" onClick={handleGithubSignIn} disabled={isLoading}>
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </Button>
            </div>

            <div className="text-center text-sm text-slate-400">
              {mode === "login" ? (
                <>
                  Don't have an account?{" "}
                  <Link to="/signup" className="text-amber-300 hover:text-amber-200 font-medium">
                    Sign up
                  </Link>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <Link to="/login" className="text-amber-300 hover:text-amber-200 font-medium">
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
