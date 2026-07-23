export const WEAPON_CATEGORIES = [
  { id: "pistol", label: "Pistolas" },
  { id: "smg", label: "SMGs" },
  { id: "heavy", label: "Pesadas" },
  { id: "rifle", label: "Rifles" },
];

// The default/free option (USP-S / Glock) is intentionally NOT listed here —
// it's the implicit fallback when a player has no paid weapon selected.
export const WEAPONS = [
  { id: "p250", name: "P250", price: 300, power: 1.15, category: "pistol" },
  { id: "dualies", name: "Dualies", price: 400, power: 1.2, category: "pistol" },
  { id: "deagle", name: "Desert Eagle", price: 700, power: 1.4, category: "pistol" },

  { id: "mp9", name: "MP9", price: 1000, power: 1.3, category: "smg" },
  { id: "ump", name: "UMP-45", price: 1200, power: 1.4, category: "smg" },
  { id: "mp7", name: "MP7", price: 1500, power: 1.5, category: "smg" },
  { id: "p90", name: "P90", price: 2350, power: 1.6, category: "smg" },

  { id: "shotgun", name: "Nova", price: 1200, power: 1.3, category: "heavy" },
  { id: "autoshotgun", name: "XM1014", price: 2000, power: 1.5, category: "heavy" },
  { id: "lmg", name: "Negev", price: 1700, power: 1.7, category: "heavy" },

  { id: "rifle_budget", name: "Galil / FAMAS", price: 2000, power: 1.8, category: "rifle" },
  { id: "rifle_std", name: "AK-47 / M4A4", price: 2900, power: 2.0, category: "rifle" },
  { id: "rifle_burst", name: "AUG / SG 553", price: 3100, power: 2.1, category: "rifle" },
  { id: "sniper", name: "AWP", price: 4750, power: 2.6, category: "rifle" },
];

export const DEFAULT_WEAPON = { id: "usp", name: "USP-S / Glock", price: 0, power: 1, category: "pistol" };

export const ARMOR_PRICE = 650;

export const GRENADES = [
  { id: "flash", name: "Flashbang", price: 200, icon: "⚡" },
  { id: "smoke", name: "Smoke", price: 300, icon: "💨" },
  { id: "molotov", name: "Molotov", price: 400, icon: "🔥" },
  { id: "he", name: "HE Grenade", price: 300, icon: "💣" },
];

// v1 scope: only 3 attitudes.
export const STYLES = [
  { id: "rush", name: "Rushar", desc: "Avança rápido, mais exposto." },
  { id: "site", name: "Ficar", desc: "Segura a posição, joga defensivo." },
  { id: "passive", name: "Recuar", desc: "Vai até a posição e depois joga na defensiva, recuado." },
];

export const STARTING_MONEY = 800;

export const PLAYER_COLORS = [
  { id: "orange", name: "Laranja", hex: "#e59435" },
  { id: "yellow", name: "Amarelo", hex: "#e0c93f" },
  { id: "green", name: "Verde", hex: "#5cb87a" },
  { id: "blue", name: "Azul", hex: "#5f89b3" },
  { id: "purple", name: "Roxo", hex: "#9b6fd1" },
];

export function weaponById(id) {
  if (!id || id === "usp") return DEFAULT_WEAPON;
  return WEAPONS.find((w) => w.id === id) ?? DEFAULT_WEAPON;
}
export function grenadeById(id) {
  return GRENADES.find((g) => g.id === id);
}
export function styleById(id) {
  return STYLES.find((s) => s.id === id);
}
export function weaponsByCategory(categoryId) {
  return WEAPONS.filter((w) => w.category === categoryId);
}
