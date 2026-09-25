import { useEffect, useState } from "react";
import { toast } from "sonner";
import api, { apiError } from "@/lib/api";
import { Layout, PageHeader } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bookmark, Trash2, ExternalLink, ListPlus } from "lucide-react";

export default function SavedJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get("/job").then((res) => setJobs(res.data.jobs)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const remove = async (id) => {
    try { await api.delete(`/job/${id}`); setJobs((p) => p.filter((j) => j._id !== id)); toast.success("Removed"); }
    catch (err) { toast.error(apiError(err)); }
  };

  const track = async (j) => {
    try {
      await api.post("/applications", { company: j.company, role: j.title, jobUrl: j.url, matchScore: j.matchScore, status: "Saved" });
      toast.success("Added to Application Tracker");
    } catch (err) { toast.error(apiError(err)); }
  };

  return (
    <Layout>
      <PageHeader title="Saved Jobs" subtitle="Jobs you've bookmarked for later, with their match scores." />
      {loading ? (
        <div className="py-16 text-center text-muted-foreground">Loading…</div>
      ) : jobs.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg p-16 text-center">
          <Bookmark className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="font-medium">No saved jobs</p>
          <p className="text-sm text-muted-foreground mt-1">Save jobs from the Job Analyzer to revisit them here.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {jobs.map((j) => (
            <div key={j._id} className="border border-border bg-card rounded-lg p-6" data-testid={`saved-job-${j._id}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-display font-semibold truncate">{j.title || "Untitled role"}</div>
                  <div className="text-sm text-muted-foreground truncate">{j.company || "—"}</div>
                </div>
                {j.matchScore > 0 && <Badge className="bg-secondary text-secondary-foreground rounded-full shrink-0">{j.matchScore}% match</Badge>}
              </div>
              {j.analysis?.requiredSkills?.length ? (
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {j.analysis.requiredSkills.slice(0, 6).map((s) => (
                    <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-secondary border border-border">{s}</span>
                  ))}
                </div>
              ) : null}
              <div className="flex gap-2 mt-5">
                <Button size="sm" variant="outline" className="rounded-md gap-1.5" onClick={() => track(j)}><ListPlus className="h-4 w-4" /> Track</Button>
                {j.url && <a href={j.url} target="_blank" rel="noreferrer"><Button size="sm" variant="outline" className="rounded-md gap-1.5"><ExternalLink className="h-4 w-4" /> Open</Button></a>}
                <Button size="sm" variant="ghost" className="rounded-md text-destructive ml-auto" onClick={() => remove(j._id)} data-testid={`delete-saved-${j._id}`}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
