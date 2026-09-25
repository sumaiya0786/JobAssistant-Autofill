import { useEffect, useState } from "react";
import { toast } from "sonner";
import api, { apiError } from "@/lib/api";
import { Layout, PageHeader } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, Plus, Trash2, Save } from "lucide-react";

const toList = (arr) => (Array.isArray(arr) ? arr.join(", ") : "");
const fromList = (str) => String(str || "").split(",").map((s) => s.trim()).filter(Boolean);

function Field({ label, value, onChange, placeholder, testid, type = "text" }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} data-testid={testid} />
    </div>
  );
}

export default function Profile() {
  const [p, setP] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/profile").then((res) => setP(normalize(res.data.profile)));
  }, []);

  function normalize(profile) {
    return {
      personal: profile.personal || {},
      professional: profile.professional || {},
      schooling: profile.schooling || {},
      education: profile.education || [],
      experience: profile.experience || [],
      projects: profile.projects || [],
      other: profile.other || {},
    };
  }

  const setSection = (sec, key, val) => setP((prev) => ({ ...prev, [sec]: { ...prev[sec], [key]: val } }));
  const setArrayField = (sec, key, val) => setSection(sec, key, fromList(val));

  const addRow = (sec, template) => setP((prev) => ({ ...prev, [sec]: [...prev[sec], template] }));
  const updateRow = (sec, i, key, val) =>
    setP((prev) => ({ ...prev, [sec]: prev[sec].map((row, idx) => (idx === i ? { ...row, [key]: val } : row)) }));
  const removeRow = (sec, i) => setP((prev) => ({ ...prev, [sec]: prev[sec].filter((_, idx) => idx !== i) }));

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.put("/profile", p);
      setP(normalize(data.profile));
      toast.success("Profile saved");
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setSaving(false);
    }
  };

  if (!p) return <Layout><div className="py-20 text-center text-muted-foreground">Loading profile…</div></Layout>;

  return (
    <Layout>
      <PageHeader
        title="Profile"
        subtitle="Enter your details once. The extension uses this to autofill any job application."
        action={<Button onClick={save} disabled={saving} className="rounded-md gap-2" data-testid="save-profile-button">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save</Button>}
      />

      <Tabs defaultValue="personal">
        <TabsList className="mb-6 flex-wrap h-auto">
          <TabsTrigger value="personal" data-testid="tab-personal">Personal</TabsTrigger>
          <TabsTrigger value="professional" data-testid="tab-professional">Professional</TabsTrigger>
          <TabsTrigger value="education" data-testid="tab-education">Education</TabsTrigger>
          <TabsTrigger value="experience" data-testid="tab-experience">Experience</TabsTrigger>
          <TabsTrigger value="projects" data-testid="tab-projects">Projects</TabsTrigger>
          <TabsTrigger value="other" data-testid="tab-other">Other</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <div className="border border-border bg-card rounded-lg p-6 grid md:grid-cols-2 gap-5">
            <Field label="Full Name" value={p.personal.fullName} onChange={(v) => setSection("personal", "fullName", v)} testid="pf-fullName" />
            <Field label="First Name" value={p.personal.firstName} onChange={(v) => setSection("personal", "firstName", v)} testid="pf-firstName" />
            <Field label="Last Name" value={p.personal.lastName} onChange={(v) => setSection("personal", "lastName", v)} testid="pf-lastName" />
            <Field label="Email" type="email" value={p.personal.email} onChange={(v) => setSection("personal", "email", v)} testid="pf-email" />
            <Field label="Phone" value={p.personal.phone} onChange={(v) => setSection("personal", "phone", v)} testid="pf-phone" />
            <Field label="Date of Birth" value={p.personal.dateOfBirth} onChange={(v) => setSection("personal", "dateOfBirth", v)} placeholder="YYYY-MM-DD" testid="pf-dob" />
            <Field label="Location" value={p.personal.location} onChange={(v) => setSection("personal", "location", v)} testid="pf-location" />
            <Field label="Address" value={p.personal.address} onChange={(v) => setSection("personal", "address", v)} testid="pf-address" />
            <Field label="City" value={p.personal.city} onChange={(v) => setSection("personal", "city", v)} testid="pf-city" />
            <Field label="State" value={p.personal.state} onChange={(v) => setSection("personal", "state", v)} testid="pf-state" />
            <Field label="Country" value={p.personal.country} onChange={(v) => setSection("personal", "country", v)} testid="pf-country" />
            <Field label="Pincode / Zip" value={p.personal.pincode} onChange={(v) => setSection("personal", "pincode", v)} testid="pf-pincode" />
          </div>
        </TabsContent>

        <TabsContent value="professional">
          <div className="border border-border bg-card rounded-lg p-6 grid md:grid-cols-2 gap-5">
            <Field label="Current Role" value={p.professional.currentRole} onChange={(v) => setSection("professional", "currentRole", v)} testid="pf-currentRole" />
            <Field label="Target Role" value={p.professional.targetRole} onChange={(v) => setSection("professional", "targetRole", v)} testid="pf-targetRole" />
            <Field label="Years of Experience" value={p.professional.experienceYears} onChange={(v) => setSection("professional", "experienceYears", v)} testid="pf-experienceYears" />
            <Field label="LinkedIn" value={p.professional.linkedin} onChange={(v) => setSection("professional", "linkedin", v)} testid="pf-linkedin" />
            <Field label="GitHub" value={p.professional.github} onChange={(v) => setSection("professional", "github", v)} testid="pf-github" />
            <Field label="Portfolio" value={p.professional.portfolio} onChange={(v) => setSection("professional", "portfolio", v)} testid="pf-portfolio" />
            <div className="md:col-span-2 space-y-1.5">
              <Label>Skills <span className="text-muted-foreground font-normal">(comma separated)</span></Label>
              <Textarea value={toList(p.professional.skills)} onChange={(e) => setArrayField("professional", "skills", e.target.value)} placeholder="Java, React, SQL, Git" data-testid="pf-skills" />
            </div>
            <div className="space-y-1.5">
              <Label>Programming Languages</Label>
              <Input value={toList(p.professional.programmingLanguages)} onChange={(e) => setArrayField("professional", "programmingLanguages", e.target.value)} placeholder="Java, Python" data-testid="pf-langs" />
            </div>
            <div className="space-y-1.5">
              <Label>Frameworks</Label>
              <Input value={toList(p.professional.frameworks)} onChange={(e) => setArrayField("professional", "frameworks", e.target.value)} placeholder="React, Express" data-testid="pf-frameworks" />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <Label>Tools</Label>
              <Input value={toList(p.professional.tools)} onChange={(e) => setArrayField("professional", "tools", e.target.value)} placeholder="Git, Docker, Figma" data-testid="pf-tools" />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="education">
          <RowEditor
            title="Education"
            rows={p.education}
            onAdd={() => addRow("education", { university: "", degree: "", branch: "", graduationYear: "", cgpa: "" })}
            renderRow={(row, i) => (
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="College / University" value={row.university} onChange={(v) => updateRow("education", i, "university", v)} />
                <Field label="Degree" value={row.degree} onChange={(v) => updateRow("education", i, "degree", v)} />
                <Field label="Branch / Major" value={row.branch} onChange={(v) => updateRow("education", i, "branch", v)} />
                <Field label="Graduation Year" value={row.graduationYear} onChange={(v) => updateRow("education", i, "graduationYear", v)} />
                <Field label="CGPA / GPA" value={row.cgpa} onChange={(v) => updateRow("education", i, "cgpa", v)} />
              </div>
            )}
            onRemove={(i) => removeRow("education", i)}
            testid="education"
          />
          <div className="border border-border bg-card rounded-lg p-6 grid md:grid-cols-2 gap-5 mt-4">
            <Field label="10th School" value={p.schooling.tenthSchool} onChange={(v) => setSection("schooling", "tenthSchool", v)} />
            <Field label="10th Percentage" value={p.schooling.tenthPercentage} onChange={(v) => setSection("schooling", "tenthPercentage", v)} />
            <Field label="12th School" value={p.schooling.twelfthSchool} onChange={(v) => setSection("schooling", "twelfthSchool", v)} />
            <Field label="12th Percentage" value={p.schooling.twelfthPercentage} onChange={(v) => setSection("schooling", "twelfthPercentage", v)} />
          </div>
        </TabsContent>

        <TabsContent value="experience">
          <RowEditor
            title="Experience"
            rows={p.experience}
            onAdd={() => addRow("experience", { company: "", role: "", duration: "", responsibilities: "" })}
            renderRow={(row, i) => (
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Company" value={row.company} onChange={(v) => updateRow("experience", i, "company", v)} />
                <Field label="Role" value={row.role} onChange={(v) => updateRow("experience", i, "role", v)} />
                <Field label="Duration" value={row.duration} onChange={(v) => updateRow("experience", i, "duration", v)} placeholder="Jan 2023 – Present" />
                <div className="md:col-span-2 space-y-1.5">
                  <Label>Responsibilities</Label>
                  <Textarea value={row.responsibilities} onChange={(e) => updateRow("experience", i, "responsibilities", e.target.value)} />
                </div>
              </div>
            )}
            onRemove={(i) => removeRow("experience", i)}
            testid="experience"
          />
        </TabsContent>

        <TabsContent value="projects">
          <RowEditor
            title="Projects"
            rows={p.projects}
            onAdd={() => addRow("projects", { name: "", description: "", technologies: "", link: "" })}
            renderRow={(row, i) => (
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Project Name" value={row.name} onChange={(v) => updateRow("projects", i, "name", v)} />
                <Field label="Technologies" value={row.technologies} onChange={(v) => updateRow("projects", i, "technologies", v)} />
                <Field label="Link" value={row.link} onChange={(v) => updateRow("projects", i, "link", v)} />
                <div className="md:col-span-2 space-y-1.5">
                  <Label>Description</Label>
                  <Textarea value={row.description} onChange={(e) => updateRow("projects", i, "description", e.target.value)} />
                </div>
              </div>
            )}
            onRemove={(i) => removeRow("projects", i)}
            testid="projects"
          />
        </TabsContent>

        <TabsContent value="other">
          <div className="border border-border bg-card rounded-lg p-6 grid md:grid-cols-2 gap-5">
            <div className="md:col-span-2 space-y-1.5">
              <Label>Certifications (comma separated)</Label>
              <Input value={toList(p.other.certifications)} onChange={(e) => setArrayField("other", "certifications", e.target.value)} data-testid="pf-certs" />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <Label>Achievements (comma separated)</Label>
              <Input value={toList(p.other.achievements)} onChange={(e) => setArrayField("other", "achievements", e.target.value)} />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <Label>Preferred Locations (comma separated)</Label>
              <Input value={toList(p.other.preferredLocations)} onChange={(e) => setArrayField("other", "preferredLocations", e.target.value)} />
            </div>
            <Field label="Notice Period" value={p.other.noticePeriod} onChange={(v) => setSection("other", "noticePeriod", v)} />
            <Field label="Work Authorization" value={p.other.workAuthorization} onChange={(v) => setSection("other", "workAuthorization", v)} placeholder="e.g. US Citizen, Needs sponsorship" />
            <Field label="Willingness to Relocate" value={p.other.willingToRelocate} onChange={(v) => setSection("other", "willingToRelocate", v)} placeholder="Yes / No" />
          </div>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}

function RowEditor({ title, rows, renderRow, onAdd, onRemove, testid }) {
  return (
    <div className="space-y-4">
      {rows.length === 0 && (
        <div className="border border-dashed border-border rounded-lg p-10 text-center text-muted-foreground">
          No {title.toLowerCase()} added yet.
        </div>
      )}
      {rows.map((row, i) => (
        <div key={i} className="border border-border bg-card rounded-lg p-6 relative" data-testid={`${testid}-row-${i}`}>
          <button onClick={() => onRemove(i)} className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors" data-testid={`${testid}-remove-${i}`}>
            <Trash2 className="h-4 w-4" />
          </button>
          {renderRow(row, i)}
        </div>
      ))}
      <Button variant="outline" onClick={onAdd} className="rounded-md gap-2" data-testid={`add-${testid}`}>
        <Plus className="h-4 w-4" /> Add {title}
      </Button>
    </div>
  );
}
