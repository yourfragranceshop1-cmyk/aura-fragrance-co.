export const WHATSAPP_NUMBER = "22942238684";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;
export const INSTAGRAM_URL = "https://www.instagram.com/yourfragranceshop1";
export const TIKTOK_URL = "https://www.tiktok.com/@your.fragrance.sh";

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(value) + " FCFA";
}

export type WaItem = { name: string; quantity: number; price: number; contenance?: number };

export function buildWhatsappMessage(items: WaItem[], location?: string | null): string {
  const lines: string[] = ["Bonjour, je souhaite commander :", ""];
  let total = 0;
  for (const item of items) {
    const sub = item.price * item.quantity;
    total += sub;
    const detail = item.contenance ? ` (${item.contenance}ml)` : "";
    lines.push(`• ${item.name}${detail} x${item.quantity} — ${formatPrice(sub)}`);
  }
  lines.push("", `Total : ${formatPrice(total)}`);
  if (location) lines.push("", `📍 Localisation : ${location}`);
  return lines.join("\n");
}

export function whatsappLink(items: WaItem[], location?: string | null): string {
  return `${WHATSAPP_URL}?text=${encodeURIComponent(buildWhatsappMessage(items, location))}`;
}

export async function getCurrentLocationLink(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Géolocalisation non supportée"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(`https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  });
}
