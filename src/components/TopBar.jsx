export default function TopBar({ ctScore, trScore, teamMoney, onRandom, roundLabel }) {
  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-line bg-gradient-to-b from-[#151619] to-[#101114]">
      <div className="flex items-center gap-4">
        <div className="font-display font-bold text-xl tracking-wide">
          SIDE<span className="text-orange">CALL</span>
        </div>
        <div className="font-mono text-[11px] tracking-wider bg-panelAlt border border-line px-2.5 py-1 text-textMuted">
          {roundLabel}
        </div>
      </div>
      <div className="flex items-center gap-2 font-display">
        <span className="text-2xl font-bold text-ctblue">{ctScore}</span>
        <span className="text-xl text-textFaint">—</span>
        <span className="text-2xl font-bold text-red">{trScore}</span>
      </div>
      <div className="flex items-center gap-3.5">
        <div className="font-mono text-sm font-semibold text-green bg-panelAlt border border-line px-3.5 py-1.5">
          <span className="uppercase text-[10px] tracking-wider text-textMuted mr-1.5 font-display">Time</span>
          ${teamMoney}
        </div>
        <button
          onClick={onRandom}
          className="font-display text-xs tracking-wider uppercase px-3.5 py-1.5 border border-line bg-panelAlt hover:border-textFaint"
        >
          🎲 Aleatório
        </button>
      </div>
    </div>
  );
}
