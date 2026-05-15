import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Instagram } from "lucide-react";
import { Layout } from "@/components/Layout";
import { INSTAGRAM_URL, TIKTOK_URL, WHATSAPP_URL } from "@/lib/whatsapp";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Your Fragrance Shop" },
      { name: "description", content: "Contactez Your Fragrance Shop directement sur WhatsApp." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <Layout>
      <section className="container-edit py-24 text-center max-w-xl">
        <p className="text-[11px] uppercase tracking-[0.3em] text-gold mb-4">Contact</p>
        <h1 className="font-display text-5xl md:text-6xl mb-6">Restons en contact</h1>
        <p className="text-muted-foreground mb-12">Contactez-nous directement sur WhatsApp pour toute question, conseil ou commande.</p>

        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-3 bg-whatsapp text-white px-8 py-4 text-xs uppercase tracking-[0.2em] hover:opacity-90"
        >
          <MessageCircle className="h-5 w-5" /> Discuter sur WhatsApp
        </a>

        <div className="mt-16 flex justify-center gap-6 text-muted-foreground">
          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-foreground">
            <Instagram className="h-4 w-4" /> Instagram
          </a>
          <a href={TIKTOK_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-foreground">
            TikTok
          </a>
        </div>
      </section>
    </Layout>
  );
}
