import { ZONE_MAP } from "../data/zones";

// Returns an array of zone ids from `fromId` to `toId` (inclusive), shortest
// path by number of hops. Returns [fromId] if fromId === toId, or null if
// unreachable (shouldn't happen — graph is fully connected).
export function shortestPath(fromId, toId) {
  if (fromId === toId) return [fromId];
  const visited = new Set([fromId]);
  const queue = [[fromId]];
  while (queue.length) {
    const path = queue.shift();
    const last = path[path.length - 1];
    const zone = ZONE_MAP[last];
    if (!zone) continue;
    for (const next of zone.edges) {
      if (visited.has(next)) continue;
      const newPath = [...path, next];
      if (next === toId) return newPath;
      visited.add(next);
      queue.push(newPath);
    }
  }
  return null;
}

export function areAdjacent(zoneIdA, zoneIdB) {
  if (zoneIdA === zoneIdB) return true;
  const zone = ZONE_MAP[zoneIdA];
  return !!zone && zone.edges.includes(zoneIdB);
}
