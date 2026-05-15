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

      {/* CATEGORIES */}
      <section className="container-edit py-20">
        <div className="text-center mb-12">
          <p className="text-[11px] uppercase tracking-[0.3em] text-gold mb-3">Explorer</p>
          <h2 className="font-display text-4xl md:text-5xl">Catégories</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.key}
              to="/catalogue"
              search={c.key === "bestseller" ? { bestseller: true } : { category: c.key }}
              className="group relative aspect-[4/5] overflow-hidden bg-primary text-primary-foreground"
            >
              <div className="absolute inset-0 grid place-items-center">
                <span className="font-display text-2xl md:text-3xl tracking-wide group-hover:text-gold transition-colors">{c.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* BESTSELLERS */}
      {bestsellers.length > 0 && (
        <section className="container-edit py-12">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl md:text-5xl">Les Bestsellers</h2>
            <Link to="/catalogue" search={{ bestseller: true }} className="mt-4 link-underline inline-flex">
              Voir tous <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
