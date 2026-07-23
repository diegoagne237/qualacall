// Zone graph: each zone is a node on the map. `edges` are the zones it has a
// direct sightline/path to (used both for pathfinding and for combat checks).
// ctSelectable marks zones the coach is allowed to place CT players in —
// based on the actual CT starting area highlighted on the reference map.
export const ZONES = [
  // --- CT territory (selectable) ---
  { id: "base_ct", label: "Base CT", x: 55, y: 8, edges: ["elevador", "varanda"], ctSelectable: true },
  { id: "elevador", label: "Elevador", x: 72, y: 10, edges: ["base_ct", "rampa_bomb"], ctSelectable: true },
  { id: "rampa_bomb", label: "Rampa Bomb", x: 80, y: 16, edges: ["elevador", "b_kitchen"], ctSelectable: true },

  { id: "a_site", label: "Bombsite A", x: 24, y: 15, edges: ["caixa_gorda", "rampa_a"], ctSelectable: true },
  { id: "caixa_gorda", label: "Caixa Gorda", x: 18, y: 26, edges: ["a_site", "a_long", "rampa_a"], ctSelectable: true },
  { id: "a_long", label: "A Long", x: 20, y: 39, edges: ["caixa_gorda", "fundo_tr", "rampa_a"], ctSelectable: true },
  { id: "rampa_a", label: "Rampa A", x: 35, y: 27, edges: ["a_site", "caixa_gorda", "a_long", "meio"], ctSelectable: true },

  { id: "varanda", label: "Varanda", x: 50, y: 22, edges: ["base_ct", "porta_meio", "escada"], ctSelectable: true },
  { id: "porta_meio", label: "Porta Meio", x: 48, y: 32, edges: ["varanda", "meio"], ctSelectable: true },
  { id: "meio", label: "Meio", x: 51, y: 41, edges: ["rampa_a", "porta_meio", "catwalk", "connector"], ctSelectable: true },
  { id: "escada", label: "Escada", x: 58, y: 33, edges: ["varanda", "b_kitchen"], ctSelectable: true },
  { id: "catwalk", label: "Passarela", x: 60, y: 50, edges: ["meio", "connector", "b_kitchen"], ctSelectable: true },

  { id: "b_kitchen", label: "Cozinha B", x: 74, y: 25, edges: ["rampa_bomb", "escada", "catwalk", "b_site"], ctSelectable: true },
  { id: "b_site", label: "Bombsite B", x: 78, y: 35, edges: ["b_kitchen", "azul"], ctSelectable: true },
  { id: "connector", label: "Conector", x: 72, y: 61, edges: ["meio", "catwalk", "b_back"], ctSelectable: true },
  { id: "azul", label: "Azul", x: 85, y: 48, edges: ["b_site", "b_back"], ctSelectable: true },
  { id: "b_back", label: "Fundos B", x: 88, y: 62, edges: ["connector", "azul", "under"], ctSelectable: true },

  // --- T-only territory (not selectable by CT) ---
  { id: "under", label: "Escurinho", x: 39, y: 89, edges: ["b_back", "fundo_tr", "base_tr"], ctSelectable: false },
  { id: "fundo_tr", label: "Fundo TR", x: 30, y: 90, edges: ["a_long", "under", "base_tr"], ctSelectable: false },
  { id: "base_tr", label: "Base TR", x: 20, y: 85, edges: ["fundo_tr", "under"], ctSelectable: false },
];

export const ZONE_MAP = Object.fromEntries(ZONES.map((z) => [z.id, z]));

export const SITES = ["a_site", "b_site"];

export const CT_SELECTABLE_ZONES = ZONES.filter((z) => z.ctSelectable).map((z) => z.id);

export const CT_SPAWN = "base_ct";
export const TR_SPAWN = "base_tr";
