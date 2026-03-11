import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import ProfileBuilder from "./pages/ProfileBuilder";
import Dashboard from "./pages/Dashboard";
import ChatPage from "./pages/ChatPage";
import SavedScholarships from "./pages/SavedScholarships";
import DeadlineTracker from "./pages/DeadlineTracker";
import ApplicationTracker from "./pages/ApplicationTracker";
import ScholarshipDetails from "./pages/ScholarshipDetails";
import ProfilePage from "./pages/ProfilePage";
import SearchPage from "./pages/SearchPage";
import { FirebaseProvider, useFirebase } from "./contexts/FirebaseContext";

const AppRoutes = () => {
  const { user, loading } = useFirebase();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-300/30 border-t-amber-300 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Layout user={user}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/signup" element={<AuthPage mode="signup" />} />
        <Route path="/profile-builder" element={user ? <ProfileBuilder /> : <Navigate to="/login" />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/search" element={user ? <SearchPage /> : <Navigate to="/login" />} />
        <Route path="/chat" element={user ? <ChatPage /> : <Navigate to="/login" />} />
        <Route path="/saved" element={user ? <SavedScholarships /> : <Navigate to="/login" />} />
        <Route path="/deadlines" element={user ? <DeadlineTracker /> : <Navigate to="/login" />} />
        <Route path="/tracker" element={user ? <ApplicationTracker /> : <Navigate to="/login" />} />
        <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="/scholarship/:id" element={<ScholarshipDetails />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

export default function App() {
  return (
    <FirebaseProvider>
      <AppRoutes />
    </FirebaseProvider>
  );
}
