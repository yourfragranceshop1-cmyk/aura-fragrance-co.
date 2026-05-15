import logo from "@/assets/logo.png";
import { Link } from "@tanstack/react-router";

export function Logo({ variant = "full" }: { variant?: "full" | "mark" }) {
  if (variant === "mark") {
    return (
      <span className="block h-10 w-10 rounded-full bg-secondary ring-1 ring-border overflow-hidden">
        <img src={logo} alt="Your Fragrance Shop" className="h-full w-full object-cover" />
      </span>
    );
  }
  return (
    <Link to="/" className="flex items-center gap-3">
      <span className="block h-10 w-10 rounded-full bg-secondary ring-1 ring-border overflow-hidden">
        <img src={logo} alt="Your Fragrance Shop logo" className="h-full w-full object-cover" />
      </span>
      <span className="font-display text-lg tracking-[0.2em] uppercase">Your Fragrance Shop</span>
    </Link>
  );
}
