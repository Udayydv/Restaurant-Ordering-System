import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LocateFixed, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";

import { restaurant } from "@/data/restaurant";
import { getAuthToken, useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";

import { API_URL } from "@/lib/api-config";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      {
        title: "Checkout — Tripathi Veg Restaurant",
      },
      {
        name: "description",
        content:
          "Confirm your pure veg order, choose delivery or pickup, and pay by cash or UPI.",
      },
      {
        property: "og:title",
        content: "Checkout — Tripathi Veg Restaurant",
      },
      {
        property: "og:description",
        content: "Fast checkout with flat ₹5 delivery.",
      },
    ],
  }),

  component: CheckoutPage,
});

function CheckoutPage() {
  const {
    lines,
    subtotal,
    clear,
  } = useCart();

  const {
    user,
    setLoginOpen,
    updateProfile,
  } = useAuth();

  const navigate = useNavigate();

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [address, setAddress] = useState(user?.address ?? "");

  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("Varanasi");
  const [state, setState] = useState("Uttar Pradesh");
  const [pincode, setPincode] = useState("");

  const [notes, setNotes] = useState("");

  const [mode, setMode] =
    useState<"delivery" | "pickup">("delivery");

  // Payment method always follows the order mode — dining/pickup is
  // paid at the restaurant with no delivery fee, home delivery is
  // paid via UPI on delivery with the distance-based fee. This is
  // derived, not a separate choice the customer makes.
  const paymentLabel =
    mode === "pickup"
      ? "Pay at Restaurant"
      : "UPI on Delivery";

  const [placingOrder, setPlacingOrder] =
    useState(false);

  /*
   * ------------------------------------------------
   * LOCATION + DISTANCE-BASED DELIVERY FEE
   * ------------------------------------------------
   * Coordinates are only ever captured when the customer explicitly
   * taps "Use my current location" — never silently in the
   * background — and are used only to (a) autofill the address via
   * reverse geocoding and (b) compute the distance-based delivery
   * fee. They're sent to our own backend, never to a third party
   * beyond the public OpenStreetMap geocoder used for the address
   * lookup itself.
   */
  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [locating, setLocating] = useState(false);

  const [deliveryQuote, setDeliveryQuote] = useState<{
    fee: number | null;
    distanceKm: number | null;
    deliverable: boolean;
  } | null>(null);

  const [quoteLoading, setQuoteLoading] = useState(false);

  /*
   * Fetch a live delivery-fee quote whenever we have coordinates.
   * Slabs (server-authoritative): 0–3km ₹5, 3–7km ₹15, 7–10km ₹30,
   * beyond 10km not deliverable.
   */
  useEffect(() => {
    if (!coords || mode !== "delivery") {
      setDeliveryQuote(null);
      return;
    }

    let cancelled = false;

    const fetchQuote = async () => {
      try {
        setQuoteLoading(true);

        const token = getAuthToken();

        if (!token) {
          return;
        }

        const response = await fetch(
          `${API_URL}/addresses/delivery-quote?latitude=${coords.latitude}&longitude=${coords.longitude}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const data = await response.json();

        if (cancelled) return;

        if (response.ok && data.success) {
          setDeliveryQuote({
            fee: data.deliverable ? data.deliveryFee : null,
            distanceKm: data.distanceKm,
            deliverable: data.deliverable,
          });

          if (!data.deliverable) {
            toast.error(
              data.message ||
                "Sorry, this location is outside our delivery range",
            );
          }
        }
      } catch (error) {
        console.error("Delivery quote error:", error);
      } finally {
        if (!cancelled) setQuoteLoading(false);
      }
    };

    fetchQuote();

    return () => {
      cancelled = true;
    };
  }, [coords, mode]);

  /*
   * "Use my current location": browser geolocation -> reverse
   * geocode (OpenStreetMap Nominatim, no API key needed) -> autofill
   * the address fields. The customer can still edit anything
   * afterwards; nothing is saved until they place the order.
   */
  const useCurrentLocation = () => {
    if (!("geolocation" in navigator)) {
      toast.error("Location isn't supported on this device/browser");
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        setCoords({ latitude, longitude });

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            {
              headers: {
                Accept: "application/json",
              },
            },
          );

          const data = await response.json();
          const addr = data?.address || {};

          const line = [
            addr.house_number,
            addr.road || addr.pedestrian || addr.neighbourhood,
            addr.suburb,
          ]
            .filter(Boolean)
            .join(", ");

          if (line) setAddress(line);

          const resolvedCity =
            addr.city || addr.town || addr.village || addr.county;

          if (resolvedCity) setCity(resolvedCity);
          if (addr.state) setState(addr.state);
          if (addr.postcode) setPincode(addr.postcode.replace(/\D/g, ""));

          toast.success("Location detected — please review your address");
        } catch (error) {
          console.error("Reverse geocoding error:", error);
          toast.error(
            "Got your location, but couldn't auto-fill the address. Please fill it in manually.",
          );
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocating(false);

        toast.error(
          error.code === error.PERMISSION_DENIED
            ? "Location permission denied. You can still enter your address manually."
            : "Unable to detect your location. Please enter your address manually.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  /*
   * Delivery fee: use the live distance-based quote when we have
   * coordinates; otherwise fall back to the restaurant's base fee
   * (matches the backend's fallback for addresses without location).
   */
  const deliveryFee =
    mode === "delivery"
      ? (deliveryQuote?.fee ?? restaurant.deliveryFee)
      : 0;

  const total = subtotal + deliveryFee;

  /*
   * If cart is empty
   */
  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-extrabold">
          Your cart is empty
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Add a few dishes and come back to complete your order.
        </p>

        <Button
          asChild
          className="mt-6 rounded-full px-7 font-bold"
        >
          <Link to="/menu">
            Browse Menu
          </Link>
        </Button>
      </div>
    );
  }

  /*
   * PLACE ORDER
   */
  const placeOrder = async () => {
    /*
     * User must be logged in
     */
    if (!user) {
      toast.error(
        "Please login before placing an order"
      );

      setLoginOpen(true);
      return;
    }

    /*
     * Validate name
     */
    if (!name.trim()) {
      toast.error(
        "Please enter your name"
      );
      return;
    }

    /*
     * Validate phone
     */
    if (!/^\d{10}$/.test(phone)) {
      toast.error(
        "Enter a valid 10-digit mobile number"
      );
      return;
    }

    /*
     * Delivery validation
     */
    if (
      mode === "delivery" &&
      address.trim().length < 10
    ) {
      toast.error(
        "Please enter a complete delivery address"
      );
      return;
    }

    /*
     * Pincode validation
     */
    if (
      mode === "delivery" &&
      !/^\d{6}$/.test(pincode)
    ) {
      toast.error(
        "Enter a valid 6-digit pincode"
      );
      return;
    }

    /*
     * Block placing the order if we detected the location is outside
     * our delivery range.
     */
    if (
      mode === "delivery" &&
      deliveryQuote &&
      deliveryQuote.deliverable === false
    ) {
      toast.error(
        "This address is outside our 10 km delivery range. Please choose a closer address or self pickup.",
      );
      return;
    }

    /*
     * Get JWT
     */
    const token = getAuthToken();

    if (!token) {
      toast.error(
        "Your login session has expired. Please login again."
      );

      setLoginOpen(true);
      return;
    }

    try {
      setPlacingOrder(true);

      /*
       * ------------------------------------------------
       * STEP 1
       * Sync frontend cart with backend cart
       * ------------------------------------------------
       */

      for (const item of lines) {
        let priceType:
          | "regular"
          | "half"
          | "full" = "regular";

        const variant = item.variant.toLowerCase();

        if (variant.includes("half")) {
          priceType = "half";
        } else if (variant.includes("full")) {
          priceType = "full";
        }

        const cartResponse = await fetch(
          `${API_URL}/cart/items`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              productId: item.itemId,
              quantity: item.qty,
              priceType,
            }),
          }
        );

        const cartData = await cartResponse.json();

        if (
          !cartResponse.ok ||
          !cartData.success
        ) {
          throw new Error(
            cartData.message ||
              `Unable to sync ${item.name} with cart`
          );
        }
      }

      /*
       * ------------------------------------------------
       * STEP 2
       * Create delivery address (delivery orders only —
       * pickup orders don't need one)
       * ------------------------------------------------
       */

      let addressId: string | undefined;

      if (mode === "delivery") {
        const addressResponse = await fetch(
          `${API_URL}/addresses`,
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },

            body: JSON.stringify({
              name: name.trim(),
              phone,
              addressLine: address.trim(),
              landmark: landmark.trim(),
              city: city.trim(),
              state: state.trim(),
              pincode: pincode.trim(),
              latitude: coords?.latitude,
              longitude: coords?.longitude,
              isDefault: true,
            }),
          }
        );

        const addressData =
          await addressResponse.json();

        if (
          !addressResponse.ok ||
          !addressData.success ||
          !addressData.address
        ) {
          throw new Error(
            addressData.message ||
              "Unable to save delivery address"
          );
        }

        addressId = addressData.address._id;
      }

      /*
       * ------------------------------------------------
       * STEP 3
       * Create order
       * ------------------------------------------------
       */

      const orderResponse = await fetch(
        `${API_URL}/orders`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            orderMode: mode,
            addressId,
            notes: notes.trim(),
          }),
        }
      );

      const orderData =
        await orderResponse.json();

      if (
        !orderResponse.ok ||
        !orderData.success ||
        !orderData.order
      ) {
        throw new Error(
          orderData.message ||
            "Unable to place order"
        );
      }

      /*
       * ------------------------------------------------
       * STEP 4
       * Update local profile
       * ------------------------------------------------
       */

      updateProfile({
        name,
        address,
      });

      /*
       * ------------------------------------------------
       * STEP 5
       * Clear frontend cart
       * ------------------------------------------------
       */

      clear();

      /*
       * ------------------------------------------------
       * STEP 6
       * Navigate to confirmation page
       * ------------------------------------------------
       */

      navigate({
        to: "/order-confirmed",
        search: {
          id:
            orderData.order.orderNumber ??
            orderData.order._id,
        },
      });

      toast.success(
        "Order placed successfully!"
      );
    } catch (error) {
      console.error(
        "Place order error:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to place order"
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">

      <h1 className="font-display text-3xl font-black sm:text-4xl">
        Checkout
      </h1>

      {!user && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-3xl border bg-cream p-5">

          <p className="text-sm font-semibold">
            Login with your mobile number before placing your order.
          </p>

          <Button
            className="rounded-full font-bold"
            onClick={() => setLoginOpen(true)}
          >
            Login
          </Button>

        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">

        <div className="space-y-6">

          {/* YOUR DETAILS */}

          <section className="rounded-3xl border bg-card p-6 shadow-soft">

            <h2 className="font-display text-lg font-extrabold">
              Your details
            </h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">

              <div className="space-y-2">

                <Label htmlFor="co-name">
                  Full name
                </Label>

                <Input
                  id="co-name"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                />

              </div>

              <div className="space-y-2">

                <Label htmlFor="co-phone">
                  Mobile number
                </Label>

                <Input
                  id="co-phone"
                  inputMode="numeric"
                  maxLength={10}
                  value={phone}
                  onChange={(e) =>
                    setPhone(
                      e.target.value.replace(
                        /\D/g,
                        ""
                      )
                    )
                  }
                />

              </div>

            </div>

          </section>

          {/* DELIVERY */}

          <section className="rounded-3xl border bg-card p-6 shadow-soft">

            <h2 className="font-display text-lg font-extrabold">
              Delivery
            </h2>

            <RadioGroup
              value={mode}
              onValueChange={(v) =>
                setMode(
                  v as typeof mode
                )
              }
              className="mt-4 grid gap-3 sm:grid-cols-2"
            >

              {[
                {
                  v: "delivery",
                  label: "Home Delivery",
                  sub:
                    mode === "delivery" && deliveryQuote?.fee != null
                      ? `Pay ₹${deliveryQuote.fee} via UPI (${deliveryQuote.distanceKm} km away)`
                      : `UPI on delivery, from ₹${restaurant.deliveryFee}`,
                },
                {
                  v: "pickup",
                  label: "Self Pickup",
                  sub: "Pay at restaurant — no delivery fee",
                },
              ].map((o) => (

                <Label
                  key={o.v}
                  htmlFor={`mode-${o.v}`}
                  className="flex cursor-pointer items-center gap-3 rounded-2xl border p-4 has-[button[data-state=checked]]:border-primary has-[button[data-state=checked]]:bg-accent"
                >

                  <RadioGroupItem
                    id={`mode-${o.v}`}
                    value={o.v}
                  />

                  <span>

                    <span className="block font-bold">
                      {o.label}
                    </span>

                    <span className="block text-xs text-muted-foreground">
                      {o.sub}
                    </span>

                  </span>

                </Label>

              ))}

            </RadioGroup>

            {mode === "delivery" && (

              <div className="mt-4 space-y-4">

                <div className="flex items-center justify-between gap-3 rounded-2xl border border-dashed bg-cream/60 p-3">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Auto-fill your address & get an instant delivery fee
                  </p>

                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="shrink-0 gap-1.5 rounded-full font-bold"
                    onClick={useCurrentLocation}
                    disabled={locating}
                  >
                    {locating ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <LocateFixed className="h-3.5 w-3.5" />
                    )}
                    {locating ? "Locating..." : "Use current location"}
                  </Button>
                </div>

                {coords && (
                  <p className="text-xs font-semibold">
                    {quoteLoading ? (
                      <span className="text-muted-foreground">
                        Calculating delivery fee...
                      </span>
                    ) : deliveryQuote?.deliverable === false ? (
                      <span className="text-destructive">
                        Outside our 10 km delivery range — try self pickup instead.
                      </span>
                    ) : deliveryQuote?.fee != null ? (
                      <span className="text-leaf">
                        {deliveryQuote.distanceKm} km from the restaurant —
                        delivery fee ₹{deliveryQuote.fee}
                      </span>
                    ) : null}
                  </p>
                )}

                <div className="space-y-2">

                  <Label htmlFor="co-address">
                    Delivery address
                  </Label>

                  <Textarea
                    id="co-address"
                    rows={3}
                    placeholder="House / flat no., street, area"
                    value={address}
                    onChange={(e) =>
                      setAddress(
                        e.target.value
                      )
                    }
                  />

                </div>

                <div className="grid gap-4 sm:grid-cols-2">

                  <div className="space-y-2">

                    <Label htmlFor="co-landmark">
                      Landmark
                    </Label>

                    <Input
                      id="co-landmark"
                      placeholder="Near..."
                      value={landmark}
                      onChange={(e) =>
                        setLandmark(
                          e.target.value
                        )
                      }
                    />

                  </div>

                  <div className="space-y-2">

                    <Label htmlFor="co-pincode">
                      Pincode
                    </Label>

                    <Input
                      id="co-pincode"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="221001"
                      value={pincode}
                      onChange={(e) =>
                        setPincode(
                          e.target.value.replace(
                            /\D/g,
                            ""
                          )
                        )
                      }
                    />

                  </div>

                </div>

                <div className="grid gap-4 sm:grid-cols-2">

                  <div className="space-y-2">

                    <Label htmlFor="co-city">
                      City
                    </Label>

                    <Input
                      id="co-city"
                      value={city}
                      onChange={(e) =>
                        setCity(
                          e.target.value
                        )
                      }
                    />

                  </div>

                  <div className="space-y-2">

                    <Label htmlFor="co-state">
                      State
                    </Label>

                    <Input
                      id="co-state"
                      value={state}
                      onChange={(e) =>
                        setState(
                          e.target.value
                        )
                      }
                    />

                  </div>

                </div>

              </div>

            )}

            <div className="mt-4 space-y-2">

              <Label htmlFor="co-notes">
                Cooking instructions (optional)
              </Label>

              <Textarea
                id="co-notes"
                rows={2}
                placeholder="Less spicy, no onion garlic, extra raita…"
                value={notes}
                onChange={(e) =>
                  setNotes(
                    e.target.value
                  )
                }
              />

            </div>

          </section>

          {/* PAYMENT — derived from delivery mode, not a separate choice */}

          <section className="rounded-3xl border bg-card p-6 shadow-soft">

            <h2 className="font-display text-lg font-extrabold">
              Payment
            </h2>

            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-primary bg-accent p-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-lg font-black text-primary-foreground">
                {mode === "pickup" ? "🏠" : "📱"}
              </span>
              <span>
                <span className="block font-bold">{paymentLabel}</span>
                <span className="block text-xs text-muted-foreground">
                  {mode === "pickup"
                    ? "Pay in person when you pick up your food — no delivery fee."
                    : "Pay via UPI when your food is delivered."}
                </span>
              </span>
            </div>

          </section>

        </div>

        {/* ORDER SUMMARY */}

        <aside className="lg:sticky lg:top-32 lg:h-fit">

          <div className="rounded-3xl border bg-card p-6 shadow-card">

            <h2 className="font-display text-lg font-extrabold">
              Order summary
            </h2>

            <ul className="mt-4 space-y-3">

              {lines.map((l) => (

                <li
                  key={l.key}
                  className="flex justify-between gap-3 text-sm"
                >

                  <span className="min-w-0">

                    <span className="block truncate font-semibold">

                      {l.name}

                      <span className="text-muted-foreground">
                        {" "}× {l.qty}
                      </span>

                    </span>

                    <span className="block text-xs text-muted-foreground">
                      {l.variant}
                    </span>

                  </span>

                  <span className="shrink-0 font-semibold">
                    ₹{l.price * l.qty}
                  </span>

                </li>

              ))}

            </ul>

            <div className="mt-5 space-y-2 border-t pt-4 text-sm">

              <div className="flex justify-between">

                <span className="text-muted-foreground">
                  Item total
                </span>

                <span className="font-semibold">
                  ₹{subtotal}
                </span>

              </div>

              <div className="flex justify-between">

                <span className="text-muted-foreground">
                  Delivery
                </span>

                <span className="font-semibold text-leaf">

                  {deliveryFee
                    ? `₹${deliveryFee}`
                    : "Free"}

                </span>

              </div>

              <div className="flex justify-between border-t pt-3 font-display text-xl font-extrabold">

                <span>
                  To pay
                </span>

                <span>
                  ₹{total}
                </span>

              </div>

            </div>

            <Button
              size="lg"
              className="mt-5 w-full rounded-full text-base font-bold"
              onClick={placeOrder}
              disabled={
                placingOrder || !user
              }
            >

              {placingOrder
                ? "Placing Order..."
                : "Place Order"}

            </Button>

          </div>

        </aside>

      </div>

    </div>
  );
} 