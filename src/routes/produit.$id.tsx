import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart, MessageCircle, ShoppingBag } from "lucide-react";
import { Layout } from "@/components/Layout";
import { StockBadge } from "@/components/StockBadge";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/lib/types";
import { formatPrice, whatsappLink } from "@/lib/whatsapp";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { toast } from "sonner";

export const Route = createFileRoute("/produit/$id")({
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const { add } = useCart();
  const { isFavorite, toggle } = useFavorites();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
      return data as Product | null;
    },
  });

  if (isLoading) return <Layout><div className="container-edit py-20 text-center text-muted-foreground">Chargement...</div></Layout>;
  if (!product) return <Layout><div className="container-edit py-20 text-center"><p>Produit introuvable.</p><Link to="/catalogue" className="link-underline mt-4 inline-flex">Retour au catalogue</Link></div></Layout>;

  const fav = isFavorite(product.id);
  const waLink = whatsappLink([{ name: product.name, quantity: 1, price: Number(product.price), contenance: product.contenance }]);

  return (
    <Layout>
      <section className="container-edit py-12 grid lg:grid-cols-2 gap-12">
        <div className="relative bg-secondary/60 aspect-square">
          {product.image_url && (
            <img src={product.image_url} alt={product.name} width={800} height={800} className="h-full w-full object-cover" />
          )}
          <div className="absolute top-4 right-4"><StockBadge stock={product.stock} /></div>
        </div>
        <div className="flex flex-col justify-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-gold mb-4">{product.category}</p>
          <h1 className="font-display text-5xl mb-4">{product.name}</h1>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-6">
            Eau de parfum · {product.contenance} ml
          </p>
          {product.description && (
            <p className="text-muted-foreground mb-8 leading-relaxed max-w-md">{product.description}</p>
          )}
          <p className="font-display text-3xl mb-10">{formatPrice(Number(product.price))}</p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={async () => { await add(product); toast.success("Ajouté au panier"); }}
              disabled={product.stock <= 0}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 text-xs uppercase tracking-[0.2em] hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <ShoppingBag className="h-4 w-4" /> Ajouter au panier
            </button>
            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-whatsapp text-white px-7 py-3.5 text-xs uppercase tracking-[0.2em] hover:opacity-90 transition"
            >
              <MessageCircle className="h-4 w-4" /> Commander via WhatsApp
            </a>
            <button
              onClick={() => toggle(product.id)}
              className={`inline-flex items-center gap-2 border border-border px-5 py-3.5 text-xs uppercase tracking-[0.2em] transition ${fav ? "text-destructive" : ""}`}
            >
              <Heart className={`h-4 w-4 ${fav ? "fill-current" : ""}`} />
              {fav ? "Favori" : "Ajouter aux favoris"}
            </button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
