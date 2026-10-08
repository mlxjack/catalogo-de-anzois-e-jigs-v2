// Produtos para pesca em pesqueiro (filtro "Pesqueiro" do catálogo).
// IDs = handle do produto no products.csv.
export const PESQUEIRO_IDS = new Set([
  'anzol-chinu',
  'anzol-izumezina',
  'anzol-maruseigo',
  'anzol-maruseigo-xc',
]);

export const isPesqueiro = (p) => PESQUEIRO_IDS.has(p.id);
