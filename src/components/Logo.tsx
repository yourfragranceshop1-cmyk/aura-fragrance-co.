import logo from "@/assets/logo.png";
import { Link } from "@tanstack/react-router";

export function Logo({ variant = "full" }: { variant?: "full" | "mark" }) {
  if (variant === "mark") {
    return <img src={logo} alt="Your Fragrance Shop" className="h-10 w-10 object-contain" />;
  }
  return (
    <Link to="/" className="flex items-center gap-3">
      <img src={logo} alt="Your Fragrance Shop logo" className="h-10 w-10 object-contain" />
      <span className="font-display text-lg tracking-[0.2em] uppercase">Fragrance Shop</span>
    </Link>
  );
}
