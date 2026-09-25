import { useEffect, useState } from "react";
import { toast } from "sonner";
import api, { apiError } from "@/lib/api";
import { Layout, PageHeader } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, ExternalLink, ListChecks } from "lucide-react";

const STATUSES = ["Saved", "Applying", "Applied", "Interview", "Rejected", "Offer"];
const STATUS_COLORS = {
  Saved: "bg-slate-100 text-slate-700",
  Applying: "bg-amber-100 text-amber-800",
  Applied: "bg-blue-100 text-blue-800",
  Interview: "bg-violet-100 text-violet-800",
  Rejected: "bg-red-100 text-red-800",
  Offer: "bg-green-100 text-green-800",
};

export default function Applications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ company: "", role: "", jobUrl: "", dateApplied: "", matchScore: "", notes: "", status: "Saved" });

  const load = () => {
    setLoading(true);
    api.get("/applications").then((res) => setApps(res.data.applications)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const create = async () => {
    if (!form.company) { toast.error("Company is required"); return; }
    try {
      await api.post("/applications", { ...form, matchScore: Number(form.matchScore) || 0 });
      toast.success("Application added");
      setOpen(false);
      setForm({ company: "", role: "", jobUrl: "", dateApplied: "", matchScore: "", notes: "", status: "Saved" });
      load();
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  const updateStatus = async (id, status) => {
    setApps((prev) => prev.map((a) => (a._id === id ? { ...a, status } : a)));
    try {
      await api.put(`/applications/${id}`, { status });
      toast.success(`Status → ${status}`);
    } catch (err) {
      toast.error(apiError(err));
      load();
    }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/applications/${id}`);
      setApps((prev) => prev.filter((a) => a._id !== id));
      toast.success("Removed");
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  return (
    <Layout>
      <PageHeader
        title="Applications"
        subtitle="Track every job from saved to offer. Update statuses as you progress."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-md gap-2" data-testid="add-application-button"><Plus className="h-4 w-4" /> Add</Button>
            </DialogTrigger>
            <DialogContent data-testid="add-application-dialog">
              <DialogHeader>
                <DialogTitle>Add application</DialogTitle>
                <DialogDescription>Track a job you're applying to. Update its status as you progress.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Label>Company *</Label><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} data-testid="app-company-input" /></div>
                  <div className="space-y-1.5"><Label>Role</Label><Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} data-testid="app-role-input" /></div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Label>Match score (%)</Label><Input type="number" value={form.matchScore} onChange={(e) => setForm({ ...form, matchScore: e.target.value })} /></div>
                  <div className="space-y-1.5">
                    <Label>Status</Label>
                    <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                      <SelectTrigger data-testid="app-status-select"><SelectValue /></SelectTrigger>
                      <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5"><Label>Job URL</Label><Input value={form.jobUrl} onChange={(e) => setForm({ ...form, jobUrl: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={create} data-testid="save-application-button">Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {loading ? (
        <div className="py-16 text-center text-muted-foreground">Loading…</div>
      ) : apps.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg p-16 text-center">
          <ListChecks className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="font-medium">No applications tracked</p>
          <p className="text-sm text-muted-foreground mt-1">Add one manually or send jobs here from the Job Analyzer.</p>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden bg-card">
          <Table data-testid="applications-table">
            <TableHeader>
              <TableRow className="bg-secondary/50">
                <TableHead>Company</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Match</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apps.map((a) => (
                <TableRow key={a._id} data-testid={`app-row-${a._id}`}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-1.5">
                      {a.company}
                      {a.jobUrl && <a href={a.jobUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary"><ExternalLink className="h-3.5 w-3.5" /></a>}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{a.role || "—"}</TableCell>
                  <TableCell>{a.matchScore > 0 ? <span className="font-medium text-primary">{a.matchScore}%</span> : "—"}</TableCell>
                  <TableCell>
                    <Select value={a.status} onValueChange={(v) => updateStatus(a._id, v)}>
                      <SelectTrigger className={`h-8 w-32 border-0 rounded-full ${STATUS_COLORS[a.status]}`} data-testid={`status-select-${a._id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-destructive" onClick={() => remove(a._id)} data-testid={`delete-app-${a._id}`}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Layout>
  );
}
