import { areAdjacent, shortestPath } from "./pathfinding";
import { buildEnemyPlan } from "./teamAI";
import { weaponById, styleById } from "../data/catalog";

export const ROUND_TICKS = 24; // compressed round (~115s of game time)
const DEFUSE_TICKS = 6; // ticks after plant before detonation

function rand() {
  return Math.random();
}

function buildCTPlayers(ctConfig) {
  return ctConfig.map((p) => {
    const dest = p.zone || "ct_spawn";
    const path = shortestPath("ct_spawn", dest) || ["ct_spawn"];
    return {
      id: `ct${p.id}`,
      name: p.name,
      team: "CT",
      alive: true,
      zone: "ct_spawn",
      path,
      pathIndex: 0,
      weapon: p.weapon,
      armor: p.armor,
      grenades: p.grenades || [],
      utilTarget: p.utilTarget || null,
      style: p.style || "site",
      ambushAvailable: p.style === "hidden",
      statusPenaltyTicks: 0,
      hasEnteredDest: false,
    };
  });
}

function advance(player) {
  if (player.pathIndex < player.path.length - 1) {
    player.pathIndex += 1;
    player.zone = player.path[player.pathIndex];
    return true;
  }
  return false;
}

function applyUtilityOnEntry(enteringPlayer, allPlayers, tick, events) {
  if (tick > 10) return; // pre-placed utility only relevant early in the round
  const enemies = allPlayers.filter((p) => p.team !== enteringPlayer.team && p.alive);
  for (const enemy of enemies) {
    if (enemy.utilTarget === enteringPlayer.zone && enemy.grenades.length > 0) {
      const nadeId = enemy.grenades[0];
      if (nadeId === "molotov") {
        if (rand() < 0.22) {
          enteringPlayer.alive = false;
          events.push({ tick, type: "kill", killer: enemy.name, killerTeam: enemy.team, victim: enteringPlayer.name, victimTeam: enteringPlayer.team, weapon: "Molotov" });
        } else {
          enteringPlayer.statusPenaltyTicks = 2;
          events.push({ tick, type: "utility", nade: "molotov", zone: enteringPlayer.zone, thrower: enemy.name, affected: enteringPlayer.name });
        }
      } else if (nadeId === "flash") {
        enteringPlayer.statusPenaltyTicks = 2;
        events.push({ tick, type: "utility", nade: "flash", zone: enteringPlayer.zone, thrower: enemy.name, affected: enteringPlayer.name });
      } else if (nadeId === "he") {
        enteringPlayer.statusPenaltyTicks = 1;
        events.push({ tick, type: "utility", nade: "he", zone: enteringPlayer.zone, thrower: enemy.name, affected: enteringPlayer.name });
      } else if (nadeId === "smoke") {
        enteringPlayer.statusPenaltyTicks = Math.max(enteringPlayer.statusPenaltyTicks, 1);
        events.push({ tick, type: "utility", nade: "smoke", zone: enteringPlayer.zone, thrower: enemy.name, affected: enteringPlayer.name });
      }
      enemy.grenades = enemy.grenades.slice(1);
    }
  }
}

function duelChance(ct, tr) {
  let chance = 50;
  chance += (weaponById(ct.weapon).power - weaponById(tr.weapon).power) * 20;
  if (ct.armor === "vest") chance += 8;

  const ctStyle = styleById(ct.style);
  if (ctStyle) {
    if (ct.style === "hidden" && ct.ambushAvailable) chance += 15;
    if (ct.style === "passive") chance += 5;
    if (ct.style === "rush") chance -= 5;
    if (ct.style === "midctrl" && ct.zone === "mid") chance += 5;
  }

  if (ct.statusPenaltyTicks > 0) chance -= 20;
  if (tr.statusPenaltyTicks > 0) chance += 20;

  return Math.max(8, Math.min(92, chance));
}

