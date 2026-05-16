import type { ReactNode } from "react";
import { Header, Breadcrumbs } from "./Header";
import { Footer } from "./Footer";
import { WhatsappFab } from "./WhatsappFab";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <Breadcrumbs />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsappFab />
    </div>
  );
}
