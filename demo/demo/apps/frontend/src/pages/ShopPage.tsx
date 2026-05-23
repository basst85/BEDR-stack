import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import {
  shopPrimaryButtonClassName,
  shopSecondaryButtonClassName,
} from '@/components/shop/buttonStyles';
import { SeoHead } from '@/components/SeoHead';
import { useAddToCart } from '@/components/shop/shopStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatShopPrice, shopProducts } from '@/lib/shop';

export function ShopPage() {
  const addToCart = useAddToCart();

  return (
    <>
      <SeoHead
        title="Shop | BEDR"
        description="Browse the BEDR shop demo with two products, product detail pages, and an in-browser cart."
        canonicalPath="/shop"
      />

      <section className="mb-10 grid gap-0 border border-black lg:grid-cols-[1.15fr_0.85fr]">
        <div className="flex min-h-[30rem] flex-col justify-between p-8 sm:p-12">
          <div className="space-y-5">
            <Badge className="w-fit rounded-none border border-black bg-white px-3 py-1 text-[10px] tracking-[0.28em] text-black uppercase hover:bg-white">
              Featured
            </Badge>
            <h1 className="max-w-3xl text-5xl font-normal tracking-tight sm:text-6xl">
              New arrivals
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className={shopPrimaryButtonClassName}>
              <Link to={`/shop/${shopProducts[0]?.id ?? ''}`}>Shop now</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className={shopSecondaryButtonClassName}>
              <Link to="/shop/cart">Cart</Link>
            </Button>
          </div>
        </div>

        <div className="grid min-h-[30rem] place-items-center border-t border-black bg-[#f5f5f5] p-8 lg:border-t-0 lg:border-l">
          <div className="flex h-full w-full items-end justify-center border border-black bg-white p-8">
            <div className="h-72 w-56 border border-black/20 bg-gradient-to-b from-white to-black/5" />
          </div>
        </div>
      </section>

      <section className="mb-4 flex items-center justify-between gap-4 border-b border-black pb-4">
        <p className="text-lg">Products</p>
        <p className="text-sm text-black/55">{shopProducts.length} items</p>
      </section>

      <section className="grid gap-0 border border-black sm:grid-cols-2">
        {shopProducts.map((product) => (
          <Card
            key={product.id}
            className="sm:last-child:border-b-0 sm:nth-last-child(2):border-b-0 overflow-hidden rounded-none border-0 border-b border-black bg-white text-black shadow-none sm:[&:nth-child(odd)]:border-r"
          >
            <CardHeader className="p-0">
              <div className="min-h-80 bg-[#f6f6f6] p-6">
                <div className="grid h-full place-items-center border border-black/10 bg-white p-6">
                  <div className="space-y-2 text-center">
                    <Badge className="rounded-none border border-black bg-white px-3 py-1 text-[10px] tracking-[0.24em] text-black uppercase hover:bg-white">
                      {product.badge}
                    </Badge>
                    <div className="mx-auto h-44 w-32 border border-black/20 bg-white" />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl font-normal tracking-tight text-black">
                    {product.name}
                  </CardTitle>
                  <CardDescription className="mt-1 text-sm text-black/55">
                    {product.tagline}
                  </CardDescription>
                </div>
                <div className="text-right">
                  {product.compareAtPrice ? (
                    <p className="text-sm text-black/35 line-through">
                      {formatShopPrice(product.compareAtPrice)}
                    </p>
                  ) : null}
                  <p className="text-xl font-semibold text-[#1f1d18]">
                    {formatShopPrice(product.price)}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-3 border-t border-black px-6 py-5">
              <div className="flex w-full gap-3">
                <Button
                  variant="secondary"
                  className={`flex-1 ${shopSecondaryButtonClassName}`}
                  onClick={() => addToCart(product.id)}
                >
                  Add to cart
                </Button>
                <Button asChild className={`flex-1 ${shopPrimaryButtonClassName}`}>
                  <Link to={`/shop/${product.id}`}>
                    View
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </section>
    </>
  );
}