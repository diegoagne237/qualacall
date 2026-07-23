import { useEffect, useRef, useState } from "react";
import MapView from "./MapView";
import { ROUND_TICKS } from "../engine/simulate";

const REASON_LABEL = {
  elimination: "Eliminação total do time TR",
  elimination_no_resistance: "Eliminação total do time CT",
  defuse: "Bomba desarmada",
  detonation: "A bomba explodiu",
  time: "Tempo esgotado — CT defende o round",
};

const NADE_ICON = { flash: "⚡", smoke: "💨", molotov: "🔥", he: "💣" };

export default function SimulationView({ result, onContinue }) {
  const { frames, events, outcome, ctPlayers, trPlayers } = result;
  const [tick, setTick] = useState(0);
  const [playing, setPlaying] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setTick((t) => {
          if (t >= frames.length - 1) {
            setPlaying(false);
            return t;
          }
          return t + 1;
        });
      }, 850);
    }
    return () => clearInterval(intervalRef.current);
  }, [playing, frames.length]);

  const frame = frames[tick];
  const finished = tick >= frames.length - 1;

  const nameOf = (id) => [...ctPlayers, ...trPlayers].find((p) => p.id === id)?.name ?? id;

  const tokens = [
    ...ctPlayers.map((p) => ({
      id: p.id,
      team: "CT",
      color: p.color,
      zoneId: frame.positions[p.id],
      alive: frame.alive[p.id],
      short: p.id.replace("ct", ""),
      label: p.name,
    })),
    ...trPlayers.map((p) => ({
      id: p.id,
      team: "TR",
      zoneId: frame.positions[p.id],
      alive: frame.alive[p.id],
      short: "T" + p.id.replace("t", ""),
      label: p.name,
    })),
  ];

  const utilMarkers = events
    .filter((e) => e.type === "utility" && e.tick <= tick && tick <= e.tick + 2)
    .map((e) => ({ fromZoneId: e.zone, toZoneId: e.zone, icon: NADE_ICON[e.nade] ?? "💥" }));

  const visibleEvents = events.filter((e) => e.tick <= tick && (e.type === "kill" || e.type === "plant" || e.type === "round_end"));
  const aliveCT = Object.entries(frame.alive).filter(([id, a]) => id.startsWith("ct") && a).length;
  const aliveTR = Object.entries(frame.alive).filter(([id, a]) => id.startsWith("t") && a).length;

  return (
    <div className="grid grid-cols-[1fr_320px] gap-px bg-line flex-1 min-h-0">
      <div className="bg-void flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 border-b border-line">
          <span className="font-display text-xs tracking-widest uppercase text-textPrimary">
            Simulação em andamento
          </span>
          <span className="font-mono text-xs text-textMuted">
            Tick {tick + 1}/{ROUND_TICKS} {frame.planted && <span className="text-orange ml-2">● BOMBA ATIVA</span>}
          </span>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-[680px]">
            <MapView tokens={tokens} utilMarkers={utilMarkers} />
          </div>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-line">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm text-ctblue">CT vivos: {aliveCT}</span>
            <span className="font-mono text-sm text-red">TR vivos: {aliveTR}</span>
          </div>
          <div className="flex items-center gap-2">
            {!finished && (
              <button
                onClick={() => setPlaying((p) => !p)}
                className="font-display uppercase text-xs tracking-wider px-4 py-2 border border-line bg-panelAlt hover:border-textFaint"
              >
                {playing ? "⏸ Pausar" : "▶ Retomar"}
              </button>
            )}
            {!finished && (
              <button
                onClick={() => {
                  setPlaying(false);
                  setTick(frames.length - 1);
                }}
                className="font-display uppercase text-xs tracking-wider px-4 py-2 border border-line bg-panelAlt hover:border-textFaint"
              >
                ⏭ Pular pro resultado
              </button>
            )}
            {finished && (
              <button
                onClick={onContinue}
                className="font-display uppercase text-xs tracking-wider px-4 py-2 border border-orange text-orange bg-orange/10 hover:bg-orange/20"
              >
                Continuar →
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-panel p-4 overflow-y-auto">
        <div className="font-display text-xs tracking-widest uppercase mb-3">Killfeed</div>
        <div className="space-y-2">
          {visibleEvents.length === 0 && (
            <div className="text-xs text-textFaint border border-dashed border-line p-4 text-center">
              Aguardando primeiro contato...
            </div>
          )}
          {[...visibleEvents].reverse().map((e, i) => (
            <div key={i} className="text-[11.5px] font-mono border border-lineSoft bg-panelAlt px-2 py-1.5">
              {e.type === "kill" && (
                <span>
                  <span className={e.killerTeam === "CT" ? "text-ctblue" : "text-red"}>{e.killer}</span>
                  {" ✕ "}
                  <span className={e.victimTeam === "CT" ? "text-ctblue" : "text-red"}>{e.victim}</span>
                  <span className="text-textFaint"> · {e.weapon}{e.headshot ? " (HS)" : ""}</span>
                </span>
              )}
              {e.type === "plant" && <span className="text-orange">Bomba plantada</span>}
              {e.type === "round_end" && (
                <span className={e.winner === "CT" ? "text-ctblue" : "text-red"}>
                  Round para {e.winner} — {REASON_LABEL[e.reason]}
                </span>
              )}
            </div>
          ))}
        </div>

        {finished && (
          <div className="mt-6 border border-orange p-4 bg-orange/5">
            <div className="font-display text-sm uppercase tracking-wide text-orange mb-1">
              Vitória: {outcome.winner === "CT" ? "Seu time (CT)" : "Time adversário (TR)"}
            </div>
            <div className="text-xs text-textMuted">{REASON_LABEL[outcome.reason]}</div>
          </div>
        )}
      </div>
    </div>
  );
}
