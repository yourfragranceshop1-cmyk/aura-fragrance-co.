import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Sparkles, Truck, ShieldCheck } from "lucide-react";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/lib/types";
import heroImg from "@/assets/hero-perfume.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Your Fragrance Shop — De bonnes senteurs pour tous les budgets" },
      { name: "description", content: "Découvrez notre sélection de parfums accessibles. Commande rapide via WhatsApp." },
    ],
  }),
  component: HomePage,
});

const CATEGORIES = [
  { key: "femme", label: "Femme" },
  { key: "homme", label: "Homme" },
  { key: "unisexe", label: "Unisexe" },
  { key: "bestseller", label: "Bestsellers" },
] as const;

function HomePage() {
  const { data: bestsellers = [] } = useQuery({
    queryKey: ["bestsellers"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").eq("is_bestseller", true).limit(3);
      return (data ?? []) as Product[];
    },
  });
  const { data: popular = [] } = useQuery({
    queryKey: ["popular"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").eq("is_popular", true).limit(4);
      return (data ?? []) as Product[];
    },
  });

  return (
    <Layout>
      <ParallaxHero />

      {/* BESTSELLERS */}
      {bestsellers.length > 0 && (
        <section className="container-edit py-12">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl md:text-5xl">Les Bestsellers</h2>
            <Link to="/catalogue" search={{ bestseller: true }} className="mt-4 link-underline inline-flex">
              Voir tous <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {bestsellers.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* POPULAR */}
      {popular.length > 0 && (
        <section className="container-edit py-20">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl md:text-5xl">Populaires</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {popular.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* TRUST */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container-edit grid md:grid-cols-3 gap-12 text-center">
          {[
            { icon: Sparkles, title: "Qualité sélectionnée", text: "Chaque fragrance est choisie avec soin pour son authenticité." },
            { icon: Truck, title: "Commande rapide", text: "Passez commande en quelques clics directement via WhatsApp." },
            { icon: ShieldCheck, title: "Prix accessibles", text: "Le luxe à portée de tous, sans compromis sur la qualité." },
          ].map((t) => (
            <div key={t.title} className="flex flex-col items-center">
              <t.icon className="h-7 w-7 text-gold mb-4" />
              <h3 className="font-display text-2xl mb-2">{t.title}</h3>
              <p className="text-sm text-primary-foreground/70 max-w-xs">{t.text}</p>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}

function ParallaxHero() {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      // Only animate while hero is in/near viewport
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      // Subtle parallax: bg moves slower than scroll
      setOffset(-rect.top * 0.25);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden h-[88vh] min-h-[600px] max-h-[900px] bg-secondary"
    >
      <div
        className="absolute inset-0 will-change-transform"
        style={{
          transform: `translate3d(0, ${offset}px, 0) scale(1.12)`,
        }}
      >
        <img
          src={heroImg}
          alt="Flacon de parfum minimaliste"
          width={1920}
          height={1080}
          className="h-full w-full object-cover"
        />
        {/* Tinted overlay so text stays legible in light & dark themes */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/50 to-transparent dark:from-background/90 dark:via-background/60" />
      </div>

      <div className="relative z-10 container-edit h-full flex items-center">
        <div className="max-w-xl">
          <p className="text-[11px] uppercase tracking-[0.3em] text-gold mb-6">Nouvelle collection</p>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight text-foreground">
            Luxury &<br />
            <span className="italic">Fragrance</span>
          </h1>
          <p className="mt-6 max-w-md text-muted-foreground">
            De bonnes senteurs pour tous les budgets. Une sélection de fragrances raffinées, livrées rapidement via WhatsApp.
          </p>
          <div className="mt-10 flex items-center gap-6">
            <Link to="/catalogue" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 text-xs uppercase tracking-[0.2em] hover:bg-primary/90 transition-colors">
              Voir les parfums <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/about" className="link-underline text-foreground">Notre histoire</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
