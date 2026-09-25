import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import api, { apiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2 } from "lucide-react";

const AUTH_BG = "https://images.unsplash.com/photo-1601662528567-526cd06f6582?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MDZ8MHwxfHNlYXJjaHwyfHxhYnN0cmFjdCUyMHN1YnRsZSUyMHRleHR1cmUlMjBwYXBlcnxlbnwwfHx8fDE3ODc2ODM4MjB8MA&ixlib=rb-4.1.0&q=85";

export function AuthShell({ children, title, subtitle }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-primary text-primary-foreground overflow-hidden">
        <img src={AUTH_BG} alt="" className="absolute inset-0 h-full w-full object-cover opacity-10" />
        <div className="relative flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-md bg-primary-foreground/10 border border-primary-foreground/20 flex items-center justify-center">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="font-display font-bold text-lg">JobAssist</span>
        </div>
        <div className="relative max-w-md">
          <h2 className="font-display text-4xl font-bold leading-tight tracking-tight">
            Apply to more jobs, in a fraction of the time.
          </h2>
          <p className="mt-4 text-primary-foreground/70 leading-relaxed">
            Smart autofill, transparent resume-to-job match scoring, and an AI assistant that lives in your browser —
            without ever submitting an application on your behalf.
          </p>
        </div>
        <div className="relative text-sm text-primary-foreground/50">Set up once. Autofill everywhere.</div>
      </div>

      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm fade-up">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
            <p className="text-muted-foreground mt-2 text-sm">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      login(data.token, data.user);
      toast.success("Welcome back!");
      navigate("/");
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Sign in" subtitle="Access your job application dashboard.">
      <form onSubmit={submit} className="space-y-5" data-testid="login-form">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" data-testid="login-email-input" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" data-testid="login-password-input" />
        </div>
        <Button type="submit" disabled={loading} className="w-full rounded-md" data-testid="login-submit-button">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
        </Button>
        <p className="text-sm text-muted-foreground text-center">
          No account?{" "}
          <Link to="/register" className="text-primary font-medium hover:underline" data-testid="go-register-link">
            Create one
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
