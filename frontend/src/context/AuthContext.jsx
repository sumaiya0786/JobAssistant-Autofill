import { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null=loading, false=guest, object=user
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("ja_token");
    if (!token) {
      setUser(false);
      setReady(true);
      return;
    }
    api
      .get("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem("ja_token");
        setUser(false);
      })
      .finally(() => setReady(true));
  }, []);

  const login = (token, u) => {
    localStorage.setItem("ja_token", token);
    setUser(u);
  };
  const logout = () => {
    localStorage.removeItem("ja_token");
    setUser(false);
    window.location.href = "/login";
  };

  return <AuthContext.Provider value={{ user, setUser, ready, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
