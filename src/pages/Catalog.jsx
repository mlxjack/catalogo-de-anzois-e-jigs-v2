import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { loadProducts, CATEGORIES, SECTION_ORDER } from '../utils/csvParser';
import ProductCard from '../components/ProductCard';
import { STORE_URL } from '../config';

const normalize = (s) =>
  (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

const SECTION_META = {
  'Anzóis Premium': {
    kicker: '匠 · Linha Premium',
    desc: 'Anzóis de competição com afiação química Quimipoint. Ponta ultrafina, penetração instantânea e resistência de elite.',
  },
  'Anzóis': { kicker: 'Anzóis Avulsos', desc: 'Modelos japoneses clássicos para as mais variadas modalidades.' },
  'Jig Heads': { kicker: 'Jig Heads', desc: 'Cabeças de chumbo articuladas e offset para iscas soft.' },
  'EWG': { kicker: 'Anzóis EWG', desc: 'Extra Wide Gap anti-enrosco, ideais para texas e iscas montadas.' },
  '90°': { kicker: 'Jig Head 90°', desc: 'Ângulo clássico para trabalho de meia água e fundo.' },
  '60°': { kicker: 'Jig Head 60°', desc: 'Ângulo de 60° para maior aproveitamento de fisgada.' },
  'Com Mola': { kicker: 'Com Mola', desc: 'Sistema de mola/sapatinho para fixação firme da isca.' },
};

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setProducts(await loadProducts());
      } catch (e) {
        console.error('Failed to load products', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const close = () => setDropdownOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const term = normalize(searchTerm);
  const filtered = products.filter((p) => {
    const matchesSearch =
      !term ||
      normalize(p.title).includes(term) ||
      normalize(p.category).includes(term) ||
      p.tags.some((t) => normalize(t).includes(term));
    const matchesCat = filterCategory === 'All' || p.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  const featured = products.find((p) => p.premium && p.images.length > 0) || products[0];
  const sectioned = filterCategory === 'All' && !term;

  const grouped = SECTION_ORDER.map((sec) => ({
    section: sec,
    items: filtered.filter((p) => p.category === sec),
  })).filter((g) => g.items.length > 0);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <style>{`.spinner{border:3px solid rgba(0,0,0,.06);width:36px;height:36px;border-radius:50%;border-left-color:var(--color-brand);animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="view-fade">
      {/* Hero */}
      <section className="hero" aria-label="Apresentação do Catálogo">
        <div className="hero-container">
          <div className="hero-content">
            <span className="badge-tag">Edição Oficial 2026</span>
            <h1 className="hero-title">
              Anzóis &amp; <span>Jig Heads</span>
            </h1>
            <p className="hero-desc">
              O catálogo completo de anzóis e jig heads da Chumbada Oficial. Da linha{' '}
              <strong>Premium Quimipoint</strong> — afiação química de competição — aos jig heads
              90°, 60°, EWG e modelos com mola. Especificações técnicas, fotos e todas as
              variações em um só lugar.
            </p>
            <div className="hero-actions">
              <a href="#catalogo-secao" className="btn btn-primary">Ver Catálogo</a>
              <a href={STORE_URL} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">Visitar Loja</a>
            </div>
          </div>

          {featured && (
            <div className="hero-card premium" aria-label="Destaque Premium">
              <Link to={`/product/${featured.id}`}>
                <div className="hero-card-media">
                  <img src={featured.images[0] || `${import.meta.env.BASE_URL}logo.png`} alt={featured.title} />
                </div>
              </Link>
              <div className="hero-card-body">
                <div className="hero-card-info">
                  <h3>{featured.title}</h3>
                  <p>{featured.premium ? 'Premium Quimipoint' : featured.category}</p>
                </div>
                <span className="hero-card-badge">匠 Premium</span>
              </div>
            </div>
          )}
        </div>
      </section>

      <main className="main-wrap" id="catalogo-secao" style={{ paddingTop: '3rem' }}>
        {/* Busca + filtros */}
        <section className="panel" aria-label="Painel de Busca e Filtros">
          <div className="tools">
            <div className="search-wrapper">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="search"
                className="search-input"
                placeholder="Buscar anzol, jig head, EWG, Kitsune..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoComplete="off"
              />
            </div>

            <div className="menu-dropdown-wrapper">
              <button
                className="hamburger-menu-btn"
                onClick={(e) => { e.stopPropagation(); setDropdownOpen(!dropdownOpen); }}
                type="button"
                aria-expanded={dropdownOpen}
                aria-label="Menu de Categorias"
              >
                <svg className="hamburger-icon" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
                <span>{filterCategory === 'All' ? 'Todas as categorias' : filterCategory}</span>
                <svg className="chevron-icon" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto', transition: 'transform .2s', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)' }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              <div className={`categories-dropdown ${dropdownOpen ? 'active' : ''}`}>
                <button className={`dropdown-item ${filterCategory === 'All' ? 'active' : ''}`} onClick={() => { setFilterCategory('All'); setDropdownOpen(false); }} type="button">
                  Todas as categorias
                </button>
                {CATEGORIES.map((c) => (
                  <button
                    key={c.key}
                    className={`dropdown-item ${filterCategory === c.key ? 'active' : ''} ${c.premium ? 'premium' : ''}`}
                    onClick={() => { setFilterCategory(c.key); setDropdownOpen(false); }}
                    type="button"
                  >
                    {c.premium ? '匠 ' : ''}{c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="summary-bar">
          <div className="summary-title">
            <h2>Nosso Catálogo</h2>
            <p>Selecione um produto para ver tamanhos, pesos, acabamentos e especificações técnicas completas.</p>
          </div>
          <div className="summary-count">
            {filtered.length} produto{filtered.length === 1 ? '' : 's'}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-results">
            <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ width: 48, height: 48, color: 'var(--color-text-muted)', marginBottom: 16 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 10-4.773-4.773 3.375 3.375 0 004.774 4.774zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3>Nenhum produto encontrado</h3>
            <p>Tente outros termos ou selecione outra categoria.</p>
          </div>
        ) : sectioned ? (
          grouped.map(({ section, items }) => {
            const meta = SECTION_META[section] || {};
            const isPremium = section === 'Anzóis Premium';
            return (
              <section key={section} className={`catalog-section ${isPremium ? 'premium-section' : ''}`} id={`sec-${normalize(section).replace(/[^a-z0-9]/g, '')}`}>
                {isPremium && <div className="oriental-pattern" aria-hidden="true" />}
                <header className="section-head">
                  <div>
                    <span className="section-kicker">{meta.kicker || section}</span>
                    <h2 className="section-title">{section}</h2>
                    {meta.desc && <p className="section-desc">{meta.desc}</p>}
                  </div>
                  <span className="section-count">{items.length}</span>
                </header>
                <div className="products-grid">
                  {items.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
              </section>
            );
          })
        ) : (
          <div className="products-grid">
            {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </main>
    </div>
  );
}
