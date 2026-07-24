import Papa from 'papaparse';

/**
 * Categorias do catálogo de Anzóis & Jig Heads.
 * A ordem define a prioridade de classificação (um produto recebe a PRIMEIRA que casar).
 * `premium` é destacado com design oriental.
 */
export const CATEGORIES = [
  { key: 'Anzóis Premium', label: 'Anzóis Premium', premium: true },
  { key: 'Com Mola', label: 'Com Mola' },
  { key: 'EWG', label: 'Anzóis EWG' },
  { key: '90°', label: 'Jig Head 90°' },
  { key: '60°', label: 'Jig Head 60°' },
  { key: 'Jig Heads', label: 'Jig Heads' },
  { key: 'Anzóis', label: 'Anzóis' },
];

// Ordem de exibição das seções no catálogo (Premium primeiro, em destaque)
export const SECTION_ORDER = [
  'Anzóis Premium',
  'Anzóis',
  'Jig Heads',
  'EWG',
  '90°',
  '60°',
  'Com Mola',
];

// Categorias cujos produtos (hoje divididos por cor) são agrupados por MODELO.
const JIG_CATEGORIES = ['90°', '60°', 'EWG', 'Jig Heads', 'Com Mola'];

export const getCategory = (title, tags) => {
  const t = (title || '').toLowerCase();
  const tg = (tags || []).join(' ').toLowerCase();

  if (t.includes('premium')) return 'Anzóis Premium';
  if (tg.includes('mola') || t.includes('mola')) return 'Com Mola';
  if (tg.includes('ewg')) return 'EWG';
  if (tg.includes('90 graus') || t.includes('90°')) return '90°';
  if (tg.includes('60 graus') || t.includes('60°')) return '60°';
  if (tg.includes('jig head')) return 'Jig Heads';
  return 'Anzóis';
};

export const isPremiumCategory = (cat) => cat === 'Anzóis Premium';

const slugify = (s) =>
  (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// Detecta e canonicaliza a cor a partir do título (formas com gênero → rótulo único)
const COLOR_CANON = [
  [/\bnatural\b/i, 'Natural'],
  [/\bn[íi]quel\b/i, 'Níquel'],
  [/\bdourad[oa]\b/i, 'Dourado'],
  [/\bamarel[oa]\b/i, 'Amarelo'],
  [/\blaranja\b/i, 'Laranja'],
  [/\bvermelh[oa]\b/i, 'Vermelho'],
  [/\bpret[oa]\b/i, 'Preto'],
  [/\bazul\b/i, 'Azul'],
];
const getTitleColor = (title) => {
  for (const [re, label] of COLOR_CANON) if (re.test(title)) return label;
  return null;
};

// Deriva o "modelo" removendo cor, faixa de tamanho e parênteses do título
const getModelTitle = (title) => {
  let t = title;
  t = t.replace(/\s*\([^)]*\)/g, ''); // remove "(6# - 1#)"
  t = t.replace(/\bAnz[óo]is\s+(Menores|Maiores)\b/gi, '');
  // remove tokens de cor (ambos os gêneros)
  t = t
    .replace(/\bnatura(l|is)\b/gi, '')
    .replace(/\bn[íi]quel\b/gi, '')
    .replace(/\bdourad[oa]s?\b/gi, '')
    .replace(/\bamarel[oa]s?\b/gi, '')
    .replace(/\blaranjas?\b/gi, '')
    .replace(/\bvermelh[oa]s?\b/gi, '')
    .replace(/\bpret[oa]s?\b/gi, '')
    .replace(/\bazuis?\b/gi, '')
    .replace(/\bazul\b/gi, '');
  // remove sufixos de faixa isolados (Menor/Maior)
  t = t.replace(/\b(Menor|Maior|Menores|Maiores)\b/gi, '');
  t = t.replace(/\s{2,}/g, ' ').replace(/\s+([,.-])/g, '$1').trim();
  return t;
};

// Ordem preferida de opções e de valores de cor
const OPTION_PRIORITY = ['Cor', 'Tamanho', 'Tamanho do Anzol', 'Anzol', 'Peso', 'Pacote', 'Quantidade', 'Variações'];
const COLOR_ORDER = ['Natural', 'Níquel', 'Amarelo', 'Laranja', 'Vermelho', 'Preto', 'Azul', 'Dourado'];

