import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

interface FavoritesContextValue {
  ids: Set<string>;
  toggle: (productId: string) => Promise<void>;
  isFavorite: (productId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);
const STORAGE_KEY = "yfs_favs_v1";

function readLocal(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"); } catch { return []; }
}
function writeLocal(ids: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [ids, setIds] = useState<Set<string>>(new Set());

  const reload = async () => {
    if (user) {
      const { data } = await supabase.from("favorites").select("product_id").eq("user_id", user.id);
      setIds(new Set((data ?? []).map((d) => d.product_id)));
    } else {
      setIds(new Set(readLocal()));
    }
  };

  useEffect(() => {
    (async () => {
      if (user) {
        const local = readLocal();
        for (const pid of local) {
          await supabase.from("favorites").insert({ user_id: user.id, product_id: pid }).then(() => {}, () => {});
        }
        writeLocal([]);
      }
      await reload();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const toggle = async (productId: string) => {
    const has = ids.has(productId);
    const next = new Set(ids);
    if (has) next.delete(productId); else next.add(productId);
    setIds(next);
    if (user) {
      if (has) await supabase.from("favorites").delete().eq("user_id", user.id).eq("product_id", productId);
      else await supabase.from("favorites").insert({ user_id: user.id, product_id: productId });
    } else {
      writeLocal(Array.from(next));
    }
  };

  return (
    <FavoritesContext.Provider value={{ ids, toggle, isFavorite: (id) => ids.has(id) }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
