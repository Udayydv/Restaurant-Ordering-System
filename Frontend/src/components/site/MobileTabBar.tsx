import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Phone, ShoppingBag, UtensilsCrossed, PartyPopper } from "lucide-react";

import { useCart } from "@/lib/cart";
import { restaurant, telHref } from "@/data/restaurant";
import { cn } from "@/lib/utils";

export function MobileTabBar() {
  const { count, setOpen } = useCart();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const item = (active: boolean) =>
    cn(
      "flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-semibold transition-colors",
      active ? "text-primary" : "text-muted-foreground",
    );

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex max-w-md items-stretch">
        <Link to="/" className={item(pathname === "/")}>
          <Home className="h-5 w-5" />
          Home
        </Link>
        <Link to="/menu" className={item(pathname.startsWith("/menu"))}>
          <UtensilsCrossed className="h-5 w-5" />
          Menu
        </Link>
        <button type="button" onClick={() => setOpen(true)} className={item(false)}>
          <span className="relative">
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-tomato px-1 text-[9px] font-bold text-primary-foreground">
                {count}
              </span>
            )}
          </span>
          Cart
        </button>
        <Link to="/catering" className={item(pathname.startsWith("/catering"))}>
          <PartyPopper className="h-5 w-5" />
          Catering
        </Link>
        <a href={telHref(restaurant.phones[0])} className={item(false)}>
          <Phone className="h-5 w-5" />
          Call
        </a>
      </div>
    </nav>
  );
}
