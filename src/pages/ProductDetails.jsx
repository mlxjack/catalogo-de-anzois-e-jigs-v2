import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { loadProducts } from '../utils/csvParser';
import { getSwatchStyle } from '../utils/colorHelper';
import { SHOW_PRICES, WHATSAPP_NUMBER, STORE_URL } from '../config';

const normalizeOpt = (str) =>
  str ? str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '') : '';

const matchOpt = (a, b) => {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return a === b || normalizeOpt(a) === normalizeOpt(b);
};

export default function ProductDetails() {
  const { handle } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [currentVariant, setCurrentVariant] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await loadProducts();
        const found = data.find((p) => p.id === handle);
        if (found) {
          if (found.images.length === 0) found.images = [`${import.meta.env.BASE_URL}logo.png`];
          setProduct(found);
          const init = {};
          Object.keys(found.options).forEach((k) => { init[k] = found.options[k][0]; });
          setSelectedOptions(init);
        }
      } catch (e) {
        console.error('Failed to load product', e);
      } finally {
        setLoading(false);
      }
    })();
    setActiveImage(0);
  }, [handle]);

  useEffect(() => {
    if (!product || Object.keys(selectedOptions).length === 0) return;
    const optionKeys = Object.keys(product.options);
    let matched = product.variants.find((v) => {
      let ok = true;
      if (optionKeys[0] && !matchOpt(v.option1, selectedOptions[optionKeys[0]])) ok = false;
      if (optionKeys[1] && !matchOpt(v.option2, selectedOptions[optionKeys[1]])) ok = false;
      if (optionKeys[2] && !matchOpt(v.option3, selectedOptions[optionKeys[2]])) ok = false;
      return ok;
    });
    if (!matched) {
      matched = product.variants.find((v) => {
        let ok = true;
        optionKeys.forEach((key, idx) => {
          if (!key.toLowerCase().includes('cor') && !key.toLowerCase().includes('color')) {
            const vVal = idx === 0 ? v.option1 : idx === 1 ? v.option2 : v.option3;
            const selVal = selectedOptions[key];
            if (vVal && selVal && !matchOpt(vVal, selVal)) ok = false;
          }
        });
        return ok;
      });
    }
    setCurrentVariant(matched || product.variants[0]);
  }, [selectedOptions, product]);

  const handleOptionSelect = (optionName, value) => {
    setSelectedOptions((prev) => {
      const next = { ...prev, [optionName]: value };
      if (!product) return next;
      const optionKeys = Object.keys(product.options);
      const exact = product.variants.find((v) => {
        const vVals = [v.option1, v.option2, v.option3];
        return optionKeys.every((key, idx) => matchOpt(vVals[idx], next[key]));
      });
      if (exact) return next;

      const targetColor = next['Cor'] || next['cor'] || next['Color'];
      let candidate = product.variants.find((v) => {
        const myIdx = optionKeys.indexOf(optionName);
        const vVal = myIdx === 0 ? v.option1 : myIdx === 1 ? v.option2 : v.option3;
        if (!matchOpt(vVal, value)) return false;
        if (targetColor) {
          const colorIdx = optionKeys.findIndex((k) => k.toLowerCase().includes('cor') || k.toLowerCase().includes('color'));
          if (colorIdx !== -1) {
            const vColor = colorIdx === 0 ? v.option1 : colorIdx === 1 ? v.option2 : v.option3;
            if (!matchOpt(vColor, targetColor)) return false;
          }
        }
        return true;
      });
      if (!candidate) {
        candidate = product.variants.find((v) => {
          const myIdx = optionKeys.indexOf(optionName);
          const vVal = myIdx === 0 ? v.option1 : myIdx === 1 ? v.option2 : v.option3;
          return matchOpt(vVal, value);
        });
      }
      if (candidate) {
        const vVals = [candidate.option1, candidate.option2, candidate.option3];
        optionKeys.forEach((key, idx) => { if (vVals[idx]) next[key] = vVals[idx]; });
      }
      return next;
    });
  };

  const isValueAvailable = (optionName, val) => {
    if (!product) return true;
    const l = optionName.toLowerCase();
    if (l.includes('tamanho') || l.includes('size') || l.includes('cor') || l.includes('color') || l.includes('peso')) return true;
    const optionKeys = Object.keys(product.options);
    const myIdx = optionKeys.indexOf(optionName);
    if (myIdx === -1) return true;
    return product.variants.some((v) => {
      const vVals = [v.option1, v.option2, v.option3];
      return optionKeys.every((key, idx) => {
        if (idx === myIdx) return matchOpt(vVals[idx], val);
        const isColor = key.toLowerCase().includes('cor') || key.toLowerCase().includes('color');
        if (isColor) return true;
        const sel = selectedOptions[key];
        if (!sel) return true;
        return matchOpt(vVals[idx], sel);
      });
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <style>{`.spinner{border:3px solid rgba(0,0,0,.06);width:36px;height:36px;border-radius:50%;border-left-color:var(--color-brand);animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div className="spinner" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="main-wrap" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <h2>Produto não encontrado</h2>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 20 }}>Voltar ao Catálogo</Link>
      </div>
    );
  }

  const isPremium = product.premium;
  const displayPrice =
    currentVariant && currentVariant.price > 0
      ? `R$ ${currentVariant.price.toFixed(2).replace('.', ',')}`
      : 'Sob Consulta';

  const getWhatsAppLink = () => {
    const opts = Object.entries(selectedOptions).map(([k, v]) => `${k}: ${v}`).join(', ');
    const text = `Olá! Gostaria de saber mais sobre: ${product.title}${opts ? ` (${opts})` : ''}`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  };

  const buildSpecs = () => {
    const specs = [];
    const full = `${(product.title || '').toLowerCase()} ${(product.description || '').toLowerCase()} ${product.tags.join(' ').toLowerCase()}`;

    specs.push({ label: 'Categoria', value: product.category });
    specs.push({ label: 'Marca', value: isPremium ? 'Quimipoint / Chumbada Oficial' : product.vendor || 'Chumbada Oficial' });
    if (currentVariant?.sku) specs.push({ label: 'SKU / Código', value: currentVariant.sku });

    Object.keys(product.options).forEach((key) => {
      const val = selectedOptions[key];
      if (val) specs.push({ label: key, value: val });
    });

    if (currentVariant?.grams > 0) specs.push({ label: 'Peso Unitário', value: `${currentVariant.grams}g` });

    // Material
    specs.push({ label: 'Material', value: 'Aço carbono de alto teor (alta resistência)' });

    // Afiação
    if (isPremium || full.includes('quimipoint') || full.includes('quimic')) {
      specs.push({ label: 'Afiação', value: 'Química Quimipoint — ponta ultrafina de competição' });
    } else {
      specs.push({ label: 'Afiação', value: 'Ponta afiada de alta penetração' });
    }

    // Tipo / formato
    if (full.includes('jig head')) {
      const angulo = full.includes('90') ? '90°' : full.includes('60') ? '60°' : null;
      specs.push({ label: 'Tipo', value: `Jig Head${angulo ? ` ${angulo}` : ''}` });
      if (full.includes('esfer')) specs.push({ label: 'Formato da Cabeça', value: 'Esférica' });
      else if (full.includes('facet')) specs.push({ label: 'Formato da Cabeça', value: 'Facetada' });
      else if (full.includes('football')) specs.push({ label: 'Formato da Cabeça', value: 'Football' });
      else if (full.includes('bananinha')) specs.push({ label: 'Formato da Cabeça', value: 'Bananinha' });
      else if (full.includes('bullet')) specs.push({ label: 'Formato da Cabeça', value: 'Bullet' });
    } else {
      specs.push({ label: 'Tipo', value: 'Anzol' });
    }

    // Haste / olhal
    if (full.includes('olhal')) specs.push({ label: 'Fixação', value: 'Olhal' });
    else if (full.includes('pata') || full.includes('pÃ¡ta')) specs.push({ label: 'Fixação', value: 'Pata (chata)' });

    // Anti-enrosco / offset
    if (full.includes('ewg')) specs.push({ label: 'Design', value: 'EWG — Extra Wide Gap (anti-enrosco)' });
    if (full.includes('offset')) specs.push({ label: 'Montagem', value: 'Offset — ideal para iscas soft montadas' });
    if (full.includes('articulad')) specs.push({ label: 'Articulação', value: 'Articulado (link de movimento)' });
    if (full.includes('mola') || full.includes('sapatinho')) specs.push({ label: 'Fixação da Isca', value: 'Sistema de mola / sapatinho' });

    // Uso recomendado
    if (isPremium) {
      specs.push({ label: 'Indicação', value: 'Pesca esportiva de competição e alto rendimento' });
    } else if (full.includes('jig head')) {
      specs.push({ label: 'Indicação', value: 'Iscas soft, grubs e shads — água doce e salgada' });
    } else {
      specs.push({ label: 'Indicação', value: 'Iscas naturais e montagens diversas' });
    }

    specs.push({ label: 'Disponibilidade', value: 'Em Estoque (Pronta Entrega)' });
    return specs;
  };

  return (
    <div className="view-fade">
      <main className={`main-wrap detail-view ${isPremium ? 'premium-detail' : ''}`}>
        {isPremium && <div className="oriental-pattern detail" aria-hidden="true" />}
        <nav className="breadcrumb" aria-label="Trilha">
          <Link to="/">Home</Link>
          <span className="breadcrumb-separator">/</span>
          <Link to="/">{product.category}</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current" aria-current="page">{product.title}</span>
        </nav>

        <div className="detail-grid">
          <section className="detail-gallery" aria-label="Imagens do Produto">
            <div className="gallery-main">
              <img src={product.images[activeImage]} alt={product.title} onError={(e) => { e.target.src = `${import.meta.env.BASE_URL}logo.png`; }} />
            </div>
            {product.images.length > 1 && (
              <div className="gallery-thumbs">
                {product.images.map((img, i) => (
                  <button key={i} className={`thumb-btn ${i === activeImage ? 'active' : ''}`} onClick={() => setActiveImage(i)} type="button" aria-label={`Ver imagem ${i + 1}`}>
                    <img src={img} alt={`Miniatura ${i + 1}`} onError={(e) => { e.target.src = `${import.meta.env.BASE_URL}logo.png`; }} />
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="detail-info" aria-label="Informações do Produto">
            <div className="info-header">
              <span className={`info-cat ${isPremium ? 'premium' : ''}`}>
                {isPremium ? '匠 Premium Quimipoint' : product.category}
              </span>
              <h1 className="info-title">{product.title}</h1>
              {SHOW_PRICES && (
                <div className="info-price-wrapper">
                  <span className="info-price">{displayPrice}</span>
                </div>
              )}
            </div>

            {Object.keys(product.options).map((optionName) => {
              const values = product.options[optionName];
              if (!values || values.length === 0) return null;
              const isColor = optionName.toLowerCase().includes('cor') || optionName.toLowerCase().includes('color');
              return (
                <div key={optionName} className="info-section">
                  <h2 className="info-section-title">
                    {optionName}: <span className="info-section-value">{selectedOptions[optionName]}</span>
                  </h2>
                  {isColor ? (
                    <div className="swatches-selector" role="radiogroup" aria-label={`Seleção de ${optionName}`}>
                      {values.map((val) => {
                        const available = isValueAvailable(optionName, val);
                        return (
                          <button
                            key={val}
                            className={`swatch-btn ${selectedOptions[optionName] === val ? 'active' : ''} ${!available ? 'unavailable' : ''}`}
                            style={getSwatchStyle(val)}
                            onClick={() => available && handleOptionSelect(optionName, val)}
                            title={val}
                            type="button"
                            role="radio"
                            aria-checked={selectedOptions[optionName] === val ? 'true' : 'false'}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <div className="vars-selector" role="radiogroup" aria-label={`Seleção de ${optionName}`}>
                      {values.map((val) => {
                        const available = isValueAvailable(optionName, val);
                        return (
                          <button
                            key={val}
                            className={`var-btn ${selectedOptions[optionName] === val ? 'active' : ''} ${!available ? 'unavailable' : ''}`}
                            onClick={() => available && handleOptionSelect(optionName, val)}
                            type="button"
                            role="radio"
                            aria-checked={selectedOptions[optionName] === val ? 'true' : 'false'}
                            title={available ? val : `${val} — Indisponível nesta combinação`}
                          >
                            <span className="var-name">{val}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="info-section">
              <h2 className="info-section-title">Especificações Técnicas</h2>
              <table className="specs-table">
                <tbody>
                  {buildSpecs().map((s, i) => (
                    <tr key={i}>
                      <td className="specs-label">{s.label}</td>
                      <td className="specs-val">{s.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {product.description && (
              <div className="info-section">
                <h2 className="info-section-title">Descrição</h2>
                <div className="info-desc" dangerouslySetInnerHTML={{ __html: product.description }} />
              </div>
            )}

            <div className="detail-actions">
              <button className="btn btn-primary btn-whatsapp" onClick={() => window.open(getWhatsAppLink(), '_blank', 'noopener noreferrer')} type="button">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436.002 9.858-4.417 9.86-9.86.001-2.638-1.024-5.117-2.884-6.979C16.59 1.905 14.113.882 11.48.882c-5.441 0-9.863 4.42-9.865 9.861 0 1.682.454 3.32 1.317 4.757l-.988 3.605 3.702-.971zm11.367-7.252c-.3-.149-1.777-.875-2.05-.974-.274-.1-.474-.149-.674.15-.2.299-.774.974-.949 1.173-.174.199-.349.224-.648.075-.3-.15-1.263-.465-2.403-1.482-.888-.793-1.488-1.77-1.663-2.069-.175-.299-.019-.461.13-.61.135-.134.3-.349.449-.523.149-.174.199-.299.299-.498.1-.2.05-.374-.025-.523-.075-.15-.674-1.62-.924-2.22-.243-.585-.49-.507-.674-.516-.174-.008-.374-.01-.574-.01-.2 0-.524.075-.798.374-.274.299-1.048 1.022-1.048 2.492 0 1.47 1.073 2.89 1.223 3.089.15.2 2.11 3.22 5.111 4.516.713.308 1.27.493 1.704.63.716.228 1.368.196 1.883.119.574-.085 1.777-.726 2.025-1.42.249-.696.249-1.293.174-1.418-.075-.125-.274-.199-.573-.349z" />
                </svg>
                Solicitar via WhatsApp
              </button>
              <div className="action-row">
                <a href={STORE_URL} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">Comprar no Site</a>
                <Link to="/" className="btn btn-secondary">Voltar ao Catálogo</Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
