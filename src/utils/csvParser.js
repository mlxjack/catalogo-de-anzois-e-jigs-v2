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

export const loadProducts = async () => {
  return new Promise((resolve, reject) => {
    const csvPath = `${import.meta.env.BASE_URL}products.csv`;
    Papa.parse(csvPath, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rawData = results.data;
        const productsMap = new Map();

        rawData.forEach((row) => {
          if (!row.Handle) return;

          if (!productsMap.has(row.Handle)) {
            productsMap.set(row.Handle, {
              id: row.Handle,
              title: row.Title,
              description: row['Body (HTML)'],
              vendor: row.Vendor,
              productCategory: row['Product Category'],
              tags: row.Tags ? row.Tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
              variants: [],
              images: new Set(),
              optionNames: [row['Option1 Name'], row['Option2 Name'], row['Option3 Name']],
              options: {
                [row['Option1 Name']]: new Set(),
                [row['Option2 Name']]: new Set(),
                [row['Option3 Name']]: new Set(),
              },
            });
          }

          const product = productsMap.get(row.Handle);

          const variant = {
            sku: row['Variant SKU'],
            price: parseFloat(row['Variant Price']) || 0,
            compareAt: parseFloat(row['Variant Compare At Price']) || 0,
            grams: parseFloat(row['Variant Grams']) || 0,
            image: row['Variant Image'] || row['Image Src'],
            option1: row['Option1 Value'],
            option2: row['Option2 Value'],
            option3: row['Option3 Value'],
          };
          // Só adiciona a variação se tiver algum valor de opção ou preço (ignora linhas só de imagem)
          if (variant.option1 || variant.option2 || variant.option3 || variant.price > 0) {
            product.variants.push(variant);
          }

          const optNames = product.optionNames;
          if (optNames[0] && row['Option1 Value']) product.options[optNames[0]].add(row['Option1 Value']);
          if (optNames[1] && row['Option2 Value']) product.options[optNames[1]].add(row['Option2 Value']);
          if (optNames[2] && row['Option3 Value']) product.options[optNames[2]].add(row['Option3 Value']);

          if (row['Image Src']) product.images.add(row['Image Src']);
          if (row['Variant Image']) product.images.add(row['Variant Image']);
        });

        const products = Array.from(productsMap.values()).map((p) => {
          const cleanOptions = {};
          Object.keys(p.options).forEach((key) => {
            if (key && key !== 'undefined') {
              const values = Array.from(p.options[key]).filter((v) => v);
              if (values.length > 0) cleanOptions[key] = values;
            }
          });

          let imagesArr = Array.from(p.images).filter((i) => i);
          if (imagesArr.length === 0 && p.variants.length > 0) {
            const firstWithImage = p.variants.find((v) => v.image);
            if (firstWithImage) imagesArr.push(firstWithImage.image);
          }

          const category = getCategory(p.title, p.tags);
          const pricedVariants = p.variants.filter((v) => v.price > 0);

          return {
            ...p,
            category,
            premium: isPremiumCategory(category),
            options: cleanOptions,
            images: imagesArr,
            minPrice: pricedVariants.length ? Math.min(...pricedVariants.map((v) => v.price)) : 0,
            maxPrice: pricedVariants.length ? Math.max(...pricedVariants.map((v) => v.price)) : 0,
          };
        });

        resolve(products);
      },
      error: (error) => reject(error),
    });
  });
};
