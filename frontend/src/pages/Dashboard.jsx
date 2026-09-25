import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import {
  User,
  FileText,
  Search,
  TrendingUp,
  Target,
  Award,
  ArrowUpRight,
  ArrowRight,
  CheckCircle2,
  BriefcaseBusiness,
  Building2,
  Bell,
  Sparkles,
  Puzzle,
} from "lucide-react";

const STATUS_STYLES = {
  Saved: "bg-slate-500/15 text-slate-300 border-slate-400/20",
  Applying: "bg-amber-500/15 text-amber-300 border-amber-400/20",
  Applied: "bg-blue-500/15 text-blue-300 border-blue-400/20",
  Interview: "bg-purple-500/15 text-purple-300 border-purple-400/20",
  Rejected: "bg-red-500/15 text-red-300 border-red-400/20",
  Offer: "bg-emerald-500/15 text-emerald-300 border-emerald-400/20",
};

function GlassCard({ children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.08] bg-[#0b1927]/80 backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}

function StatCard({
  icon: Icon,
  title,
  value,
  sub,
  iconClass,
  glowClass,
}) {
  return (
    <GlassCard className="relative overflow-hidden p-5">
      <div
        className={`pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full blur-3xl ${glowClass}`}
      />

      <div className="relative flex items-start justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full ${iconClass}`}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>

        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.05]">
          <ArrowUpRight className="h-4 w-4 text-slate-400" />
        </div>
      </div>

      <div className="relative mt-5">
        <div className="text-xs text-slate-400">{title}</div>

        <div className="mt-1 text-3xl font-bold tracking-tight text-white">
          {value}
        </div>

        {sub && (
          <div className="mt-2 flex items-center gap-1 text-xs text-emerald-400">
            <TrendingUp className="h-3.5 w-3.5" />
            {sub}
          </div>
        )}
      </div>
    </GlassCard>
  );
}

export default function Dashboard() {
  const [completion, setCompletion] = useState(0);
  const [resumeCount, setResumeCount] = useState(0);
  const [analytics, setAnalytics] = useState(null);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    Promise.all([
      api.get("/profile/completion"),
      api.get("/resume"),
      api.get("/applications/analytics"),
      api.get("/applications"),
    ])
      .then(([completionResponse, resumeResponse, analyticsResponse, appsResponse]) => {
        setCompletion(completionResponse.data.percent || 0);
        setResumeCount(resumeResponse.data.resumes?.length || 0);
        setAnalytics(analyticsResponse.data);
        setApps(appsResponse.data.applications || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const recentApps = apps.slice(0, 5);

  const companiesCount = useMemo(() => {
    return new Set(
      apps
        .map((app) => app.company)
        .filter(Boolean)
        .map((company) => company.toLowerCase())
    ).size;
  }, [apps]);

  const interviewCount = analytics?.interviews ?? 0;

  const scoreGroups = useMemo(() => {
    const groups = {
      high: 0,
      good: 0,
      medium: 0,
      low: 0,
    };

    apps.forEach((app) => {
      const score = Number(app.matchScore || 0);

      if (score >= 80) {
        groups.high++;
      } else if (score >= 60) {
        groups.good++;
      } else if (score >= 40) {
        groups.medium++;
      } else {
        groups.low++;
      }
    });

    return groups;
  }, [apps]);

  const totalScored = Object.values(scoreGroups).reduce(
    (sum, value) => sum + value,
    0
  );

  const maxBar = Math.max(
    ...apps.slice(0, 12).map((app) => Number(app.matchScore || 0)),
    1
  );

  const displayName =
    user?.name?.split(" ")[0] ||
    user?.name ||
    "there";

  return (
    <Layout>
      {/* -------------------------------------------------- */}
      {/* TOP BAR */}
      {/* -------------------------------------------------- */}

      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="hidden h-11 max-w-xl flex-1 items-center gap-3 rounded-xl border border-white/[0.08] bg-[#0b1927]/80 px-4 md:flex">
          <Search className="h-4 w-4 text-slate-500" />

          <input
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            placeholder="Search jobs, companies, or keywords..."
          />

          <span className="rounded-md bg-white/[0.05] px-2 py-1 text-[10px] text-slate-500">
            Ctrl K
          </span>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-[#0b1927] text-slate-400 transition hover:text-white"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-400" />
          </button>

          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.1] bg-gradient-to-br from-slate-600 to-slate-800 font-semibold">
            {(user?.name || "U").charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* -------------------------------------------------- */}
      {/* HERO */}
      {/* -------------------------------------------------- */}

      <section className="relative mb-4 min-h-[230px] overflow-hidden rounded-2xl border border-cyan-300/20 bg-gradient-to-br from-[#102538] via-[#091722] to-[#07111c] p-7">
        <div className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="pointer-events-none absolute bottom-0 right-1/3 h-52 w-52 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="relative z-10 max-w-3xl">
          <div className="mb-3 flex items-center gap-2 text-xs font-medium text-emerald-400">
            <Sparkles className="h-4 w-4" />
            JOBASSIST AI WORKSPACE
          </div>

          <h1 className="text-3xl font-bold leading-tight text-white md:text-4xl">
            Good to see you again,
            <br />
            {displayName} 👋
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400 md:text-base">
            Keep going. Track your applications, analyze opportunities, and
            autofill repetitive job forms faster.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/analyze")}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:scale-[1.02]"
            >
              <Search className="h-4 w-4" />
              Analyze a job
            </button>

            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/[0.08]"
            >
              <User className="h-4 w-4" />
              Edit profile
            </button>
          </div>
        </div>

        {/* Decorative hero visual */}
        <div className="absolute right-8 top-1/2 hidden -translate-y-1/2 lg:block">
          <div className="relative h-40 w-64">
            <div className="absolute right-0 top-3 h-28 w-40 rotate-3 rounded-xl border border-cyan-300/30 bg-gradient-to-br from-cyan-400/20 to-blue-500/10 shadow-2xl shadow-cyan-500/10 backdrop-blur">
              <div className="p-4">
                <FileText className="h-7 w-7 text-cyan-300" />

                <div className="mt-3 h-2 w-20 rounded bg-white/20" />

                <div className="mt-2 h-2 w-28 rounded bg-white/10" />
              </div>
            </div>

            <div className="absolute bottom-0 left-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-300/30 bg-emerald-400/15 shadow-xl shadow-emerald-500/20 backdrop-blur">
              <CheckCircle2 className="h-8 w-8 text-emerald-300" />
            </div>

            <div className="absolute right-0 top-0 h-9 w-32 rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-[10px] text-slate-300">
              Tailored Resume
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- */}
      {/* KPI CARDS */}
      {/* -------------------------------------------------- */}

      <section className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={FileText}
          title="Total Applications"
          value={apps.length}
          sub={`${analytics?.thisMonth ?? 0} this month`}
          iconClass="bg-emerald-500/20 shadow-lg shadow-emerald-500/20"
          glowClass="bg-emerald-400/20"
        />

        <StatCard
          icon={Building2}
          title="Companies Applied"
          value={companiesCount}
          sub={`${analytics?.thisWeek ?? 0} this week`}
          iconClass="bg-blue-500/20 shadow-lg shadow-blue-500/20"
          glowClass="bg-blue-400/20"
        />

        <StatCard
          icon={Target}
          title="Average Match Score"
          value={analytics ? `${analytics.avgMatch}%` : "–"}
          sub="across scored jobs"
          iconClass="bg-purple-500/20 shadow-lg shadow-purple-500/20"
          glowClass="bg-purple-400/20"
        />

        <StatCard
          icon={Award}
          title="Interviews"
          value={interviewCount}
          sub={`${analytics?.interviewRate ?? 0}% interview rate`}
          iconClass="bg-orange-500/20 shadow-lg shadow-orange-500/20"
          glowClass="bg-orange-400/20"
        />
      </section>

      {/* -------------------------------------------------- */}
      {/* ANALYTICS */}
      {/* -------------------------------------------------- */}

      <section className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Application Activity */}
        <GlassCard className="overflow-hidden p-5 xl:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/10">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
              </div>

              <div>
                <h2 className="font-semibold text-white">
                  Application Activity
                </h2>

                <p className="text-xs text-slate-500">
                  Recent applications and match scores
                </p>
              </div>
            </div>

            <span className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-slate-400">
              Recent
            </span>
          </div>

          {/* FIXED CHART */}
          <div className="mt-8 h-52 overflow-x-auto border-b border-white/[0.06] px-2">
            <div className="flex h-full min-w-full items-end gap-4">
              {apps.slice(0, 12).map((app, index) => {
                const score = Number(app.matchScore || 0);

                const height = Math.max(
                  18,
                  Math.round((score / maxBar) * 145)
                );

                return (
                  <div
                    key={app._id || index}
                    className="group flex h-full w-10 shrink-0 flex-col justify-end"
                  >
                    <div className="flex flex-1 items-end justify-center">
                      <div
                        className="w-8 rounded-t-lg bg-gradient-to-t from-emerald-500/50 to-cyan-300/80 shadow-lg shadow-cyan-400/10 transition-all duration-300 group-hover:from-emerald-400 group-hover:to-cyan-300"
                        style={{
                          height: `${height}px`,
                        }}
                        title={`${app.company || "Job"} — ${score}% match`}
                      />
                    </div>

                    <div className="mt-2 w-10 truncate text-center text-[9px] text-slate-600">
                      {app.company || "Job"}
                    </div>
                  </div>
                );
              })}

              {apps.length === 0 && (
                <div className="flex w-full items-center justify-center text-sm text-slate-500">
                  No application activity yet.
                </div>
              )}
            </div>
          </div>

          {/* Chart footer */}
          {apps.length > 0 && (
            <div className="mt-3 flex items-center justify-between px-2 text-[10px] text-slate-600">
              <span>Applications</span>
              <span>Match score</span>
            </div>
          )}
        </GlassCard>

        {/* Match Distribution */}
        <GlassCard className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-semibold text-white">
                Match Score Distribution
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Scores across your applications
              </p>
            </div>

            <Target className="h-5 w-5 text-slate-500" />
          </div>

          <div className="mt-6 flex items-center gap-6">
            <div className="relative flex h-36 w-36 shrink-0 items-center justify-center rounded-full bg-[conic-gradient(#22c55e_0_40%,#06b6d4_40%_70%,#8b5cf6_70%_88%,#475569_88%_100%)] p-[12px]">
              <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-[#0b1927]">
                <span className="text-2xl font-bold text-white">
                  {totalScored}
                </span>

                <span className="text-[11px] text-slate-500">
                  Jobs
                </span>
              </div>
            </div>

            <div className="min-w-0 flex-1 space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="text-slate-400">80–100%</span>
                <span className="ml-auto font-semibold text-white">
                  {scoreGroups.high}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
                <span className="text-slate-400">60–80%</span>
                <span className="ml-auto font-semibold text-white">
                  {scoreGroups.good}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-purple-400" />
                <span className="text-slate-400">40–60%</span>
                <span className="ml-auto font-semibold text-white">
                  {scoreGroups.medium}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-500" />
                <span className="text-slate-400">&lt; 40%</span>
                <span className="ml-auto font-semibold text-white">
                  {scoreGroups.low}
                </span>
              </div>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* -------------------------------------------------- */}
      {/* BOTTOM */}
      {/* -------------------------------------------------- */}

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Recent Applications */}
        <GlassCard className="overflow-hidden p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-white">
                Recent Applications
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Your latest tracked opportunities
              </p>
            </div>

            <button
              onClick={() => navigate("/applications")}
              className="flex items-center gap-1 text-xs font-medium text-emerald-400 hover:text-emerald-300"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-slate-500">
              Loading applications...
            </div>
          ) : recentApps.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/[0.1] py-12 text-center">
              <BriefcaseBusiness className="mx-auto h-8 w-8 text-slate-600" />

              <p className="mt-3 text-sm text-slate-500">
                No applications yet.
              </p>

              <button
                onClick={() => navigate("/applications")}
                className="mt-4 rounded-lg bg-emerald-400 px-4 py-2 text-xs font-semibold text-slate-950"
              >
                Add your first
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[620px]">
                <div className="grid grid-cols-[1.5fr_1fr_80px_110px_90px] border-b border-white/[0.06] px-3 pb-3 text-[10px] uppercase tracking-wider text-slate-600">
                  <span>Job</span>
                  <span>Company</span>
                  <span>Match</span>
                  <span>Status</span>
                  <span>Date</span>
                </div>

                {recentApps.map((app, index) => (
                  <div
                    key={app._id || index}
                    className="grid grid-cols-[1.5fr_1fr_80px_110px_90px] items-center border-b border-white/[0.05] px-3 py-3 text-xs transition hover:bg-white/[0.025]"
                  >
                    <div className="truncate font-medium text-slate-200">
                      {app.role || "Untitled role"}
                    </div>

                    <div className="truncate text-slate-400">
                      {app.company || "—"}
                    </div>

                    <div>
                      {app.matchScore > 0 ? (
                        <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-emerald-300">
                          {app.matchScore}%
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </div>

                    <div>
                      <span
                        className={`rounded-full border px-2.5 py-1 ${
                          STATUS_STYLES[app.status] ||
                          STATUS_STYLES.Saved
                        }`}
                      >
                        {app.status || "Saved"}
                      </span>
                    </div>

                    <div className="text-slate-500">
                      {app.createdAt
                        ? new Date(app.createdAt).toLocaleDateString(
                            undefined,
                            {
                              month: "short",
                              day: "numeric",
                            }
                          )
                        : "—"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </GlassCard>

        {/* Quick Actions */}
        <GlassCard className="p-5">
          <div className="mb-4">
            <h2 className="font-semibold text-white">
              Quick Actions
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Jump directly into your workflow
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate("/analyze")}
              className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] p-4 text-left transition hover:bg-emerald-400/10"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-400/15">
                <Search className="h-4 w-4 text-emerald-300" />
              </div>

              <div className="mt-3 text-xs font-semibold text-white">
                Analyze a job
              </div>

              <div className="mt-1 text-[10px] text-slate-500">
                Get match insights
              </div>
            </button>

            <button
              onClick={() => navigate("/profile")}
              className="rounded-xl border border-blue-400/20 bg-blue-400/[0.06] p-4 text-left transition hover:bg-blue-400/10"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-400/15">
                <User className="h-4 w-4 text-blue-300" />
              </div>

              <div className="mt-3 text-xs font-semibold text-white">
                Edit profile
              </div>

              <div className="mt-1 text-[10px] text-slate-500">
                Update information
              </div>
            </button>

            <button
              onClick={() => navigate("/resume")}
              className="rounded-xl border border-purple-400/20 bg-purple-400/[0.06] p-4 text-left transition hover:bg-purple-400/10"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-400/15">
                <FileText className="h-4 w-4 text-purple-300" />
              </div>

              <div className="mt-3 text-xs font-semibold text-white">
                Resume
              </div>

              <div className="mt-1 text-[10px] text-slate-500">
                {resumeCount > 0
                  ? `${resumeCount} uploaded`
                  : "Upload resume"}
              </div>
            </button>

            <button
              onClick={() => navigate("/extension")}
              className="rounded-xl border border-orange-400/20 bg-orange-400/[0.06] p-4 text-left transition hover:bg-orange-400/10"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-400/15">
                <Puzzle className="h-4 w-4 text-orange-300" />
              </div>

              <div className="mt-3 text-xs font-semibold text-white">
                Get Extension
              </div>

              <div className="mt-1 text-[10px] text-slate-500">
                Autofill applications
              </div>
            </button>
          </div>

          {/* Profile completion */}
          <div className="mt-5 rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Profile completion
              </span>

              <span className="text-sm font-semibold text-emerald-400">
                {completion}%
              </span>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.07]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                style={{
                  width: `${completion}%`,
                }}
              />
            </div>

            <button
              onClick={() => navigate("/profile")}
              className="mt-3 flex items-center gap-1 text-[11px] text-slate-400 transition hover:text-white"
            >
              Complete profile
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </GlassCard>
      </section>
    </Layout>
  );
}