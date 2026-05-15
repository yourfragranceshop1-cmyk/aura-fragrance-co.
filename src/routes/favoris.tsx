import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import { useFavorites } from "@/contexts/FavoritesContext";
import type { Product } from "@/lib/types";
import { useMemo } from "react";

export const Route = createFileRoute("/favoris")({
  head: () => ({ meta: [{ title: "Favoris — Your Fragrance Shop" }] }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const { ids } = useFavorites();
  const idArray = useMemo(() => Array.from(ids), [ids]);

  const { data: products = [] } = useQuery({
    queryKey: ["favorites", idArray.join(",")],
    queryFn: async () => {
      if (idArray.length === 0) return [];
      const { data } = await supabase.from("products").select("*").in("id", idArray);
      return (data ?? []) as Product[];
    },
  });

  return (
    <Layout>
      <section className="container-edit py-12">
        <h1 className="font-display text-5xl text-center mb-12">Mes favoris</h1>
        {products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-6">Vous n'avez pas encore de favoris.</p>
            <Link to="/catalogue" className="link-underline">Explorer le catalogue</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
    </Layout>
  );
}
