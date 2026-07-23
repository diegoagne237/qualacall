import { useState } from "react";
import TopBar from "./components/TopBar";
import Stepper from "./components/Stepper";
import MapView from "./components/MapView";
import RosterPanel from "./components/RosterPanel";
import BuyPanel from "./components/BuyPanel";
import StylePanel from "./components/StylePanel";
import SimulationView from "./components/SimulationView";
import { ZONES, CT_SELECTABLE_ZONES } from "./data/zones";
import { WEAPONS, STYLES, STARTING_MONEY, weaponById, armorById, grenadeById } from "./data/catalog";
import { simulateRound } from "./engine/simulate";

function freshPlayers() {
  const roles = ["Entry", "Support", "Lurker", "AWP", "IGL (Você)"];
  return roles.map((role, i) => ({
    id: i + 1,
    name: `Jogador ${i + 1}`,
    role,
    money: STARTING_MONEY,
    weapon: "usp",
    armor: "none",
    grenades: [],
    zone: null,
    utilTarget: null,
    style: null,
  }));
}

function spent(p) {
  let s = weaponById(p.weapon).price + armorById(p.armor).price;
  p.grenades.forEach((g) => (s += grenadeById(g).price));
  return s;
}
function remaining(p) {
  return p.money - spent(p);
}

