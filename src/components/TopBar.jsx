export default function TopBar({ ctScore, trScore, teamMoney, onRandom, roundLabel, showRandom = true }) {
  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-line bg-gradient-to-b from-[#151619] to-[#101114] shrink-0">
      <div className="flex items-center gap-4">
        <div className="font-display font-bold text-xl tracking-wide">
          QUAL A <span className="text-orange">CALL?</span>
        </div>
        <div className="font-mono text-[11px] tracking-wider bg-panelAlt border border-line px-2.5 py-1 text-textMuted">
          {roundLabel}
        </div>
      </div>
      <div className="flex items-center gap-3 font-display">
        <div className="flex flex-col items-end leading-none">
          <span className="text-[9px] font-mono tracking-wider text-textMuted uppercase mb-1">Contra-Terroristas</span>
          <span className="text-2xl font-bold text-ctblue">{ctScore}</span>
        </div>
        <span className="text-xl text-textFaint">—</span>
        <div className="flex flex-col items-start leading-none">
          <span className="text-[9px] font-mono tracking-wider text-textMuted uppercase mb-1">Terroristas</span>
          <span className="text-2xl font-bold text-red">{trScore}</span>
        </div>
      </div>
      <div className="flex items-center gap-3.5">
        <div className="font-mono text-sm font-semibold text-green bg-panelAlt border border-line px-3.5 py-1.5">
          <span className="uppercase text-[10px] tracking-wider text-textMuted mr-1.5 font-display">Time</span>
          ${teamMoney}
        </div>
        {showRandom && (
          <button
            onClick={onRandom}
            className="font-display text-xs tracking-wider uppercase px-3.5 py-1.5 border border-line bg-panelAlt hover:border-textFaint"
          >
            🎲 Aleatório
          </button>
        )}
      </div>
    </div>
  );
}
