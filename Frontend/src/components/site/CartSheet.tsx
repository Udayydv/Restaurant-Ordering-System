import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { restaurant } from "@/data/restaurant";
import { useCart } from "@/lib/cart";

export function CartSheet() {
  const { isOpen, setOpen, lines, setQty, remove, subtotal, count } = useCart();
  const total = subtotal + (lines.length ? restaurant.deliveryFee : 0);

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle className="font-display text-lg">Your Cart ({count})</SheetTitle>
        </SheetHeader>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            <p className="font-display text-lg font-bold">Your cart is empty</p>
            <p className="text-sm text-muted-foreground">
              Add something delicious — ghar jaisa swad is one tap away.
            </p>
            <Button asChild className="rounded-full" onClick={() => setOpen(false)}>
              <Link to="/menu">Browse Menu</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {lines.map((l) => (
                <div key={l.key} className="flex gap-3 rounded-2xl border bg-card p-3">
                  <img
                    src={l.image}
                    alt={l.name}
                    className="h-16 w-16 shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{l.name}</p>
                    <p className="text-xs text-muted-foreground">{l.variant}</p>
                    <p className="mt-1 font-display font-bold">₹{l.price * l.qty}</p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button
                      type="button"
                      aria-label={`Remove ${l.name}`}
                      onClick={() => remove(l.key)}
                      className="text-muted-foreground transition-colors hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="flex items-center gap-1 rounded-full border">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => setQty(l.key, l.qty - 1)}
                        className="grid h-7 w-7 place-items-center rounded-full hover:bg-accent"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="min-w-5 text-center text-sm font-bold">{l.qty}</span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => setQty(l.key, l.qty + 1)}
                        className="grid h-7 w-7 place-items-center rounded-full hover:bg-accent"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 border-t bg-card p-5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Item total</span>
                <span className="font-semibold">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery</span>
                <span className="font-semibold text-leaf">₹{restaurant.deliveryFee}</span>
              </div>
              <div className="flex justify-between font-display text-lg font-extrabold">
                <span>To pay</span>
                <span>₹{total}</span>
              </div>
              <Button
                asChild
                size="lg"
                className="w-full rounded-full text-base font-bold"
                onClick={() => setOpen(false)}
              >
                <Link to="/checkout">Proceed to Checkout</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
