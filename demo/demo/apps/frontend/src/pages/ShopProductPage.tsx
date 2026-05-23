import { startTransition, useOptimistic } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import {
  shopGhostButtonClassName,
  shopPrimaryButtonClassName,
  shopSecondaryButtonClassName,
} from '@/components/shop/buttonStyles';
import { SeoHead } from '@/components/SeoHead';
import { useAddToCart, useCartCount } from '@/components/shop/shopStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatShopPrice, getShopProduct } from '@/lib/shop';

export function ShopProductPage() {
  const { productId = '' } = useParams();
  const addToCart = useAddToCart();
  const cartCount = useCartCount();
  const [optimisticCartCount, addOptimisticCartCount] = useOptimistic(
    cartCount,
    (count, quantity: number) => count + quantity,
  );
  const product = getShopProduct(productId);

  if (!product) {
    return (
      <section className="grid gap-5 rounded-[2rem] border border-black/10 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <SeoHead title="Product not found | BEDR Shop" robots="noindex, nofollow" />

        <Card className="border-black/10 bg-white text-[#1f1d18] shadow-none">
          <CardHeader className="space-y-3">
            <Badge className="w-fit rounded-full bg-black px-3 py-1 text-[10px] tracking-[0.28em] text-white uppercase hover:bg-black">
              Shop
            </Badge>
            <CardTitle className="text-3xl font-semibold tracking-tight">
              Product not found
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className={`w-fit ${shopPrimaryButtonClassName}`}>
              <Link to="/shop">
                <ArrowLeft className="h-4 w-4" />
                Back to shop
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <>
      <SeoHead
        title={`${product.name} | BEDR Shop`}
        description={product.description}
        canonicalPath={`/shop/${product.id}`}
      />

      <section className="grid gap-0 border border-black lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="overflow-hidden rounded-none border-0 border-b border-black bg-white text-black shadow-none lg:border-r lg:border-b-0">
          <CardContent className="relative min-h-[28rem] p-0">
            <div className="absolute inset-0 bg-[#f6f6f6]" />
            <div className="relative grid h-full min-h-[34rem] place-items-center p-8 sm:p-10">
              <div className="grid h-full w-full place-items-center border border-black/10 bg-white p-6">
                <div className="space-y-5 text-center">
                  <Badge className="rounded-none border border-black bg-white px-3 py-1 text-[10px] tracking-[0.28em] text-black uppercase hover:bg-white">
                    {product.badge}
                  </Badge>
                  <div className="mx-auto h-80 w-56 border border-black/15 bg-white" />
                  <p className="text-sm text-black/55">{product.imageLabel}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-5">
          <Card className="rounded-none border-0 bg-white text-black shadow-none">
            <CardContent className="grid gap-6 p-8 sm:p-10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Button
                  asChild
                  variant="ghost"
                  className={`justify-start px-0 ${shopGhostButtonClassName}`}
                >
                  <Link to="/shop">
                    <ArrowLeft className="h-4 w-4" />
                    Back to shop
                  </Link>
                </Button>
                <Button asChild variant="secondary" className={shopSecondaryButtonClassName}>
                  <Link to="/shop/cart">
                    Cart {optimisticCartCount ? `(${optimisticCartCount})` : ''}
                  </Link>
                </Button>
              </div>

              <div className="space-y-2">
                <h1 className="text-4xl font-normal tracking-tight text-black sm:text-5xl">
                  {product.name}
                </h1>
                <p className="text-sm text-black/55">{product.tagline}</p>
              </div>

              <div className="flex items-end justify-between gap-4 border-y border-black py-5">
                <div>
                  {product.compareAtPrice ? (
                    <p className="text-sm text-black/35 line-through">
                      {formatShopPrice(product.compareAtPrice)}
                    </p>
                  ) : null}
                  <p className="text-4xl font-normal text-black">
                    {formatShopPrice(product.price)}
                  </p>
                </div>
                <Button
                  size="lg"
                  className={shopPrimaryButtonClassName}
                  onClick={() => {
                    addOptimisticCartCount(1);

                    startTransition(() => {
                      addToCart(product.id);
                    });
                  }}
                >
                  Add to cart
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="border border-black p-4">
                  <p className="text-xs tracking-[0.2em] text-black/45 uppercase">Colors</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <Badge
                        key={color}
                        className="rounded-none border border-black bg-white px-3 py-1 text-[11px] text-black hover:bg-white"
                      >
                        {color}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="border border-black p-4">
                  <p className="text-xs tracking-[0.2em] text-black/45 uppercase">Materials</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {product.materials.map((material) => (
                      <Badge
                        key={material}
                        className="rounded-none border border-black bg-white px-3 py-1 text-[11px] text-black hover:bg-white"
                      >
                        {material}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-none border-0 border-t border-black bg-white text-black shadow-none">
            <CardContent className="p-8 sm:p-10">
              <ul className="grid gap-2 text-sm text-black/55">
                <li className="pb-2 text-xs tracking-[0.2em] text-black/45 uppercase">Details</li>
                {product.includes.map((item) => (
                  <li key={item} className="border border-black px-3 py-3">
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}