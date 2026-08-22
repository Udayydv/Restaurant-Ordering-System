import { Link } from "@tanstack/react-router";
import { Clock, MapPin, Phone } from "lucide-react";

import { restaurant, telHref } from "@/data/restaurant";

export function Footer() {
  return (
    <footer className="mt-16 border-t bg-ink text-cream">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-xl font-extrabold">{restaurant.brandName}</p>
          <p className="mt-1 text-sm text-cream/70">{restaurant.legalName}</p>
          <p className="mt-4 text-sm text-cream/80">{restaurant.tagline}</p>
          <p className="mt-2 text-xs text-cream/60">{restaurant.subTagline}</p>
        </div>

        <div>
          <p className="font-display text-sm font-bold uppercase tracking-widest text-cream/60">
            Explore
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {[
              { to: "/menu", label: "Full Menu" },
              { to: "/offers", label: "Offers" },
              { to: "/catering", label: "Catering & Parties" },
              { to: "/about", label: "About Us" },
              { to: "/contact", label: "Contact" },
            ].map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-cream/80 transition-colors hover:text-cream">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-display text-sm font-bold uppercase tracking-widest text-cream/60">
            Contact
          </p>
          <ul className="mt-4 space-y-3 text-sm text-cream/80">
            {restaurant.phones.map((p) => (
              <li key={p}>
                <a href={telHref(p)} className="inline-flex items-center gap-2 hover:text-cream">
                  <Phone className="h-4 w-4 shrink-0" /> {p}
                </a>
              </li>
            ))}
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{restaurant.address}</span>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{restaurant.openingHours}</span>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-display text-sm font-bold uppercase tracking-widest text-cream/60">
            Follow
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {restaurant.social.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cream/80 transition-colors hover:text-cream"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-cream/10 px-4 py-5 text-center text-xs text-cream/60">
        © {new Date().getFullYear()} {restaurant.legalName}. All rights reserved.
      </div>
    </footer>
  );
}
