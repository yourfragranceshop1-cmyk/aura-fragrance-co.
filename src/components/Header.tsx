import { Link } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "./Logo";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

const NAV = [
  { to: "/", label: "Accueil" },
  { to: "/catalogue", label: "Catalogue" },
  { to: "/about", label: "À propos" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const { count } = useCart();
  const { user, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container-edit flex h-20 items-center justify-between">
        <button className="md:hidden text-foreground" onClick={() => setOpen((v) => !v)} aria-label="Menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Logo />

        <nav className="hidden md:flex items-center gap-10 text-[13px] tracking-[0.18em] uppercase text-foreground/80">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>
              {n.label}
            </Link>
          ))}
          {isAdmin && (
            <Link to="/admin" className="hover:text-gold transition-colors text-gold">Admin</Link>
          )}
        </nav>

        <div className="flex items-center gap-4 text-foreground/80">
          <Link to="/catalogue" className="hidden sm:inline-flex" aria-label="Recherche"><Search className="h-5 w-5" /></Link>
          <Link to={user ? "/favoris" : "/login"} aria-label="Favoris"><Heart className="h-5 w-5" /></Link>
          <Link to={user ? "/login" : "/login"} aria-label="Compte"><User className="h-5 w-5" /></Link>
          <Link to="/panier" className="relative" aria-label="Panier">
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -top-2 -right-2 h-5 min-w-5 px-1 rounded-full bg-gold text-gold-foreground text-[10px] font-semibold flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {open && (
        <nav className="md:hidden border-t border-border bg-background">
          <div className="container-edit py-4 flex flex-col gap-3 text-sm">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="py-2">
                {n.label}
              </Link>
            ))}
            {isAdmin && <Link to="/admin" onClick={() => setOpen(false)} className="py-2 text-gold">Admin</Link>}
          </div>
        </nav>
      )}
    </header>
  );
}
