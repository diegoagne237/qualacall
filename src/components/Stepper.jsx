const STEPS = ["Compra", "Posição Inicial", "Utilitárias", "Atitude", "Simular"];

export default function Stepper({ currentStep, onJump }) {
  return (
    <div className="flex items-center px-6 bg-void border-b border-line overflow-x-auto shrink-0">
      {STEPS.map((s, i) => (
        <div
          key={s}
          onClick={() => onJump(i)}
          className={`flex items-center gap-2 px-5 py-3.5 font-display text-xs tracking-wider uppercase cursor-pointer whitespace-nowrap border-b-2 transition-colors ${
            i === currentStep
              ? "text-textPrimary border-orange"
              : i < currentStep
              ? "text-textMuted border-transparent"
              : "text-textFaint border-transparent hover:text-textPrimary"
          }`}
        >
          <span
            className={`font-mono text-[11px] w-[18px] h-[18px] rounded-sm border flex items-center justify-center ${
              i === currentStep
                ? "border-orange text-orange bg-orange/10"
                : i < currentStep
                ? "border-green text-green"
                : "border-textFaint text-textFaint"
            }`}
          >
            {i < currentStep ? "✓" : i + 1}
          </span>
          {s}
        </div>
      ))}
    </div>
  );
}
