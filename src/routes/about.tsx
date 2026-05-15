import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "À propos — Your Fragrance Shop" },
      { name: "description", content: "Your Fragrance Shop : parfums accessibles et de qualité, pour tous les budgets." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <Layout>
      <section className="container-edit py-20 max-w-3xl">
        <p className="text-[11px] uppercase tracking-[0.3em] text-gold mb-4 text-center">Notre histoire</p>
        <h1 className="font-display text-5xl md:text-6xl text-center mb-12">À propos de Your Fragrance Shop</h1>

        <div className="space-y-6 text-muted-foreground leading-relaxed text-lg">
          <p>
            Your Fragrance Shop est une boutique spécialisée dans la vente de parfums accessibles et de qualité.
            Nous proposons une sélection variée de fragrances adaptées à tous les goûts et à tous les budgets.
          </p>
        </div>

        <div className="mt-16 grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="font-display text-3xl mb-4">Notre mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              Permettre à chacun de trouver son parfum idéal sans compromis sur le prix ou la qualité.
            </p>
          </div>
          <div>
            <h2 className="font-display text-3xl mb-4">Nos valeurs</h2>
            <ul className="space-y-2 text-muted-foreground">
              {["Accessibilité", "Diversité", "Simplicité", "Qualité"].map((v) => (
                <li key={v} className="flex items-center gap-3">
                  <span className="h-px w-6 bg-gold" /> {v}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </Layout>
  );
}
