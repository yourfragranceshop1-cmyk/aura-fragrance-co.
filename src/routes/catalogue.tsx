import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { z } from "zod";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/lib/types";
import { Search } from "lucide-react";

const searchSchema = z.object({
  q: z.string().optional(),
  category: z.enum(["homme", "femme", "unisexe"]).optional(),
  contenance: z.coerce.number().optional(),
  bestseller: z.coerce.boolean().optional(),
  inStock: z.coerce.boolean().optional(),
  sort: z.enum(["new", "price_asc", "price_desc"]).optional(),
});

export const Route = createFileRoute("/catalogue")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Catalogue — Your Fragrance Shop" },
      { name: "description", content: "Tous nos parfums : femme, homme, unisexe. Filtrez par contenance, prix et disponibilité." },
    ],
  }),
  component: CataloguePage,
});

function CataloguePage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/catalogue" });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      return (data ?? []) as Product[];
    },
  });

  const filtered = useMemo(() => {
    let list = [...products];
    if (search.category) list = list.filter((p) => p.category === search.category);
    if (search.contenance) list = list.filter((p) => p.contenance === search.contenance);
    if (search.bestseller) list = list.filter((p) => p.is_bestseller);
    if (search.inStock) list = list.filter((p) => p.stock > 0);
    if (search.q) {
      const q = search.q.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || (p.description ?? "").toLowerCase().includes(q));
    }
    if (search.sort === "price_asc") list.sort((a, b) => Number(a.price) - Number(b.price));
    if (search.sort === "price_desc") list.sort((a, b) => Number(b.price) - Number(a.price));
    return list;
  }, [products, search]);

  const update = (patch: Partial<typeof search>) =>
    navigate({ search: (prev: typeof search) => ({ ...prev, ...patch }) });

  return (
    <Layout>
      <section className="container-edit py-12">
        <div className="text-center mb-10">
          <p className="text-[11px] uppercase tracking-[0.3em] text-gold mb-3">Notre sélection</p>
          <h1 className="font-display text-5xl">Catalogue</h1>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-8 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search.q ?? ""}
            onChange={(e) => update({ q: e.target.value || undefined })}
            placeholder="Rechercher un parfum..."
            className="w-full bg-card border border-border pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 justify-center mb-12 text-xs uppercase tracking-[0.16em]">
          {(["homme", "femme", "unisexe"] as const).map((c) => (
            <button
              key={c}
              onClick={() => update({ category: search.category === c ? undefined : c })}
              className={`px-4 py-2 border transition ${search.category === c ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-foreground"}`}
            >{c}</button>
          ))}
          {[30, 50, 100].map((ml) => (
            <button
              key={ml}
              onClick={() => update({ contenance: search.contenance === ml ? undefined : ml })}
              className={`px-4 py-2 border transition ${search.contenance === ml ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-foreground"}`}
            >{ml}ml</button>
          ))}
          <button
            onClick={() => update({ bestseller: search.bestseller ? undefined : true })}
            className={`px-4 py-2 border transition ${search.bestseller ? "bg-gold text-gold-foreground border-gold" : "border-border hover:border-foreground"}`}
          >Bestseller</button>
          <button
            onClick={() => update({ inStock: search.inStock ? undefined : true })}
            className={`px-4 py-2 border transition ${search.inStock ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-foreground"}`}
          >En stock</button>
          <select
            value={search.sort ?? "new"}
            onChange={(e) => update({ sort: e.target.value as "new" | "price_asc" | "price_desc" })}
            className="px-4 py-2 border border-border bg-background uppercase tracking-[0.16em] text-xs"
          >
            <option value="new">Nouveautés</option>
            <option value="price_asc">Prix croissant</option>
            <option value="price_desc">Prix décroissant</option>
          </select>
        </div>

        {isLoading ? (
          <p className="text-center text-muted-foreground">Chargement...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">Aucun parfum ne correspond à votre recherche.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
    </Layout>
  );
}
