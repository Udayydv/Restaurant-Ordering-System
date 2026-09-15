import { Minus, Phone, Plus, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { restaurant, telHref } from "@/data/restaurant";
import { thaliContents, type MenuItem } from "@/data/menu";
import { useCart, getPriceTypeForVariant } from "@/lib/cart";
import { cn } from "@/lib/utils";
import { sipImageSrcSet } from "@/lib/sip-images";

export function VegMark({ className }: { className?: string }) {
  return (
    <span
      title="Pure vegetarian"
      className={cn(
        "grid h-4 w-4 shrink-0 place-items-center rounded-[3px] border-2 border-leaf bg-card",
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-leaf" />
    </span>
  );
}

export function FoodCard({ item }: { item: MenuItem }) {
  const { add, lines, setQty } = useCart();
  const [variantIndex, setVariantIndex] = useState(0);
  const variant = item.variants[variantIndex] ?? item.variants[0]!;
  const priceOnCall = variant.price === null;
  const cartProductId = item.backendId || item.id;
  const lineKey = `${cartProductId}__${variant.label}`;
  const line = lines.find((l) => l.key === lineKey);
  const contents = thaliContents[item.id];
  const isSip = item.section === "sip-n-scoop";

  const addToCart = () => {
    if (priceOnCall) return;

    const incomingSection = item.section || "restaurant";
    const hasDifferentSection = lines.some(
      (cartLine) => (cartLine.section || "restaurant") !== incomingSection,
    );

    if (hasDifferentSection) {
      toast.error("Please checkout these items separately", {
        description:
          incomingSection === "sip-n-scoop"
            ? "Sip n Scoop uses a separate 3 km quick-delivery service."
            : "Finish or clear your Sip n Scoop cart before adding restaurant food.",
      });
      return;
    }

    add({
      itemId: cartProductId,
      productSlug: item.id,
      name: item.name,
      image: item.image,
      variant: variant.label,
      price: variant.price!,
      priceType: getPriceTypeForVariant(variant.label),
      section: item.section || "restaurant",
    });
    toast.success(`${item.name} added`, { description: `${variant.label} • ₹${variant.price}` });
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
      <Dialog>
        <DialogTrigger asChild>
          <button type="button" className={cn("relative block w-full shrink-0 overflow-hidden", isSip ? "aspect-square bg-[#fffdf0]" : "aspect-4/3")}>
            <img
              src={item.image}
              alt={`${item.name} — ${item.description}`}
              loading="lazy"
              decoding="async"
              width={isSip ? 960 : undefined}
              height={isSip ? 960 : undefined}
              srcSet={isSip ? sipImageSrcSet(item.image) : undefined}
              sizes={isSip ? "(min-width: 1280px) 300px, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw" : undefined}
              className={cn("h-full w-full", isSip ? "object-contain object-center p-3 pb-10 sm:p-4 sm:pb-10" : "object-cover transition-transform duration-500 group-hover:scale-105")}
            />
            {!isSip && <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-ink/55 to-transparent" />}
            {item.section === "sip-n-scoop" && (
              <span className="absolute bottom-2 left-2 rounded-full bg-violet-950/90 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-white backdrop-blur sm:bottom-3 sm:left-3 sm:text-[10px]">
                ⚡ Quick delivery
              </span>
            )}
            {item.tags?.includes("bestseller") && (
              <span className={cn("absolute rounded-full bg-tomato py-1 font-bold uppercase tracking-wide text-primary-foreground", isSip ? "left-2 top-2 px-1.5 text-[8px] sm:left-3 sm:top-3 sm:px-2.5 sm:text-[10px]" : "left-3 top-3 px-2.5 text-[10px]")}>
                Bestseller
              </span>
            )}
            <span className={cn("absolute inline-flex items-center gap-1 rounded-full bg-card/95 px-2 py-1 font-bold", isSip ? "top-2 right-2 text-[10px] sm:top-3 sm:right-3 sm:text-[11px]" : "bottom-3 right-3 text-[11px]")}>
              <Star className="h-3 w-3 fill-saffron text-saffron" />
              {item.rating.toFixed(1)}
            </span>
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-md overflow-hidden p-0">
          <img
            src={item.image}
            alt={item.name}
            decoding="async"
            srcSet={isSip ? sipImageSrcSet(item.image) : undefined}
            sizes={isSip ? "(min-width: 640px) 448px, calc(100vw - 32px)" : undefined}
            className={isSip ? "h-64 w-full bg-[#fffdf0] object-contain object-center p-6 sm:h-80" : "h-52 w-full object-cover sm:h-60"}
          />
          <div className="p-5">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 font-display text-xl">
                <VegMark />
                {item.name}
              </DialogTitle>
              <DialogDescription>{item.description}</DialogDescription>
            </DialogHeader>
            <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Ingredients
            </p>
            <p className="mt-1 text-sm">{item.ingredients}</p>
            {contents && (
              <>
                <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  What's included
                </p>
                <ul className="mt-1 grid gap-1 text-sm">
                  {contents.map((c) => (
                    <li key={c}>• {c}</li>
                  ))}
                </ul>
              </>
            )}
            <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Portions
            </p>
            <ul className="mt-1 space-y-1 text-sm">
              {item.variants.map((vr) => (
                <li key={vr.label} className="flex justify-between">
                  <span>{vr.label}</span>
                  <span className="font-semibold">
                    {vr.price === null ? "Call for price" : `₹${vr.price}`}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </DialogContent>
      </Dialog>

      <div className={cn("flex flex-1 flex-col gap-3", isSip ? "p-3 sm:p-4" : "p-4")}>
        <div className="min-w-0">
          <h3 className={cn("flex items-start gap-2 font-display font-bold leading-snug", isSip ? "text-sm sm:text-base" : "text-base")}>
            <VegMark className="mt-1" />
            <span className="min-w-0">{item.name}</span>
          </h3>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
        </div>

        {item.variants.length > 1 && (
          <div className="flex flex-wrap gap-1.5">
            {item.variants.map((vr, i) => (
              <button
                key={vr.label}
                type="button"
                onClick={() => setVariantIndex(i)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors",
                  i === variantIndex
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-secondary text-secondary-foreground hover:border-primary/50",
                )}
              >
                {vr.label}
              </button>
            ))}
          </div>
        )}

        <div className={cn("mt-auto flex items-center justify-between gap-2", isSip && "flex-wrap")}>
          <span className="font-display text-lg font-extrabold">
            {priceOnCall ? (
              <span className="text-sm font-semibold text-muted-foreground">Call for price</span>
            ) : (
              `₹${variant.price}`
            )}
          </span>

          {priceOnCall ? (
            <Button asChild size="sm" variant="secondary" className="rounded-full">
              <a href={telHref(restaurant.phones[0])}>
                <Phone className="mr-1.5 h-3.5 w-3.5" /> Call
              </a>
            </Button>
          ) : line ? (
            <div className="flex items-center gap-1 rounded-full bg-primary p-1 text-primary-foreground">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQty(lineKey, line.qty - 1)}
                className="grid h-7 w-7 place-items-center rounded-full transition-colors hover:bg-primary-foreground/20"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="min-w-5 text-center text-sm font-bold">{line.qty}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQty(lineKey, line.qty + 1)}
                className="grid h-7 w-7 place-items-center rounded-full transition-colors hover:bg-primary-foreground/20"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <Button size="sm" className="rounded-full px-4 font-bold" onClick={addToCart}>
              ADD
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
