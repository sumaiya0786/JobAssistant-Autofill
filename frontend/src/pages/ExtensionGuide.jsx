import { Layout, PageHeader } from "@/components/Layout";
import {
  Button
} from "@/components/ui/button";
import {
  Wand2,
  MousePointerClick,
  ShieldCheck,
  Search,
  UserRound,
  FileCheck
} from "lucide-react";

const FEATURES = [
  {
    icon: Wand2,
    t: "Smart Autofill",
    d: "Automatically identifies application fields and fills them using the information saved in your JobAssist profile."
  },
  {
    icon: Search,
    t: "Form Detection",
    d: "Detects relevant fields on job application pages so you can spend less time entering repetitive information."
  },
  {
    icon: UserRound,
    t: "Your Profile",
    d: "Uses your saved profile information to keep your applications consistent across different job sites."
  },
  {
    icon: FileCheck,
    t: "Job Application Support",
    d: "Works directly on application pages while you review the information before submitting."
  },
  {
    icon: MousePointerClick,
    t: "Review Before Submit",
    d: "You remain in control. Review the completed fields and make any changes before submitting an application."
  },
  {
    icon: ShieldCheck,
    t: "Never Auto-Submits",
    d: "JobAssist fills application fields but never submits an application on your behalf."
  }
];

export default function ExtensionGuide() {
  return (
    <Layout>
      <PageHeader
        title="JobAssist Extension"
        subtitle="Autofill job applications directly from your browser."
        action={
          <a href="/job-assistant-extension.zip" download>
            <Button
              className="rounded-md"
              data-testid="download-extension-button"
            >
              Get JobAssist Extension
            </Button>
          </a>
        }
      />

      <div className="border border-border bg-card rounded-lg p-6 mb-8">
        <div className="max-w-3xl">
          <h2 className="font-display font-semibold text-xl">
            Apply faster with JobAssist
          </h2>

          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            JobAssist works inside your browser to detect job application
            fields and fill them using your saved profile information.
            You review everything before submitting the application.
          </p>

          <div className="flex flex-wrap gap-3 mt-5">
            <div className="text-sm bg-secondary px-3 py-2 rounded-md">
              ✓ Smart field detection
            </div>

            <div className="text-sm bg-secondary px-3 py-2 rounded-md">
              ✓ Profile-based autofill
            </div>

            <div className="text-sm bg-secondary px-3 py-2 rounded-md">
              ✓ Manual review
            </div>

            <div className="text-sm bg-secondary px-3 py-2 rounded-md">
              ✓ Never auto-submits
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {FEATURES.map((f) => (
          <div
            key={f.t}
            className="border border-border bg-card rounded-lg p-6"
          >
            <div className="h-10 w-10 rounded-md bg-secondary flex items-center justify-center mb-4">
              <f.icon className="h-5 w-5 text-primary" />
            </div>

            <h3 className="font-display font-semibold">
              {f.t}
            </h3>

            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
              {f.d}
            </p>
          </div>
        ))}
      </div>

      <div className="border border-border bg-card rounded-lg p-6">
        <h3 className="font-display font-semibold text-lg">
          How JobAssist works
        </h3>

        <div className="grid md:grid-cols-3 gap-6 mt-6">
          <div>
            <div className="text-sm font-semibold mb-1">
              1. Open a job application
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Open the application page for the job you want to apply for.
            </p>
          </div>

          <div>
            <div className="text-sm font-semibold mb-1">
              2. Let JobAssist fill the fields
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              JobAssist detects available fields and fills them using your
              saved profile information.
            </p>
          </div>

          <div>
            <div className="text-sm font-semibold mb-1">
              3. Review and submit
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Check the information, make any required changes, and submit
              the application yourself.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">
              Already installed?
            </strong>{" "}
            Open JobAssist from your Chrome toolbar and use it on any
            supported job application.
          </p>
        </div>
      </div>
    </Layout>
  );
}