import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  User,
  FileText,
  Search,
  ListChecks,
  Bookmark,
  Puzzle,
  LogOut,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true, id: "dashboard" },
  { to: "/profile", label: "Profile", icon: User, id: "profile" },
  { to: "/resume", label: "Resume", icon: FileText, id: "resume" },
  { to: "/analyze", label: "Job Analyzer", icon: Search, id: "analyze" },
  { to: "/applications", label: "Applications", icon: ListChecks, id: "applications" },
  { to: "/saved", label: "Saved Jobs", icon: Bookmark, id: "saved" },
  { to: "/extension", label: "Extension", icon: Puzzle, id: "extension" },
];

export function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#06101a] text-white">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute right-0 top-20 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-purple-500/5 blur-3xl" />
      </div>

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-white/[0.07] bg-[#07121e]/95 backdrop-blur-xl md:flex md:flex-col">
        {/* Logo */}
        <div className="border-b border-white/[0.07] px-6 py-5">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3"
            data-testid="sidebar-logo"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 shadow-lg shadow-emerald-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>

            <div className="text-left">
              <div className="text-lg font-bold tracking-tight text-white">
                JobAssist
              </div>
              <div className="text-[11px] text-slate-400">
                AI Application Assistant
              </div>
            </div>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <div className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Workspace
          </div>

          <div className="space-y-1.5">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                data-testid={`nav-${n.id}`}
                className={({ isActive }) =>
                  `group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all ${
                    isActive
                      ? "border border-emerald-400/20 bg-gradient-to-r from-emerald-400/20 to-cyan-400/5 text-white shadow-lg shadow-emerald-500/5"
                      : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                  }`
                }
              >
                <n.icon className="h-[18px] w-[18px] shrink-0" />
                <span className="truncate">{n.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Upgrade card */}
        <div className="mx-3 mb-4 rounded-2xl border border-purple-400/20 bg-gradient-to-br from-purple-500/10 via-indigo-500/10 to-transparent p-4">
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-purple-500">
            <Sparkles className="h-4 w-4 text-white" />
          </div>

          <div className="text-sm font-semibold text-white">
            JobAssist Pro
          </div>

          <p className="mt-1 text-[11px] leading-5 text-slate-400">
            Unlock advanced job insights and smarter matching.
          </p>

          <button className="mt-3 w-full rounded-lg bg-gradient-to-r from-purple-400 to-violet-500 py-2 text-xs font-semibold text-white transition hover:opacity-90">
            Upgrade
          </button>
        </div>

        {/* User */}
        <div className="border-t border-white/[0.07] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-600 to-slate-800 text-sm font-semibold">
              {(user?.name || "U").charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-white">
                {user?.name || "User"}
              </div>

              <div className="truncate text-[11px] text-slate-500">
                {user?.email}
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            onClick={logout}
            data-testid="logout-button"
            className="mt-3 w-full justify-start gap-3 px-2 text-slate-500 hover:bg-white/[0.04] hover:text-white"
          >
            <LogOut className="h-[17px] w-[17px]" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main */}
      <main className="relative min-w-0 overflow-x-hidden md:ml-64">
        <div className="mx-auto w-full max-w-[1500px] min-w-0 px-4 py-5 sm:px-6 lg:px-7">
          {children}
        </div>
      </main>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-8 flex min-w-0 items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
          {title}
        </h1>

        {subtitle && (
          <p className="mt-1.5 max-w-2xl text-sm text-slate-400 md:text-base">
            {subtitle}
          </p>
        )}
      </div>

      {action}
    </div>
  );
}