// Runs the whole round up front and returns a frame-by-frame timeline the UI
// can play back at a fixed pace, plus the chronological event log (kills,
// utility triggers, plant/defuse) and the final outcome.
export function simulateRound(ctConfig) {
  const ctPlayers = buildCTPlayers(ctConfig);
  const { targetSite, players: trPlayers } = buildEnemyPlan(ctConfig);
  const all = [...ctPlayers, ...trPlayers];

  const events = [];
  const frames = [];
  let planted = false;
  let plantTick = null;
  let outcome = null;

  const snapshot = (tick) => ({
    tick,
    positions: Object.fromEntries(all.map((p) => [p.id, p.zone])),
    alive: Object.fromEntries(all.map((p) => [p.id, p.alive])),
    planted,
  });

  for (let tick = 0; tick < ROUND_TICKS && !outcome; tick++) {
    // 1. movement
    for (const p of all.filter((p) => p.alive)) {
      const moved = advance(p);
      if (moved) {
        events.push({ tick, type: "move", playerId: p.id, team: p.team, zone: p.zone });
        applyUtilityOnEntry(p, all, tick, events);
      }
    }

    // 2. combat: any alive CT/TR pair sharing or adjacent zones fights it out
    const aliveCT = () => ctPlayers.filter((p) => p.alive);
    const aliveTR = () => trPlayers.filter((p) => p.alive);
    for (const ct of aliveCT()) {
      for (const tr of aliveTR()) {
        if (!ct.alive || !tr.alive) continue;
        if (!areAdjacent(ct.zone, tr.zone)) continue;
        const chance = duelChance(ct, tr);
        const ctWins = rand() * 100 < chance;
        const winner = ctWins ? ct : tr;
        const loser = ctWins ? tr : ct;
        loser.alive = false;
        events.push({
          tick,
          type: "kill",
          killer: winner.name,
          killerTeam: winner.team,
          victim: loser.name,
          victimTeam: loser.team,
          weapon: weaponById(winner.weapon || "usp").name,
          headshot: rand() < 0.3,
        });
        if (ct.style === "hidden") ct.ambushAvailable = false;
      }
    }
    // decay status penalties
    for (const p of all) if (p.statusPenaltyTicks > 0) p.statusPenaltyTicks -= 1;

    // 3. plant check
    if (!planted) {
      const trAtSite = aliveTR().filter((p) => p.zone === targetSite);
      const ctContesting = aliveCT().filter((p) => areAdjacent(p.zone, targetSite));
      const allCTDead = aliveCT().length === 0;
      if (trAtSite.length > 0 && (ctContesting.length === 0 || allCTDead)) {
        planted = true;
        plantTick = tick;
        events.push({ tick, type: "plant", site: targetSite, by: trAtSite[0].name });
      }
    }

    // 4. win conditions
    if (aliveTR().length === 0) {
      outcome = { winner: "CT", reason: "elimination" };
    } else if (aliveCT().length === 0) {
      outcome = planted
        ? { winner: "TR", reason: "detonation" }
        : { winner: "TR", reason: "elimination_no_resistance" };
    } else if (planted) {
      const ctAtSite = aliveCT().filter((p) => p.zone === targetSite);
      const trDefending = aliveTR().filter((p) => areAdjacent(p.zone, targetSite));
      if (ctAtSite.length > 0 && trDefending.length === 0 && tick - plantTick >= 2) {
        outcome = { winner: "CT", reason: "defuse" };
      } else if (tick - plantTick >= DEFUSE_TICKS) {
        outcome = { winner: "TR", reason: "detonation" };
      }
    }

    frames.push(snapshot(tick));

    if (outcome) {
      events.push({ tick, type: "round_end", winner: outcome.winner, reason: outcome.reason });
    }
  }

  if (!outcome) {
    outcome = planted ? { winner: "TR", reason: "detonation" } : { winner: "CT", reason: "time" };
    events.push({ tick: ROUND_TICKS - 1, type: "round_end", winner: outcome.winner, reason: outcome.reason });
  }

  return {
    targetSite,
    ctPlayers: ctPlayers.map((p) => ({ id: p.id, name: p.name, team: p.team })),
    trPlayers: trPlayers.map((p) => ({ id: p.id, name: p.name, team: p.team })),
    frames,
    events,
    outcome,
  };
}
