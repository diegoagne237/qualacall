import { SITES, TR_SPAWN } from "../data/zones";
import { shortestPath, areAdjacent } from "./pathfinding";
import { GRENADES, weaponsByCategory } from "../data/catalog";

const TR_NAMES = ["Rival 1", "Rival 2", "Rival 3", "Rival 4", "Rival 5"];
const TR_PISTOLS = weaponsByCategory("pistol");

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
    zone: TR_SPAWN,
    path: [],
    pathIndex: 0,
    weapon: Math.random() > 0.3 ? TR_PISTOLS[Math.floor(Math.random() * TR_PISTOLS.length)].id : "usp",
    armor: Math.random() > 0.5,
    grenades: Math.random() > 0.4 ? [GRENADES[Math.floor(Math.random() * GRENADES.length)].id] : [],
    style: i === 4 ? "site" : "rush",
    statusPenaltyTicks: 0,
  }));

  // 4 players push the chosen site, 1 holds/lurks mid for info.
  players.forEach((p, i) => {
    const dest = i === 4 ? "meio" : targetSite;
    const path = shortestPath(TR_SPAWN, dest) || [TR_SPAWN];
    p.path = path;
  });

  return { targetSite, players };
}
