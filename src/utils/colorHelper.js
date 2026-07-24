// Mapeamento de cores de anzóis/jig heads → swatch CSS (gradiente ou cor sólida).
// Diferente das iscas (que usam fotos), aqui as cores são acabamentos metálicos/pintura.

export const normalizeString = (str) =>
  (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '');

// key normalizada → background CSS
const COLOR_MAP = {
  natural: 'linear-gradient(135deg, #d9d2c5, #b3a692)', // acabamento natural / bronze claro
  niquel: 'linear-gradient(135deg, #f0f2f5, #b8bfc7 55%, #8a929b)', // níquel polido
  prata: 'linear-gradient(135deg, #f5f7fa, #c3cad2 55%, #9aa2ab)',
  dourado: 'linear-gradient(135deg, #f7e6a2, #d4af37 55%, #a8801a)',
  ouro: 'linear-gradient(135deg, #f7e6a2, #d4af37 55%, #a8801a)',
  azul: 'linear-gradient(135deg, #4b8dd6, #1e4f9c)',
  preto: 'linear-gradient(135deg, #3a3a3a, #0d0d0d)',
  preta: 'linear-gradient(135deg, #3a3a3a, #0d0d0d)',
  vermelho: 'linear-gradient(135deg, #f0564a, #b91c1c)',
  vermelha: 'linear-gradient(135deg, #f0564a, #b91c1c)',
  amarelo: 'linear-gradient(135deg, #ffe066, #eab308)',
  amarela: 'linear-gradient(135deg, #ffe066, #eab308)',
  laranja: 'linear-gradient(135deg, #fb923c, #ea580c)',
  cafe: 'linear-gradient(135deg, #7a5230, #4a2f18)', // acabamento café
  bronze: 'linear-gradient(135deg, #cd9b62, #92642f)',
  verde: 'linear-gradient(135deg, #4ade80, #16a34a)',
  branco: 'linear-gradient(135deg, #ffffff, #e2e8f0)',
  rosa: 'linear-gradient(135deg, #f9a8d4, #db2777)',
};

// Detecta uma cor a partir de um texto livre (título do produto, valor de opção, tag)
export const getColorFromText = (text) => {
  const n = normalizeString(text);
  if (!n) return null;
  // ordem importa: termos mais específicos primeiro
  const order = [
    'niquel', 'dourado', 'ouro', 'vermelha', 'vermelho', 'amarela', 'amarelo',
    'laranja', 'preta', 'preto', 'azul', 'cafe', 'bronze', 'natural', 'prata',
    'verde', 'branco', 'rosa',
  ];
  for (const key of order) {
    if (n.includes(key)) return { key, css: COLOR_MAP[key] };
  }
  return null;
};

// Retorna o background CSS de um valor de cor (para swatches na página de produto)
export const getSwatchStyle = (colorName) => {
  const found = getColorFromText(colorName);
  if (found) return { background: found.css };
  return { background: 'linear-gradient(135deg, #e2e8f0, #cbd5e1)' };
};
