export type ShopProduct = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  badge: string;
  colors: string[];
  materials: string[];
  includes: string[];
  imageLabel: string;
};

export const shopProducts: ShopProduct[] = [
  {
    id: 'nord-lamp',
    name: 'Nord Lamp',
    tagline: 'Soft studio light for late-night focus.',
    description:
      'A sculpted desk lamp with warm dimming, weighted aluminum base, and a glow tuned for evening work without the blue glare.',
    price: 129,
    compareAtPrice: 149,
    badge: 'Best seller',
    colors: ['Ivory', 'Graphite'],
    materials: ['Anodized aluminum', 'Frosted glass'],
    includes: ['Touch dimmer', 'USB-C cable', '2 year warranty'],
    imageLabel: 'Nord Lamp silhouette',
  },
  {
    id: 'atlas-tote',
    name: 'Atlas Tote',
    tagline: 'Weekend carry with laptop-grade structure.',
    description:
      'A structured canvas tote with vegetable-tanned handles, padded device sleeve, and a deep profile that holds a three-day pack without slouching.',
    price: 94,
    compareAtPrice: 118,
    badge: 'New drop',
    colors: ['Storm', 'Sand'],
    materials: ['Waxed canvas', 'Leather trim'],
    includes: ['Padded 14-inch sleeve', 'Magnetic closure', 'Interior key strap'],
    imageLabel: 'Atlas Tote silhouette',
  },
];

export function getShopProduct(productId: string) {
  return shopProducts.find((product) => product.id === productId);
}

export function formatShopPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price);
}
