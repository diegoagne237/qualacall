import { SITES } from "../data/zones";
import { shortestPath, areAdjacent } from "./pathfinding";
import { GRENADES, WEAPONS } from "../data/catalog";

const TR_NAMES = ["Rival 1", "Rival 2", "Rival 3", "Rival 4", "Rival 5"];

// Counts how many CT players are positioned at or adjacent to a site zone —
// a rough "defense strength" reading the AI uses to pick where to attack.
function defenseStrength(ctPlayers, siteId) {
  return ctPlayers.filter((p) => p.zone && areAdjacent(p.zone, siteId)).length;
}

// Builds the TR (enemy) team plan: simple + predictable, per the agreed v1 scope.
// Always picks the site with the weaker CT defense and sends the majority of
// the team there via the shortest path, keeping one player to hold/lurk mid.
export function buildEnemyPlan(ctPlayers) {
  const strengths = SITES.map((s) => ({ site: s, strength: defenseStrength(ctPlayers, s) }));
  strengths.sort((a, b) => a.strength - b.strength || (Math.random() < 0.5 ? -1 : 1));
  const targetSite = strengths[0].site;

  const players = TR_NAMES.map((name, i) => ({
    id: `t${i + 1}`,
    name,
    team: "TR",
    alive: true,
    zone: "t_spawn",
    path: [],
    pathIndex: 0,
    weapon: WEAPONS[Math.floor(Math.random() * WEAPONS.length)].id,
    armor: Math.random() > 0.5 ? "vest" : "none",
    grenades: Math.random() > 0.4 ? [GRENADES[Math.floor(Math.random() * GRENADES.length)].id] : [],
    style: i === 4 ? "midctrl" : "rush",
    statusPenaltyTicks: 0,
  }));

  // 4 players push the chosen site, 1 holds/lurks mid for info.
  players.forEach((p, i) => {
    const dest = i === 4 ? "mid" : targetSite;
    const path = shortestPath("t_spawn", dest) || ["t_spawn"];
    p.path = path;
  });

  return { targetSite, players };
}
