import { stockBadge } from "@/lib/types";

export function StockBadge({ stock }: { stock: number }) {
  const { label, tone } = stockBadge(stock);
  const cls =
    tone === "success" ? "bg-success/15 text-success border-success/30" :
    tone === "warning" ? "bg-warning/20 text-warning border-warning/40" :
    tone === "destructive" ? "bg-destructive/15 text-destructive border-destructive/30" :
    "bg-muted text-muted-foreground border-border";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] font-medium backdrop-blur ${cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
