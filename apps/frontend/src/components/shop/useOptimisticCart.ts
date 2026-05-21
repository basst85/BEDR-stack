import { startTransition, useOptimistic } from 'react';

import type { ShopCartLine } from '@/components/shop/shopStore';
import { useCartLines, useRemoveFromCart, useSetQuantity } from '@/components/shop/shopStore';

type OptimisticCartAction =
  | { type: 'set-quantity'; productId: string; quantity: number }
  | { type: 'remove'; productId: string };

const applyOptimisticCartAction = (
  cartLines: ShopCartLine[],
  action: OptimisticCartAction,
): ShopCartLine[] => {
  if (action.type === 'remove') {
    return cartLines.filter((line) => line.productId !== action.productId);
  }

  if (action.quantity <= 0) {
    return cartLines.filter((line) => line.productId !== action.productId);
  }

  return cartLines.map((line) =>
    line.productId === action.productId
      ? {
          ...line,
          quantity: action.quantity,
          lineTotal: line.product.price * action.quantity,
        }
      : line,
  );
};

export function useOptimisticCart() {
  const cartLines = useCartLines();
  const removeFromCart = useRemoveFromCart();
  const setQuantity = useSetQuantity();
  const [optimisticCartLines, applyOptimisticUpdate] = useOptimistic(
    cartLines,
    applyOptimisticCartAction,
  );

  const setOptimisticQuantity = (productId: string, quantity: number) => {
    applyOptimisticUpdate({ type: 'set-quantity', productId, quantity });

    startTransition(() => {
      setQuantity(productId, quantity);
    });
  };

  const removeOptimisticLine = (productId: string) => {
    applyOptimisticUpdate({ type: 'remove', productId });

    startTransition(() => {
      removeFromCart(productId);
    });
  };

  return {
    cartLines: optimisticCartLines,
    setQuantity: setOptimisticQuantity,
    removeFromCart: removeOptimisticLine,
  };
}