export default function App() {
  const [players, setPlayers] = useState(freshPlayers());
  const [step, setStep] = useState(0);
  const [activePlayerId, setActivePlayerId] = useState(1);
  const [phase, setPhase] = useState("setup"); // 'setup' | 'simulation'
  const [result, setResult] = useState(null);
  const [ctScore, setCtScore] = useState(0);
  const [trScore, setTrScore] = useState(0);
  const [toast, setToast] = useState("");

  const activePlayer = players.find((p) => p.id === activePlayerId);
  const teamMoney = players.reduce((acc, p) => acc + remaining(p), 0);

  function showToast(msg) {
    setToast(msg);
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => setToast(""), 2200);
  }

  function updatePlayer(id, patch) {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }
  function toggleGrenade(id, gid) {
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const has = p.grenades.includes(gid);
        return { ...p, grenades: has ? p.grenades.filter((g) => g !== gid) : [...p.grenades, gid] };
      })
    );
  }

  function onZoneClick(zoneId) {
    const zone = ZONES.find((z) => z.id === zoneId);
    if (step === 1 || step === 3) {
      updatePlayer(activePlayerId, { zone: zoneId });
      showToast(`${activePlayer.name} posicionado em ${zone.label}`);
    } else if (step === 2) {
      if (activePlayer.grenades.length === 0) {
        showToast(`${activePlayer.name} não está carregando granadas`);
        return;
      }
      if (!activePlayer.zone) {
        showToast(`Defina a posição de ${activePlayer.name} antes de mirar a utilidade`);
        return;
      }
      updatePlayer(activePlayerId, { utilTarget: zoneId });
      showToast(`${activePlayer.name} vai jogar ${grenadeById(activePlayer.grenades[0]).name} em ${zone.label}`);
    }
  }

  function onRandom() {
    if (step === 0) {
      setPlayers((prev) =>
        prev.map((p) => {
          const grenPool = ["flash", "smoke", "molotov", "he"];
          const n = Math.floor(Math.random() * 3);
          const gset = new Set();
          while (gset.size < n) gset.add(grenPool[Math.floor(Math.random() * grenPool.length)]);
          return {
            ...p,
            weapon: WEAPONS[Math.floor(Math.random() * WEAPONS.length)].id,
            armor: Math.random() > 0.4 ? "vest" : "none",
            grenades: [...gset],
          };
        })
      );
      showToast("Compra sorteada para o time");
    } else if (step === 1 || step === 3) {
      setPlayers((prev) =>
        prev.map((p) => ({
          ...p,
          zone: CT_SELECTABLE_ZONES[Math.floor(Math.random() * CT_SELECTABLE_ZONES.length)],
          ...(step === 3 ? { style: STYLES[Math.floor(Math.random() * STYLES.length)].id } : {}),
        }))
      );
      showToast("Posições sorteadas para o time");
    } else if (step === 2) {
      setPlayers((prev) =>
        prev.map((p) =>
          p.grenades.length > 0 && p.zone
            ? { ...p, utilTarget: CT_SELECTABLE_ZONES[Math.floor(Math.random() * CT_SELECTABLE_ZONES.length)] }
            : p
        )
      );
      showToast("Alvos de utilidade sorteados");
    }
  }

  function startSimulation() {
    const r = simulateRound(players);
    setResult(r);
    setPhase("simulation");
  }

  function afterSimulation() {
    if (result.outcome.winner === "CT") setCtScore((s) => s + 1);
    else setTrScore((s) => s + 1);
    setPlayers(freshPlayers());
    setStep(0);
    setActivePlayerId(1);
    setResult(null);
    setPhase("setup");
  }

  if (phase === "simulation" && result) {
    return (
      <div className="min-h-screen">
        <TopBar ctScore={ctScore} trScore={trScore} teamMoney={teamMoney} onRandom={() => {}} roundLabel="ROUND EM ANDAMENTO" />
        <SimulationView result={result} onContinue={afterSimulation} />
      </div>
    );
  }

  const tokens = players
    .filter((p) => p.zone)
    .map((p) => ({
      id: p.id,
      team: "CT",
      zoneId: p.zone,
      alive: true,
      short: p.id,
      label: p.name,
      selected: p.id === activePlayerId,
      onClick: () => setActivePlayerId(p.id),
    }));

  const utilMarkers = players
    .filter((p) => p.zone && p.utilTarget)
    .map((p) => ({
      fromZoneId: p.zone,
      toZoneId: p.utilTarget,
      icon: grenadeById(p.grenades[0] ?? "smoke")?.icon ?? "💨",
    }));

  const mapInstructions = [
    "Selecione um jogador na lista e defina a compra dele",
    "Selecione um jogador e clique numa zona pra posicioná-lo",
    "Selecione um jogador com granada e clique no alvo do arremesso",
    "Selecione um jogador, confirme a zona e escolha o estilo",
    "Revise o plano — o round está pronto para simular",
  ];
  const phaseTags = ["FASE: COMPRA", "FASE: POSIÇÃO INICIAL", "FASE: UTILITÁRIAS", "FASE: POSIÇÃO FINAL", "FASE: SIMULAÇÃO"];

  return (
    <div className="min-h-screen">
      <TopBar ctScore={ctScore} trScore={trScore} teamMoney={teamMoney} onRandom={onRandom} roundLabel="ROUND 1 · PISTOL" />
      <Stepper currentStep={step} onJump={setStep} />

      <div className="grid grid-cols-[300px_1fr_300px] gap-px bg-line" style={{ height: "calc(100vh - 128px)" }}>
        <div className="bg-panel p-4.5 overflow-y-auto">
          {step === 0 && (
            <BuyPanel
              player={activePlayer}
              remaining={remaining}
              onSet={(field, val) => updatePlayer(activePlayerId, { [field]: val })}
              onToggleGrenade={(gid) => toggleGrenade(activePlayerId, gid)}
            />
          )}
          {step === 1 && (
            <div>
              <div className="font-display text-[13px] tracking-wider uppercase mb-3.5">Posição Inicial</div>
              <div className="text-[11.5px] text-textFaint border border-dashed border-line p-4 mb-3.5 text-center">
                Clique num jogador na lista à direita, depois clique numa zona no mapa pra posicioná-lo defendendo o
                round.
              </div>
              <RosterPanel
                players={players}
                activePlayerId={activePlayerId}
                onSelect={setActivePlayerId}
                remaining={remaining}
                show={{ zone: true, money: true }}
              />
            </div>
          )}
          {step === 2 && (
            <div>
              <div className="font-display text-[13px] tracking-wider uppercase mb-3.5">Utilitárias</div>
              <div className="text-[11.5px] text-textFaint border border-dashed border-line p-4 mb-3.5 text-center">
                Escolha o jogador e clique numa zona no mapa pra definir onde a primeira granada dele vai cair.
              </div>
              <RosterPanel
                players={players}
                activePlayerId={activePlayerId}
                onSelect={setActivePlayerId}
                remaining={remaining}
                show={{ util: true, zone: true }}
              />
              {activePlayer.grenades.length > 0 ? (
                <div className="mt-3.5 text-[11.5px] text-textMuted">
                  Granada usada: <b className="text-textPrimary">{grenadeById(activePlayer.grenades[0]).name}</b>
                </div>
              ) : (
                <div className="mt-3.5 text-[11.5px] text-red">{activePlayer.name} não comprou granadas.</div>
              )}
            </div>
          )}
          {step === 3 && (
            <div>
              <div className="font-display text-[13px] tracking-wider uppercase mb-3.5">Posição Final</div>
              <div className="text-[11.5px] text-textFaint border border-dashed border-line p-4 mb-3.5 text-center">
                Confirme (ou ajuste) a zona, e escolha o estilo de jogo de cada player.
              </div>
              <RosterPanel
                players={players}
                activePlayerId={activePlayerId}
                onSelect={setActivePlayerId}
                remaining={remaining}
                show={{ zone: true, style: true }}
              />
              <StylePanel player={activePlayer} onSetStyle={(sid) => updatePlayer(activePlayerId, { style: sid })} />
            </div>
          )}
          {step === 4 && (
            <div>
              <div className="font-display text-[13px] tracking-wider uppercase mb-3.5">Resumo do Round</div>
              <div className="text-xs text-textMuted leading-relaxed">
                Compra, posição e utilidades definidas. O time TR será revelado apenas quando a simulação começar.
              </div>
              <div className="text-[11.5px] text-textFaint border border-dashed border-line p-4 mt-4 text-center">
                O motor de simulação roda a IA do time TR, movimento e trocas com base no que você definiu.
              </div>
            </div>
          )}
        </div>

        <div className="bg-void flex flex-col">
          <div className="flex items-center justify-between px-4.5 py-2.5 border-b border-line">
            <span className="font-display text-xs tracking-wider uppercase">{mapInstructions[step]}</span>
            <span className="font-display text-xs tracking-wider uppercase text-textPrimary">{phaseTags[step]}</span>
          </div>
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-[680px]">
              <MapView tokens={tokens} utilMarkers={utilMarkers} onZoneClick={onZoneClick} showZoneHotspots={step === 1 || step === 2 || step === 3} />
            </div>
          </div>
        </div>

        <div className="bg-panel p-4.5 overflow-y-auto">
          <div className="font-display text-[13px] tracking-wider uppercase mb-3.5 flex items-center justify-between">
            Elenco <span className="font-body normal-case text-[11px] text-textFaint">CT</span>
          </div>
          <RosterPanel
            players={players}
            activePlayerId={activePlayerId}
            onSelect={setActivePlayerId}
            remaining={remaining}
            show={
              step === 0
                ? { money: true }
                : step === 1
                ? { zone: true }
                : step === 2
                ? { util: true, zone: true }
                : { zone: true, style: true }
            }
          />
        </div>
      </div>

      <div className="flex items-center justify-between px-6 py-3 border-t border-line bg-gradient-to-t from-[#151619] to-[#101114]">
        <button
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className="font-display uppercase text-xs tracking-wider px-5 py-2.5 border border-line bg-transparent disabled:opacity-30 disabled:cursor-not-allowed hover:border-textFaint"
        >
          ← Voltar
        </button>
        <button
          onClick={() => (step === 4 ? startSimulation() : setStep((s) => Math.min(4, s + 1)))}
          className="font-display uppercase text-xs tracking-wider px-5 py-2.5 border border-orange text-orange bg-orange/10 hover:bg-orange/20"
        >
          {step === 4 ? "Iniciar Simulação →" : "Avançar →"}
        </button>
      </div>

      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-card border border-orange text-textPrimary px-5 py-3 text-[12.5px] z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
