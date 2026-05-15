import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import type { Product } from "@/lib/types";

interface CartLine { product: Product; quantity: number }
interface CartContextValue {
  items: CartLine[];
  count: number;
  total: number;
  add: (p: Product, qty?: number) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  setQuantity: (productId: string, qty: number) => Promise<void>;
  clear: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = "yfs_cart_v1";

type LocalLine = { product_id: string; quantity: number };

function readLocal(): LocalLine[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"); } catch { return []; }
}
function writeLocal(lines: LocalLine[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartLine[]>([]);

  const reload = async () => {
    const localLines = readLocal();
    let dbLines: LocalLine[] = [];
    if (user) {
      const { data } = await supabase.from("cart_items").select("product_id,quantity").eq("user_id", user.id);
      dbLines = (data ?? []).map((d) => ({ product_id: d.product_id, quantity: d.quantity }));
    }
    const merged = new Map<string, number>();
    for (const l of dbLines) merged.set(l.product_id, l.quantity);
    for (const l of localLines) merged.set(l.product_id, (merged.get(l.product_id) ?? 0) + l.quantity);
    const ids = Array.from(merged.keys());
    if (ids.length === 0) { setItems([]); return; }
    const { data: products } = await supabase.from("products").select("*").in("id", ids);
    const lines: CartLine[] = (products ?? []).map((p) => ({
      product: p as Product,
      quantity: merged.get(p.id) ?? 1,
    }));
    setItems(lines);
  };

  // On login: push local to DB, then clear local
  useEffect(() => {
    (async () => {
      if (user) {
        const local = readLocal();
        if (local.length > 0) {
          for (const l of local) {
            const { data: existing } = await supabase
              .from("cart_items").select("id,quantity").eq("user_id", user.id).eq("product_id", l.product_id).maybeSingle();
            if (existing) {
              await supabase.from("cart_items").update({ quantity: existing.quantity + l.quantity }).eq("id", existing.id);
            } else {
              await supabase.from("cart_items").insert({ user_id: user.id, product_id: l.product_id, quantity: l.quantity });
            }
          }
          writeLocal([]);
        }
      }
      await reload();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const persist = async (productId: string, qty: number) => {
    if (user) {
      if (qty <= 0) {
        await supabase.from("cart_items").delete().eq("user_id", user.id).eq("product_id", productId);
      } else {
        const { data: existing } = await supabase
          .from("cart_items").select("id").eq("user_id", user.id).eq("product_id", productId).maybeSingle();
        if (existing) await supabase.from("cart_items").update({ quantity: qty }).eq("id", existing.id);
        else await supabase.from("cart_items").insert({ user_id: user.id, product_id: productId, quantity: qty });
      }
    } else {
      const local = readLocal().filter((l) => l.product_id !== productId);
      if (qty > 0) local.push({ product_id: productId, quantity: qty });
      writeLocal(local);
    }
  };

  const add = async (p: Product, qty = 1) => {
    const existing = items.find((i) => i.product.id === p.id);
    const nextQty = (existing?.quantity ?? 0) + qty;
    await persist(p.id, nextQty);
    await reload();
  };
  const remove = async (productId: string) => { await persist(productId, 0); await reload(); };
  const setQuantity = async (productId: string, qty: number) => { await persist(productId, qty); await reload(); };
  const clear = async () => {
    if (user) await supabase.from("cart_items").delete().eq("user_id", user.id);
    writeLocal([]);
    setItems([]);
  };

  const count = items.reduce((s, l) => s + l.quantity, 0);
  const total = items.reduce((s, l) => s + l.quantity * Number(l.product.price), 0);

  return (
    <CartContext.Provider value={{ items, count, total, add, remove, setQuantity, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
