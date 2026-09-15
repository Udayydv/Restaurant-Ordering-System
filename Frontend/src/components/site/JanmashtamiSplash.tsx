import { useEffect, useRef, useState } from "react";

/*
 * One-day-only festive splash screen for Krishna Janmashtami (4 Sept
 * 2026). Shown once per browser (via localStorage) to a first-time
 * visitor on that date, only while the restaurant is actually open
 * (until 10 PM IST) — matching the site's real operating hours.
 * From the next day onward this renders nothing at all.
 */

const FESTIVAL_DATE_IST = "2026-09-04"; // Janmashtami
const CLOSE_HOUR_IST = 22; // 10 PM — matches RESTAURANT_CLOSE_TIME
const STORAGE_KEY = `tvr-janmashtami-seen-${FESTIVAL_DATE_IST}`;

function getISTParts() {
  const now = new Date();
  const istMs = now.getTime() + (5.5 * 60 + now.getTimezoneOffset()) * 60000;
  const ist = new Date(istMs);
  const dateStr = ist.toISOString().slice(0, 10);
  const hour = ist.getUTCHours();
  return { dateStr, hour };
}

function isWithinFestivalWindow() {
  const { dateStr, hour } = getISTParts();
  return dateStr === FESTIVAL_DATE_IST && hour < CLOSE_HOUR_IST;
}

