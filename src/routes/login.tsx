import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Connexion — Your Fragrance Shop" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    return (
      <Layout>
        <section className="container-edit py-24 max-w-md text-center">
          <h1 className="font-display text-4xl mb-4">Bonjour</h1>
          <p className="text-muted-foreground mb-2">{user.email}</p>
          <button onClick={() => signOut()} className="link-underline mt-6">Se déconnecter</button>
        </section>
      </Layout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Connecté");
        navigate({ to: "/" });
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/` },
        });
        if (error) throw error;
        toast.success("Compte créé. Vérifiez vos e-mails.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    if (error) toast.error("Connexion Google échouée : " + error.message);
  };

  return (
    <Layout>
      <section className="container-edit py-20 max-w-md">
        <h1 className="font-display text-5xl text-center mb-2">{mode === "signin" ? "Connexion" : "Créer un compte"}</h1>
        <p className="text-center text-muted-foreground mb-10 text-sm">
          {mode === "signin" ? "Retrouvez vos favoris et commandes." : "Sauvegardez vos favoris et votre panier."}
        </p>

        <button onClick={handleGoogle} className="w-full border border-border py-3 text-xs uppercase tracking-[0.2em] hover:bg-secondary mb-6">
          Continuer avec Google
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground tracking-[0.2em]">ou</span></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-card border border-border px-4 py-3 mt-1" />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Mot de passe</label>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-card border border-border px-4 py-3 mt-1" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground py-3.5 text-xs uppercase tracking-[0.2em] hover:bg-primary/90 disabled:opacity-50">
            {loading ? "..." : mode === "signin" ? "Se connecter" : "Créer mon compte"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {mode === "signin" ? "Pas de compte ?" : "Déjà inscrit ?"}{" "}
          <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="text-foreground underline">
            {mode === "signin" ? "Créer un compte" : "Se connecter"}
          </button>
        </p>
      </section>
    </Layout>
  );
}
