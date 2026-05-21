import { Link } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';

import {
  shopGhostButtonClassName,
  shopPrimaryButtonClassName,
  shopQuantityButtonClassName,
  shopSecondaryButtonClassName,
} from '@/components/shop/buttonStyles';
import { SeoHead } from '@/components/SeoHead';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatShopPrice } from '@/lib/shop';
import { useOptimisticCart } from '../components/shop/useOptimisticCart';

export function ShopCartPage() {
  const { cartLines, setQuantity, removeFromCart } = useOptimisticCart();

  const subtotal = cartLines.reduce((total, line) => total + line.lineTotal, 0);
  const shipping = subtotal >= 150 || subtotal === 0 ? 0 : 12;
  const total = subtotal + shipping;

  return (
    <>
      <SeoHead
        title="Cart | BEDR Shop"
        description="Review selected items in the BEDR shop demo cart."
        canonicalPath="/shop/cart"
      />

      <section className="grid gap-0 border border-black lg:grid-cols-[1.15fr_0.85fr]">
        <div className="grid gap-5">
          <Card className="rounded-none border-0 border-b border-black bg-white text-black shadow-none lg:border-r lg:border-b-0">
            <CardHeader className="flex flex-col gap-4 border-b border-black sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <Badge className="w-fit rounded-none border border-black bg-white px-3 py-1 text-[10px] tracking-[0.28em] text-black uppercase hover:bg-white">
                  Cart
                </Badge>
                <CardTitle className="text-3xl font-normal tracking-tight">Bag</CardTitle>
              </div>
              <Button asChild variant="ghost" className={shopGhostButtonClassName}>
                <Link to="/shop">
                  <ArrowLeft className="h-4 w-4" />
                  Continue shopping
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="grid gap-4 p-6">
              {cartLines.length ? (
                cartLines.map((line) => (
                  <div
                    key={line.productId}
                    className="grid gap-4 border border-black bg-white p-4 sm:grid-cols-[auto_1fr_auto] sm:items-center"
                  >
                    <div
                      className="h-24 w-20 border border-black/20 bg-[#f3f3f3]"
                      aria-hidden="true"
                    />
                    <div className="space-y-2">
                      <div>
                        <p className="text-lg font-semibold text-[#1f1d18]">{line.product.name}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 border border-black bg-white px-2 py-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-8 w-8 ${shopQuantityButtonClassName}`}
                            onClick={() => setQuantity(line.productId, line.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="min-w-6 text-center text-sm text-[#1f1d18]">
                            {line.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-8 w-8 ${shopQuantityButtonClassName}`}
                            onClick={() => setQuantity(line.productId, line.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          className={shopGhostButtonClassName}
                          onClick={() => removeFromCart(line.productId)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-sm text-black/45">
                        {formatShopPrice(line.product.price)} each
                      </p>
                      <p className="text-xl font-semibold text-[#1f1d18]">
                        {formatShopPrice(line.lineTotal)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="grid gap-4 border border-dashed border-black p-10 text-center">
                  <div className="mx-auto border border-black bg-white p-4 text-black/45">
                    <ShoppingCart className="h-5 w-5" />
                  </div>
                  <p className="text-xl font-semibold text-[#1f1d18]">Your cart is empty</p>
                  <Button asChild className={shopPrimaryButtonClassName}>
                    <Link to="/shop">Browse products</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-none border-0 bg-white text-black shadow-none">
          <CardHeader className="border-b border-black">
            <CardTitle className="text-2xl font-normal tracking-tight">Order summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 p-6">
            <div className="grid gap-3 border border-black p-4">
              <div className="flex items-center justify-between text-sm text-black/55">
                <span>Subtotal</span>
                <span>{formatShopPrice(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-black/55">
                <span>Shipping</span>
                <span>{shipping ? formatShopPrice(shipping) : 'Free'}</span>
              </div>
              <div className="flex items-center justify-between border-t border-black/10 pt-3 text-base font-semibold text-[#1f1d18]">
                <span>Total</span>
                <span>{formatShopPrice(total)}</span>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="discount-code">Discount code</Label>
              <div className="flex gap-3">
                <Input id="discount-code" placeholder="DEMO-ONLY" readOnly value="SHOPMODE" />
                <Button variant="secondary" type="button" className={shopSecondaryButtonClassName}>
                  Apply
                </Button>
              </div>
            </div>

            <Button
              size="lg"
              disabled={!cartLines.length}
              className={`${shopPrimaryButtonClassName} disabled:translate-x-0 disabled:translate-y-0 disabled:bg-black/10 disabled:text-black/40 disabled:shadow-none`}
            >
              Checkout demo
            </Button>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
