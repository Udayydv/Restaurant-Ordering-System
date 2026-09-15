import { useEffect, useMemo, useState } from "react";

const CAMPAIGN_START_IST = "2026-09-15";
const CAMPAIGN_END_IST = "2026-09-22"; // exclusive end date (7 full days)
const DISPLAY_MS = 5000;
const FADE_MS = 500;

function getISTDateString(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  const month = parts.find((part) => part.type === "month")?.value ?? "00";
  const day = parts.find((part) => part.type === "day")?.value ?? "00";

  return `${year}-${month}-${day}`;
}

function isWithinCampaignWindow() {
  const todayIst = getISTDateString();
  return todayIst >= CAMPAIGN_START_IST && todayIst < CAMPAIGN_END_IST;
}

export function GaneshChaturthiSplash() {
  const [shouldRender, setShouldRender] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.pathname.startsWith("/admin")) return;
    if (!isWithinCampaignWindow()) return;

    setShouldRender(true);

    const closeTimer = window.setTimeout(() => {
      setIsClosing(true);
    }, DISPLAY_MS);

    const removeTimer = window.setTimeout(() => {
      setShouldRender(false);
    }, DISPLAY_MS + FADE_MS);

    return () => {
      window.clearTimeout(closeTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  const petals = useMemo(
    () =>
      Array.from({ length: 22 }, (_, index) => ({
        id: index,
        left: `${(index * 4.5 + (index % 3) * 1.7) % 100}%`,
        size: 14 + (index % 4) * 6,
        delay: (index % 7) * 0.35,
        duration: 4.5 + (index % 5) * 0.6,
        sway: (index % 2 === 0 ? 1 : -1) * (12 + (index % 4) * 6),
        opacity: 0.68 + (index % 3) * 0.1,
      })),
    [],
  );

  if (!shouldRender) return null;

  return (
    <>
      <style>{`
        @keyframes tvr-petal-fall {
          0% {
            transform: translate3d(0, -10vh, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(var(--petal-sway), 48vh, 0) rotate(180deg);
          }
          100% {
            transform: translate3d(calc(var(--petal-sway) * -0.7), 108vh, 0) rotate(360deg);
          }
        }
      `}</style>

      <div
        className="fixed inset-0 z-[220] flex items-center justify-center overflow-hidden bg-[#140606]/85 p-4 backdrop-blur-md"
        style={{
          opacity: isClosing ? 0 : 1,
          transition: `opacity ${FADE_MS}ms ease`,
        }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{
            backgroundImage: "url('/festivals/ganesh-chaturthi-offer.png')",
            filter: "blur(24px) saturate(1.15)",
            transform: "scale(1.06)",
          }}
        />

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {petals.map((petal) => (
            <span
              key={petal.id}
              className="absolute top-[-12vh] rounded-[60%_40%_65%_35%/55%_45%_55%_45%] bg-gradient-to-br from-rose-200 via-rose-500 to-rose-700 shadow-[0_4px_12px_rgba(0,0,0,0.18)]"
              style={{
                left: petal.left,
                width: petal.size,
                height: Math.round(petal.size * 0.72),
                opacity: petal.opacity,
                animation: `tvr-petal-fall ${petal.duration}s linear ${petal.delay}s infinite`,
                transformOrigin: "center",
                // @ts-expect-error CSS custom property for animation sway.
                "--petal-sway": `${petal.sway}px`,
              }}
            />
          ))}
        </div>

        <div className="relative mx-auto flex w-full max-w-2xl flex-col items-center">
          <div className="mb-4 inline-flex items-center rounded-full border border-amber-300/55 bg-black/35 px-5 py-2 text-center text-sm font-black uppercase tracking-[0.24em] text-amber-100 shadow-lg">
            Ganesh Chaturthi Special Offer • 7 Days Only
          </div>

          <div className="relative w-full overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 p-3 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-sm sm:p-4">
            <img
              src="/festivals/ganesh-chaturthi-offer.png"
              alt="Ganesh Chaturthi special offer poster for Tripathi Veg Restaurant"
              className="mx-auto max-h-[78vh] w-full rounded-[1.45rem] object-contain shadow-2xl"
            />
          </div>

          <div className="mt-4 rounded-full bg-black/35 px-4 py-2 text-center text-xs font-semibold tracking-wide text-white/90 shadow-lg sm:text-sm">
            Offer valid for 7 days • Opening website now...
          </div>
        </div>
      </div>
    </>
  );
}
