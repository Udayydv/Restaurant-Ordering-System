import { Link } from "@tanstack/react-router";
import { LayoutDashboard, Menu, Phone, Search, ShoppingBag, User } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { restaurant, telHref } from "@/data/restaurant";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu" },
  { to: "/offers", label: "Offers" },
  { to: "/catering", label: "Catering" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Navbar() {
  const { count, setOpen } = useCart();
  const { user, setLoginOpen } = useAuth();
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="bg-ink text-cream">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-1.5 text-center text-[11px] font-medium tracking-wide sm:text-xs">
          <span className="truncate">{restaurant.promo}</span>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
        <Link to="/" className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground shadow-soft">
            T
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate font-display text-base font-extrabold tracking-tight sm:text-lg">
              {restaurant.logoTop}
            </span>
            <span className="block truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:text-[11px]">
              {restaurant.logoBottom}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center justify-center gap-1 lg:flex">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              activeProps={{ className: "bg-accent text-accent-foreground" }}
              className="rounded-full px-3.5 py-2 text-sm font-semibold text-foreground/75 transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-1.5">
          <Button asChild variant="ghost" size="icon" className="hidden sm:inline-flex">
            <Link to="/menu" aria-label="Search menu">
              <Search className="h-5 w-5" />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="icon" className="hidden sm:inline-flex">
            <a href={telHref(restaurant.phones[0])} aria-label="Call restaurant">
              <Phone className="h-5 w-5" />
            </a>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Account"
            onClick={() => (user ? undefined : setLoginOpen(true))}
            asChild={!!user}
          >
            {user ? (
              <Link to="/account" aria-label="Account">
                <User className="h-5 w-5" />
              </Link>
            ) : (
              <User className="h-5 w-5" />
            )}
          </Button>
          {user?.role === "admin" && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Admin dashboard"
              asChild
            >
              <Link to="/admin" aria-label="Admin dashboard">
                <LayoutDashboard className="h-5 w-5" />
              </Link>
            </Button>
          )}
          <Button
            variant="default"
            className="relative rounded-full px-3.5"
            onClick={() => setOpen(true)}
            aria-label={`Cart with ${count} items`}
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="ml-1.5 hidden text-sm font-semibold sm:inline">Cart</span>
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-tomato px-1 text-[11px] font-bold text-primary-foreground">
                {count}
              </span>
            )}
          </Button>

          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[86vw] max-w-sm p-0">
              <div className="flex h-full flex-col">
                <div className="border-b px-5 py-5">
                  <p className="font-display text-lg font-extrabold">{restaurant.brandName}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{restaurant.tagline}</p>
                </div>
                <nav className="flex flex-1 flex-col gap-1 p-3">
                  {navLinks.map((l) => (
                    <Link
                      key={l.to}
                      to={l.to}
                      onClick={() => setSheetOpen(false)}
                      activeOptions={{ exact: l.to === "/" }}
                      activeProps={{ className: "bg-accent text-accent-foreground" }}
                      className="rounded-xl px-4 py-3 text-base font-semibold transition-colors hover:bg-accent"
                    >
                      {l.label}
                    </Link>
                  ))}
                  <Link
                    to="/account"
                    onClick={() => setSheetOpen(false)}
                    className="rounded-xl px-4 py-3 text-base font-semibold transition-colors hover:bg-accent"
                  >
                    My Account
                  </Link>
                </nav>
                <div className="space-y-2 border-t p-4">
                  {restaurant.phones.map((p) => (
                    <Button key={p} asChild variant="secondary" className="w-full rounded-xl">
                      <a href={telHref(p)}>
                        <Phone className="mr-2 h-4 w-4" /> {p}
                      </a>
                    </Button>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
