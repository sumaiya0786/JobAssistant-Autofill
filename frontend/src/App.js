import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import Resume from "@/pages/Resume";
import JobAnalyzer from "@/pages/JobAnalyzer";
import Applications from "@/pages/Applications";
import SavedJobs from "@/pages/SavedJobs";
import ExtensionGuide from "@/pages/ExtensionGuide";

function Protected({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function Guest({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  if (user) return <Navigate to="/" replace />;
  return children;
}

function App() {
  return (
    <div className="App grain">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Guest><Login /></Guest>} />
            <Route path="/register" element={<Guest><Register /></Guest>} />
            <Route path="/" element={<Protected><Dashboard /></Protected>} />
            <Route path="/profile" element={<Protected><Profile /></Protected>} />
            <Route path="/resume" element={<Protected><Resume /></Protected>} />
            <Route path="/analyze" element={<Protected><JobAnalyzer /></Protected>} />
            <Route path="/applications" element={<Protected><Applications /></Protected>} />
            <Route path="/saved" element={<Protected><SavedJobs /></Protected>} />
            <Route path="/extension" element={<Protected><ExtensionGuide /></Protected>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster position="top-right" richColors closeButton />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
