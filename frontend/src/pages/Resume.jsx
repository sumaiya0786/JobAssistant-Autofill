import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import api, { apiError, API_BASE } from "@/lib/api";
import { Layout, PageHeader } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Upload, FileText, Trash2, Eye, Loader2, CheckCircle2 } from "lucide-react";

function Chips({ items, testid }) {
  if (!items || items.length === 0) return <span className="text-sm text-muted-foreground">None detected</span>;
  return (
    <div className="flex flex-wrap gap-1.5" data-testid={testid}>
      {items.map((s, i) => (
        <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground border border-border">{s}</span>
      ))}
    </div>
  );
}

export default function Resume() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [label, setLabel] = useState("General Resume");
  const fileRef = useRef();

  const load = () => {
    setLoading(true);
    api.get("/resume").then((res) => setResumes(res.data.resumes)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") { toast.error("Please upload a PDF file"); return; }
    setUploading(true);
    const fd = new FormData();
    fd.append("resume", file);
    fd.append("label", label);
    try {
      await api.post("/resume/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Resume uploaded and parsed");
      load();
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const view = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/resume/${id}/file`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("ja_token")}` },
      });
      const blob = await res.blob();
      window.open(URL.createObjectURL(blob), "_blank");
    } catch {
      toast.error("Could not open resume");
    }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/resume/${id}`);
      toast.success("Resume deleted");
      load();
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  return (
    <Layout>
      <PageHeader title="Resume" subtitle="Upload a PDF resume. We extract skills, education, experience and projects to power matching." />

      <div className="border border-border bg-card rounded-lg p-6 mb-6">
        <div className="grid md:grid-cols-[1fr_auto] gap-4 items-end">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Resume label / version</label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Frontend Resume" data-testid="resume-label-input" />
          </div>
          <div>
            <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={upload} data-testid="resume-file-input" />
            <Button onClick={() => fileRef.current?.click()} disabled={uploading} className="rounded-md gap-2 w-full md:w-auto" data-testid="upload-resume-button">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload PDF
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-muted-foreground">Loading…</div>
      ) : resumes.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg p-16 text-center">
          <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="font-medium">No resume yet</p>
          <p className="text-sm text-muted-foreground mt-1">Upload your first resume to enable AI matching.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {resumes.map((r) => (
            <div key={r._id} className="border border-border bg-card rounded-lg p-6" data-testid={`resume-card-${r._id}`}>
              <div className="flex items-start justify-between gap-4 mb-5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-md bg-secondary flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{r.fileName}</span>
                      {r.isActive && <Badge className="bg-green-100 text-green-800 hover:bg-green-100 gap-1 rounded-full"><CheckCircle2 className="h-3 w-3" /> Active</Badge>}
                    </div>
                    <div className="text-sm text-muted-foreground">{r.label}</div>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" variant="outline" className="rounded-md gap-1.5" onClick={() => view(r._id)} data-testid={`view-resume-${r._id}`}>
                    <Eye className="h-4 w-4" /> View
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline" className="rounded-md text-destructive hover:bg-destructive/10" data-testid={`delete-resume-${r._id}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this resume?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently remove "{r.fileName}" and its parsed data.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => remove(r._id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Skills & Technologies</div>
                  <Chips items={r.parsed?.skills} testid={`resume-skills-${r._id}`} />
                </div>
                <ParsedList label="Education" items={r.parsed?.education} />
                <ParsedList label="Experience" items={r.parsed?.experience} />
                <ParsedList label="Projects" items={r.parsed?.projects} />
                <ParsedList label="Certifications" items={r.parsed?.certifications} />
                <ParsedList label="Achievements" items={r.parsed?.achievements} />
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}

function ParsedList({ label, items }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">{label}</div>
      {items && items.length ? (
        <ul className="text-sm space-y-1 list-disc list-inside text-foreground/80">
          {items.slice(0, 5).map((it, i) => <li key={i} className="truncate">{it}</li>)}
        </ul>
      ) : (
        <span className="text-sm text-muted-foreground">None detected</span>
      )}
    </div>
  );
}
