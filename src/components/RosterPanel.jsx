import { useState } from "react";
import { ZONE_MAP } from "../data/zones";
import {
  WEAPON_CATEGORIES,
  WEAPONS,
  ARMOR_PRICE,
  GRENADES,
  STYLES,
  weaponById,
  styleById,
} from "../data/catalog";

function spentOf(p) {
  const grenadePrice = p.grenades[0] ? GRENADES.find((g) => g.id === p.grenades[0]).price : 0;
  return weaponById(p.weapon).price + (p.armor ? ARMOR_PRICE : 0) + grenadePrice;
}
function remainingOf(p) {
  return p.money - spentOf(p);
}
function canAfford(p, currentPrice, newPrice) {
  return remainingOf(p) + currentPrice >= newPrice;
}

// mode: 'buy' | 'position' | 'utility' | 'attitude'
export default function RosterPanel({
  players,
  activePlayerId,
  onSelect,
  mode,
  onSetWeapon,
  onToggleArmor,
  onSetGrenade,
  onSetStyle,
}) {
  const [expandedId, setExpandedId] = useState(null);
  const [openCategory, setOpenCategory] = useState(null);
  const expandable = mode === "buy" || mode === "attitude";

  function handleRowClick(id) {
    onSelect(id);
    if (!expandable) return;
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      setOpenCategory(null);
    }
  }

  return (
    <div className="space-y-2">
      {players.map((p) => {
        const zoneLabel = p.zone ? ZONE_MAP[p.zone]?.label : "—";
        const style = p.style ? styleById(p.style)?.name : "—";
        const isExpanded = expandable && expandedId === p.id;
        const isActive = p.id === activePlayerId;

        return (
          <div key={p.id} className={`border transition-colors ${isActive ? "border-orange" : "border-lineSoft"}`}>
            <div
              onClick={() => handleRowClick(p.id)}
              className={`flex items-center gap-2.5 p-2.5 cursor-pointer ${isActive ? "bg-card" : "bg-panelAlt hover:border-textFaint"}`}
            >
              <div
                className="w-[30px] h-[30px] rounded-full flex items-center justify-center font-mono text-[10px] font-semibold text-void shrink-0"
                style={{ background: p.colorHex, border: `1px solid ${p.colorHex}` }}
              >
                {p.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[12.5px] font-semibold text-textPrimary">
                  {p.name} <span className="text-textFaint font-normal">· {p.role}</span>
                </div>
                <div className="text-[10.5px] font-mono text-textMuted mt-0.5 flex gap-2 flex-wrap">
                  {mode === "buy" && <span>${remainingOf(p)} livre</span>}
                  {(mode === "position" || mode === "utility" || mode === "attitude") && (
                    <span className="px-1.5 py-0.5 border border-orangeDim text-orange text-[9.5px]">{zoneLabel}</span>
                  )}
                  {mode === "utility" && (
                    <span className="px-1.5 py-0.5 border border-line text-[9.5px]">
                      {p.grenades.length > 0 ? GRENADES.find((g) => g.id === p.grenades[0]).name : "sem granada"}
                    </span>
                  )}
                  {mode === "attitude" && (
                    <span className="px-1.5 py-0.5 border border-ctblueDim text-ctblue text-[9.5px]">{style}</span>
                  )}
                </div>
              </div>
              {expandable && <span className="text-textFaint text-xs">{isExpanded ? "▲" : "▼"}</span>}
            </div>

            {isExpanded && mode === "buy" && (
              <div className="p-3 border-t border-lineSoft bg-void/40">
                {WEAPON_CATEGORIES.map((cat) => {
                  const items = WEAPONS.filter((w) => w.category === cat.id);
                  const catOpen = openCategory === cat.id;
                  return (
                    <div key={cat.id} className="mb-1.5">
                      <button
                        onClick={() => setOpenCategory(catOpen ? null : cat.id)}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 text-[10.5px] font-mono uppercase tracking-wider text-textMuted border border-line hover:border-textFaint"
                      >
                        {cat.label}
                        <span>{catOpen ? "▲" : "▼"}</span>
                      </button>
                      {catOpen && (
                        <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                          {items.map((w) => {
                            const selected = p.weapon === w.id;
                            const currentPrice = weaponById(p.weapon).price;
                            const affordable = selected || canAfford(p, currentPrice, w.price);
                            return (
                              <button
                                key={w.id}
                                disabled={!affordable}
                                onClick={() => onSetWeapon(p.id, selected ? "usp" : w.id)}
                                className={`flex items-center justify-between px-2 py-1.5 border text-[11px] text-left ${
                                  selected
                                    ? "border-orange bg-orange/10"
                                    : affordable
                                    ? "border-line bg-panelAlt hover:border-textFaint"
                                    : "border-line bg-panelAlt opacity-35 cursor-not-allowed"
                                }`}
                              >
                                <span>{w.name}</span>
                                <span className={`font-mono text-[10px] ${selected ? "text-orange" : "text-textMuted"}`}>
                                  ${w.price}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}

                <div className="mb-1.5">
                  <button
                    onClick={() => setOpenCategory(openCategory === "utility" ? null : "utility")}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 text-[10.5px] font-mono uppercase tracking-wider text-textMuted border border-line hover:border-textFaint"
                  >
                    Utilitários
                    <span>{openCategory === "utility" ? "▲" : "▼"}</span>
                  </button>
                  {openCategory === "utility" && (
                    <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                      {GRENADES.map((g) => {
                        const selected = p.grenades[0] === g.id;
                        const currentPrice = p.grenades[0] ? GRENADES.find((x) => x.id === p.grenades[0]).price : 0;
                        const affordable = selected || canAfford(p, currentPrice, g.price);
                        return (
                          <button
                            key={g.id}
                            disabled={!affordable}
                            onClick={() => onSetGrenade(p.id, selected ? null : g.id)}
                            className={`flex items-center justify-between px-2 py-1.5 border text-[11px] text-left ${
                              selected
                                ? "border-orange bg-orange/10"
                                : affordable
                                ? "border-line bg-panelAlt hover:border-textFaint"
                                : "border-line bg-panelAlt opacity-35 cursor-not-allowed"
                            }`}
                          >
                            <span>
                              {g.icon} {g.name}
                            </span>
                            <span className={`font-mono text-[10px] ${selected ? "text-orange" : "text-textMuted"}`}>
                              ${g.price}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    const turningOn = !p.armor;
                    if (turningOn && !canAfford(p, 0, ARMOR_PRICE)) return;
                    onToggleArmor(p.id);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 border text-[11px] mt-1 ${
                    p.armor ? "border-orange bg-orange/10" : "border-line bg-panelAlt hover:border-textFaint"
                  }`}
                >
                  <span>Colete</span>
                  <span className={`font-mono text-[10px] ${p.armor ? "text-orange" : "text-textMuted"}`}>${ARMOR_PRICE}</span>
                </button>
              </div>
            )}

            {isExpanded && mode === "attitude" && (
              <div className="p-3 border-t border-lineSoft bg-void/40 flex flex-wrap gap-1.5">
                {STYLES.map((s) => (
                  <button
                    key={s.id}
                    title={s.desc}
                    onClick={() => onSetStyle(p.id, s.id)}
                    className={`px-2.5 py-1.5 border font-mono text-[10.5px] uppercase tracking-wide ${
                      p.style === s.id
                        ? "border-ctblue text-ctblue bg-ctblue/10"
                        : "border-line text-textMuted hover:border-textFaint hover:text-textPrimary"
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
