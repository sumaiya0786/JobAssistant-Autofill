import { useState } from "react";
import { toast } from "sonner";
import api, { apiError } from "@/lib/api";
import { Layout, PageHeader } from "@/components/Layout";
import { MatchScoreRing } from "@/components/MatchScoreRing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, CheckCircle2, AlertTriangle, Bookmark, ListPlus, Lightbulb, GraduationCap, Briefcase } from "lucide-react";

export default function JobAnalyzer() {
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const analyze = async () => {
    if (description.trim().length < 10) { toast.error("Paste a job description first"); return; }
    setLoading(true);
    try {
      const { data } = await api.post("/job/match", { title, company, description });
      setResult(data);
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  const saveJob = async () => {
    try {
      await api.post("/job/save", { title: result?.analysis?.title || title, company: result?.analysis?.company || company, url, description });
      toast.success("Job saved");
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  const addToTracker = async () => {
    try {
      await api.post("/applications", {
        company: result?.analysis?.company || company || "Unknown",
        role: result?.analysis?.title || title || "",
        jobUrl: url,
        matchScore: result?.match?.score || 0,
        status: "Saved",
      });
      toast.success("Added to Application Tracker");
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  return (
    <Layout>
      <PageHeader title="Job Analyzer" subtitle="Paste a job description to extract requirements and see your transparent resume-to-job match." />

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="border border-border bg-card rounded-lg p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Job title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="SDE Intern" data-testid="job-title-input" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Company</label>
              <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Google" data-testid="job-company-input" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Job URL (optional)</label>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" data-testid="job-url-input" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Job description</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={12} placeholder="Paste the full job description here…" data-testid="job-description-input" />
          </div>
          <Button onClick={analyze} disabled={loading} className="w-full rounded-md gap-2" data-testid="analyze-job-button">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Analyze & Match
          </Button>
        </div>

        <div>
          {!result ? (
            <div className="border border-dashed border-border rounded-lg p-16 text-center h-full flex flex-col items-center justify-center" data-testid="analyzer-empty">
              <Search className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="font-medium">No analysis yet</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">Paste a job description and click Analyze to see your match breakdown.</p>
            </div>
          ) : (
            <div className="space-y-4" data-testid="analysis-result">
              <div className="border border-border bg-card rounded-lg p-6" data-testid="job-match-score-card">
                <div className="flex items-center gap-6">
                  <MatchScoreRing score={result.match.score} />
                  <div className="min-w-0">
                    <div className="font-display text-lg font-semibold truncate">{result.analysis.title || "Job"}</div>
                    <div className="text-sm text-muted-foreground truncate">{result.analysis.company || "—"}</div>
                    <p className="text-sm mt-3 font-medium text-primary">{result.match.recommendation}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-5">
                  <Button size="sm" variant="outline" className="rounded-md gap-1.5" onClick={saveJob} data-testid="save-job-button"><Bookmark className="h-4 w-4" /> Save Job</Button>
                  <Button size="sm" variant="outline" className="rounded-md gap-1.5" onClick={addToTracker} data-testid="add-tracker-button"><ListPlus className="h-4 w-4" /> Track</Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border border-border bg-card rounded-lg p-5">
                  <div className="flex items-center gap-2 text-sm font-medium mb-3"><CheckCircle2 className="h-4 w-4 text-green-600" /> Strong matches</div>
                  <div className="flex flex-wrap gap-1.5" data-testid="strong-matches">
                    {result.match.strongMatches.length ? result.match.strongMatches.map((s) => (
                      <Badge key={s} className="bg-green-100 text-green-800 hover:bg-green-100 rounded-full">{s}</Badge>
                    )) : <span className="text-sm text-muted-foreground">None yet</span>}
                  </div>
                </div>
                <div className="border border-border bg-card rounded-lg p-5">
                  <div className="flex items-center gap-2 text-sm font-medium mb-3"><AlertTriangle className="h-4 w-4 text-amber-500" /> Missing / weak</div>
                  <div className="flex flex-wrap gap-1.5" data-testid="missing-skills">
                    {result.match.missing.length ? result.match.missing.map((s) => (
                      <Badge key={s} className="bg-amber-100 text-amber-800 hover:bg-amber-100 rounded-full">{s}</Badge>
                    )) : <span className="text-sm text-muted-foreground">Nothing missing 🎉</span>}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <ReqCard icon={GraduationCap} label="Education" meets={result.match.education.meets} note={result.match.education.note} />
                <ReqCard icon={Briefcase} label="Experience" meets={result.match.experience.meets} note={result.match.experience.note} />
              </div>

              <div className="border border-border bg-card rounded-lg p-6">
                <div className="flex items-center gap-2 text-sm font-medium mb-4"><Lightbulb className="h-4 w-4 text-primary" /> AI Suggestions</div>
                <div className="space-y-3" data-testid="ai-suggestions">
                  {result.match.suggestions.map((s, i) => (
                    <div key={i} className="flex gap-3 text-sm">
                      <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${s.type === "strength" ? "bg-green-500" : s.type === "gap" ? "bg-amber-500" : "bg-primary"}`} />
                      <p className="text-foreground/80 leading-relaxed">{s.text}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
                  Scoring is transparent: {result.match.breakdown.requiredMatched}/{result.match.breakdown.requiredTotal} required and {result.match.breakdown.preferredMatched}/{result.match.breakdown.preferredTotal} preferred skills matched. Skills are never invented.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function ReqCard({ icon: Icon, label, meets, note }) {
  return (
    <div className="border border-border bg-card rounded-lg p-5">
      <div className="flex items-center gap-2 text-sm font-medium mb-2"><Icon className="h-4 w-4 text-primary" /> {label}</div>
      <div className="flex items-center gap-1.5">
        {meets ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <AlertTriangle className="h-4 w-4 text-amber-500" />}
        <span className="text-sm">{meets ? "Meets requirement" : "May not meet"}</span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">{note}</p>
    </div>
  );
}
