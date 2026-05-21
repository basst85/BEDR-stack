import { create } from 'zustand';

import { getShopProduct } from '@/lib/shop';

export type CartLine = {
  productId: string;
  quantity: number;
};

export type ShopCartLine = CartLine & {
  product: ReturnType<typeof getShopProduct> extends infer Product | undefined
    ? Exclude<Product, undefined>
    : never;
  lineTotal: number;
};

type ShopContextValue = {
  cart: CartLine[];
  cartCount: number;
  addToCart: (productId: string, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
};

const useShopStore = create<ShopContextValue>((set) => ({
  cart: [],
  cartCount: 0,
  addToCart: (productId, quantity = 1) => {
    set((state) => {
      const existingLine = state.cart.find((line) => line.productId === productId);

      const nextCart = existingLine
        ? state.cart.map((line) =>
            line.productId === productId ? { ...line, quantity: line.quantity + quantity } : line,
          )
        : [...state.cart, { productId, quantity }];

      return {
        cart: nextCart,
        cartCount: nextCart.reduce((total, line) => total + line.quantity, 0),
      };
    });
  },
  setQuantity: (productId, quantity) => {
    set((state) => {
      const nextCart =
        quantity <= 0
          ? state.cart.filter((line) => line.productId !== productId)
          : state.cart.map((line) => (line.productId === productId ? { ...line, quantity } : line));

      return {
        cart: nextCart,
        cartCount: nextCart.reduce((total, line) => total + line.quantity, 0),
      };
    });
  },
  removeFromCart: (productId) => {
    set((state) => {
      const nextCart = state.cart.filter((line) => line.productId !== productId);

      return {
        cart: nextCart,
        cartCount: nextCart.reduce((total, line) => total + line.quantity, 0),
      };
    });
  },
}));

export function useCart() {
  return useShopStore((state) => state.cart);
}

export function useCartCount() {
  return useShopStore((state) => state.cartCount);
}

export function useAddToCart() {
  return useShopStore((state) => state.addToCart);
}

export function useSetQuantity() {
  return useShopStore((state) => state.setQuantity);
}

export function useRemoveFromCart() {
  return useShopStore((state) => state.removeFromCart);
}

export function useCartLines() {
  const cart = useCart();

  return cart.flatMap<ShopCartLine>((line) => {
    const product = getShopProduct(line.productId);

    if (!product) {
      return [];
    }

    return [
      {
        ...line,
        product,
        lineTotal: product.price * line.quantity,
      },
    ];
  });
}