export function JanmashtamiSplash() {
  const [eligible, setEligible] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [arrived, setArrived] = useState(false);
  const krishnaRef = useRef<HTMLDivElement>(null);
  const burstRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isWithinFestivalWindow()) return;

    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      // localStorage unavailable — fail open and still show it once.
    }

    setEligible(true);
  }, []);

  if (!eligible || hidden) return null;

  const handleTap = () => {
    const krishnaEl = krishnaRef.current;
    const burstEl = burstRef.current;

    if (krishnaEl && burstEl) {
      const rect = krishnaEl.getBoundingClientRect();
      burstEl.style.left = `${rect.left + rect.width / 2}px`;
      burstEl.style.top = `${rect.top + rect.height / 2}px`;
      burstEl.classList.add("tvr-burst-go");
    }

    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }

    window.setTimeout(() => setHidden(true), 300);
  };

  return (
    <>
      <style>{`
        @keyframes tvrCrawl {
          0%   { left: -140px; transform: translateY(0) rotate(0deg); }
          10%  { transform: translateY(-6px) rotate(-3deg); }
          20%  { transform: translateY(0) rotate(3deg); }
          30%  { transform: translateY(-6px) rotate(-3deg); }
          40%  { transform: translateY(0) rotate(3deg); }
          50%  { left: calc(50% - 60px); transform: translateY(-6px) rotate(-3deg); }
          60%  { transform: translateY(0) rotate(2deg); }
          70%  { transform: translateY(-4px) rotate(-2deg); }
          80%  { transform: translateY(0) rotate(1deg); }
          100% { left: calc(50% - 60px); transform: translateY(0) rotate(0deg); }
        }
        @keyframes tvrPulseRing {
          0%   { opacity: 0.7; transform: translateX(-50%) scale(0.7); }
          100% { opacity: 0; transform: translateX(-50%) scale(1.25); }
        }
        @keyframes tvrFall {
          0%   { transform: translateY(-40px) rotate(0deg); }
          100% { transform: translateY(110vh) rotate(360deg); }
        }
        @keyframes tvrFadeIn { to { opacity: 1; } }
        @keyframes tvrBurstOut {
          0%   { transform: translate(-50%, -50%) scale(0); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(60); opacity: 0; }
        }
        .tvr-burst-go { animation: tvrBurstOut 0.9s ease-out forwards; }
      `}</style>

      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 200,
          background:
            "radial-gradient(circle at 50% 25%, #2b3f7a 0%, #1a2456 35%, #0d1333 75%, #070a1f 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: "8vh",
          overflow: "hidden",
          transition: "opacity 0.9s ease",
        }}
      >
        <div style={{ position: "absolute", top: 20, left: 20, width: 120, height: 120, border: "2px solid #f2c14e", opacity: 0.45, borderRight: "none", borderBottom: "none", borderRadius: "40px 0 0 0" }} />
        <div style={{ position: "absolute", top: 20, right: 20, width: 120, height: 120, border: "2px solid #f2c14e", opacity: 0.45, borderLeft: "none", borderBottom: "none", borderRadius: "0 40px 0 0" }} />
        <div style={{ position: "absolute", bottom: 20, left: 20, width: 120, height: 120, border: "2px solid #f2c14e", opacity: 0.45, borderRight: "none", borderTop: "none", borderRadius: "0 0 0 40px" }} />
        <div style={{ position: "absolute", bottom: 20, right: 20, width: 120, height: 120, border: "2px solid #f2c14e", opacity: 0.45, borderLeft: "none", borderTop: "none", borderRadius: "0 0 40px 0" }} />

        <Petals />

        <div
          style={{
            fontSize: 34,
            color: "#f2c14e",
            textShadow: "0 0 20px rgba(242,193,78,0.6)",
          }}
        >
          🕉
        </div>
        <div
          style={{
            marginTop: 14,
            fontSize: 18,
            letterSpacing: 5,
            color: "#ffe9b0",
            fontWeight: 700,
          }}
        >
          RADHE RADHE
        </div>
        <div
          style={{
            marginTop: 8,
            fontSize: 40,
            fontWeight: 900,
            color: "#fff",
            textAlign: "center",
            textShadow: "0 3px 16px rgba(0,0,0,0.4)",
          }}
        >
          Happy
          <span style={{ color: "#f7d774", display: "block" }}>
            Janmashtami!
          </span>
        </div>
        <div
          style={{
            marginTop: 14,
            fontSize: 15,
            color: "#d8e0ff",
            textAlign: "center",
            maxWidth: 340,
            padding: "0 20px",
          }}
        >
          Little Krishna is crawling in to bless your day — tap him to enter
          the website.
        </div>
        <div
          style={{
            marginTop: 14,
            fontSize: 13,
            color: "#f2c14e",
            letterSpacing: 1,
            opacity: 0,
            animation: "tvrFadeIn 1s ease 2.2s forwards",
          }}
        >
          ✨ TAP BABY KRISHNA WHEN HE ARRIVES ✨
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "14vh",
            left: 0,
            width: "100%",
            height: 140,
          }}
        >
          <div
            ref={krishnaRef}
            onClick={handleTap}
            onAnimationEnd={() => setArrived(true)}
            style={{
              position: "absolute",
              bottom: 0,
              left: -140,
              width: 120,
              height: 130,
              cursor: "pointer",
              animation: "tvrCrawl 4s cubic-bezier(0.4,0,0.2,1) forwards",
            }}
          >
            {arrived && (
              <div
                style={{
                  position: "absolute",
                  bottom: -10,
                  left: "50%",
                  width: 160,
                  height: 160,
                  transform: "translateX(-50%)",
                  borderRadius: "50%",
                  border: "2px solid #f2c14e",
                  animation: "tvrPulseRing 1.6s ease-out infinite",
                  pointerEvents: "none",
                }}
              />
            )}
            {arrived && (
              <div
                style={{
                  position: "absolute",
                  bottom: -46,
                  left: "50%",
                  transform: "translateX(-50%)",
                  fontSize: 12,
                  color: "#ffe9b0",
                  letterSpacing: 2,
                  whiteSpace: "nowrap",
                  opacity: 0,
                  animation: "tvrFadeIn 0.6s ease forwards",
                }}
              >
                TAP ME
              </div>
            )}
            <svg viewBox="0 0 200 200" width="100%" height="100%">
              <ellipse cx="100" cy="165" rx="55" ry="14" fill="#000" opacity="0.15" />
              <path d="M55 150 Q60 110 85 100 L80 150 Z" fill="#26408a" />
              <path d="M145 150 Q140 110 115 100 L120 150 Z" fill="#26408a" />
              <ellipse cx="72" cy="152" rx="14" ry="9" fill="#2b4a9e" />
              <ellipse cx="128" cy="152" rx="14" ry="9" fill="#2b4a9e" />
              <path d="M55 145 Q45 120 55 95 L85 100 Q65 115 60 145Z" fill="#2b4a9e" />
              <path d="M145 145 Q155 120 145 95 L115 100 Q135 115 140 145Z" fill="#2b4a9e" />
              <ellipse cx="52" cy="148" rx="10" ry="7" fill="#26408a" />
              <ellipse cx="148" cy="148" rx="10" ry="7" fill="#26408a" />
              <ellipse cx="100" cy="105" rx="42" ry="34" fill="#2b4a9e" />
              <circle cx="100" cy="65" r="30" fill="#3157ad" />
              <circle cx="88" cy="64" r="3.4" fill="#0d1333" />
              <circle cx="112" cy="64" r="3.4" fill="#0d1333" />
              <path d="M90 76 Q100 82 110 76" stroke="#0d1333" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M72 46 Q100 26 128 46" stroke="#f2c14e" strokeWidth="5" fill="none" strokeLinecap="round" />
              <circle cx="100" cy="30" r="4.5" fill="#f2c14e" />
              <path d="M100 30 C80 5, 55 12, 50 40 C72 32, 88 36, 100 30Z" fill="#3aa0a0" />
              <circle cx="58" cy="20" r="4" fill="#f2c14e" />
              <rect x="118" y="95" width="42" height="6" rx="3" fill="#f2c14e" transform="rotate(35 118 95)" />
            </svg>
          </div>
        </div>
      </div>

      <div
        ref={burstRef}
        style={{
          position: "fixed",
          zIndex: 210,
          width: 20,
          height: 20,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, #fff6d8 0%, #f2c14e 40%, transparent 70%)",
          transform: "translate(-50%, -50%) scale(0)",
          pointerEvents: "none",
        }}
      />
    </>
  );
}

function Petals() {
  const petals = useRef(
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: -40 - Math.random() * 300,
      size: 8 + Math.random() * 14,
      color: ["#e0567a", "#d94f70", "#f28fa8", "#c73f61", "#f2b3c2"][
        Math.floor(Math.random() * 5)
      ],
      duration: 6 + Math.random() * 6,
      delay: Math.random() * 5,
    })),
  ).current;

  return (
    <>
      {petals.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            borderRadius: "60% 0 60% 0",
            opacity: 0.85,
            width: p.size,
            height: p.size * 0.8,
            left: `${p.left}%`,
            top: p.top,
            background: p.color,
            animation: `tvrFall linear infinite`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </>
  );
}
