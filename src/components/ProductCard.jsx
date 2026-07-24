import React from 'react';
import { Link } from 'react-router-dom';
import { getColorFromText, getSwatchStyle } from '../utils/colorHelper';
import { SHOW_PRICES } from '../config';

export default function ProductCard({ product }) {
  const mainImage = product.images[0] || `${import.meta.env.BASE_URL}logo.png`;
  const isPremium = product.premium;

  // Coleta cores para preview: valores da opção "Cor" ou cor derivada do título
  let colorVals = [];
  const corKey = Object.keys(product.options).find(
    (k) => k.toLowerCase().includes('cor') || k.toLowerCase().includes('color'),
  );
  if (corKey) colorVals = product.options[corKey];
  else {
    const fromTitle = getColorFromText(product.title);
    if (fromTitle) colorVals = [fromTitle.key];
  }

  const priceDisplay =
    product.minPrice > 0
      ? `R$ ${product.minPrice.toFixed(2).replace('.', ',')}`
      : 'Sob Consulta';

  return (
    <article className={`product-card ${isPremium ? 'premium' : ''}`}>
      {isPremium && <span className="premium-corner" aria-hidden="true">匠</span>}
      <div className="product-card-media">
        <Link to={`/product/${product.id}`}>
          <img
            src={mainImage}
            alt={product.title}
            loading="lazy"
            onError={(e) => {
              e.target.src = `${import.meta.env.BASE_URL}logo.png`;
            }}
          />
        </Link>
      </div>

      <div className="product-card-content">
        <span className={`product-card-cat ${isPremium ? 'premium' : ''}`}>
          {isPremium ? 'Premium Quimipoint' : product.category}
        </span>
        <h3 className="product-card-title">
          <Link to={`/product/${product.id}`}>{product.title}</Link>
        </h3>

        {colorVals.length > 0 && (
          <div className="product-card-previews">
            <div className="card-swatches" aria-label="Cores / acabamentos disponíveis">
              {colorVals.slice(0, 8).map((color) => {
                const colorImg = product.imagesByColor?.[color]?.[0];
                const style = colorImg
                  ? { backgroundImage: `url("${encodeURI(colorImg)}")`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : getSwatchStyle(color);
                return <span key={color} className="card-swatch" style={style} title={color} />;
              })}
              {colorVals.length > 8 && (
                <span className="card-vars-count">+{colorVals.length - 8}</span>
              )}
            </div>
          </div>
        )}

        <div className="product-card-footer">
          {SHOW_PRICES ? (
            <span className="product-card-price">{priceDisplay}</span>
          ) : (
            <span className="product-card-price muted">Ver detalhes</span>
          )}
          <Link to={`/product/${product.id}`} className="product-card-action">
            Detalhes
          </Link>
        </div>
      </div>
    </article>
  );
}
