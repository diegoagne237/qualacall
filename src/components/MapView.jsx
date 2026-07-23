import { ZONES, ZONE_MAP } from "../data/zones";

// tokens: array of { id, x?, zoneId, label, team: 'CT'|'TR', selected? }
// utilMarkers: array of { fromZoneId, toZoneId, icon }
// onZoneClick: optional (zoneId) => void — when set, zones become clickable hotspots
export default function MapView({ tokens = [], utilMarkers = [], onZoneClick, showZoneHotspots = false }) {
  return (
    <div className="relative w-full aspect-square border border-line shadow-[0_0_0_1px_rgba(0,0,0,0.4),0_30px_60px_-20px_rgba(0,0,0,0.6)] overflow-hidden bg-black">
      <img
        src="/map.png"
        alt="Mapa"
        className="w-full h-full object-cover"
        style={{ filter: "saturate(0.9) brightness(0.95)" }}
      />
      {/* HUD corner brackets */}
      <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-orange pointer-events-none z-10" />
      <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-orange pointer-events-none z-10" />
      <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-orange pointer-events-none z-10" />
      <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-orange pointer-events-none z-10" />
      <div className="scanline absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-orange/40 to-transparent z-[8] opacity-60" />

      {showZoneHotspots &&
        ZONES.filter((z) => z.ctSelectable).map((z) => (
          <button
            key={z.id}
            onClick={() => onZoneClick && onZoneClick(z.id)}
            className="group absolute w-4 h-4 -ml-2 -mt-2 rounded-full border border-textFaint bg-black/60 hover:scale-125 hover:border-orange transition-transform z-20"
            style={{ left: `${z.x}%`, top: `${z.y}%` }}
          >
            <span className="pointer-events-none absolute top-5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-void/80 text-[9px] font-mono text-textMuted px-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {z.label}
            </span>
          </button>
        ))}

      {utilMarkers.map((m, i) => {
        const from = ZONE_MAP[m.fromZoneId];
        const to = ZONE_MAP[m.toZoneId];
        if (!from || !to) return null;
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        return (
          <div key={i}>
            <div
              className="absolute h-px z-[15] opacity-70"
              style={{
                left: `${from.x}%`,
                top: `${from.y}%`,
                width: `${len}%`,
                transform: `rotate(${angle}deg)`,
                transformOrigin: "0 0",
                backgroundImage: "repeating-linear-gradient(90deg, #e59435 0 4px, transparent 4px 8px)",
              }}
            />
            <div
              className="absolute w-4 h-4 -ml-2 -mt-2 flex items-center justify-center text-[10px] rounded-sm z-[16]"
              style={{ left: `${to.x}%`, top: `${to.y}%`, background: "rgba(30,30,30,0.85)" }}
            >
              {m.icon}
            </div>
          </div>
        );
      })}

      {tokens.map((t) => {
        const zone = ZONE_MAP[t.zoneId];
        if (!zone) return null;
        const isCT = t.team === "CT";
        const color = isCT ? t.color || "#5f89b3" : "#d1554f";
        return (
          <div
            key={t.id}
            onClick={t.onClick}
            className={`absolute w-[22px] h-[22px] -ml-[11px] -mt-[11px] rounded-full flex items-center justify-center text-[10px] font-mono font-semibold z-[22] transition-all duration-500 ease-out text-void ${
              t.onClick ? "cursor-pointer" : ""
            } ${!t.alive ? "opacity-25 grayscale scale-75" : ""}`}
            style={{
              left: `${zone.x}%`,
              top: `${zone.y}%`,
              border: `2px solid ${t.selected ? "#e59435" : color}`,
              background: `radial-gradient(circle at 35% 30%, ${color}cc, ${color})`,
              boxShadow: `0 0 0 4px ${t.selected ? "rgba(229,148,53,0.35)" : color + "26"}`,
            }}
            title={t.label}
          >
            {t.short ?? t.label}
          </div>
        );
      })}
    </div>
  );
}