const sortOptionKeys = (keys) =>
  [...keys].sort((a, b) => {
    const ia = OPTION_PRIORITY.indexOf(a);
    const ib = OPTION_PRIORITY.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

const sortValues = (optName, values) => {
  const arr = [...values];
  if (optName === 'Cor') {
    return arr.sort((a, b) => {
      const ia = COLOR_ORDER.indexOf(a);
      const ib = COLOR_ORDER.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });
  }
  if (optName === 'Peso') {
    return arr.sort((a, b) => (parseFloat(a) || 0) - (parseFloat(b) || 0));
  }
  return arr;
};

// Reconstrói options (nome → valores) a partir das variantes (sel maps)
const buildOptionsFromVariants = (variants) => {
  const map = {};
  variants.forEach((v) => {
    Object.entries(v.sel || {}).forEach(([k, val]) => {
      if (!k || !val) return;
      if (!map[k]) map[k] = new Set();
      map[k].add(val);
    });
  });
  const out = {};
  sortOptionKeys(Object.keys(map)).forEach((k) => {
    out[k] = sortValues(k, Array.from(map[k]));
  });
  return out;
};

const priceRange = (variants) => {
  const priced = variants.filter((v) => v.price > 0).map((v) => v.price);
  return {
    minPrice: priced.length ? Math.min(...priced) : 0,
    maxPrice: priced.length ? Math.max(...priced) : 0,
  };
};

export const loadProducts = async () => {
  return new Promise((resolve, reject) => {
    const csvPath = `${import.meta.env.BASE_URL}products.csv`;
    Papa.parse(csvPath, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rawData = results.data;
        const map = new Map();

        rawData.forEach((row) => {
          if (!row.Handle) return;
          if (!map.has(row.Handle)) {
            map.set(row.Handle, {
              id: row.Handle,
              title: row.Title,
              description: row['Body (HTML)'],
              vendor: row.Vendor,
              tags: row.Tags ? row.Tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
              optionNames: [row['Option1 Name'], row['Option2 Name'], row['Option3 Name']],
              variants: [],
              images: new Set(),
            });
          }
          const p = map.get(row.Handle);
          const [n1, n2, n3] = p.optionNames;
          const sel = {};
          if (n1 && row['Option1 Value']) sel[n1] = row['Option1 Value'];
          if (n2 && row['Option2 Value']) sel[n2] = row['Option2 Value'];
          if (n3 && row['Option3 Value']) sel[n3] = row['Option3 Value'];

          const price = parseFloat(row['Variant Price']) || 0;
          const hasSel = Object.keys(sel).length > 0;
          if (hasSel || price > 0) {
            p.variants.push({
              sku: row['Variant SKU'],
              price,
              grams: parseFloat(row['Variant Grams']) || 0,
              image: row['Variant Image'] || row['Image Src'],
              sel,
            });
          }
          if (row['Image Src']) p.images.add(row['Image Src']);
          if (row['Variant Image']) p.images.add(row['Variant Image']);
        });

        // Produtos "crus" (um por handle)
        const raw = Array.from(map.values()).map((p) => ({
          ...p,
          images: Array.from(p.images).filter(Boolean),
          category: getCategory(p.title, p.tags),
        }));

        // --- Agrupamento por MODELO (apenas categorias de jig head) ---
        const models = new Map(); // modelKey → { members: [...] }
        const passthrough = [];

        raw.forEach((p) => {
          if (!JIG_CATEGORIES.includes(p.category)) {
            passthrough.push(p);
            return;
          }
          const modelTitle = getModelTitle(p.title);
          const key = `${p.category}::${slugify(modelTitle)}`;
          if (!models.has(key)) models.set(key, { modelTitle, category: p.category, members: [] });
          models.get(key).members.push(p);
        });

        const merged = [];
        models.forEach(({ modelTitle, category, members }) => {
          // Modelo com 1 membro e SEM cor no título → mantém como está
          const anyColor = members.some((m) => getTitleColor(m.title));
          if (members.length === 1 && !anyColor) {
            const m = members[0];
            merged.push(finalizeProduct({
              id: m.id,
              title: m.title,
              description: m.description,
              vendor: m.vendor,
              tags: m.tags,
              category: m.category,
              variants: m.variants,
              images: m.images,
              imagesByColor: null,
            }));
            return;
          }

          // Merge de fato: injeta Cor nas variantes de cada membro
          const allVariants = [];
          const imagesByColor = {};
          const descs = [];
          let baseVendor = 'Chumbada Oficial';
          const tagSet = new Set();

          members.forEach((m) => {
            const color = getTitleColor(m.title);
            const memberImgs = (m.images || []).slice(0, 8);
            if (color) imagesByColor[color] = memberImgs;
            baseVendor = m.vendor || baseVendor;
            m.tags.forEach((t) => tagSet.add(t));
            if (m.description && m.description.length > 40) descs.push(m.description);
            m.variants.forEach((v) => {
              const sel = { ...v.sel };
              if (color) sel['Cor'] = color;
              allVariants.push({ ...v, sel });
            });
          });

          // imagem representativa: primeira cor na ordem preferida
          const firstColor = COLOR_ORDER.find((c) => imagesByColor[c]) || Object.keys(imagesByColor)[0];
          const repImages = firstColor ? imagesByColor[firstColor] : (members[0].images || []);

          merged.push(finalizeProduct({
            id: slugify(modelTitle),
            title: modelTitle,
            description: descs[0] || `<p>${modelTitle}</p>`,
            vendor: baseVendor,
            tags: Array.from(tagSet),
            category,
            variants: allVariants,
            images: repImages,
            imagesByColor: Object.keys(imagesByColor).length ? imagesByColor : null,
          }));
        });

        const finalizedPassthrough = passthrough.map((p) =>
          finalizeProduct({
            id: p.id,
            title: p.title,
            description: p.description,
            vendor: p.vendor,
            tags: p.tags,
            category: p.category,
            variants: p.variants,
            images: p.images,
            imagesByColor: null,
          }),
        );

        resolve([...finalizedPassthrough, ...merged]);
      },
      error: (error) => reject(error),
    });
  });
};

function finalizeProduct({ id, title, description, vendor, tags, category, variants, images, imagesByColor }) {
  const options = buildOptionsFromVariants(variants);
  let imgs = (images || []).filter(Boolean);
  if (imgs.length === 0 && variants.length) {
    const withImg = variants.find((v) => v.image);
    if (withImg) imgs = [withImg.image];
  }
  return {
    id,
    title,
    description,
    vendor,
    tags: tags || [],
    category,
    premium: isPremiumCategory(category),
    variants,
    options,
    images: imgs,
    imagesByColor,
    ...priceRange(variants),
  };
}
