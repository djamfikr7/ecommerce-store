'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, useOptimistic, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import { revalidatePath } from 'next/cache';

// Types
export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  name: string;
  slug: string;
  image?: string;
  variantName?: string;
  sku?: string;
}

export interface CartTotals {
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  totals: CartTotals;
  guestCartId?: string;
}

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
}

type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CART'; payload: Cart }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'UPDATE_ITEM'; payload: { id: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_CART' };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_CART':
      return { ...state, cart: action.payload, isLoading: false, error: null };
    case 'ADD_ITEM': {
      if (!state.cart) return state;
      const existingIndex = state.cart.items.findIndex(
        (item) => item.productId === action.payload.productId && item.variantId === action.payload.variantId
      );
      let newItems: CartItem[];
      if (existingIndex >= 0) {
        newItems = state.cart.items.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      } else {
        newItems = [...state.cart.items, action.payload];
      }
      return {
        ...state,
        cart: {
          ...state.cart,
          items: newItems,
          totals: recalculateTotals(newItems, state.cart.totals),
        },
      };
    }
    case 'UPDATE_ITEM': {
      if (!state.cart) return state;
      const newItems = state.cart.items
        .map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
        .filter((item) => item.quantity > 0);
      return {
        ...state,
        cart: {
          ...state.cart,
          items: newItems,
          totals: recalculateTotals(newItems, state.cart.totals),
        },
      };
    }
    case 'REMOVE_ITEM': {
      if (!state.cart) return state;
      const newItems = state.cart.items.filter((item) => item.id !== action.payload);
      return {
        ...state,
        cart: {
          ...state.cart,
          items: newItems,
          totals: recalculateTotals(newItems, state.cart.totals),
        },
      };
    }
    case 'CLEAR_CART': {
      if (!state.cart) return state;
      return {
        ...state,
        cart: {
          ...state.cart,
          items: [],
          totals: { subtotal: 0, tax: 0, shipping: 0, discount: 0, total: 0 },
        },
      };
    }
    default:
      return state;
  }
}

function recalculateTotals(items: CartItem[], existingTotals: CartTotals): CartTotals {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.08; // 8% tax rate
  const shipping = subtotal >= 100 ? 0 : 9.99; // Free shipping over $100
  const total = subtotal + tax + shipping - existingTotals.discount;
  return {
    subtotal,
    tax,
    shipping,
    discount: existingTotals.discount,
    total,
  };
}

interface CartContextValue extends CartState {
  addItem: (item: Omit<CartItem, 'id'>) => Promise<void>;
  updateItem: (id: string, quantity: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
  setCart: (cart: Cart) => void;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const GUEST_CART_KEY = 'guest_cart_id';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    cart: null,
    isLoading: true,
    error: null,
  });
  const router = useRouter();

  // Auto-fetch cart on mount
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const guestCartId = typeof window !== 'undefined' ? localStorage.getItem(GUEST_CART_KEY) : null;
      const response = await fetch(`/api/cart${guestCartId ? `?guestCartId=${guestCartId}` : ''}`);
      if (!response.ok) throw new Error('Failed to fetch cart');
      const cart: Cart = await response.json();

      if (cart.guestCartId && !guestCartId) {
        localStorage.setItem(GUEST_CART_KEY, cart.guestCartId);
      }

      dispatch({ type: 'SET_CART', payload: cart });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to load cart' });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const refreshCart = useCallback(async () => {
    await fetchCart();
  }, [fetchCart]);

  const addItem = useCallback(async (item: Omit<CartItem, 'id'>) => {
    const tempId = `temp-${Date.now()}`;
    const newItem: CartItem = { ...item, id: tempId };

    // Optimistic update
    dispatch({ type: 'ADD_ITEM', payload: newItem });

    try {
      const guestCartId = typeof window !== 'undefined' ? localStorage.getItem(GUEST_CART_KEY) : undefined;
      const response = await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, guestCartId }),
      });

      if (!response.ok) throw new Error('Failed to add item');

      const updatedCart: Cart = await response.json();
      dispatch({ type: 'SET_CART', payload: updatedCart });

      if (updatedCart.guestCartId) {
        localStorage.setItem(GUEST_CART_KEY, updatedCart.guestCartId);
      }

      revalidatePath('/cart');
      revalidatePath('/');
    } catch (error) {
      // Rollback on error
      await fetchCart();
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to add item' });
    }
  }, [fetchCart]);

  const updateItem = useCallback(async (id: string, quantity: number) => {
    // Optimistic update
    dispatch({ type: 'UPDATE_ITEM', payload: { id, quantity } });

    try {
      const guestCartId = typeof window !== 'undefined' ? localStorage.getItem(GUEST_CART_KEY) : undefined;
      const response = await fetch(`/api/cart/items/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity, guestCartId }),
      });

      if (!response.ok) throw new Error('Failed to update item');

      const updatedCart: Cart = await response.json();
      dispatch({ type: 'SET_CART', payload: updatedCart });

      revalidatePath('/cart');
    } catch (error) {
      // Rollback on error
      await fetchCart();
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update item' });
    }
  }, [fetchCart]);

  const removeItem = useCallback(async (id: string) => {
    // Optimistic update
    dispatch({ type: 'REMOVE_ITEM', payload: id });

    try {
      const guestCartId = typeof window !== 'undefined' ? localStorage.getItem(GUEST_CART_KEY) : undefined;
      const response = await fetch(`/api/cart/items/${id}?guestCartId=${guestCartId || ''}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to remove item');

      const updatedCart: Cart = await response.json();
      dispatch({ type: 'SET_CART', payload: updatedCart });

      revalidatePath('/cart');
    } catch (error) {
      // Rollback on error
      await fetchCart();
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to remove item' });
    }
  }, [fetchCart]);

  const clearCart = useCallback(async () => {
    dispatch({ type: 'CLEAR_CART' });

    try {
      const guestCartId = typeof window !== 'undefined' ? localStorage.getItem(GUEST_CART_KEY) : undefined;
      const response = await fetch(`/api/cart?guestCartId=${guestCartId || ''}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to clear cart');

      revalidatePath('/cart');
    } catch (error) {
      await fetchCart();
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to clear cart' });
    }
  }, [fetchCart]);

  const setCart = useCallback((cart: Cart) => {
    dispatch({ type: 'SET_CART', payload: cart });
  }, []);

  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem,
        updateItem,
        removeItem,
        clearCart,
        setCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export { CartContext };
