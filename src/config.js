// Configuração central do catálogo — Anzóis & Jig Heads / Chumbada Oficial
// Esta é a ÚNICA diferença entre a versão "com preço" e "sem preço":
// no repositório sem preço, SHOW_PRICES = false.
export const SHOW_PRICES = false;

export const WHATSAPP_NUMBER = '5511941900602';
export const STORE_URL = 'https://chumbadas.com.br';
export const INSTAGRAM_URL = 'https://www.instagram.com/chumbadaoficial/';

// Banner promocional temporário — some sozinho no horário definido, sem precisar
// de novo deploy. Pra remover antes da hora, é só apagar este bloco e o <PromoBanner />
// no App.jsx (ou trocar `active: false`).
export const PROMO_BANNER = {
  active: true,
  image: 'https://cdn.shopify.com/s/files/1/0454/5845/6736/files/dia_do_cliente_2.png?v=1789475113',
  link: STORE_URL,
  alt: 'Dia do Cliente — Chumbada Oficial',
  expiresAt: '2026-09-15T23:59:59-03:00',
};
