// Zone graph: each zone is a node on the map. `edges` are the zones it has a
// direct sightline/path to (used both for pathfinding and for combat checks —
// two players can only "see" each other if they're in the same zone or in
// zones connected by an edge).
export const ZONES = [
  { id: "t_spawn", label: "T Spawn", x: 62, y: 5, edges: ["t_mid_entry", "b_main"] },
  { id: "t_mid_entry", label: "Mid (Lado T)", x: 55, y: 20, edges: ["t_spawn", "mid"] },
  { id: "b_main", label: "B Principal", x: 80, y: 18, edges: ["t_spawn", "b_kitchen"] },

  { id: "a_site", label: "Bombsite A", x: 24, y: 15, edges: ["a_long", "a_ramp"] },
  { id: "a_long", label: "A Long", x: 20, y: 39, edges: ["a_site", "ct_spawn", "a_ramp"] },
  { id: "a_ramp", label: "Rampa A", x: 35, y: 27, edges: ["a_site", "a_long", "mid"] },

  { id: "mid", label: "Mid", x: 51, y: 41, edges: ["a_ramp", "t_mid_entry", "catwalk", "connector"] },
  { id: "catwalk", label: "Passarela", x: 60, y: 50, edges: ["mid", "connector", "b_kitchen"] },
  { id: "connector", label: "Conector", x: 72, y: 61, edges: ["mid", "catwalk", "b_back"] },

  { id: "b_kitchen", label: "Cozinha B", x: 74, y: 25, edges: ["b_main", "catwalk", "b_site"] },
  { id: "b_site", label: "Bombsite B", x: 78, y: 35, edges: ["b_kitchen", "b_back"] },
  { id: "b_back", label: "Fundos B", x: 88, y: 62, edges: ["connector", "b_site", "under"] },

  { id: "under", label: "Sob B", x: 39, y: 89, edges: ["ct_spawn", "b_back"] },
  { id: "ct_spawn", label: "Spawn CT", x: 20, y: 83, edges: ["a_long", "under"] },
];

export const ZONE_MAP = Object.fromEntries(ZONES.map((z) => [z.id, z]));

export const SITES = ["a_site", "b_site"];

// Zones a CT player is allowed to pick as a defensive position.
// (excludes the raw T spawn area, which is only used by the enemy AI as its start point)
export const CT_SELECTABLE_ZONES = ZONES.filter((z) => z.id !== "t_spawn").map((z) => z.id);
