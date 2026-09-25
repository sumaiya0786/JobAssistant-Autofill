import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import api, { apiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { AuthShell } from "@/pages/Login";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", { name, email, password });
      login(data.token, data.user);
      toast.success("Account created — let's build your profile.");
      navigate("/profile");
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Set up your profile once, autofill applications everywhere.">
      <form onSubmit={submit} className="space-y-5" data-testid="register-form">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Lovelace" data-testid="register-name-input" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" data-testid="register-email-input" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" data-testid="register-password-input" />
        </div>
        <Button type="submit" disabled={loading} className="w-full rounded-md" data-testid="register-submit-button">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
        </Button>
        <p className="text-sm text-muted-foreground text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline" data-testid="go-login-link">
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
