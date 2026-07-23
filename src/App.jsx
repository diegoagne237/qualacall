import { useState } from "react";
import TopBar from "./components/TopBar";
import Stepper from "./components/Stepper";
import MapView from "./components/MapView";
import RosterPanel from "./components/RosterPanel";
import SimulationView from "./components/SimulationView";
import { CT_SELECTABLE_ZONES, ZONE_MAP } from "./data/zones";
import {
  WEAPONS,
  ARMOR_PRICE,
  GRENADES,
  STYLES,
  STARTING_MONEY,
  PLAYER_COLORS,
  weaponById,
  grenadeById,
} from "./data/catalog";
import { simulateRound } from "./engine/simulate";

const ROLES = ["Entry", "Support", "Lurker", "AWP", "IGL"];

function freshPlayers() {
  return PLAYER_COLORS.map((c, i) => ({
    id: i + 1,
    name: c.name,
    colorHex: c.hex,
    role: ROLES[i],
    money: STARTING_MONEY,
    weapon: "usp",
    armor: false,
    grenades: [],
    zone: null,
    utilTarget: null,
    style: null,
  }));
}

function spent(p) {
  const grenadePrice = p.grenades[0] ? grenadeById(p.grenades[0]).price : 0;
  return weaponById(p.weapon).price + (p.armor ? ARMOR_PRICE : 0) + grenadePrice;
}
function remaining(p) {
  return p.money - spent(p);
}

const MODE_BY_STEP = ["buy", "position", "utility", "attitude", "attitude"];
const PHASE_TAGS = ["FASE: COMPRA", "FASE: POSIÇÃO INICIAL", "FASE: UTILITÁRIAS", "FASE: ATITUDE", "FASE: SIMULAÇÃO"];
const MAP_INSTRUCTIONS = [
  "Selecione um jogador na lista e defina a compra dele",
  "Selecione um jogador e clique numa zona pra posicioná-lo",
  "Selecione um jogador com granada e clique no alvo do arremesso",
  "Confirme a posição e escolha a atitude de cada jogador",
  "Revise o plano — o round está pronto para simular",
];

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
  const roundNumber = ctScore + trScore + 1;

  function showToast(msg) {
    setToast(msg);
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => setToast(""), 2200);
  }

  function updatePlayer(id, patch) {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  function onSetWeapon(id, weaponId) {
    updatePlayer(id, { weapon: weaponId });
  }
  function onToggleArmor(id) {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, armor: !p.armor } : p)));
  }
  function onSetGrenade(id, gid) {
    updatePlayer(id, { grenades: gid ? [gid] : [], utilTarget: gid ? players.find((p) => p.id === id).utilTarget : null });
  }
  function onSetStyle(id, styleId) {
    updatePlayer(id, { style: styleId });
  }

  function onZoneClick(zoneId) {
    const zone = ZONE_MAP[zoneId];
    if (step === 1 || step === 3) {
      updatePlayer(activePlayerId, { zone: zoneId });
      showToast(`${activePlayer.name} posicionado em ${zone.label}`);
    } else if (step === 2) {
      if (activePlayer.grenades.length === 0) {
        showToast(`${activePlayer.name} não está carregando granada`);
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
          let budget = p.money;
          const affordableWeapons = WEAPONS.filter((w) => w.price <= budget);
          const useDefault = Math.random() < 0.15 || affordableWeapons.length === 0;
          const weapon = useDefault ? "usp" : affordableWeapons[Math.floor(Math.random() * affordableWeapons.length)].id;
          budget -= weaponById(weapon).price;
          const armor = budget >= ARMOR_PRICE && Math.random() > 0.4;
          if (armor) budget -= ARMOR_PRICE;
          const affordableGrenades = GRENADES.filter((g) => g.price <= budget);
          const useGrenade = affordableGrenades.length > 0 && Math.random() > 0.35;
          const grenade = useGrenade ? affordableGrenades[Math.floor(Math.random() * affordableGrenades.length)].id : null;
          return { ...p, weapon, armor, grenades: grenade ? [grenade] : [] };
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
      showToast("Alvo de utilidade sorteado");
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
      <div className="h-screen flex flex-col overflow-hidden">
        <TopBar ctScore={ctScore} trScore={trScore} teamMoney={teamMoney} roundLabel={`ROUND ${roundNumber}`} showRandom={false} />
        <SimulationView result={result} onContinue={afterSimulation} />
      </div>
    );
  }

  const tokens = players
    .filter((p) => p.zone)
    .map((p) => ({
      id: p.id,
      team: "CT",
      color: p.colorHex,
      zoneId: p.zone,
      alive: true,
      short: p.name.slice(0, 1),
      label: p.name,
      selected: p.id === activePlayerId,
      onClick: () => setActivePlayerId(p.id),
    }));

  const utilMarkers = players
    .filter((p) => p.zone && p.utilTarget && p.grenades[0])
    .map((p) => ({
      fromZoneId: p.zone,
      toZoneId: p.utilTarget,
      icon: grenadeById(p.grenades[0]).icon,
    }));

  const mode = MODE_BY_STEP[step];

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <TopBar ctScore={ctScore} trScore={trScore} teamMoney={teamMoney} onRandom={onRandom} roundLabel={`ROUND ${roundNumber}`} />
      <Stepper currentStep={step} onJump={setStep} />

      <div className="flex-1 min-h-0 grid grid-cols-[1fr_340px] gap-px bg-line">
        <div className="bg-void flex flex-col min-h-0">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-line shrink-0">
            <span className="font-display text-xs tracking-wider uppercase">{MAP_INSTRUCTIONS[step]}</span>
            <span className="font-display text-xs tracking-wider uppercase text-textPrimary">{PHASE_TAGS[step]}</span>
          </div>
          <div className="flex-1 min-h-0 flex items-center justify-center p-6">
            <div className="w-full max-w-[680px]">
              <MapView
                tokens={tokens}
                utilMarkers={utilMarkers}
                onZoneClick={onZoneClick}
                showZoneHotspots={step === 1 || step === 2 || step === 3}
              />
            </div>
          </div>
        </div>

        <div className="bg-panel p-4 overflow-y-auto min-h-0">
          <div className="font-display text-[13px] tracking-wider uppercase mb-3.5 flex items-center justify-between">
            Elenco <span className="font-body normal-case text-[11px] text-textFaint">CT</span>
          </div>
          <RosterPanel
            players={players}
            activePlayerId={activePlayerId}
            onSelect={setActivePlayerId}
            mode={mode}
            onSetWeapon={onSetWeapon}
            onToggleArmor={onToggleArmor}
            onSetGrenade={onSetGrenade}
            onSetStyle={onSetStyle}
          />
        </div>
      </div>

      <div className="flex items-center justify-between px-6 py-3 border-t border-line bg-gradient-to-t from-[#151619] to-[#101114] shrink-0">
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
