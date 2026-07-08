"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { CART_ADDED_FEEDBACK_MS, CART_STORAGE_KEY } from "@/constants/cart";
import {
  clampQuantity,
  getCartItemCount,
  getCartTotal,
  getMaxQuantity,
} from "@/lib/cart";
import type { CartItem } from "@/types/cart";

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  total: number;
  isReady: boolean;
  recentlyAddedProductId: string | null;
  addItem: (item: CartItem, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const listeners = new Set<() => void>();
const addedFeedbackListeners = new Set<() => void>();
let cachedRaw = "";
let cachedItems: CartItem[] = [];
let recentlyAddedProductId: string | null = null;

function emitChange() {
  listeners.forEach((listener) => listener());
}

function emitAddedFeedbackChange() {
  addedFeedbackListeners.forEach((listener) => listener());
}

function subscribeAddedFeedback(listener: () => void) {
  addedFeedbackListeners.add(listener);
  return () => {
    addedFeedbackListeners.delete(listener);
  };
}

function getRecentlyAddedProductId() {
  return recentlyAddedProductId;
}

let addedFeedbackTimer: ReturnType<typeof setTimeout> | null = null;

function flashAddedProduct(productId: string) {
  recentlyAddedProductId = productId;
  emitAddedFeedbackChange();

  if (addedFeedbackTimer) {
    clearTimeout(addedFeedbackTimer);
  }

  addedFeedbackTimer = setTimeout(() => {
    if (recentlyAddedProductId === productId) {
      recentlyAddedProductId = null;
      emitAddedFeedbackChange();
    }
    addedFeedbackTimer = null;
  }, CART_ADDED_FEEDBACK_MS);
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  const onStorage = (event: StorageEvent) => {
    if (event.key === CART_STORAGE_KEY) {
      cachedRaw = "";
      listener();
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
  }

  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
    }
  };
}

function readStoredItems(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY) ?? "[]";
    if (raw === cachedRaw) return cachedItems;

    cachedRaw = raw;
    const parsed = JSON.parse(raw);
    cachedItems = Array.isArray(parsed) ? parsed : [];
    return cachedItems;
  } catch {
    cachedRaw = "[]";
    cachedItems = [];
    return cachedItems;
  }
}

function writeStoredItems(items: CartItem[]) {
  const raw = JSON.stringify(items);
  cachedRaw = raw;
  cachedItems = items;
  window.localStorage.setItem(CART_STORAGE_KEY, raw);
  emitChange();
}

function getServerSnapshot() {
  return [] as CartItem[];
}

function getServerReadySnapshot() {
  return false;
}

function getClientReadySnapshot() {
  return true;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(subscribe, readStoredItems, getServerSnapshot);
  const isReady = useSyncExternalStore(
    subscribe,
    getClientReadySnapshot,
    getServerReadySnapshot,
  );
  const addedProductId = useSyncExternalStore(
    subscribeAddedFeedback,
    getRecentlyAddedProductId,
    () => null,
  );

  const addItem = useCallback((item: CartItem, quantity = 1) => {
    if (getMaxQuantity(item) === 0) return;

    const current = readStoredItems();
    const existing = current.find((entry) => entry.productId === item.productId);

    if (!existing) {
      const nextQuantity = clampQuantity(item, quantity);
      if (nextQuantity === 0) return;
      writeStoredItems([...current, { ...item, quantity: nextQuantity }]);
      flashAddedProduct(item.productId);
      return;
    }

    writeStoredItems(
      current.map((entry) =>
        entry.productId === item.productId
          ? {
              ...entry,
              ...item,
              quantity: clampQuantity(item, entry.quantity + quantity),
            }
          : entry,
      ),
    );
    flashAddedProduct(item.productId);
  }, []);

  const removeItem = useCallback((productId: string) => {
    writeStoredItems(readStoredItems().filter((entry) => entry.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    writeStoredItems(
      readStoredItems()
        .map((entry) =>
          entry.productId === productId
            ? { ...entry, quantity: clampQuantity(entry, quantity) }
            : entry,
        )
        .filter((entry) => entry.quantity > 0),
    );
  }, []);

  const clearCart = useCallback(() => {
    writeStoredItems([]);
  }, []);

  const value = useMemo(
    () => ({
      items,
      itemCount: getCartItemCount(items),
      total: getCartTotal(items),
      isReady,
      recentlyAddedProductId: addedProductId,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    }),
    [items, isReady, addedProductId, addItem, removeItem, updateQuantity, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
