import { STYLES } from "../data/catalog";

export default function StylePanel({ player, onSetStyle }) {
  return (
    <div className="mt-4">
      <div className="font-mono text-[10.5px] text-textMuted uppercase tracking-wider mb-2 border-b border-lineSoft pb-1.5">
        Estilo — {player.name}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {STYLES.map((s) => (
          <button
            key={s.id}
            title={s.desc}
            onClick={() => onSetStyle(s.id)}
            className={`px-2.5 py-1.5 border font-mono text-[10.5px] uppercase tracking-wide ${
              player.style === s.id
                ? "border-ctblue text-ctblue bg-ctblue/10"
                : "border-line text-textMuted hover:border-textFaint hover:text-textPrimary"
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>
    </div>
  );
}
