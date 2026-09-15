import React from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import Catalog from './pages/Catalog';
import ProductDetails from './pages/ProductDetails';
import { STORE_URL, INSTAGRAM_URL, WHATSAPP_NUMBER, PROMO_BANNER } from './config';
import './index.css';

// Banner promocional que expira sozinho em PROMO_BANNER.expiresAt — não precisa de
// novo deploy pra sumir na hora certa; enquanto a aba fica aberta, some ao vivo.
function PromoBanner() {
  const [visible, setVisible] = React.useState(
    () => PROMO_BANNER.active && Date.now() < new Date(PROMO_BANNER.expiresAt).getTime(),
  );

  React.useEffect(() => {
    if (!visible) return undefined;
    const msLeft = new Date(PROMO_BANNER.expiresAt).getTime() - Date.now();
    if (msLeft <= 0) { setVisible(false); return undefined; }
    const timer = setTimeout(() => setVisible(false), msLeft);
    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;
  return (
    <a href={PROMO_BANNER.link} target="_blank" rel="noopener noreferrer" className="promo-banner" aria-label={PROMO_BANNER.alt}>
      <img src={PROMO_BANNER.image} alt={PROMO_BANNER.alt} />
    </a>
  );
}

function App() {
  return (
    <HashRouter>
      <div className="app">
        <header className="main-header">
          <div className="header-container">
            <Link to="/" className="logo-link">
              <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Chumbada Oficial Logo" className="brand-logo" />
            </Link>

            <nav className="nav-menu" aria-label="Navegação Principal">
              <Link to="/" className="nav-item active">Produtos</Link>
              <a href={STORE_URL} target="_blank" rel="noopener noreferrer" className="nav-item btn-nav">Site Oficial</a>
            </nav>
          </div>
        </header>

        <PromoBanner />

        <main className="app-container">
          <Routes>
            <Route path="/" element={<Catalog />} />
            <Route path="/product/:handle" element={<ProductDetails />} />
          </Routes>
        </main>

        <footer className="main-footer">
          <div className="footer-container">
            <div className="footer-brand">
              <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Chumbada Oficial Logo" className="footer-logo" style={{ height: '38px', width: 'auto', backgroundColor: '#ffffff', padding: '2px', borderRadius: '6px' }} />
              <p className="footer-desc">Catálogo oficial de anzóis e jig heads da Chumbada Oficial — da linha Premium Quimipoint aos jig heads técnicos. Referência para revendedores, parceiros e pescadores esportivos.</p>
            </div>

            <div className="footer-links">
              <h4 className="footer-title">Links Úteis</h4>
              <ul>
                <li><a href={STORE_URL} target="_blank" rel="noopener noreferrer">Loja Oficial</a></li>
                <li><a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">Instagram</a></li>
                <li><a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">WhatsApp Suporte</a></li>
              </ul>
            </div>

            <div className="footer-bottom">
              <p>&copy; 2026 Chumbada Oficial. Todos os direitos reservados. Anzóis &amp; Jig Heads de alta performance.</p>
            </div>
          </div>
        </footer>
      </div>
    </HashRouter>
  );
}

export default App;
