import { ZONE_MAP } from "../data/zones";
import { styleById } from "../data/catalog";

export default function RosterPanel({ players, activePlayerId, onSelect, remaining, show = {} }) {
  return (
    <div className="space-y-2">
      {players.map((p) => {
        const zoneLabel = p.zone ? ZONE_MAP[p.zone]?.label : "—";
        const style = p.style ? styleById(p.style)?.name : "—";
        return (
          <div
            key={p.id}
            onClick={() => onSelect(p.id)}
            className={`flex items-center gap-2.5 p-2.5 border cursor-pointer transition-colors ${
              p.id === activePlayerId ? "border-orange bg-card" : "border-lineSoft bg-panelAlt hover:border-textFaint"
            }`}
          >
            <div className="w-[30px] h-[30px] rounded-full bg-ctblueDim border border-ctblue flex items-center justify-center font-mono text-xs text-ctblue shrink-0">
              {p.id}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[12.5px] font-semibold text-textPrimary">
                {p.name} <span className="text-textFaint font-normal">· {p.role}</span>
              </div>
              <div className="text-[10.5px] font-mono text-textMuted mt-0.5 flex gap-2 flex-wrap">
                {show.money && <span>${remaining(p)}</span>}
                {show.zone && (
                  <span className="px-1.5 py-0.5 border border-orangeDim text-orange text-[9.5px]">{zoneLabel}</span>
                )}
                {show.style && (
                  <span className="px-1.5 py-0.5 border border-ctblueDim text-ctblue text-[9.5px]">{style}</span>
                )}
                {show.util && <span className="px-1.5 py-0.5 border border-line text-[9.5px]">{p.grenades.length} utilidade(s)</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
