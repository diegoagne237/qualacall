import { WEAPONS, ARMOR, GRENADES } from "../data/catalog";

export default function BuyPanel({ player, remaining, onSet, onToggleGrenade }) {
  return (
    <div>
      <div className="font-display text-[13px] tracking-wider uppercase flex items-center justify-between mb-3.5">
        Compra <span className="font-body normal-case text-[11px] text-textFaint">${remaining(player)} livre</span>
      </div>

      <div className="mb-4">
        <div className="font-mono text-[10.5px] text-textMuted uppercase tracking-wider mb-2 border-b border-lineSoft pb-1.5">
          Arma
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {WEAPONS.map((w) => (
            <button
              key={w.id}
              onClick={() => onSet("weapon", w.id)}
              className={`flex items-center justify-between px-2.5 py-2 border text-[11.5px] text-left ${
                player.weapon === w.id ? "border-orange bg-orange/10" : "border-line bg-panelAlt hover:border-textFaint"
              }`}
            >
              <span>{w.name}</span>
              <span className={`font-mono text-[10.5px] ${player.weapon === w.id ? "text-orange" : "text-textMuted"}`}>
                ${w.price}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <div className="font-mono text-[10.5px] text-textMuted uppercase tracking-wider mb-2 border-b border-lineSoft pb-1.5">
          Proteção
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {ARMOR.map((a) => (
            <button
              key={a.id}
              onClick={() => onSet("armor", a.id)}
              className={`flex items-center justify-between px-2.5 py-2 border text-[11.5px] text-left ${
                player.armor === a.id ? "border-orange bg-orange/10" : "border-line bg-panelAlt hover:border-textFaint"
              }`}
            >
              <span>{a.name}</span>
              <span className={`font-mono text-[10.5px] ${player.armor === a.id ? "text-orange" : "text-textMuted"}`}>
                ${a.price}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="font-mono text-[10.5px] text-textMuted uppercase tracking-wider mb-2 border-b border-lineSoft pb-1.5">
          Granadas
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {GRENADES.map((g) => {
            const owned = player.grenades.includes(g.id);
            return (
              <button
                key={g.id}
                onClick={() => onToggleGrenade(g.id)}
                className={`flex items-center justify-between px-2.5 py-2 border text-[11.5px] text-left ${
                  owned ? "border-orange bg-orange/10" : "border-line bg-panelAlt hover:border-textFaint"
                }`}
              >
                <span>{g.icon} {g.name}</span>
                <span className={`font-mono text-[10.5px] ${owned ? "text-orange" : "text-textMuted"}`}>${g.price}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
