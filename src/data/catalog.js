export const WEAPONS = [
  { id: "usp", name: "USP-S / Glock", price: 0, power: 1 },
  { id: "p250", name: "P250", price: 300, power: 1.15 },
  { id: "dualies", name: "Dualies", price: 400, power: 1.2 },
  { id: "deagle", name: "Desert Eagle", price: 700, power: 1.4 },
];

export const ARMOR = [
  { id: "none", name: "Sem colete", price: 0 },
  { id: "vest", name: "Colete", price: 650 },
];

export const GRENADES = [
  { id: "flash", name: "Flashbang", price: 200, icon: "⚡" },
  { id: "smoke", name: "Smoke", price: 300, icon: "💨" },
  { id: "molotov", name: "Molotov", price: 400, icon: "🔥" },
  { id: "he", name: "HE Grenade", price: 300, icon: "💣" },
];

export const STYLES = [
  { id: "rush", name: "Rushar", desc: "Avança rápido, mais exposto." },
  { id: "site", name: "Ficar no bomb", desc: "Segura o site, joga defensivo." },
  { id: "passive", name: "Recuado", desc: "Joga pra trás, evita troca ruim." },
  { id: "hidden", name: "Escondido", desc: "Fica parado esperando, bônus de surpresa." },
  { id: "midctrl", name: "Controle de mid", desc: "Disputa o meio do mapa." },
];

export const STARTING_MONEY = 800;

export function grenadeById(id) {
  return GRENADES.find((g) => g.id === id);
}
export function weaponById(id) {
  return WEAPONS.find((w) => w.id === id);
}
export function armorById(id) {
  return ARMOR.find((a) => a.id === id);
}
export function styleById(id) {
  return STYLES.find((s) => s.id === id);
}
