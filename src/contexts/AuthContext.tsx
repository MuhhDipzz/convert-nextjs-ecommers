"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type AppRole = "buyer" | "seller" | "admin";

interface Profile {
  id: string;
  user_id: string;
  email: string;
  name: string;
  phone: string | null;
  avatar_url: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: AppRole | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    name: string,
    phone?: string
  ) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error: Error | null }>;
  requestSellerRole: () => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  /* ================= FETCHERS ================= */

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Profile error:", error);
      return null;
    }

    return data;
  };

  const fetchRole = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Role error:", error);
      return null;
    }

    return data?.role as AppRole | null;
  };

  const loadUserData = async (session: Session | null) => {
    if (!session?.user) {
      setProfile(null);
      setRole(null);
      setLoading(false);
      return;
    }

    const [profileData, roleData] = await Promise.all([
      fetchProfile(session.user.id),
      fetchRole(session.user.id),
    ]);

    setProfile(profileData);
    setRole(roleData);
    setLoading(false);
  };

  /* ================= INIT ================= */

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      setSession(session);
      setUser(session?.user ?? null);

      await loadUserData(session);
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      // penting: jangan pakai setTimeout lagi
      loadUserData(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /* ================= ACTIONS ================= */

  const signUp = async (
    email: string,
    password: string,
    name: string,
    phone?: string
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { name, phone },
      },
    });

    if (error) return { error };

    toast({
      title: "Account created",
      description: "Silakan login",
    });

    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setRole(null);
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { error } = await supabase
      .from("profiles")
      .update(data)
      .eq("user_id", user.id);

    if (error) return { error };

    const newProfile = await fetchProfile(user.id);
    setProfile(newProfile);

    return { error: null };
  };

  const requestSellerRole = async () => {
    if (!user) return { error: new Error("Not authenticated") };

    const { error } = await supabase
      .from("user_roles")
      .update({ role: "seller" })
      .eq("user_id", user.id);

    if (error) return { error };

    setRole("seller");

    return { error: null };
  };

  /* ================= PROVIDER ================= */

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role,
        loading,
        signUp,
        signIn,
        signOut,
        updateProfile,
        requestSellerRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* ================= HOOK ================= */

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};